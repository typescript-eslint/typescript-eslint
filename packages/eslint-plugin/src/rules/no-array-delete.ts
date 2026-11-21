import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isParenthesized,
  isStartOfExpressionStatement,
  needsPrecedingSemicolon,
} from '../util';

export type MessageId = 'noArrayDelete' | 'useSplice';

export default createRule<[], MessageId>({
  name: 'no-array-delete',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow using the `delete` operator on array values',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      noArrayDelete:
        'Using the `delete` operator with an array expression is unsafe.',
      useSplice: 'Use `array.splice()` instead.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isUnderlyingTypeArray(type: ts.Type): boolean {
      const predicate = (t: ts.Type): boolean =>
        checker.isArrayType(t) || checker.isTupleType(t);

      if (type.isUnion()) {
        return type.types.every(predicate);
      }

      if (type.isIntersection()) {
        return type.types.some(predicate);
      }

      return predicate(type);
    }

    return {
      'UnaryExpression[operator="delete"]'(
        node: TSESTree.UnaryExpression,
      ): void {
        const { argument } = node;

        if (
          argument.type !== AST_NODE_TYPES.MemberExpression ||
          !argument.computed
        ) {
          return;
        }

        const type = getConstrainedTypeAtLocation(services, argument.object);

        if (!isUnderlyingTypeArray(type)) {
          return;
        }

        context.report({
          node,
          messageId: 'noArrayDelete',
          suggest: [
            {
              messageId: 'useSplice',
              fix(fixer): TSESLint.RuleFix | null {
                const { object, property } = argument;

                const shouldHaveParentheses =
                  property.type === AST_NODE_TYPES.SequenceExpression;

                const nodeMap = services.esTreeNodeToTSNodeMap;
                const rawTarget = nodeMap.get(object).getText();
                const target = isParenthesized(object, context.sourceCode)
                  ? `(${rawTarget})`
                  : rawTarget;
                const rawKey = nodeMap.get(property).getText();
                const key = shouldHaveParentheses ? `(${rawKey})` : rawKey;

                const semicolon =
                  /^[([`]/.test(target) &&
                  isStartOfExpressionStatement(node) &&
                  needsPrecedingSemicolon(context.sourceCode, node)
                    ? ';'
                    : '';

                let suggestion = `${semicolon}${target}.splice(${key}, 1)`;

                const comments = context.sourceCode.getCommentsInside(node);

                if (comments.length > 0) {
                  const indentationCount = node.loc.start.column;
                  const indentation = ' '.repeat(indentationCount);

                  const commentsText = comments
                    .map(comment => {
                      return comment.type === AST_TOKEN_TYPES.Line
                        ? `//${comment.value}`
                        : `/*${comment.value}*/`;
                    })
                    .join(`\n${indentation}`);

                  suggestion = `${commentsText}\n${indentation}${suggestion}`;
                }

                return fixer.replaceText(node, suggestion);
              },
            },
          ],
        });
      },
    };
  },
});
