import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleFix, SourceCode } from '@typescript-eslint/utils/ts-eslint';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ValidOperand } from './prefer-optional-chain-utils/gatherLogicalOperands';
import type {
  PreferOptionalChainMessageIds,
  PreferOptionalChainOptions,
} from './prefer-optional-chain-utils/PreferOptionalChainOptions';

import {
  createRule,
  getOperatorPrecedence,
  getParserServices,
  isUndefinedIdentifier,
  nullThrows,
  NullThrowsReasons,
  OperatorPrecedence,
} from '../util';
import { analyzeChain } from './prefer-optional-chain-utils/analyzeChain';
import { checkNullishAndReport } from './prefer-optional-chain-utils/checkNullishAndReport';
import {
  compareNodes,
  NodeComparisonResult,
} from './prefer-optional-chain-utils/compareNodes';
import {
  gatherLogicalOperands,
  OperandValidity,
} from './prefer-optional-chain-utils/gatherLogicalOperands';

function isNullOrUndefined(node: TSESTree.Node): boolean {
  return (
    (node.type === AST_NODE_TYPES.Literal && node.raw === 'null') ||
    isUndefinedIdentifier(node)
  );
}

/**
 * Finds the member access or call in `chain` whose object or callee is `target`,
 * e.g. `foo.bar` in `foo.bar.baz()` when `target` is `foo`.
 */
function findLinkOnTarget(
  chain: TSESTree.Expression,
  target: TSESTree.Node,
): TSESTree.CallExpression | TSESTree.MemberExpression | null {
  let link: TSESTree.Node = chain;
  while (
    link.type === AST_NODE_TYPES.MemberExpression ||
    link.type === AST_NODE_TYPES.CallExpression
  ) {
    const inner: TSESTree.Expression =
      link.type === AST_NODE_TYPES.MemberExpression ? link.object : link.callee;
    if (compareNodes(target, inner) === NodeComparisonResult.Equal) {
      return link;
    }
    link = inner;
  }
  return null;
}

/**
 * Gets the token that starts `link`: `.` or `[` for a member access, `<` or `(` for a call.
 */
function getLinkStartToken(
  sourceCode: SourceCode,
  link: TSESTree.CallExpression | TSESTree.MemberExpression,
): TSESTree.Token {
  if (link.type === AST_NODE_TYPES.MemberExpression) {
    const punctuator = link.computed ? '[' : '.';
    return nullThrows(
      sourceCode.getTokenAfter(link.object, {
        filter: token => token.value === punctuator,
      }),
      NullThrowsReasons.MissingToken(punctuator, 'member expression'),
    );
  }
  if (link.typeArguments) {
    return nullThrows(
      sourceCode.getFirstToken(link.typeArguments),
      NullThrowsReasons.MissingToken('<', 'type arguments'),
    );
  }
  return nullThrows(
    sourceCode.getTokenAfter(link.callee, {
      filter: token => token.value === '(',
    }),
    NullThrowsReasons.MissingToken('(', 'call expression'),
  );
}

export default createRule<
  [PreferOptionalChainOptions],
  PreferOptionalChainMessageIds
>({
  name: 'prefer-optional-chain',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using concise optional chain expressions instead of chained logical ands, negated logical ors, or empty objects',
      recommended: 'stylistic',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      optionalChainSuggest: 'Change to an optional chain.',
      preferOptionalChain:
        "Prefer using an optional chain expression instead, as it's more concise and easier to read.",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: {
            type: 'boolean',
            description:
              'Allow autofixers that will change the return type of the expression. This option is considered unsafe as it may break the build.',
          },
          checkAny: {
            type: 'boolean',
            description:
              'Check operands that are typed as `any` when inspecting "loose boolean" operands.',
          },
          checkBigInt: {
            type: 'boolean',
            description:
              'Check operands that are typed as `bigint` when inspecting "loose boolean" operands.',
          },
          checkBoolean: {
            type: 'boolean',
            description:
              'Check operands that are typed as `boolean` when inspecting "loose boolean" operands.',
          },
          checkNumber: {
            type: 'boolean',
            description:
              'Check operands that are typed as `number` when inspecting "loose boolean" operands.',
          },
          checkString: {
            type: 'boolean',
            description:
              'Check operands that are typed as `string` when inspecting "loose boolean" operands.',
          },
          checkUnknown: {
            type: 'boolean',
            description:
              'Check operands that are typed as `unknown` when inspecting "loose boolean" operands.',
          },
          requireNullish: {
            type: 'boolean',
            description:
              'Skip operands that are not typed with `null` and/or `undefined` when inspecting "loose boolean" operands.',
          },
        },
      },
    ],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [
    {
      allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: false,
      checkAny: true,
      checkBigInt: true,
      checkBoolean: true,
      checkNumber: true,
      checkString: true,
      checkUnknown: true,
      requireNullish: false,
    },
  ],
  create(context, [options]) {
    const parserServices = getParserServices(context);

    const seenLogicals = new Set<TSESTree.LogicalExpression>();

    return {
      // specific handling for `foo == null ? undefined : foo.bar`
      ConditionalExpression(node): void {
        const { test } = node;
        if (
          test.type !== AST_NODE_TYPES.BinaryExpression ||
          (test.operator !== '==' && test.operator !== '!=')
        ) {
          return;
        }

        let comparedNode: TSESTree.Node;
        if (isNullOrUndefined(test.right)) {
          comparedNode = test.left;
        } else if (isNullOrUndefined(test.left)) {
          comparedNode = test.right;
        } else {
          return;
        }

        const [nullishBranch, nonNullishBranch] =
          test.operator === '=='
            ? [node.consequent, node.alternate]
            : [node.alternate, node.consequent];
        if (!isUndefinedIdentifier(nullishBranch)) {
          return;
        }

        const chain =
          nonNullishBranch.type === AST_NODE_TYPES.ChainExpression
            ? nonNullishBranch.expression
            : nonNullishBranch;
        const link = findLinkOnTarget(chain, comparedNode);
        if (!link) {
          return;
        }

        context.report({
          node,
          messageId: 'preferOptionalChain',
          fix: (fixer): RuleFix | null => {
            const { sourceCode } = context;
            // replacing the whole ternary would drop comments outside of the chain
            if (
              sourceCode.getCommentsInside(node).length !==
              sourceCode.getCommentsInside(chain).length
            ) {
              return null;
            }

            const chainText = sourceCode.getText(chain);
            if (link.optional) {
              return fixer.replaceText(node, chainText);
            }

            const linkStart = getLinkStartToken(sourceCode, link);
            const start = linkStart.range[0] - chain.range[0];
            const end = linkStart.range[1] - chain.range[0];
            const optionalChainText =
              linkStart.value === '.'
                ? `${chainText.slice(0, start)}?.${chainText.slice(end)}`
                : `${chainText.slice(0, start)}?.${chainText.slice(start)}`;
            return fixer.replaceText(node, optionalChainText);
          },
        });
      },
      'LogicalExpression[operator!="??"]'(
        node: TSESTree.LogicalExpression,
      ): void {
        if (seenLogicals.has(node)) {
          return;
        }

        const { newlySeenLogicals, operands } = gatherLogicalOperands(
          node,
          parserServices,
          context.sourceCode,
          options,
        );
        for (const logical of newlySeenLogicals) {
          seenLogicals.add(logical);
        }

        let currentChain: ValidOperand[] = [];
        for (const operand of operands) {
          if (operand.type === OperandValidity.Invalid) {
            analyzeChain(
              context,
              parserServices,
              options,
              node,
              node.operator,
              currentChain,
            );
            currentChain = [];
          } else if (operand.type === OperandValidity.Last) {
            analyzeChain(
              context,
              parserServices,
              options,
              node,
              node.operator,
              currentChain,
              operand,
            );
            currentChain = [];
          } else {
            currentChain.push(operand);
          }
        }

        // make sure to check whatever's left
        if (currentChain.length > 0) {
          analyzeChain(
            context,
            parserServices,
            options,
            node,
            node.operator,
            currentChain,
          );
        }
      },

      // specific handling for `(foo ?? {}).bar` / `(foo || {}).bar`
      'LogicalExpression[operator="||"], LogicalExpression[operator="??"]'(
        node: TSESTree.LogicalExpression,
      ): void {
        const leftNode = node.left;
        const rightNode = node.right;
        const parentNode = node.parent;
        const isRightNodeAnEmptyObjectLiteral =
          rightNode.type === AST_NODE_TYPES.ObjectExpression &&
          rightNode.properties.length === 0;
        if (
          !isRightNodeAnEmptyObjectLiteral ||
          parentNode.type !== AST_NODE_TYPES.MemberExpression ||
          parentNode.optional
        ) {
          return;
        }

        seenLogicals.add(node);

        function isLeftSideLowerPrecedence(): boolean {
          const logicalTsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
          const leftTsNode = parserServices.esTreeNodeToTSNodeMap.get(leftNode);
          const leftPrecedence = getOperatorPrecedence(
            leftTsNode.kind,
            logicalTsNode.operatorToken.kind,
          );

          return leftPrecedence < OperatorPrecedence.LeftHandSide;
        }

        checkNullishAndReport(context, parserServices, options, [leftNode], {
          node: parentNode,
          messageId: 'preferOptionalChain',
          suggest: [
            {
              messageId: 'optionalChainSuggest',
              fix: (fixer): RuleFix => {
                const leftNodeText = context.sourceCode.getText(leftNode);
                // Any node that is made of an operator with higher or equal precedence,
                const maybeWrappedLeftNode = isLeftSideLowerPrecedence()
                  ? `(${leftNodeText})`
                  : leftNodeText;
                const propertyToBeOptionalText = context.sourceCode.getText(
                  parentNode.property,
                );
                const maybeWrappedProperty = parentNode.computed
                  ? `[${propertyToBeOptionalText}]`
                  : propertyToBeOptionalText;
                return fixer.replaceTextRange(
                  parentNode.range,
                  `${maybeWrappedLeftNode}?.${maybeWrappedProperty}`,
                );
              },
            },
          ],
        });
      },
    };
  },
});
