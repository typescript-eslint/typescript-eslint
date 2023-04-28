import { AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

type DirectiveConfig =
  | boolean
  | 'allow-with-description'
  | { descriptionFormat: string };

interface Options {
  'ts-expect-error'?: DirectiveConfig;
  'ts-ignore'?: DirectiveConfig;
  'ts-nocheck'?: DirectiveConfig;
  'ts-check'?: DirectiveConfig;
  minimumDescriptionLength?: number;
}

export const defaultMinimumDescriptionLength = 3;

type MessageIds =
  | 'tsDirectiveComment'
  | 'tsDirectiveCommentRequiresDescription'
  | 'tsDirectiveCommentDescriptionNotMatchPattern';

export default util.createRule<[Options], MessageIds>({
  name: 'ban-ts-comment',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow `@ts-<directive>` comments or require descriptions after directives',
      recommended: 'recommended',
    },
    messages: {
      tsDirectiveComment:
        'Do not use "@ts-{{directive}}" because it alters compilation errors.',
      tsDirectiveCommentRequiresDescription:
        'Include a description after the "@ts-{{directive}}" directive to explain why the @ts-{{directive}} is necessary. The description must be {{minimumDescriptionLength}} characters or longer.',
      tsDirectiveCommentDescriptionNotMatchPattern:
        'The description for the "@ts-{{directive}}" directive must match the {{format}} format.',
    },
    schema: [
      {
        $defs: {
          directiveConfigSchema: {
            oneOf: [
              {
                type: 'boolean',
                default: true,
              },
              {
                type: 'string',
                enum: ['allow-with-description'],
              },
              {
                type: 'object',
                additionalProperties: false,
                properties: {
                  descriptionFormat: { type: 'string' },
                },
              },
            ],
          },
        },
        properties: {
          'ts-expect-error': { $ref: '#/items/0/$defs/directiveConfigSchema' },
          'ts-ignore': { $ref: '#/items/0/$defs/directiveConfigSchema' },
          'ts-nocheck': { $ref: '#/items/0/$defs/directiveConfigSchema' },
          'ts-check': { $ref: '#/items/0/$defs/directiveConfigSchema' },
          minimumDescriptionLength: {
            type: 'number',
            default: defaultMinimumDescriptionLength,
          },
        },
        type: 'object',
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
    /*
      The regex used are taken from the ones used in the official TypeScript repo -
      https://github.com/microsoft/TypeScript/blob/408c760fae66080104bc85c449282c2d207dfe8e/src/compiler/scanner.ts#L288-L296
    */
    const commentDirectiveRegExSingleLine =
      /^\/*\s*@ts-(?<directive>expect-error|ignore|check|nocheck)(?<description>.*)/;
    const commentDirectiveRegExMultiLine =
      /^\s*(?:\/|\*)*\s*@ts-(?<directive>expect-error|ignore|check|nocheck)(?<description>.*)/;
    const sourceCode = context.getSourceCode();

    const descriptionFormats = new Map<string, RegExp>();
    for (const directive of [
      'ts-expect-error',
      'ts-ignore',
      'ts-nocheck',
      'ts-check',
    ] as const) {
      const option = options[directive];
      if (typeof option === 'object' && option.descriptionFormat) {
        descriptionFormats.set(directive, new RegExp(option.descriptionFormat));
      }
    }

    return {
      Program(): void {
        const comments = sourceCode.getAllComments();

        comments.forEach(comment => {
          const regExp =
            comment.type === AST_TOKEN_TYPES.Line
              ? commentDirectiveRegExSingleLine
              : commentDirectiveRegExMultiLine;

          const match = regExp.exec(comment.value);
          if (!match) {
            return;
          }
          const { directive, description } = match.groups!;

          const fullDirective = `ts-${directive}` as keyof Options;

          const option = options[fullDirective];
          if (option === true) {
            context.report({
              data: { directive },
              node: comment,
              messageId: 'tsDirectiveComment',
            });
          }

          if (
            option === 'allow-with-description' ||
            (typeof option === 'object' && option.descriptionFormat)
          ) {
            const {
              minimumDescriptionLength = defaultMinimumDescriptionLength,
            } = options;
            const format = descriptionFormats.get(fullDirective);
            if (
              util.getStringLength(description.trim()) <
              minimumDescriptionLength
            ) {
              context.report({
                data: { directive, minimumDescriptionLength },
                node: comment,
                messageId: 'tsDirectiveCommentRequiresDescription',
              });
            } else if (format && !format.test(description)) {
              context.report({
                data: { directive, format: format.source },
                node: comment,
                messageId: 'tsDirectiveCommentDescriptionNotMatchPattern',
              });
            }
          }
        });
      },
    };
  },
});
