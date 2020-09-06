import { AST_TOKEN_TYPES } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

interface Options {
  'ts-expect-error'?: boolean | 'allow-with-description';
  'ts-ignore'?: boolean | 'allow-with-description';
  'ts-nocheck'?: boolean | 'allow-with-description';
  'ts-check'?: boolean | 'allow-with-description';
  minimumDescriptionLength?: number;
}

export const defaultMinimumDescriptionLength = 3;

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
        'Include a description after the "// @ts-{{directive}}" directive to explain why the @ts-{{directive}} is necessary. The description must be {{minimumDescriptionLength}} characters or longer.',
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
          minimumDescriptionLength: {
            type: 'number',
            default: defaultMinimumDescriptionLength,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': true,
      'ts-nocheck': true,
      'ts-check': false,
      minimumDescriptionLength: defaultMinimumDescriptionLength,
    },
  ],
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
            const {
              minimumDescriptionLength = defaultMinimumDescriptionLength,
            } = options;
            if (description.trim().length < minimumDescriptionLength) {
              context.report({
                data: { directive, minimumDescriptionLength },
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
