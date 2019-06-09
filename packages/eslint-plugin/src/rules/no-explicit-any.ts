import * as util from '../util';

export default util.createRule({
  name: 'no-explicit-any',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of the `any` type',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      unexpectedAny: 'Unexpected any. Specify a different type.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSAnyKeyword(node) {
        context.report({
          node,
          messageId: 'unexpectedAny',
        });
      },
    };
  },
});
