import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'no-dynamic-delete',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Bans usage of the delete operator with computed key expressions.',
      category: 'Possible Errors',
      recommended: false,
      requiresTypeChecking: false,
    },
    messages: {
      noDynamicDelete: 'Do not delete dynamically computed property keys.',
    },
    schema: [],
  },
  defaultOptions: [null],
  create(context) {
    return {
      UnaryExpression(node: TSESTree.UnaryExpression): void {
        if (node.operator !== 'delete') {
          return;
        }

        if ((node.argument as TSESTree.MemberExpression).computed) {
          context.report({
            node,
            messageId: 'noDynamicDelete',
          });
        }
      },
    };
  },
});
