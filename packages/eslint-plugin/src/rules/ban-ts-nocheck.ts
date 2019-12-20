import * as util from '../util';

export default util.createRule({
  name: 'ban-ts-nocheck',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans “// @ts-nocheck” comments from being used',
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [],
    messages: {
      tsNocheckComment:
        'Do not use "// @ts-nocheck" comments because they suppress compilation errors.',
    },
  },
  defaultOptions: [],
  create(context) {
    const tsNocheckRegExp = /^\/*\s*@ts-nocheck/;
    const sourceCode = context.getSourceCode();

    return {
      Program(): void {
        const comments = sourceCode.getAllComments();

        comments.forEach(comment => {
          if (comment.type !== 'Line') {
            return;
          }
          if (tsNocheckRegExp.test(comment.value)) {
            context.report({
              node: comment,
              messageId: 'tsNocheckComment',
            });
          }
        });
      },
    };
  },
});
