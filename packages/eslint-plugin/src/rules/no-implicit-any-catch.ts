import * as util from '../util';
import {
  TSESLint,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';

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
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of the implicit `any` type in catch clauses',
      category: 'Best Practices',
      recommended: false,
      suggestion: true,
    },
    fixable: 'code',
    messages: {
      implicitAnyInCatch: 'Implicit any in catch clause',
      explicitAnyInCatch: 'Explicit any in catch clause',
      suggestExplicitUnknown:
        'Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowExplicitAny: {
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
