import { AST_TOKEN_TYPES } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

interface Options {
  'ts-expect-error'?: boolean;
  'ts-ignore'?: boolean;
  'ts-nocheck'?: boolean;
  'ts-check'?: boolean;
}

const defaultOptions: [Options] = [
  {
    'ts-expect-error': true,
    'ts-ignore': true,
    'ts-nocheck': true,
    'ts-check': false,
  },
];

type MessageIds = 'tsDirectiveComment';

export default util.createRule<[Options], MessageIds>({
  name: 'ban-ts-comment',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans `// @ts-<directive>` comments from being used',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      tsDirectiveComment:
        'Do not use "// @ts-{{directive}}" because it alters compilation errors.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          'ts-expect-error': {
            type: 'boolean',
            default: true,
          },
          'ts-ignore': {
            type: 'boolean',
            default: true,
          },
          'ts-nocheck': {
            type: 'boolean',
            default: true,
          },
          'ts-check': {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions,
  create(context, [options]) {
    const tsCommentRegExp = /^\/*\s*@ts-(expect-error|ignore|check|nocheck)/;
    const sourceCode = context.getSourceCode();

    return {
      Program(): void {
        const comments = sourceCode.getAllComments();

        comments.forEach(comment => {
          if (comment.type !== AST_TOKEN_TYPES.Line) {
            return;
          }

          const [, directive] = tsCommentRegExp.exec(comment.value) ?? [];

          const fullDirective = `ts-${directive}` as keyof Options;

          if (options[fullDirective]) {
            context.report({
              data: { directive },
              node: comment,
              messageId: 'tsDirectiveComment',
            });
          }
        });
      },
    };
  },
});
