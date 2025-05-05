import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleFix, RuleFixer } from '@typescript-eslint/utils/ts-eslint';

import { AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export type MessageIds = 'preferExpectErrorComment';

export default createRule<[], MessageIds>({
  name: 'prefer-ts-expect-error',
  meta: {
    type: 'problem',
    fixable: 'code',
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
    messages: {
      preferExpectErrorComment:
        'Use "@ts-expect-error" to ensure an error is actually being suppressed.',
    },
    replacedBy: ['@typescript-eslint/ban-ts-comment'],
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const tsIgnoreRegExpSingleLine = /^\s*\/?\s*@ts-ignore/;
    const tsIgnoreRegExpMultiLine = /^\s*(?:\/|\*)*\s*@ts-ignore/;

    function isLineComment(comment: TSESTree.Comment): boolean {
      return comment.type === AST_TOKEN_TYPES.Line;
    }

    function getLastCommentLine(comment: TSESTree.Comment): string {
      if (isLineComment(comment)) {
        return comment.value;
      }

      // For multiline comments - we look at only the last line.
      const commentlines = comment.value.split('\n');
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
              fix: isLineComment(comment)
                ? lineCommentRuleFixer
                : blockCommentRuleFixer,
            });
          }
        });
      },
    };
  },
});
