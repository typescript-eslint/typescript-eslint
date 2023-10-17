import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { RuleFix } from '@typescript-eslint/utils/ts-eslint';
import * as ts from 'typescript';

import {
  createRule,
  getOperatorPrecedence,
  getParserServices,
  OperatorPrecedence,
} from '../util';
import { analyzeChain } from './prefer-optional-chain-utils/analyzeChain';
import type { ValidOperand } from './prefer-optional-chain-utils/gatherLogicalOperands';
import {
  gatherLogicalOperands,
  OperandValidity,
} from './prefer-optional-chain-utils/gatherLogicalOperands';
import type {
  PreferOptionalChainMessageIds,
  PreferOptionalChainOptions,
} from './prefer-optional-chain-utils/PreferOptionalChainOptions';

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
      preferOptionalChain:
        "Prefer using an optional chain expression instead, as it's more concise and easier to read.",
      optionalChainSuggest: 'Change to an optional chain.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          checkAny: {
            type: 'boolean',
            description:
              'Check operands that are typed as `any` when inspecting "loose boolean" operands.',
          },
          checkUnknown: {
            type: 'boolean',
            description:
              'Check operands that are typed as `unknown` when inspecting "loose boolean" operands.',
          },
          checkString: {
            type: 'boolean',
            description:
              'Check operands that are typed as `string` when inspecting "loose boolean" operands.',
          },
          checkNumber: {
            type: 'boolean',
            description:
              'Check operands that are typed as `number` when inspecting "loose boolean" operands.',
          },
          checkBoolean: {
            type: 'boolean',
            description:
              'Check operands that are typed as `boolean` when inspecting "loose boolean" operands.',
          },
          checkBigInt: {
            type: 'boolean',
            description:
              'Check operands that are typed as `bigint` when inspecting "loose boolean" operands.',
          },
          requireNullish: {
            type: 'boolean',
            description:
              'Skip operands that are not typed with `null` and/or `undefined` when inspecting "loose boolean" operands.',
          },
          allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: {
            type: 'boolean',
            description:
              'Allow autofixers that will change the return type of the expression. This option is considered unsafe as it may break the build.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      checkAny: true,
      checkUnknown: true,
      checkString: true,
      checkNumber: true,
      checkBoolean: true,
      checkBigInt: true,
      requireNullish: false,
      allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: false,
    },
  ],
  create(context, [options]) {
    const sourceCode = context.getSourceCode();
    const parserServices = getParserServices(context);

    const seenLogicals = new Set<TSESTree.LogicalExpression>();

    return {
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
          !parentNode ||
          parentNode.type !== AST_NODE_TYPES.MemberExpression ||
          parentNode.optional
        ) {
          return;
        }

        seenLogicals.add(node);

        function isLeftSideLowerPrecedence(): boolean {
          const logicalTsNode = parserServices.esTreeNodeToTSNodeMap.get(node);

          const leftTsNode = parserServices.esTreeNodeToTSNodeMap.get(leftNode);
          const operator = ts.isBinaryExpression(logicalTsNode)
            ? logicalTsNode.operatorToken.kind
            : ts.SyntaxKind.Unknown;
          const leftPrecedence = getOperatorPrecedence(
            leftTsNode.kind,
            operator,
          );

          return leftPrecedence < OperatorPrecedence.LeftHandSide;
        }
        context.report({
          node: parentNode,
          messageId: 'preferOptionalChain',
          suggest: [
            {
              messageId: 'optionalChainSuggest',
              fix: (fixer): RuleFix => {
                const leftNodeText = sourceCode.getText(leftNode);
                // Any node that is made of an operator with higher or equal precedence,
                const maybeWrappedLeftNode = isLeftSideLowerPrecedence()
                  ? `(${leftNodeText})`
                  : leftNodeText;
                const propertyToBeOptionalText = sourceCode.getText(
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

      'LogicalExpression[operator!="??"]'(
        node: TSESTree.LogicalExpression,
      ): void {
        if (seenLogicals.has(node)) {
          return;
        }

        const { operands, newlySeenLogicals } = gatherLogicalOperands(
          node,
          parserServices,
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
              sourceCode,
              parserServices,
              options,
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
            sourceCode,
            parserServices,
            options,
            node.operator,
            currentChain,
          );
        }
      },
    };
  },
});
