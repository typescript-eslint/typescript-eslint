import type { TSESLint } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  isNonNullAssertionPunctuator,
  nullThrows,
  NullThrowsReasons,
} from '../util';

type MessageIds = 'noNonNull' | 'suggestOptionalChain';

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
  defaultOptions: [],
  create(context) {
    return {
      TSNonNullExpression(node): void {
        const suggest: TSESLint.ReportSuggestionArray<MessageIds> = [];

        // it always exists in non-null assertion
        const nonNullOperator = context.sourceCode.getTokenAfter(
          node.expression,
          isNonNullAssertionPunctuator,
        );
        nullThrows(
          nonNullOperator,
          NullThrowsReasons.MissingToken('!', 'expression'),
        );

        const replaceTokenWithOptional =
          (): TSESLint.ReportFixFunction => fixer =>
            fixer.replaceText(nonNullOperator, '?.');

        const removeToken = (): TSESLint.ReportFixFunction => fixer =>
          fixer.remove(nonNullOperator);

        if (
          node.parent.type === AST_NODE_TYPES.MemberExpression &&
          node.parent.object === node
        ) {
          if (!node.parent.optional) {
            if (node.parent.computed) {
              // it is x![y]?.z
              suggest.push({
                messageId: 'suggestOptionalChain',
                fix: replaceTokenWithOptional(),
              });
            } else {
              // it is x!.y?.z
              suggest.push({
                messageId: 'suggestOptionalChain',
                fix(fixer) {
                  // x!.y?.z
                  //   ^ punctuator
                  const punctuator =
                    context.sourceCode.getTokenAfter(nonNullOperator);
                  nullThrows(
                    punctuator,
                    NullThrowsReasons.MissingToken('.', '!'),
                  );
                  return [
                    fixer.remove(nonNullOperator),
                    fixer.insertTextBefore(punctuator, '?'),
                  ];
                },
              });
            }
          } else {
            // it is x!?.[y].z or  x!?.y.z
            suggest.push({
              messageId: 'suggestOptionalChain',
              fix: removeToken(),
            });
          }
        } else if (
          node.parent.type === AST_NODE_TYPES.CallExpression &&
          node.parent.callee === node
        ) {
          if (!node.parent.optional) {
            // it is x.y?.z!()
            suggest.push({
              messageId: 'suggestOptionalChain',
              fix: replaceTokenWithOptional(),
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
