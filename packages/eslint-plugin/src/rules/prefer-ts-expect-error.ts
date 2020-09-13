import * as util from '../util';
import {
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  RuleFixer,
  RuleFix,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';

type MessageIds = 'preferExpectErrorComment';

export default util.createRule<[], MessageIds>({
  name: 'prefer-ts-expect-error',
  meta: {
    type: 'problem',
    docs: {
      description: 'Recommends using `@ts-expect-error` over `@ts-ignore`',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      preferExpectErrorComment:
        'Use "@ts-expect-error" to ensure an error is actually being suppressed.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const tsIgnoreRegExp = /(^|\n)((\*)*(\/)*\s*(\/\*)*\s*)*\s*@ts-ignore/;
    const sourceCode = context.getSourceCode();

    function getLastCommentLine(comment: TSESTree.Comment): string {
      if (comment.type === AST_TOKEN_TYPES.Line) {
        return comment.value;
      }

      // For multiline comments - we look at only the last line.
      const commentlines = comment.value.split('/\n');
      return commentlines[commentlines.length - 1];
    }
    return {
      Program(): void {
        const comments = sourceCode.getAllComments();
        comments.forEach(comment => {
          if (tsIgnoreRegExp.test(getLastCommentLine(comment))) {
            const lineCommentRuleFixer = (fixer: RuleFixer): RuleFix =>
              fixer.replaceText(
                comment,
                `//${comment.value.replace('@ts-ignore', '@ts-expect-error')}`,
              );

            const blockCommentRuleFixer = (fixer: RuleFixer): RuleFix =>
              fixer.replaceText(
                comment,
                `/*${comment.value.replace(
                  '@ts-ignore',
                  '@ts-expect-error',
                )}*/`,
              );

            context.report({
              node: comment,
              messageId: 'preferExpectErrorComment',
              fix:
                comment.type === AST_TOKEN_TYPES.Line
                  ? lineCommentRuleFixer
                  : blockCommentRuleFixer,
            });
          }
        });
      },
    };
  },
});
