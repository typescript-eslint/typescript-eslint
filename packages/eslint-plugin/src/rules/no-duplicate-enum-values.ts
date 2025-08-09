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

    function isStaticTemplateLiteral(
      node: TSESTree.Expression,
    ): node is TSESTree.TemplateLiteral {
      return (
        node.type === AST_NODE_TYPES.TemplateLiteral &&
        node.expressions.length === 0 &&
        node.quasis.length === 1
      );
    }

    return {
      TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
        const enumMembers = node.body.members;
        const seenValues = new Set<number | string>();

        enumMembers.forEach(member => {
          if (member.initializer == null) {
            return;
          }

          let value: number | string | null | undefined;
          if (isStringLiteral(member.initializer)) {
            value = member.initializer.value;
          } else if (isNumberLiteral(member.initializer)) {
            value = member.initializer.value;
          } else if (isStaticTemplateLiteral(member.initializer)) {
            value = member.initializer.quasis[0].value.cooked;
          }

          if (value == null) {
            return;
          }

          if (seenValues.has(value)) {
            context.report({
              node: member,
              messageId: 'duplicateValue',
              data: {
                value,
              },
            });
          } else {
            seenValues.add(value);
          }
        });
      },
    };
  },
});
