import * as util from '../util';

export default util.createRule({
  name: 'no-non-null-assertion',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows non-null assertions using the `!` postfix operator',
      tslintRuleName: 'no-non-null-assertion',
      category: 'Stylistic Issues',
      recommended: 'error'
    },
    messages: {
      noNonNull: 'Forbidden non-null assertion.'
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      TSNonNullExpression(node) {
        context.report({
          node,
          messageId: 'noNonNull'
        });
      }
    };
  }
});
