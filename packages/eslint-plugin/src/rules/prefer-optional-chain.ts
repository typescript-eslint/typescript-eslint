import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleFix } from '@typescript-eslint/utils/ts-eslint';

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
  OperatorPrecedence,
} from '../util';
import { analyzeChain } from './prefer-optional-chain-utils/analyzeChain';
import { checkNullishAndReport } from './prefer-optional-chain-utils/checkNullishAndReport';
import {
  gatherLogicalOperands,
  NullishComparisonType,
  OperandValidity,
} from './prefer-optional-chain-utils/gatherLogicalOperands';

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
          ignoreIfStatements: {
            type: 'boolean',
            description:
              'Whether to ignore `if` statements with a single expression in the consequent.',
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
  defaultOptions: [
    {
      allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: false,
      checkAny: true,
      checkBigInt: true,
      checkBoolean: true,
      checkNumber: true,
      checkString: true,
      checkUnknown: true,
      ignoreIfStatements: false,
      requireNullish: false,
    },
  ],
  create(context, [options]) {
    const parserServices = getParserServices(context);

    const seenLogicals = new Set<TSESTree.LogicalExpression>();

    return {
      // specific handling for `if (foo) { foo.bar }` / `if (foo) foo.bar`
      'IfStatement[consequent.type=BlockStatement][consequent.body.length=1], IfStatement[consequent.type=ExpressionStatement]'(
        node: TSESTree.IfStatement,
      ): void {
        if (options.ignoreIfStatements || node.alternate) {
          return;
        }
        const ifBodyStatement =
          node.consequent.type === AST_NODE_TYPES.BlockStatement
            ? node.consequent.body[0]
            : node.consequent;

        if (ifBodyStatement.type !== AST_NODE_TYPES.ExpressionStatement) {
          return;
        }

        const ifBodyExpression = ifBodyStatement.expression;
        const currentChain: ValidOperand[] = [
          {
            node: node.test,
            type: OperandValidity.Valid,
            comparedName: node.test,
            comparisonType: NullishComparisonType.Boolean,
            isYoda: false,
          },
        ];
        if (node.test.type === AST_NODE_TYPES.LogicalExpression) {
          const { newlySeenLogicals, operands } = gatherLogicalOperands(
            node.test,
            parserServices,
            context.sourceCode,
            options,
          );
          for (const logical of newlySeenLogicals) {
            seenLogicals.add(logical);
          }
          for (const operand of operands) {
            if (operand.type === OperandValidity.Invalid) {
              return;
            }
            currentChain.push(operand);
          }
        }
        if (ifBodyExpression.type === AST_NODE_TYPES.LogicalExpression) {
          const { newlySeenLogicals, operands } = gatherLogicalOperands(
            ifBodyExpression,
            parserServices,
            context.sourceCode,
            options,
          );
          for (const logical of newlySeenLogicals) {
            seenLogicals.add(logical);
          }
          for (const operand of operands) {
            if (operand.type === OperandValidity.Invalid) {
              return;
            }
            currentChain.push(operand);
          }
        } else {
          currentChain.push({
            node: ifBodyExpression,
            type: OperandValidity.Valid,
            comparedName: ifBodyExpression,
            comparisonType: NullishComparisonType.Boolean,
            isYoda: false,
          });
        }
        analyzeChain(
          context,
          parserServices,
          options,
          node,
          '&&',
          currentChain,
        );
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
