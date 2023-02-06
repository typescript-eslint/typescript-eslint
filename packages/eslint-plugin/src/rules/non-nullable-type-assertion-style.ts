import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tools from 'ts-api-tools';
import * as ts from 'typescript';

import * as util from '../util';

export default util.createRule({
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
    const services = util.getParserServices(context);
    const sourceCode = context.getSourceCode();

    const getTypesIfNotLoose = (node: TSESTree.Node): ts.Type[] | undefined => {
      const type = services.getTypeAtLocation(node);

      if (tools.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
        return undefined;
      }

      return tools.unionTypeParts(type);
    };

    const couldBeNullish = (type: ts.Type): boolean => {
      if (type.flags & ts.TypeFlags.TypeParameter) {
        const constraint = type.getConstraint();
        return constraint == null || couldBeNullish(constraint);
      } else if (tools.isUnionType(type)) {
        for (const part of type.types) {
          if (couldBeNullish(part)) {
            return true;
          }
        }
        return false;
      } else {
        return (
          (type.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) !== 0
        );
      }
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
      node: TSESTree.TSTypeAssertion | TSESTree.TSAsExpression,
    ): boolean => {
      return (
        node.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
        node.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier &&
        node.typeAnnotation.typeName.name === 'const'
      );
    };

    return {
      'TSAsExpression, TSTypeAssertion'(
        node: TSESTree.TSTypeAssertion | TSESTree.TSAsExpression,
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
            fix(fixer) {
              return fixer.replaceText(
                node,
                `${sourceCode.getText(node.expression)}!`,
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
