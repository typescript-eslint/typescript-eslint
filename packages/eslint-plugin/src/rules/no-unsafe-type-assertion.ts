import type { TSESTree } from '@typescript-eslint/utils';

import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isTypeAnyType,
  isTypeFlagSet,
  isTypeUnknownType,
  isUnsafeAssignment,
} from '../util';

export default createRule({
  name: 'no-unsafe-type-assertion',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow type assertions that widen a type',
      requiresTypeChecking: true,
    },
    messages: {
      unsafeOfAnyTypeAssertion:
        'Unsafe cast from {{type}} detected: consider using type guards or a safer cast.',
      unsafeToAnyTypeAssertion:
        'Unsafe cast to {{type}} detected: consider using a more specific type to ensure safety.',
      unsafeTypeAssertion:
        "Unsafe type assertion: type '{{type}}' is more narrow than the original type.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const compilerOptions = services.program.getCompilerOptions();

    function isTypeUnchanged(uncast: ts.Type, cast: ts.Type): boolean {
      if (uncast === cast) {
        return true;
      }

      if (
        isTypeFlagSet(uncast, ts.TypeFlags.Undefined) &&
        isTypeFlagSet(cast, ts.TypeFlags.Undefined) &&
        tsutils.isCompilerOptionEnabled(
          compilerOptions,
          'exactOptionalPropertyTypes',
        )
      ) {
        const uncastParts = tsutils
          .unionTypeParts(uncast)
          .filter(part => !isTypeFlagSet(part, ts.TypeFlags.Undefined));

        const castParts = tsutils
          .unionTypeParts(cast)
          .filter(part => !isTypeFlagSet(part, ts.TypeFlags.Undefined));

        if (uncastParts.length !== castParts.length) {
          return false;
        }

        const uncastPartsSet = new Set(uncastParts);
        return castParts.every(part => uncastPartsSet.has(part));
      }

      return false;
    }

    function checkExpression(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): void {
      const expressionType = getConstrainedTypeAtLocation(
        services,
        node.expression,
      );
      const assertedType = getConstrainedTypeAtLocation(
        services,
        node.typeAnnotation,
      );

      // consider unchanged type as safe
      const typeIsUnchanged = isTypeUnchanged(expressionType, assertedType);

      if (typeIsUnchanged) {
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

      // handle cases when casting of an any expression.
      const expressionAny = isUnsafeAssignment(
        expressionType,
        assertedType,
        checker,
        node.expression,
      );

      if (expressionAny) {
        context.report({
          node,
          messageId: 'unsafeOfAnyTypeAssertion',
          data: {
            type: tsutils.isIntrinsicErrorType(expressionAny.sender)
              ? 'error typed'
              : '`any`',
          },
        });

        return;
      }

      // handle cases when casting to an any type.
      const assertedAny = isUnsafeAssignment(
        assertedType,
        expressionType,
        checker,
        node.typeAnnotation,
      );

      if (assertedAny) {
        context.report({
          node,
          messageId: 'unsafeToAnyTypeAssertion',
          data: {
            type: tsutils.isIntrinsicErrorType(assertedAny.sender)
              ? 'error typed'
              : '`any`',
          },
        });

        return;
      }

      // fallback to checking assignability
      const nodeWidenedType =
        tsutils.isObjectType(expressionType) &&
        tsutils.isObjectFlagSet(expressionType, ts.ObjectFlags.ObjectLiteral)
          ? checker.getWidenedType(expressionType)
          : expressionType;

      const isAssertionSafe = checker.isTypeAssignableTo(
        nodeWidenedType,
        assertedType,
      );

      if (!isAssertionSafe) {
        context.report({
          node,
          messageId: 'unsafeTypeAssertion',
          data: {
            type: checker.typeToString(expressionType),
          },
        });
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
