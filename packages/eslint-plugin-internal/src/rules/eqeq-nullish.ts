import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
  nullThrows,
  NullThrowsReasons,
} from '@typescript-eslint/utils/eslint-utils';

import { createRule } from '../util';

export default createRule({
  name: __filename,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce eqeqeq preferences around nullish comparisons',
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      unexpectedComparison:
        'Unexpected strict comparison (`{{strictOperator}}`) with `{{nullishKind}}`. In this codebase, we prefer to use loose equality as a general-purpose nullish check when possible.',
      useLooseComparisonSuggestion:
        'Use loose comparison (`{{looseOperator}} null`) instead, to check both nullish values.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      BinaryExpression(node): void {
        if (node.operator === '===' || node.operator === '!==') {
          const offendingChild = [node.left, node.right].find(
            child =>
              (child.type === AST_NODE_TYPES.Identifier &&
                child.name === 'undefined') ||
              (child.type === AST_NODE_TYPES.Literal && child.raw === 'null'),
          );

          if (offendingChild == null) {
            return;
          }

          const operatorToken = nullThrows(
            context.sourceCode.getFirstTokenBetween(
              node.left,
              node.right,
              token => token.value === node.operator,
            ),
            NullThrowsReasons.MissingToken(node.operator, 'binary expression'),
          );

          const wasLeft = node.left === offendingChild;

          const nullishKind =
            offendingChild.type === AST_NODE_TYPES.Identifier
              ? 'undefined'
              : 'null';

          const looseOperator = node.operator === '===' ? '==' : '!=';

          context.report({
            loc: wasLeft
              ? {
                  start: node.left.loc.start,
                  end: operatorToken.loc.end,
                }
              : {
                  start: operatorToken.loc.start,
                  end: node.right.loc.end,
                },

            messageId: 'unexpectedComparison',
            data: {
              nullishKind,
              strictOperator: node.operator,
            },
            suggest: [
              {
                messageId: 'useLooseComparisonSuggestion',
                data: {
                  looseOperator,
                },
                fix: fixer => [
                  fixer.replaceText(offendingChild, 'null'),
                  fixer.replaceText(operatorToken, looseOperator),
                ],
              },
            ],
          });
        }
      },
    };
  },
});
