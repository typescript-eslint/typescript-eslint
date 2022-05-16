import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import * as util from '../util';

export default util.createRule({
  name: 'no-duplicate-enum-values',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow duplicate enum member values',
      recommended: 'strict',
    },
    hasSuggestions: true,
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

    return {
      TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
        const enumMembers = node.members;
        const seenValues = new Set<number | string>();

        enumMembers.forEach(member => {
          if (member.initializer === undefined) {
            return;
          }

          let value: string | number | undefined;
          if (isStringLiteral(member.initializer)) {
            value = String(member.initializer.value);
          } else if (isNumberLiteral(member.initializer)) {
            value = Number(member.initializer.value);
          }

          if (value === undefined) {
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
