import type { TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getParserServices,
  isObjectLiteralType,
  isTypeAnyType,
  isTypeUnknownType,
  isUnsafeAssignment,
  toWidenedType,
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
        'Unsafe assertion from {{type}} detected: consider using type guards or a safer assertion.',
      unsafeToAnyTypeAssertion:
        'Unsafe assertion to {{type}} detected: consider using a more specific type to ensure safety.',
      unsafeToUnconstrainedTypeAssertion:
        "Unsafe type assertion: '{{type}}' could be instantiated with an arbitrary type which could be unrelated to the original type.",
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

    function checkExpression(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): void {
      const expressionType = services.getTypeAtLocation(node.expression);
      const assertedType = services.getTypeAtLocation(node.typeAnnotation);

      if (expressionType === assertedType) {
        return;
      }

      // handle cases when asserting unknown ==> any.
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

      // Use the widened type to bypass excess property checking
      const expressionWidenedType = toWidenedType(checker, expressionType);

      const isAssertionSafe = checker.isTypeAssignableTo(
        expressionWidenedType,
        assertedType,
      );
      if (isAssertionSafe) {
        return;
      }

      // Produce a more specific error message when targeting a type parameter
      if (tsutils.isTypeParameter(assertedType)) {
        const assertedTypeConstraint =
          checker.getBaseConstraintOfType(assertedType);
        if (!assertedTypeConstraint) {
          // asserting to an unconstrained type parameter is unsafe
          context.report({
            node,
            messageId: 'unsafeToUnconstrainedTypeAssertion',
            data: {
              type: checker.typeToString(assertedType),
            },
          });
          return;
        }

        // special case message if the original type is assignable to the
        // constraint of the target type parameter
        const isAssignableToConstraint = checker.isTypeAssignableTo(
          expressionWidenedType,
          assertedTypeConstraint,
        );
        if (isAssignableToConstraint) {
          context.report({
            node,
            messageId: 'unsafeTypeAssertionAssignableToConstraint',
            data: {
              type: checker.typeToString(assertedType),
            },
          });
          return;
        }
      }

      // General error message
      context.report({
        node,
        messageId: 'unsafeTypeAssertion',
        data: {
          type: checker.typeToString(assertedType),
        },
      });
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
