import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

/**
 * TypeScript only allows number enums, string enums, or mixed enums with both
 * numbers and strings.
 *
 * Mixed enums are a union of a number enum and a string enum, so there is
 * no separate kind for them.
 */
enum EnumKind {
  HasBothValues,
  HasNumberValues,
  HasStringValues,
  NonEnum,
}

/** These bitwise operators are always considered to be safe comparisons. */
const ALLOWED_ENUM_OPERATORS = new Set(['|=', '&=', '^=']);

/**
 * This rule can safely ignore other kinds of types (and leave the validation in
 * question to the TypeScript compiler).
 */
const IMPOSSIBLE_ENUM_TYPES =
  ts.TypeFlags.BooleanLike |
  ts.TypeFlags.NonPrimitive |
  ts.TypeFlags.ESSymbolLike;

function getEnumKind(type: ts.Type): EnumKind {
  if (!util.isTypeFlagSet(type, ts.TypeFlags.EnumLike)) {
    return EnumKind.NonEnum;
  }

  const isStringLiteral = util.isTypeFlagSet(type, ts.TypeFlags.StringLiteral);
  const isNumberLiteral = util.isTypeFlagSet(type, ts.TypeFlags.NumberLiteral);

  return isNumberLiteral
    ? isStringLiteral
      ? EnumKind.HasBothValues
      : EnumKind.HasNumberValues
    : EnumKind.HasStringValues;
}

/**
 * Returns a set containing the single `EnumKind` (if it is not a union), or
 * a set containing N `EnumKind` (if it is a union).
 */
function getEnumKinds(type: ts.Type): Set<EnumKind> {
  return type.isUnion()
    ? new Set(tsutils.unionTypeParts(type).map(getEnumKind))
    : new Set([getEnumKind(type)]);
}

function setHasAnyElementFromSet<T>(set1: Set<T>, set2: Set<T>): boolean {
  for (const value of set2.values()) {
    if (set1.has(value)) {
      return true;
    }
  }

  return false;
}

function typeHasIntersection(type: ts.Type): boolean {
  return (
    type.isIntersection() ||
    (type.isUnion() &&
      tsutils.unionTypeParts(type).every(subType => subType.isIntersection()))
  );
}

function isNullOrUndefinedOrAnyOrUnknownOrNever(...types: ts.Type[]): boolean {
  return types.some(type =>
    util.isTypeFlagSet(
      type,
      ts.TypeFlags.Null |
        ts.TypeFlags.Undefined |
        ts.TypeFlags.Any |
        ts.TypeFlags.Unknown |
        ts.TypeFlags.Never,
    ),
  );
}

export default util.createRule({
  name: 'no-unsafe-enum-comparison',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow comparing an enum value with a non-enum value',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      mismatchedComparison:
        'The two things in the comparison do not have a shared enum type.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    /*
     * If passed an enum member, returns the type of the parent. Otherwise,
     * returns itself.
     *
     * For example:
     * - `Fruit` --> `Fruit`
     * - `Fruit.Apple` --> `Fruit`
     */
    function getBaseEnumType(type: ts.Type): ts.Type {
      const symbol = type.getSymbol();
      if (
        symbol === undefined ||
        !tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.EnumMember)
      ) {
        return type;
      }

      const { valueDeclaration } = symbol;
      if (valueDeclaration === undefined) {
        return type;
      }

      return typeChecker.getTypeAtLocation(valueDeclaration.parent) ?? type;
    }

    /**
     * A type can have 0 or more enum types. For example:
     * - 123 --> []
     * - {} --> []
     * - Fruit.Apple --> [Fruit]
     * - Fruit.Apple | Vegetable.Lettuce --> [Fruit, Vegetable]
     * - Fruit.Apple | Vegetable.Lettuce | 123 --> [Fruit, Vegetable]
     * - T extends Fruit --> [Fruit]
     */
    function getEnumTypes(type: ts.Type): Set<ts.Type> {
      return new Set(
        tsutils
          // We resolve the type (or its constituents)...
          .unionTypeParts(type)
          // ...to any generic constraint...
          .map(subType => subType.getConstraint() ?? subType)
          // ...and only look at base types of enum types
          .filter(subType =>
            util.isTypeFlagSet(subType, ts.TypeFlags.EnumLiteral),
          )
          .map(getBaseEnumType),
      );
    }

    function getTypeFromNode(node: TSESTree.Node): ts.Type {
      return typeChecker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(node),
      );
    }

    function isMismatchedEnumComparison(
      operator: string,
      leftType: ts.Type,
      rightType: ts.Type,
    ): boolean {
      // Allow comparisons with allowlisted operators.
      if (ALLOWED_ENUM_OPERATORS.has(operator)) {
        return false;
      }

      // Allow comparisons that don't have anything to do with enums.
      const leftEnumTypes = getEnumTypes(leftType);
      const rightEnumTypes = getEnumTypes(rightType);
      if (leftEnumTypes.size === 0 && rightEnumTypes.size === 0) {
        return false;
      }

      // Allow comparisons to any intersection. Enum intersections would be rare
      // in real-life code, so they are out of scope for this rule.
      if (typeHasIntersection(leftType) || typeHasIntersection(rightType)) {
        return false;
      }

      // Allow comparisons to types that can never be an enum (like a function).
      //
      // (The TypeScript compiler should properly type-check these cases, so the
      // lint rule is unneeded.)
      if (
        util.isTypeFlagSet(leftType, IMPOSSIBLE_ENUM_TYPES) ||
        util.isTypeFlagSet(rightType, IMPOSSIBLE_ENUM_TYPES)
      ) {
        return false;
      }

      // Allow exact comparisons to some standard types, like null and
      // undefined.
      //
      // The TypeScript compiler should properly type-check these cases, so the
      // lint rule is unneeded.
      if (isNullOrUndefinedOrAnyOrUnknownOrNever(leftType, rightType)) {
        return false;
      }

      // Allow number enums to be compared with strings and string enums to be
      // compared with numbers.
      //
      // (The TypeScript compiler should properly type-check these cases, so the
      // lint rule is unneeded.)
      const leftEnumKinds = getEnumKinds(leftType);
      if (
        leftEnumKinds.has(EnumKind.HasStringValues) &&
        leftEnumKinds.size === 1 &&
        util.isTypeFlagSet(rightType, ts.TypeFlags.NumberLike)
      ) {
        return false;
      }
      if (
        leftEnumKinds.has(EnumKind.HasNumberValues) &&
        leftEnumKinds.size === 1 &&
        util.isTypeFlagSet(rightType, ts.TypeFlags.StringLike)
      ) {
        return false;
      }

      const rightEnumKinds = getEnumKinds(rightType);
      if (
        rightEnumKinds.has(EnumKind.HasStringValues) &&
        rightEnumKinds.size === 1 &&
        util.isTypeFlagSet(leftType, ts.TypeFlags.NumberLike)
      ) {
        return false;
      }
      if (
        rightEnumKinds.has(EnumKind.HasNumberValues) &&
        rightEnumKinds.size === 1 &&
        util.isTypeFlagSet(leftType, ts.TypeFlags.StringLike)
      ) {
        return false;
      }

      // Disallow mismatched comparisons, like the following:
      //
      // ```ts
      // if (fruit === 0) {}
      // ```
      return setHasAnyElementFromSet(leftEnumTypes, rightEnumTypes);
    }

    return {
      'BinaryExpression[operator=/=/]'(node: TSESTree.BinaryExpression): void {
        const leftType = getTypeFromNode(node.left);
        const rightType = getTypeFromNode(node.right);

        if (isMismatchedEnumComparison(node.operator, leftType, rightType)) {
          context.report({
            messageId: 'mismatchedComparison',
            node,
          });
        }
      },
    };
  },
});
