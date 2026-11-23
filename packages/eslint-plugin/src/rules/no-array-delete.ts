import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isExpressionStartNeedingParentheses,
  isParenthesized,
  isStartOfExpressionStatement,
  needsPrecedingSemicolon,
  nullThrows,
  NullThrowsReasons,
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

    /**
     * Whether the key can't name an array element: a symbol, or a string
     * literal such as `'foo'` that isn't an array index like `'0'`.
     */
    function isNonIndexKey(property: TSESTree.Expression): boolean {
      const type = getConstrainedTypeAtLocation(services, property);

      return tsutils
        .unionConstituents(type)
        .every(
          part =>
            tsutils.isTypeFlagSet(part, ts.TypeFlags.ESSymbolLike) ||
            (part.isStringLiteral() && !isArrayIndex(part.value)),
        );
    }

    return {
      'UnaryExpression[operator="delete"]'(
        node: TSESTree.UnaryExpression,
      ): void {
        const { argument } = node;

        if (
          argument.type !== AST_NODE_TYPES.MemberExpression ||
          !argument.computed ||
          isNonIndexKey(argument.property)
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
                const objectFirstToken = nullThrows(
                  context.sourceCode.getFirstToken(object),
                  NullThrowsReasons.MissingToken('first token', object.type),
                );
                // Without `delete`, a leading `{`, `function` or `class` could
                // start a block or a declaration instead of an expression.
                const target =
                  isParenthesized(object, context.sourceCode) ||
                  isExpressionStartNeedingParentheses(
                    node,
                    objectFirstToken,
                    context.sourceCode,
                  )
                    ? `(${rawTarget})`
                    : rawTarget;
                const rawKey = nodeMap.get(property).getText();
                const key = shouldHaveParentheses ? `(${rawKey})` : rawKey;

                const semicolon =
                  /^[([`/]/.test(target) &&
                  isStartOfExpressionStatement(node) &&
                  needsPrecedingSemicolon(context.sourceCode, node, target)
                    ? ';'
                    : '';

                let suggestion = `${semicolon}${target}.splice(${key}, 1)`;

                // Comments inside the target or key are already in their text.
                const comments = context.sourceCode
                  .getCommentsInside(node)
                  .filter(
                    comment =>
                      !isInside(comment, object) &&
                      !isInside(comment, property),
                  );

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

// 2 ** 32 - 1, the maximum array length
const MAX_ARRAY_LENGTH = 4_294_967_295;

// Array indices are canonical integers below the maximum array length.
function isArrayIndex(key: string): boolean {
  return /^(?:0|[1-9]\d*)$/.test(key) && Number(key) < MAX_ARRAY_LENGTH;
}

function isInside(comment: TSESTree.Comment, node: TSESTree.Node): boolean {
  return comment.range[0] >= node.range[0] && comment.range[1] <= node.range[1];
}
