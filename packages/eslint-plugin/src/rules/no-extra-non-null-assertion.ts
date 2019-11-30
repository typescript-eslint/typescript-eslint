import * as util from '../util';

export default util.createRule({
  name: 'no-extra-non-null-assertion',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow extra non-null assertion',
      category: 'Stylistic Issues',
      recommended: false,
    },
    schema: [],
    messages: {
      noExtraNonNullAssertion: 'Forbidden extra non-null assertion.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      'TSNonNullExpression > TSNonNullExpression'(node): void {
        context.report({ messageId: 'noExtraNonNullAssertion', node });
      },
    };
  },
});
