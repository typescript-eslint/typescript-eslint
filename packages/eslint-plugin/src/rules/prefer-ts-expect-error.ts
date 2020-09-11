import * as util from '../util';
import { AST_TOKEN_TYPES } from '@typescript-eslint/experimental-utils';
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
    const tsIgnoreRegExp = /^((\/)*\s*(\/\*)*\s*)*\s*@ts-ignore/;
    const sourceCode = context.getSourceCode();
    return {
      Program(): void {
        const comments = sourceCode.getAllComments();
        comments.forEach(comment => {
          if (tsIgnoreRegExp.test(comment.value)) {
            const isCommentSingleLine = comment.type == AST_TOKEN_TYPES.Line;
            const commentLineRuleFixer = (fixer: RuleFixer): RuleFix =>
              fixer.replaceText(
                comment,
                `//${comment.value.replace('@ts-ignore', '@ts-expect-error')}`,
              );

            context.report({
              node: comment,
              messageId: 'preferExpectErrorComment',
              // We currently do not support fixer for comment blocks.
              fix: isCommentSingleLine ? commentLineRuleFixer : null,
            });
          }
        });
      },
    };
  },
});
