import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { createRule, getParserServices } from '../util';
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
  return tsutils.isTypeFlagSet(type, ts.TypeFlags.EnumLike)
    ? tsutils.isTypeFlagSet(type, ts.TypeFlags.NumberLiteral)
      ? ts.TypeFlags.Number
      : ts.TypeFlags.String
    : undefined;
}

export default createRule({
  name: 'no-unsafe-enum-comparison',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow comparing an enum value with a non-enum value',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      mismatched:
        'The two values in this comparison do not have a shared enum type.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    return {
      'BinaryExpression[operator=/^[<>!=]?={0,2}$/]'(
        node: TSESTree.BinaryExpression,
      ): void {
        const left = parserServices.getTypeAtLocation(node.left);
        const right = parserServices.getTypeAtLocation(node.right);

        // Allow comparisons that don't have anything to do with enums:
        //
        // ```ts
        // 1 === 2;
        // ```
        const leftEnumTypes = getEnumTypes(typeChecker, left);
        const rightEnumTypes = new Set(getEnumTypes(typeChecker, right));
        if (leftEnumTypes.length === 0 && rightEnumTypes.size === 0) {
          return;
        }

        // Allow comparisons that share an enum type:
        //
        // ```ts
        // Fruit.Apple === Fruit.Banana;
        // ```
        for (const leftEnumType of leftEnumTypes) {
          if (rightEnumTypes.has(leftEnumType)) {
            return;
          }
        }

        const leftTypeParts = tsutils.unionTypeParts(left);
        const rightTypeParts = tsutils.unionTypeParts(right);

        // If a type exists in both sides, we consider this comparison safe:
        //
        // ```ts
        // declare const fruit: Fruit.Apple | 0;
        // fruit === 0;
        // ```
        for (const leftTypePart of leftTypeParts) {
          if (rightTypeParts.includes(leftTypePart)) {
            return;
          }
        }

        if (
          typeViolates(leftTypeParts, right) ||
          typeViolates(rightTypeParts, left)
        ) {
          context.report({
            messageId: 'mismatched',
            node,
          });
        }
      },
    };
  },
});
