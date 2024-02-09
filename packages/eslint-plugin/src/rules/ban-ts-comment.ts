import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import { createRule, getStringLength, nullThrows } from '../util';

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

const defaultMinimumDescriptionLength = 3;

type MessageIds =
  | 'tsDirectiveComment'
  | 'tsIgnoreInsteadOfExpectError'
  | 'tsDirectiveCommentDescriptionNotMatchPattern'
  | 'tsDirectiveCommentRequiresDescription'
  | 'replaceTsIgnoreWithTsExpectError';

interface MatchedTSDirective {
  directive: string;
  description: string;
}

export default createRule<[Options], MessageIds>({
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
      tsIgnoreInsteadOfExpectError:
        'Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.',
      tsDirectiveCommentRequiresDescription:
        'Include a description after the "@ts-{{directive}}" directive to explain why the @ts-{{directive}} is necessary. The description must be {{minimumDescriptionLength}} characters or longer.',
      tsDirectiveCommentDescriptionNotMatchPattern:
        'The description for the "@ts-{{directive}}" directive must match the {{format}} format.',
      replaceTsIgnoreWithTsExpectError:
        'Replace "@ts-ignore" with "@ts-expect-error".',
    },
    hasSuggestions: true,
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
    // https://github.com/microsoft/TypeScript/blob/6f1ad5ad8bec5671f7e951a3524b62d82ec4be68/src/compiler/parser.ts#L10591
    const singleLinePragmaRegEx =
      /^\/\/\/?\s*@ts-(?<directive>check|nocheck)(?<description>.*)$/;

    /*
      The regex used are taken from the ones used in the official TypeScript repo -
      https://github.com/microsoft/TypeScript/blob/6f1ad5ad8bec5671f7e951a3524b62d82ec4be68/src/compiler/scanner.ts#L340-L348
    */
    const commentDirectiveRegExSingleLine =
      /^\/*\s*@ts-(?<directive>expect-error|ignore)(?<description>.*)/;
    const commentDirectiveRegExMultiLine =
      /^\s*(?:\/|\*)*\s*@ts-(?<directive>expect-error|ignore)(?<description>.*)/;

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

    function execDirectiveRegEx(
      regex: RegExp,
      str: string,
    ): MatchedTSDirective | null {
      const match = regex.exec(str);
      if (!match) {
        return null;
      }

      const { directive, description } = nullThrows(
        match.groups,
        'RegExp should contain groups',
      );
      return {
        directive: nullThrows(
          directive,
          'RegExp should contain "directive" group',
        ),
        description: nullThrows(
          description,
          'RegExp should contain "description" group',
        ),
      };
    }

    function findDirectiveInComment(
      comment: TSESTree.Comment,
    ): MatchedTSDirective | null {
      if (comment.type === AST_TOKEN_TYPES.Line) {
        const matchedPragma = execDirectiveRegEx(
          singleLinePragmaRegEx,
          `//${comment.value}`,
        );
        if (matchedPragma) {
          return matchedPragma;
        }

        return execDirectiveRegEx(
          commentDirectiveRegExSingleLine,
          comment.value,
        );
      }

      const commentLines = comment.value.split('\n');
      return execDirectiveRegEx(
        commentDirectiveRegExMultiLine,
        commentLines[commentLines.length - 1],
      );
    }

    return {
      Program(): void {
        const comments = context.sourceCode.getAllComments();

        comments.forEach(comment => {
          const match = findDirectiveInComment(comment);
          if (!match) {
            return;
          }
          const { directive, description } = match;

          const fullDirective = `ts-${directive}` as keyof Options;

          const option = options[fullDirective];
          if (option === true) {
            if (directive === 'ignore') {
              // Special case to suggest @ts-expect-error instead of @ts-ignore
              context.report({
                node: comment,
                messageId: 'tsIgnoreInsteadOfExpectError',
                suggest: [
                  {
                    messageId: 'replaceTsIgnoreWithTsExpectError',
                    fix(fixer): TSESLint.RuleFix {
                      const commentText = comment.value.replace(
                        /@ts-ignore/,
                        '@ts-expect-error',
                      );
                      return fixer.replaceText(
                        comment,
                        comment.type === AST_TOKEN_TYPES.Line
                          ? `//${commentText}`
                          : `/*${commentText}*/`,
                      );
                    },
                  },
                ],
              });
            } else {
              context.report({
                data: { directive },
                node: comment,
                messageId: 'tsDirectiveComment',
              });
            }
          }

          if (
            option === 'allow-with-description' ||
            (typeof option === 'object' && option.descriptionFormat)
          ) {
            const { minimumDescriptionLength } = options;
            const format = descriptionFormats.get(fullDirective);
            if (
              getStringLength(description.trim()) < minimumDescriptionLength!
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
