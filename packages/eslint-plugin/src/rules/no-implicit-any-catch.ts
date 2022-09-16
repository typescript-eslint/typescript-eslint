import * as util from '../util';
import type { TSESLint } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

export type Options = [
  {
    allowExplicitAny: boolean;
  },
];
export type MessageIds =
  | 'implicitAnyInCatch'
  | 'explicitAnyInCatch'
  | 'suggestExplicitUnknown';

export default util.createRule<Options, MessageIds>({
  name: 'no-implicit-any-catch',
  meta: {
    deprecated: true,
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of the implicit `any` type in catch clauses',
      recommended: false,
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      implicitAnyInCatch: 'Implicit any in catch clause.',
      explicitAnyInCatch: 'Explicit any in catch clause.',
      suggestExplicitUnknown:
        'Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowExplicitAny: {
            description:
              'Whether to disallow specifying `: any` as the error type as well. See also `no-explicit-any`.',
            type: 'boolean',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowExplicitAny: false,
    },
  ],
  create(context, [{ allowExplicitAny }]) {
    return {
      CatchClause(node): void {
        if (!node.param) {
          return; // ignore catch without variable
        }

        if (!node.param.typeAnnotation) {
          context.report({
            node,
            messageId: 'implicitAnyInCatch',
            suggest: [
              {
                messageId: 'suggestExplicitUnknown',
                fix(fixer): TSESLint.RuleFix {
                  return fixer.insertTextAfter(node.param!, ': unknown');
                },
              },
            ],
          });
        } else if (
          !allowExplicitAny &&
          node.param.typeAnnotation.typeAnnotation.type ===
            AST_NODE_TYPES.TSAnyKeyword
        ) {
          context.report({
            node,
            messageId: 'explicitAnyInCatch',
            suggest: [
              {
                messageId: 'suggestExplicitUnknown',
                fix(fixer): TSESLint.RuleFix {
                  return fixer.replaceText(
                    node.param!.typeAnnotation!,
                    ': unknown',
                  );
                },
              },
            ],
          });
        }
      },
    };
  },
});
