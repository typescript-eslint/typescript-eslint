import {
  TSESLint,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type MessageIds = 'noNonNull' | 'suggestOptionalChain';

export default util.createRule<[], MessageIds>({
  name: 'no-non-null-assertion',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows non-null assertions using the `!` postfix operator',
      category: 'Stylistic Issues',
      recommended: 'warn',
      suggestion: true,
    },
    messages: {
      noNonNull: 'Forbidden non-null assertion.',
      suggestOptionalChain:
        'Consider using the optional chain operator `?.` instead. This operator includes runtime checks, so it is safer than the compile-only non-null assertion operator.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      TSNonNullExpression(node): void {
        const suggest: TSESLint.ReportSuggestionArray<MessageIds> = [];
        function convertTokenToOptional(
          replacement: '?' | '?.',
        ): TSESLint.ReportFixFunction {
          return (fixer: TSESLint.RuleFixer): TSESLint.RuleFix | null => {
            const operator = sourceCode.getTokenAfter(
              node.expression,
              util.isNonNullAssertionPunctuator,
            );
            if (operator) {
              return fixer.replaceText(operator, replacement);
            }

            return null;
          };
        }
        function removeToken(): TSESLint.ReportFixFunction {
          return (fixer: TSESLint.RuleFixer): TSESLint.RuleFix | null => {
            const operator = sourceCode.getTokenAfter(
              node.expression,
              util.isNonNullAssertionPunctuator,
            );
            if (operator) {
              return fixer.remove(operator);
            }

            return null;
          };
        }

        if (
          node.parent?.type === AST_NODE_TYPES.MemberExpression &&
          node.parent.object === node
        ) {
          if (!node.parent.optional) {
            if (node.parent.computed) {
              // it is x![y]?.z
              suggest.push({
                messageId: 'suggestOptionalChain',
                fix: convertTokenToOptional('?.'),
              });
            } else {
              // it is x!.y?.z
              suggest.push({
                messageId: 'suggestOptionalChain',
                fix: convertTokenToOptional('?'),
              });
            }
          } else {
            if (node.parent.computed) {
              // it is x!?.[y].z
              suggest.push({
                messageId: 'suggestOptionalChain',
                fix: removeToken(),
              });
            } else {
              // it is x!?.y.z
              suggest.push({
                messageId: 'suggestOptionalChain',
                fix: removeToken(),
              });
            }
          }
        } else if (
          node.parent?.type === AST_NODE_TYPES.CallExpression &&
          node.parent.callee === node
        ) {
          if (!node.parent.optional) {
            // it is x.y?.z!()
            suggest.push({
              messageId: 'suggestOptionalChain',
              fix: convertTokenToOptional('?.'),
            });
          } else {
            // it is x.y.z!?.()
            suggest.push({
              messageId: 'suggestOptionalChain',
              fix: removeToken(),
            });
          }
        }

        context.report({
          node,
          messageId: 'noNonNull',
          suggest,
        });
      },
    };
  },
});
