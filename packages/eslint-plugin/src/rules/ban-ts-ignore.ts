import * as util from '../util';

export default util.createRule({
  name: 'ban-ts-ignore',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans “// @ts-ignore” comments from being used',
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [],
    messages: {
      tsIgnoreComment:
        'Do not use "// @ts-ignore" comments because they suppress compilation errors.',
    },
  },
  defaultOptions: [],
  create(context) {
    const tsIgnoreRegExp = /^\/*\s*@ts-ignore/;
    const sourceCode = context.getSourceCode();

    return {
      Program(): void {
        const comments = sourceCode.getAllComments();

        comments.forEach(comment => {
          if (comment.type !== 'Line') {
            return;
          }
          if (tsIgnoreRegExp.test(comment.value)) {
            context.report({
              node: comment,
              messageId: 'tsIgnoreComment',
            });
          }
        });
      },
    };
  },
});
