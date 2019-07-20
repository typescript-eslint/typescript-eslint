import * as util from '../util';

export default util.createRule({
  name: 'no-triple-slash-reference',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow `/// <reference path="" />` comments',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    deprecated: true,
    replacedBy: ['triple-slash-reference'],
    messages: {
      noTripleSlashReference: 'Do not use a triple slash reference.',
    },
  },
  defaultOptions: [],
  create(context) {
    const referenceRegExp = /^\/\s*<reference\s*path=/;
    const sourceCode = context.getSourceCode();

    return {
      Program(program): void {
        const commentsBefore = sourceCode.getCommentsBefore(program);

        commentsBefore.forEach(comment => {
          if (comment.type !== 'Line') {
            return;
          }
          if (referenceRegExp.test(comment.value)) {
            context.report({
              node: comment,
              messageId: 'noTripleSlashReference',
            });
          }
        });
      },
    };
  },
});
