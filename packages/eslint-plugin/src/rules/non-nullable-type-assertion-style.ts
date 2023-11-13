import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getOperatorPrecedence,
  getParserServices,
  OperatorPrecedence,
} from '../util';

export default createRule({
  name: 'non-nullable-type-assertion-style',
  meta: {
    docs: {
      description: 'Enforce non-null assertions over explicit type casts',
      recommended: 'stylistic',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      preferNonNullAssertion:
        'Use a ! assertion to more succinctly remove null and undefined from the type.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],

  create(context) {
    const services = getParserServices(context);
    const sourceCode = context.getSourceCode();

    const getTypesIfNotLoose = (node: TSESTree.Node): ts.Type[] | undefined => {
      const type = services.getTypeAtLocation(node);

      if (
        tsutils.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)
      ) {
        return undefined;
      }

      return tsutils.unionTypeParts(type);
    };

    const couldBeNullish = (type: ts.Type): boolean => {
      if (type.flags & ts.TypeFlags.TypeParameter) {
        const constraint = type.getConstraint();
        return constraint == null || couldBeNullish(constraint);
      } else if (tsutils.isUnionType(type)) {
        for (const part of type.types) {
          if (couldBeNullish(part)) {
            return true;
          }
        }
        return false;
      }
      return (type.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) !== 0;
    };

    const sameTypeWithoutNullish = (
      assertedTypes: ts.Type[],
      originalTypes: ts.Type[],
    ): boolean => {
      const nonNullishOriginalTypes = originalTypes.filter(
        type =>
          (type.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) === 0,
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
          const expressionSourceCode = sourceCode.getText(node.expression);

          const higherPrecedenceThanUnary =
            getOperatorPrecedence(
              services.esTreeNodeToTSNodeMap.get(node.expression).kind,
              ts.SyntaxKind.Unknown,
            ) > OperatorPrecedence.Unary;

          context.report({
            fix(fixer) {
              return fixer.replaceText(
                node,
                higherPrecedenceThanUnary
                  ? `${expressionSourceCode}!`
                  : `(${expressionSourceCode})!`,
              );
            },
            messageId: 'preferNonNullAssertion',
            node,
          });
        }
      },
    };
  },
});
