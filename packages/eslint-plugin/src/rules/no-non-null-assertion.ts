import * as util from '../util';

export default util.createRule({
  name: 'no-non-null-assertion',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows non-null assertions using the `!` postfix operator',
      category: 'Stylistic Issues',
      recommended: 'warn',
    },
    messages: {
      noNonNull: 'Forbidden non-null assertion.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSNonNullExpression(node): void {
        context.report({
          node,
          messageId: 'noNonNull',
        });
      },
    };
  },
});
