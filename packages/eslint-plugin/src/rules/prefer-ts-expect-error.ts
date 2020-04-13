import { AST_TOKEN_TYPES } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type MessageIds = 'preferExpectErrorComment';

export default util.createRule<[], MessageIds>({
  name: 'prefer-ts-expect-error',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Recommends using `// @ts-expect-error` over `// @ts-ignore`',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      preferExpectErrorComment:
        'Use "// @ts-expect-error" to ensure an error is actually being suppressed.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const tsIgnoreRegExp = /^\/*\s*@ts-ignore/;
    const sourceCode = context.getSourceCode();

    return {
      Program(): void {
        const comments = sourceCode.getAllComments();

        comments.forEach(comment => {
          if (comment.type !== AST_TOKEN_TYPES.Line) {
            return;
          }

          if (tsIgnoreRegExp.test(comment.value)) {
            context.report({
              node: comment,
              messageId: 'preferExpectErrorComment',
              fix: fixer =>
                fixer.replaceText(
                  comment,
                  `//${comment.value.replace(
                    '@ts-ignore',
                    '@ts-expect-error',
                  )}`,
                ),
            });
          }
        });
      },
    };
  },
});
