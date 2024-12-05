import type { TSESTree } from '@typescript-eslint/utils';

import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  isTypeAnyType,
  isTypeUnknownType,
  isUnsafeAssignment,
} from '../util';

export default createRule({
  name: 'no-unsafe-type-assertion',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow type assertions that narrow a type',
      requiresTypeChecking: true,
    },
    messages: {
      unsafeOfAnyTypeAssertion:
        'Unsafe cast from {{type}} detected: consider using type guards or a safer cast.',
      unsafeToAnyTypeAssertion:
        'Unsafe cast to {{type}} detected: consider using a more specific type to ensure safety.',
      unsafeTypeAssertion:
        "Unsafe type assertion: type '{{type}}' is more narrow than the original type.",
      unsafeTypeAssertionAssignableToConstraint:
        "Unsafe type assertion: the original type is assignable to the constraint of type '{{type}}', but '{{type}}' could be instantiated with a different subtype of its constraint.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function getAnyTypeName(type: ts.Type): string {
      return tsutils.isIntrinsicErrorType(type) ? 'error typed' : '`any`';
    }

    function isObjectLiteralType(type: ts.Type): boolean {
      return (
        tsutils.isObjectType(type) &&
        tsutils.isObjectFlagSet(type, ts.ObjectFlags.ObjectLiteral)
      );
    }

    function checkExpression(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): void {
      const expressionType = services.getTypeAtLocation(node.expression);
      const assertedType = services.getTypeAtLocation(node.typeAnnotation);

      if (expressionType === assertedType) {
        return;
      }

      // handle cases when casting unknown ==> any.
      if (isTypeAnyType(assertedType) && isTypeUnknownType(expressionType)) {
        context.report({
          node,
          messageId: 'unsafeToAnyTypeAssertion',
          data: {
            type: '`any`',
          },
        });

        return;
      }

      const unsafeExpressionAny = isUnsafeAssignment(
        expressionType,
        assertedType,
        checker,
        node.expression,
      );

      if (unsafeExpressionAny) {
        context.report({
          node,
          messageId: 'unsafeOfAnyTypeAssertion',
          data: {
            type: getAnyTypeName(unsafeExpressionAny.sender),
          },
        });

        return;
      }

      const unsafeAssertedAny = isUnsafeAssignment(
        assertedType,
        expressionType,
        checker,
        node.typeAnnotation,
      );

      if (unsafeAssertedAny) {
        context.report({
          node,
          messageId: 'unsafeToAnyTypeAssertion',
          data: {
            type: getAnyTypeName(unsafeAssertedAny.sender),
          },
        });

        return;
      }

      // Use the widened type in case of an object literal so `isTypeAssignableTo()`
      // won't fail on excess property check.
      const expressionWidenedType = isObjectLiteralType(expressionType)
        ? checker.getWidenedType(expressionType)
        : expressionType;

      const isAssertionSafe = checker.isTypeAssignableTo(
        expressionWidenedType,
        assertedType,
      );

      // Check if the asserted type is a constrained generic type to whose
      // constraint the expression is assignable, in order to produce a more
      // specific error message
      const assertedTypeConstraint =
        checker.getBaseConstraintOfType(assertedType);
      const isAssignableToConstraint =
        !!assertedTypeConstraint &&
        checker.isTypeAssignableTo(
          expressionWidenedType,
          assertedTypeConstraint,
        );

      if (!isAssertionSafe) {
        if (isAssignableToConstraint) {
          context.report({
            node,
            messageId: 'unsafeTypeAssertionAssignableToConstraint',
            data: {
              type: checker.typeToString(assertedType),
            },
          });
        } else {
          context.report({
            node,
            messageId: 'unsafeTypeAssertion',
            data: {
              type: checker.typeToString(assertedType),
            },
          });
        }
      }
    }

    return {
      'TSAsExpression, TSTypeAssertion'(
        node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
      ): void {
        checkExpression(node);
      },
    };
  },
});
