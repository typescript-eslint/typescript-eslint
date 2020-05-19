import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'confusing-non-null-assertion-like-not-equal',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows confusing combinations of non-null assertion and equal test like `a! == b`, which looks very similar to not equal `a !== b`',
      category: 'Stylistic Issues',
      recommended: 'error',
    },
    messages: {
      confusing:
        'Confusing combinations of non-null assertion and equal test like "a! == b", which looks very similar to not equal "a !== b"',
      notNeedInEqualTest: 'unnecessary non-null assertion (!) in equal test',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      TSNonNullExpression(node: TSESTree.TSNonNullExpression): void {
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

        const nextToken = sourceCode.getTokenAfter(node);
        if (
          nextToken &&
          nextToken.type === AST_TOKEN_TYPES.Punctuator &&
          (nextToken.value === '==' || nextToken.value === '===')
        ) {
          if (
            node.parent &&
            node.parent.type === AST_NODE_TYPES.BinaryExpression &&
            (node.parent.operator === '===' || node.parent.operator === '==')
          ) {
            // a! == b
            context.report({
              node,
              messageId: 'confusing',
              suggest: [
                {
                  messageId: 'notNeedInEqualTest',
                  fix: removeToken(),
                },
              ],
            });
          } else {
            // others, like `a + b! == c`
            context.report({
              node,
              messageId: 'confusing',
            });
          }
        }
      },
    };
  },
});
