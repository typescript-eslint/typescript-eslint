import * as util from '../util';

export default util.createRule({
  name: 'no-angle-bracket-type-assertion',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforces the use of `as Type` assertions instead of `<Type>` assertions',
      category: 'Stylistic Issues',
      recommended: 'error',
    },
    messages: {
      preferAs:
        "Prefer 'as {{cast}}' instead of '<{{cast}}>' when doing type assertions.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      TSTypeAssertion(node) {
        context.report({
          node,
          messageId: 'preferAs',
          data: {
            cast: sourceCode.getText(node.typeAnnotation),
          },
        });
      },
    };
  },
});
