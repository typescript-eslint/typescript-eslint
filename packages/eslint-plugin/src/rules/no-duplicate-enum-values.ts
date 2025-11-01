import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export default createRule({
  name: 'no-duplicate-enum-values',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow duplicate enum member values',
      recommended: 'recommended',
    },
    hasSuggestions: false,
    messages: {
      duplicateValue: 'Duplicate enum member value {{value}}.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function isStringLiteral(
      node: TSESTree.Expression,
    ): node is TSESTree.StringLiteral {
      return (
        node.type === AST_NODE_TYPES.Literal && typeof node.value === 'string'
      );
    }

    function isNumberLiteral(
      node: TSESTree.Expression,
    ): node is TSESTree.NumberLiteral {
      return (
        node.type === AST_NODE_TYPES.Literal && typeof node.value === 'number'
      );
    }

    function isSupportedUnary(
      node: TSESTree.Expression,
    ): node is TSESTree.UnaryExpression {
      return (
        node.type === AST_NODE_TYPES.UnaryExpression &&
        ['-', '+'].includes(node.operator)
      );
    }

    function isStaticTemplateLiteral(
      node: TSESTree.Expression,
    ): node is TSESTree.TemplateLiteral {
      return (
        node.type === AST_NODE_TYPES.TemplateLiteral &&
        node.expressions.length === 0 &&
        node.quasis.length === 1
      );
    }

    function getMemberValue(
      initializer: TSESTree.Expression,
    ): number | string | undefined {
      switch (true) {
        case isStringLiteral(initializer):
        case isNumberLiteral(initializer):
          return initializer.value;
        case isSupportedUnary(initializer): {
          const inner = Number(getMemberValue(initializer.argument));
          if (Number.isNaN(inner)) {
            return undefined;
          }

          return initializer.operator === '-' ? -inner : inner;
        }
        case isStaticTemplateLiteral(initializer):
          return initializer.quasis[0].value.cooked;
        default:
          return undefined;
      }
    }

    return {
      TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
        const enumMembers = node.body.members;
        const seenValues: (number | string)[] = [];

        enumMembers.forEach(member => {
          if (member.initializer == null) {
            return;
          }

          const value = getMemberValue(member.initializer);
          if (value == null) {
            return;
          }

          const isAlreadyPresent = seenValues.some(seenValue =>
            Object.is(seenValue, value),
          );
          if (isAlreadyPresent) {
            context.report({
              node: member,
              messageId: 'duplicateValue',
              data: {
                value,
              },
            });
          } else {
            seenValues.push(value);
          }
        });
      },
    };
  },
});
