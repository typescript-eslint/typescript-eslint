import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import * as util from '../util';
import { getEnumTypes } from './enum-utils/shared';

/**
 * @returns Whether the right type is an unsafe comparison against any left type.
 */
function typeViolates(leftTypeParts: ts.Type[], right: ts.Type): boolean {
  const leftValueKinds = new Set(leftTypeParts.map(getEnumValueType));

  return (
    (leftValueKinds.has(ts.TypeFlags.Number) &&
      tsutils.isTypeFlagSet(
        right,
        ts.TypeFlags.Number | ts.TypeFlags.NumberLike,
      )) ||
    (leftValueKinds.has(ts.TypeFlags.String) &&
      tsutils.isTypeFlagSet(
        right,
        ts.TypeFlags.String | ts.TypeFlags.StringLike,
      ))
  );
}

/**
 * @returns What type a type's enum value is (number or string), if either.
 */
function getEnumValueType(type: ts.Type): ts.TypeFlags | undefined {
  return util.isTypeFlagSet(type, ts.TypeFlags.EnumLike)
    ? util.isTypeFlagSet(type, ts.TypeFlags.NumberLiteral)
      ? ts.TypeFlags.Number
      : ts.TypeFlags.String
    : undefined;
}

export default util.createRule({
  name: 'no-unsafe-enum-comparison',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow comparing an enum value with a non-enum value',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      mismatchedCondition:
        'The two values in this comparison do not have a shared enum type.',
      mismatchedCase:
        'The case statement does not have a shared enum type with the switch predicate.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    function isMismatchedComparison(
      leftNode: TSESTree.Node,
      rightNode: TSESTree.Node,
    ): boolean {
      const leftType = parserServices.getTypeAtLocation(leftNode);
      const rightType = parserServices.getTypeAtLocation(rightNode);

      // Allow comparisons that don't have anything to do with enums:
      //
      // ```ts
      // 1 === 2;
      // ```
      const leftEnumTypes = getEnumTypes(typeChecker, leftType);
      const rightEnumTypes = new Set(getEnumTypes(typeChecker, rightType));
      if (leftEnumTypes.length === 0 && rightEnumTypes.size === 0) {
        return false;
      }

      // Allow comparisons that share an enum type:
      //
      // ```ts
      // Fruit.Apple === Fruit.Banana;
      // ```
      for (const leftEnumType of leftEnumTypes) {
        if (rightEnumTypes.has(leftEnumType)) {
          return false;
        }
      }

      const leftTypeParts = tsutils.unionTypeParts(leftType);
      const rightTypeParts = tsutils.unionTypeParts(rightType);

      // If a type exists in both sides, we consider this comparison safe:
      //
      // ```ts
      // declare const fruit: Fruit.Apple | 0;
      // fruit === 0;
      // ```
      for (const leftTypePart of leftTypeParts) {
        if (rightTypeParts.includes(leftTypePart)) {
          return false;
        }
      }

      return (
        typeViolates(leftTypeParts, rightType) || typeViolates(rightTypeParts, leftType)
      );
    }

    return {
      'BinaryExpression[operator=/^[<>!=]?={0,2}$/]'(
        node: TSESTree.BinaryExpression,
      ): void {
        if (isMismatchedComparison(node.left, node.right)) {
          context.report({
            messageId: 'mismatchedCondition',
            node,
          });
        }
      },

      SwitchCase(node): void {
        // Ignore `default` cases.
        if (node.test == null) {
          return;
        }

        const { parent } = node;

        /**
         * @see https://github.com/typescript-eslint/typescript-eslint/issues/6225
         */
        const switchStatement = parent as TSESTree.SwitchStatement;

        if (isMismatchedComparison(switchStatement.discriminant, node.test)) {
          context.report({
            messageId: 'mismatchedCase',
            node,
          });
        }
      },
    };
  },
});
