import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import { createRule, getStringLength, nullThrows } from '../util';

type DirectiveConfig =
  | 'allow-with-description'
  | { descriptionFormat: string }
  | boolean;

interface Options {
  minimumDescriptionLength?: number;
  'ts-check'?: DirectiveConfig;
  'ts-expect-error'?: DirectiveConfig;
  'ts-ignore'?: DirectiveConfig;
  'ts-nocheck'?: DirectiveConfig;
}

const defaultMinimumDescriptionLength = 3;

type MessageIds =
  | 'replaceTsIgnoreWithTsExpectError'
  | 'tsDirectiveComment'
  | 'tsDirectiveCommentDescriptionNotMatchPattern'
  | 'tsDirectiveCommentRequiresDescription'
  | 'tsIgnoreInsteadOfExpectError';

interface MatchedTSDirective {
  description: string;
  directive: string;
}

export default createRule<[Options], MessageIds>({
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

      const { description, directive } = nullThrows(
        match.groups,
        'RegExp should contain groups',
      );
      return {
        description: nullThrows(
          description,
          'RegExp should contain "description" group',
        ),
        directive: nullThrows(
          directive,
          'RegExp should contain "directive" group',
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
          const { description, directive } = match;

          const fullDirective = `ts-${directive}` as keyof Options;

          const option = options[fullDirective];
          if (option === true) {
            if (directive === 'ignore') {
              // Special case to suggest @ts-expect-error instead of @ts-ignore
              context.report({
                messageId: 'tsIgnoreInsteadOfExpectError',
                node: comment,
                suggest: [
                  {
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
                    messageId: 'replaceTsIgnoreWithTsExpectError',
                  },
                ],
              });
            } else {
              context.report({
                data: { directive },
                messageId: 'tsDirectiveComment',
                node: comment,
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
              getStringLength(description.trim()) <
              nullThrows(
                minimumDescriptionLength,
                'Expected minimumDescriptionLength to be set',
              )
            ) {
              context.report({
                data: { directive, minimumDescriptionLength },
                messageId: 'tsDirectiveCommentRequiresDescription',
                node: comment,
              });
            } else if (format && !format.test(description)) {
              context.report({
                data: { directive, format: format.source },
                messageId: 'tsDirectiveCommentDescriptionNotMatchPattern',
                node: comment,
              });
            }
          }
        });
      },
    };
  },
  defaultOptions: [
    {
      minimumDescriptionLength: defaultMinimumDescriptionLength,
      'ts-check': false,
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': true,
      'ts-nocheck': true,
    },
  ],
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow `@ts-<directive>` comments or require descriptions after directives',
      recommended: {
        recommended: true,
        strict: [{ minimumDescriptionLength: 10 }],
      },
    },
    hasSuggestions: true,
    messages: {
      replaceTsIgnoreWithTsExpectError:
        'Replace "@ts-ignore" with "@ts-expect-error".',
      tsDirectiveComment:
        'Do not use "@ts-{{directive}}" because it alters compilation errors.',
      tsDirectiveCommentDescriptionNotMatchPattern:
        'The description for the "@ts-{{directive}}" directive must match the {{format}} format.',
      tsDirectiveCommentRequiresDescription:
        'Include a description after the "@ts-{{directive}}" directive to explain why the @ts-{{directive}} is necessary. The description must be {{minimumDescriptionLength}} characters or longer.',
      tsIgnoreInsteadOfExpectError:
        'Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.',
    },
    schema: [
      {
        type: 'object',
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
        additionalProperties: false,
        properties: {
          minimumDescriptionLength: {
            type: 'number',
            default: defaultMinimumDescriptionLength,
          },
          'ts-check': { $ref: '#/items/0/$defs/directiveConfigSchema' },
          'ts-expect-error': { $ref: '#/items/0/$defs/directiveConfigSchema' },
          'ts-ignore': { $ref: '#/items/0/$defs/directiveConfigSchema' },
          'ts-nocheck': { $ref: '#/items/0/$defs/directiveConfigSchema' },
        },
      },
    ],
  },
  name: 'ban-ts-comment',
});
