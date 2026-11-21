import type { TSESTree } from '@typescript-eslint/utils';

import { AST_TOKEN_TYPES, ASTUtils } from '@typescript-eslint/utils';

import { createRule } from '../util';

export type MessageIds = 'preferExpectErrorComment';

export default createRule<[], MessageIds>({
  name: 'prefer-ts-expect-error',
  meta: {
    type: 'problem',
    deprecated: {
      deprecatedSince: '7.11.0',
      replacedBy: [
        {
          rule: {
            name: '@typescript-eslint/ban-ts-comment',
            url: 'https://typescript-eslint.io/rules/ban-ts-comment',
          },
        },
      ],
      url: 'https://github.com/typescript-eslint/typescript-eslint/pull/9081',
    },
    docs: {
      description: 'Enforce using `@ts-expect-error` over `@ts-ignore`',
    },
    fixable: 'code',
    messages: {
      preferExpectErrorComment:
        'Use "@ts-expect-error" to ensure an error is actually being suppressed.',
    },
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint < 9.21
    replacedBy: ['@typescript-eslint/ban-ts-comment'],
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    const tsIgnoreRegExpSingleLine = /^\s*\/?\s*@ts-ignore/;
    const tsIgnoreRegExpMultiLine = /^\s*(?:\/|\*)*\s*@ts-ignore/;

    function isLineComment(comment: TSESTree.Comment): boolean {
      return comment.type === AST_TOKEN_TYPES.Line;
    }

    function getLastCommentLine(comment: TSESTree.Comment): string {
      // For multiline comments - we look at only the last line.
      const commentlines = comment.value.split(ASTUtils.LINEBREAK_MATCHER);
      return commentlines[commentlines.length - 1];
    }

    function isValidTsIgnorePresent(comment: TSESTree.Comment): boolean {
      const line = getLastCommentLine(comment);
      return isLineComment(comment)
        ? tsIgnoreRegExpSingleLine.test(line)
        : tsIgnoreRegExpMultiLine.test(line);
    }

    return {
      Program(): void {
        const comments = context.sourceCode.getAllComments();
        comments.forEach(comment => {
          if (isValidTsIgnorePresent(comment)) {
            // The directive is the first `@ts-ignore` on the last line,
            // and the comment's value starts after its two-character `//` or `/*`.
            const lastLine = getLastCommentLine(comment);
            const directiveStart =
              comment.range[0] +
              '//'.length +
              comment.value.length -
              lastLine.length +
              lastLine.indexOf('@ts-ignore');

            context.report({
              node: comment,
              messageId: 'preferExpectErrorComment',
              fix: fixer =>
                fixer.replaceTextRange(
                  [directiveStart, directiveStart + '@ts-ignore'.length],
                  '@ts-expect-error',
                ),
            });
          }
        });
      },
    };
  },
});
