import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export default createRule({
  name: 'no-dynamic-delete',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow using the `delete` operator on computed key expressions',
      recommended: 'strict',
    },
    messages: {
      dynamicDelete: 'Do not delete dynamically computed property keys.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    return {
      'UnaryExpression[operator=delete]'(node: TSESTree.UnaryExpression): void {
        if (
          node.argument.type !== AST_NODE_TYPES.MemberExpression ||
          !node.argument.computed ||
          isAcceptableIndexExpression(node.argument.property)
        ) {
          return;
        }

        context.report({
          node: node.argument.property,
          messageId: 'dynamicDelete',
        });
      },
    };
  },
});

function isAcceptableIndexExpression(property: TSESTree.Expression): boolean {
  return (
    (property.type === AST_NODE_TYPES.Literal &&
      ['number', 'string'].includes(typeof property.value)) ||
    (property.type === AST_NODE_TYPES.UnaryExpression &&
      property.operator === '-' &&
      property.argument.type === AST_NODE_TYPES.Literal &&
      typeof property.argument.value === 'number')
  );
}
