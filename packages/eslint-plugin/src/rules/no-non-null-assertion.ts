import type { TSESLint } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  isAssignee,
  isClosingParenToken,
  isNonNullAssertionPunctuator,
  nullThrows,
  NullThrowsReasons,
} from '../util';

export type MessageIds = 'noNonNull' | 'suggestOptionalChain';

export default createRule<[], MessageIds>({
  name: 'no-non-null-assertion',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow non-null assertions using the `!` postfix operator',
      recommended: 'strict',
    },
    hasSuggestions: true,
    messages: {
      noNonNull: 'Forbidden non-null assertion.',
      suggestOptionalChain:
        'Consider using the optional chain operator `?.` instead. This operator includes runtime checks, so it is safer than the compile-only non-null assertion operator.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    return {
      TSNonNullExpression(node): void {
        const suggest: TSESLint.ReportSuggestionArray<MessageIds> = [];

        // it always exists in non-null assertion
        const nonNullOperator = nullThrows(
          context.sourceCode.getTokenAfter(
            node.expression,
            isNonNullAssertionPunctuator,
          ),
          NullThrowsReasons.MissingToken('!', 'expression'),
        );

        function convertToOptionalChain(): TSESLint.ReportFixFunction {
          return fixer => {
            // x!.y, x![y], or x!(), possibly parenthesized as in (x!).y
            //   ^ tokenAfterNode
            const tokenAfterNode = nullThrows(
              context.sourceCode.getTokenAfter(
                node,
                token => !isClosingParenToken(token),
              ),
              NullThrowsReasons.MissingToken('member access or call', '!'),
            );

            if (tokenAfterNode.value === '.') {
              return [
                fixer.remove(nonNullOperator),
                fixer.insertTextBefore(tokenAfterNode, '?'),
              ];
            }

            // the `!` itself, or the last `)` around the non-null expression
            const tokenBeforeAccess = nullThrows(
              context.sourceCode.getTokenBefore(tokenAfterNode),
              NullThrowsReasons.MissingToken('!', 'member access or call'),
            );
            return [
              fixer.remove(nonNullOperator),
              fixer.insertTextAfter(tokenBeforeAccess, '?.'),
            ];
          };
        }

        function removeToken(): TSESLint.ReportFixFunction {
          return fixer => fixer.remove(nonNullOperator);
        }

        if (
          (node.parent.type === AST_NODE_TYPES.MemberExpression &&
            node.parent.object === node &&
            !isAssignee(node.parent)) ||
          (node.parent.type === AST_NODE_TYPES.CallExpression &&
            node.parent.callee === node)
        ) {
          suggest.push({
            messageId: 'suggestOptionalChain',
            // x!?.y, x!?.[y], and x!?.() are already optional chains
            fix: node.parent.optional
              ? removeToken()
              : convertToOptionalChain(),
          });
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
