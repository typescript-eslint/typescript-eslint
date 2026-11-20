import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getOperatorPrecedence,
  getParserServices,
  isParenthesized,
  isTokenOnSameLine,
  nullThrows,
  NullThrowsReasons,
  OperatorPrecedence,
} from '../util';

export default createRule({
  name: 'non-nullable-type-assertion-style',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce non-null assertions over explicit type assertions',
      recommended: 'stylistic',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      preferNonNullAssertion:
        'Use a ! assertion to more succinctly remove null and undefined from the type.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],

  create(context) {
    const services = getParserServices(context);

    const getTypesIfNotLoose = (node: TSESTree.Node): ts.Type[] | undefined => {
      const type = services.getTypeAtLocation(node);

      if (
        tsutils.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)
      ) {
        return undefined;
      }

      return tsutils.unionConstituents(type);
    };

    const couldBeNullish = (type: ts.Type): boolean => {
      if (tsutils.isTypeFlagSet(type, ts.TypeFlags.TypeParameter)) {
        const constraint = type.getConstraint();
        return constraint == null || couldBeNullish(constraint);
      }

      if (tsutils.isUnionType(type)) {
        for (const part of type.types) {
          if (couldBeNullish(part)) {
            return true;
          }
        }
        return false;
      }
      return tsutils.isTypeFlagSet(
        type,
        ts.TypeFlags.Null | ts.TypeFlags.Undefined,
      );
    };

    const sameTypeWithoutNullish = (
      assertedTypes: ts.Type[],
      originalTypes: ts.Type[],
    ): boolean => {
      const nonNullishOriginalTypes = originalTypes.filter(
        type =>
          !tsutils.isTypeFlagSet(
            type,
            ts.TypeFlags.Null | ts.TypeFlags.Undefined,
          ),
      );

      if (nonNullishOriginalTypes.length === originalTypes.length) {
        return false;
      }

      for (const assertedType of assertedTypes) {
        if (
          couldBeNullish(assertedType) ||
          !nonNullishOriginalTypes.includes(assertedType)
        ) {
          return false;
        }
      }

      for (const originalType of nonNullishOriginalTypes) {
        if (!assertedTypes.includes(originalType)) {
          return false;
        }
      }

      return true;
    };

    const isConstAssertion = (
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): boolean => {
      return (
        node.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
        node.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier &&
        node.typeAnnotation.typeName.name === 'const'
      );
    };

    return {
      'TSAsExpression, TSTypeAssertion'(
        node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
      ): void {
        if (isConstAssertion(node)) {
          return;
        }

        const originalTypes = getTypesIfNotLoose(node.expression);
        if (!originalTypes) {
          return;
        }

        const assertedTypes = getTypesIfNotLoose(node.typeAnnotation);
        if (!assertedTypes) {
          return;
        }

        if (sameTypeWithoutNullish(assertedTypes, originalTypes)) {
          context.report({
            node,
            messageId: 'preferNonNullAssertion',
            *fix(fixer) {
              const needsParens =
                !isParenthesized(node.expression, context.sourceCode) &&
                getOperatorPrecedence(
                  services.esTreeNodeToTSNodeMap.get(node.expression).kind,
                  ts.SyntaxKind.Unknown,
                ) <= OperatorPrecedence.Unary;

              // Only the assertion's own tokens are removed, so comments and
              // parentheses around the expression are kept.
              if (node.type === AST_NODE_TYPES.TSTypeAssertion) {
                const closingAngleBracket = nullThrows(
                  context.sourceCode.getTokenAfter(
                    node.typeAnnotation,
                    token =>
                      token.type === AST_TOKEN_TYPES.Punctuator &&
                      token.value === '>',
                  ),
                  NullThrowsReasons.MissingToken('>', 'type annotation'),
                );
                const tokenAfterAngleBracket = nullThrows(
                  context.sourceCode.getTokenAfter(closingAngleBracket),
                  NullThrowsReasons.MissingToken('token', '>'),
                );
                // A line break after `>` would move the expression to its own
                // line, which changes behavior after `return`, `throw`, and
                // `yield`, so the code between them is removed in that case.
                yield fixer.replaceTextRange(
                  [
                    node.range[0],
                    isTokenOnSameLine(
                      closingAngleBracket,
                      tokenAfterAngleBracket,
                    )
                      ? closingAngleBracket.range[1]
                      : tokenAfterAngleBracket.range[0],
                  ],
                  needsParens ? '(' : '',
                );
                yield fixer.insertTextAfter(node, needsParens ? ')!' : '!');
                return;
              }

              const asToken = nullThrows(
                context.sourceCode.getTokenAfter(
                  node.expression,
                  token =>
                    token.type === AST_TOKEN_TYPES.Identifier &&
                    token.value === 'as',
                ),
                NullThrowsReasons.MissingToken('as', 'expression'),
              );
              const tokenBeforeAs = nullThrows(
                context.sourceCode.getTokenBefore(asToken, {
                  includeComments: true,
                }),
                NullThrowsReasons.MissingToken('token', 'as'),
              );
              if (needsParens) {
                yield fixer.insertTextBefore(node, '(');
              }
              yield fixer.replaceTextRange(
                [tokenBeforeAs.range[1], node.range[1]],
                needsParens ? ')!' : '!',
              );
            },
          });
        }
      },
    };
  },
});
