import { AST_TOKEN_TYPES } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

interface Options {
  'ts-expect-error'?: boolean | 'allow-with-description';
  'ts-ignore'?: boolean | 'allow-with-description';
  'ts-nocheck'?: boolean | 'allow-with-description';
  'ts-check'?: boolean | 'allow-with-description';
}

const defaultOptions: [Options] = [
  {
    'ts-expect-error': true,
    'ts-ignore': true,
    'ts-nocheck': true,
    'ts-check': false,
  },
];

type MessageIds =
  | 'tsDirectiveComment'
  | 'tsDirectiveCommentRequiresDescription';

export default util.createRule<[Options], MessageIds>({
  name: 'ban-ts-comment',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Bans `// @ts-<directive>` comments from being used or requires descriptions after directive',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      tsDirectiveComment:
        'Do not use "// @ts-{{directive}}" because it alters compilation errors.',
      tsDirectiveCommentRequiresDescription:
        'Include a description after the "// @ts-{{directive}}" directive to explain why the @ts-{{directive}} is necessary.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          'ts-expect-error': {
            oneOf: [
              {
                type: 'boolean',
                default: true,
              },
              {
                enum: ['allow-with-description'],
              },
            ],
          },
          'ts-ignore': {
            oneOf: [
              {
                type: 'boolean',
                default: true,
              },
              {
                enum: ['allow-with-description'],
              },
            ],
          },
          'ts-nocheck': {
            oneOf: [
              {
                type: 'boolean',
                default: true,
              },
              {
                enum: ['allow-with-description'],
              },
            ],
          },
          'ts-check': {
            oneOf: [
              {
                type: 'boolean',
                default: true,
              },
              {
                enum: ['allow-with-description'],
              },
            ],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions,
  create(context, [options]) {
    const tsCommentRegExp = /^\/*\s*@ts-(expect-error|ignore|check|nocheck)(.*)/;
    const sourceCode = context.getSourceCode();

    return {
      Program(): void {
        const comments = sourceCode.getAllComments();

        comments.forEach(comment => {
          if (comment.type !== AST_TOKEN_TYPES.Line) {
            return;
          }

          const [, directive, description] =
            tsCommentRegExp.exec(comment.value) ?? [];

          const fullDirective = `ts-${directive}` as keyof Options;

          const option = options[fullDirective];
          if (option === true) {
            context.report({
              data: { directive },
              node: comment,
              messageId: 'tsDirectiveComment',
            });
          }

          if (option === 'allow-with-description') {
            if (description.length === 0) {
              context.report({
                data: { directive },
                node: comment,
                messageId: 'tsDirectiveCommentRequiresDescription',
              });
            }
          }
        });
      },
    };
  },
});
