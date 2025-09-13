import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { createRule, getParserServices, getStaticValue } from '../util';
import {
  getEnumKeyForLiteral,
  getEnumLiterals,
  getEnumTypes,
} from './enum-utils/shared';

/**
 * @returns Whether the right type is an unsafe comparison against any left type.
 */
function typeViolates(leftTypeParts: ts.Type[], rightType: ts.Type): boolean {
  const leftEnumValueTypes = new Set(leftTypeParts.map(getEnumValueType));

  return (
    (leftEnumValueTypes.has(ts.TypeFlags.Number) && isNumberLike(rightType)) ||
    (leftEnumValueTypes.has(ts.TypeFlags.String) && isStringLike(rightType))
  );
}

function isNumberLike(type: ts.Type): boolean {
  return tsutils
    .unionConstituents(type)
    .every(unionPart =>
      tsutils
        .intersectionConstituents(unionPart)
        .some(intersectionPart =>
          tsutils.isTypeFlagSet(
            intersectionPart,
            ts.TypeFlags.Number | ts.TypeFlags.NumberLike,
          ),
        ),
    );
}

function isStringLike(type: ts.Type): boolean {
  return tsutils
    .unionConstituents(type)
    .every(unionPart =>
      tsutils
        .intersectionConstituents(unionPart)
        .some(intersectionPart =>
          tsutils.isTypeFlagSet(
            intersectionPart,
            ts.TypeFlags.String | ts.TypeFlags.StringLike,
          ),
        ),
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
    hasSuggestions: true,
    messages: {
      mismatchedCase:
        'The case statement does not have a shared enum type with the switch predicate.',
      mismatchedCondition:
        'The two values in this comparison do not have a shared enum type.',
      replaceValueWithEnum: 'Replace with an enum value comparison.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    function isMismatchedComparison(
      leftType: ts.Type,
      rightType: ts.Type,
    ): boolean {
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

      // We need to split the type into the union type parts in order to find
      // valid enum comparisons like:
      //
      // ```ts
      // declare const something: Fruit | Vegetable;
      // something === Fruit.Apple;
      // ```
      const leftTypeParts = tsutils.unionConstituents(leftType);
      const rightTypeParts = tsutils.unionConstituents(rightType);

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
        typeViolates(leftTypeParts, rightType) ||
        typeViolates(rightTypeParts, leftType)
      );
    }

    return {
      'BinaryExpression[operator=/^[<>!=]?={0,2}$/]'(
        node: TSESTree.BinaryExpression,
      ): void {
        const leftType = parserServices.getTypeAtLocation(node.left);
        const rightType = parserServices.getTypeAtLocation(node.right);

        if (isMismatchedComparison(leftType, rightType)) {
          context.report({
            node,
            messageId: 'mismatchedCondition',
            suggest: [
              {
                messageId: 'replaceValueWithEnum',
                fix(fixer): TSESLint.RuleFix | null {
                  // Replace the right side with an enum key if possible:
                  //
                  // ```ts
                  // Fruit.Apple === 'apple'; // Fruit.Apple === Fruit.Apple
                  // ```
                  const leftEnumKey = getEnumKeyForLiteral(
                    getEnumLiterals(leftType),
                    getStaticValue(node.right)?.value,
                  );

                  if (leftEnumKey) {
                    return fixer.replaceText(node.right, leftEnumKey);
                  }

                  // Replace the left side with an enum key if possible:
                  //
                  // ```ts
                  // declare const fruit: Fruit;
                  // 'apple' === Fruit.Apple; // Fruit.Apple === Fruit.Apple
                  // ```
                  const rightEnumKey = getEnumKeyForLiteral(
                    getEnumLiterals(rightType),
                    getStaticValue(node.left)?.value,
                  );

                  if (rightEnumKey) {
                    return fixer.replaceText(node.left, rightEnumKey);
                  }

                  return null;
                },
              },
            ],
          });
        }
      },

      SwitchCase(node): void {
        // Ignore `default` cases.
        if (node.test == null) {
          return;
        }

        const { parent } = node;

        const leftType = parserServices.getTypeAtLocation(parent.discriminant);
        const rightType = parserServices.getTypeAtLocation(node.test);

        if (isMismatchedComparison(leftType, rightType)) {
          context.report({
            node,
            messageId: 'mismatchedCase',
          });
        }
      },
    };
  },
});
