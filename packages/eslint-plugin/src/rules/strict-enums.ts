import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

/**
 * TypeScript only allows number enums, string enums, or mixed enums with both
 * numbers and strings.
 *
 * Mixed enums are be a union of a number enum and a string enum, so there is
 * no separate kind for them.
 */
enum EnumKind {
  NON_ENUM,
  HAS_NUMBER_VALUES,
  HAS_STRING_VALUES,
}

/** These operators are always considered to be safe. */
const ALLOWED_ENUM_OPERATORS = new Set(['in', '|', '&', '^', '|=', '&=', '^=']);

/**
 * See the comment for `EnumKind`.
 *
 * This rule can safely ignore other kinds of types (and leave the validation in
 * question to the TypeScript compiler).
 */
const IMPOSSIBLE_ENUM_TYPES =
  ts.TypeFlags.BooleanLike |
  ts.TypeFlags.NonPrimitive |
  ts.TypeFlags.ESSymbolLike;

const ALLOWED_TYPES_FOR_ANY_ENUM_ARGUMENT =
  ts.TypeFlags.Any |
  ts.TypeFlags.Unknown |
  ts.TypeFlags.Number |
  ts.TypeFlags.String;

export type Options = [];
export type MessageIds =
  | 'incorrectIncrement'
  | 'mismatchedAssignment'
  | 'mismatchedComparison'
  | 'mismatchedFunctionArgument';

/**
 * See the comment for the `EnumKind` enum.
 */
function getEnumKind(type: ts.Type): EnumKind {
  if (!util.isTypeFlagSet(type, ts.TypeFlags.EnumLike)) {
    return EnumKind.NON_ENUM;
  }

  const isStringLiteral = util.isTypeFlagSet(type, ts.TypeFlags.StringLiteral);
  const isNumberLiteral = util.isTypeFlagSet(type, ts.TypeFlags.NumberLiteral);

  if (isStringLiteral && !isNumberLiteral) {
    return EnumKind.HAS_STRING_VALUES;
  }

  if (isNumberLiteral && !isStringLiteral) {
    return EnumKind.HAS_NUMBER_VALUES;
  }

  throw new Error(
    'Failed to derive the type of enum, since it did not have string values or number values.',
  );
}

/**
 * Returns a set containing the single `EnumKind` (if it is not a union), or
 * a set containing N `EnumKind` (if it is a union).
 */
function getEnumKinds(type: ts.Type): Set<EnumKind> {
  if (type.isUnion()) {
    return new Set(tsutils.unionTypeParts(type).map(getEnumKind));
  }

  return new Set([getEnumKind(type)]);
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

export default util.createRule<Options, MessageIds>({
  name: 'strict-enums',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the usage of unsafe enum code patterns',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      incorrectIncrement: 'You cannot increment or decrement an enum type.',
      mismatchedAssignment:
        'The type of the enum assignment does not match the declared enum type of the variable.',
      mismatchedComparison:
        'The two things in the comparison do not have a shared enum type.',
      mismatchedFunctionArgument:
        'Argument {{ i }} in the function call does not match the declared enum type of the function signature.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    /**
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
     * A thing can have 0 or more enum types. For example:
     * - 123 --> []
     * - {} --> []
     * - Fruit.Apple --> [Fruit]
     * - Fruit.Apple | Vegetable.Lettuce --> [Fruit, Vegetable]
     * - Fruit.Apple | Vegetable.Lettuce | 123 --> [Fruit, Vegetable]
     * - T extends Fruit --> [Fruit]
     */
    function getEnumTypes(type: ts.Type): Set<ts.Type> {
      /**
       * First, we get all the parts of the union. For non-union types, this
       * will be an array with the type in it. For example:
       * - Fruit --> [Fruit]
       * - Fruit | Vegetable --> [Fruit, Vegetable]
       */
      const subTypes = tsutils.unionTypeParts(type);

      /**
       * Next, we must resolve generic types with constraints. For example:
       * - Fruit --> Fruit
       * - T extends Fruit --> Fruit
       */
      const subTypesConstraints = subTypes.map(subType => {
        const constraint = subType.getConstraint();
        return constraint === undefined ? subType : constraint;
      });

      const enumSubTypes = subTypesConstraints.filter(subType =>
        util.isTypeFlagSet(subType, ts.TypeFlags.EnumLiteral),
      );
      const baseEnumSubTypes = enumSubTypes.map(getBaseEnumType);
      return new Set(baseEnumSubTypes);
    }

    function getTypeFromNode(node: TSESTree.Node): ts.Type {
      return typeChecker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(node),
      );
    }

    function checkCallExpression(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const signature = typeChecker.getResolvedSignature(tsNode);
      if (signature === undefined) {
        return;
      }

      const declaration = signature.getDeclaration();
      if (declaration === undefined) {
        return;
      }

      /**
       * Iterate through the arguments provided to the call function and cross
       * reference their types to the types of the "real" function parameters.
       */
      for (let i = 0; i < node.arguments.length; i++) {
        const argument = node.arguments[i];
        const argumentType = getTypeFromNode(argument);
        let parameterType = signature.getTypeParameterAtPosition(i);

        /**
         * If this function parameter is a generic type that extends another
         * type, we want to compare the calling argument to the constraint
         * instead.
         *
         * For example:
         *
         * ```ts
         * function useFruit<FruitType extends Fruit>(fruitType: FruitType) {}
         * useFruit(0)
         * ```
         *
         * Here, we want to compare `Fruit.Apple` to `Fruit`, not `FruitType`,
         * because `FruitType` would just be equal to 0 in this case (and
         * would be unsafe).
         */
        const parameter = declaration.parameters[i];
        if (parameter !== undefined) {
          const parameterTSNode = typeChecker.getTypeAtLocation(parameter);
          const constraint = parameterTSNode.getConstraint();
          if (constraint !== undefined) {
            parameterType = constraint;
          }
        }

        /**
         * Disallow mismatched function calls, like the following:
         *
         * ```ts
         * function useFruit(fruit: Fruit) {}
         * useFruit(0);
         * ```
         */
        if (isMismatchedEnumFunctionArgument(argumentType, parameterType)) {
          context.report({
            node: node.arguments[i],
            messageId: 'mismatchedFunctionArgument',
            data: { i },
          });
        }
      }
    }

    function isAssigningNonEnumValueToEnumVariable(
      leftType: ts.Type,
      rightType: ts.Type,
    ): boolean {
      /**
       * First, recursively check for containers like the following:
       *
       * ```ts
       * declare let fruits: Fruit[];
       * fruits = [0, 1];
       * ```
       */
      if (
        util.isTypeReferenceType(leftType) &&
        util.isTypeReferenceType(rightType)
      ) {
        const leftTypeArguments = typeChecker.getTypeArguments(leftType);
        const rightTypeArguments = typeChecker.getTypeArguments(rightType);

        for (let i = 0; i < leftTypeArguments.length; i++) {
          const leftTypeArgument = leftTypeArguments[i];
          const rightTypeArgument = rightTypeArguments[i];
          if (
            leftTypeArgument === undefined ||
            rightTypeArgument === undefined
          ) {
            continue;
          }

          if (
            isAssigningNonEnumValueToEnumVariable(
              leftTypeArgument,
              rightTypeArgument,
            )
          ) {
            return true;
          }
        }

        return false;
      }

      const leftEnumTypes = getEnumTypes(leftType);
      if (leftEnumTypes.size === 0) {
        // This is not an enum assignment
        return false;
      }

      /**
       * As a special case, allow assignment of bottom and top types that the
       * TypeScript compiler should handle properly.
       */
      if (isNullOrUndefinedOrAnyOrUnknownOrNever(rightType)) {
        return false;
      }

      return setHasAnyElementFromSet(leftEnumTypes, getEnumTypes(rightType));
    }

    function isMismatchedEnumComparison(
      operator: string,
      leftType: ts.Type,
      rightType: ts.Type,
    ): boolean {
      /** Allow comparisons with whitelisted operators. */
      if (ALLOWED_ENUM_OPERATORS.has(operator)) {
        return false;
      }

      /** Allow comparisons that don't have anything to do with enums. */
      const leftEnumTypes = getEnumTypes(leftType);
      const rightEnumTypes = getEnumTypes(rightType);
      if (leftEnumTypes.size === 0 && rightEnumTypes.size === 0) {
        return false;
      }

      /**
       * Allow comparisons to any intersection. Enum intersections would be rare
       * in real-life code, so they are out of scope for this rule.
       */
      if (typeHasIntersection(leftType) || typeHasIntersection(rightType)) {
        return false;
      }

      /**
       * Allow comparisons to things with a type that can never be an enum (like
       * a function).
       *
       * (The TypeScript compiler should properly type-check these cases, so the
       * lint rule is unneeded.)
       */
      if (
        util.isTypeFlagSet(leftType, IMPOSSIBLE_ENUM_TYPES) ||
        util.isTypeFlagSet(rightType, IMPOSSIBLE_ENUM_TYPES)
      ) {
        return false;
      }

      /**
       * Allow exact comparisons to some standard types, like null and
       * undefined.
       *
       * The TypeScript compiler should properly type-check these cases, so the
       * lint rule is unneeded.
       */
      if (isNullOrUndefinedOrAnyOrUnknownOrNever(leftType, rightType)) {
        return false;
      }

      /**
       * Allow number enums to be compared with strings and string enums to be
       * compared with numbers.
       *
       * (The TypeScript compiler should properly type-check these cases, so the
       * lint rule is unneeded.)
       */
      const leftEnumKinds = getEnumKinds(leftType);
      if (
        leftEnumKinds.has(EnumKind.HAS_STRING_VALUES) &&
        leftEnumKinds.size === 1 &&
        util.isTypeFlagSet(rightType, ts.TypeFlags.NumberLike)
      ) {
        return false;
      }
      if (
        leftEnumKinds.has(EnumKind.HAS_NUMBER_VALUES) &&
        leftEnumKinds.size === 1 &&
        util.isTypeFlagSet(rightType, ts.TypeFlags.StringLike)
      ) {
        return false;
      }

      const rightEnumKinds = getEnumKinds(rightType);
      if (
        rightEnumKinds.has(EnumKind.HAS_STRING_VALUES) &&
        rightEnumKinds.size === 1 &&
        util.isTypeFlagSet(leftType, ts.TypeFlags.NumberLike)
      ) {
        return false;
      }
      if (
        rightEnumKinds.has(EnumKind.HAS_NUMBER_VALUES) &&
        rightEnumKinds.size === 1 &&
        util.isTypeFlagSet(leftType, ts.TypeFlags.StringLike)
      ) {
        return false;
      }

      /**
       * Disallow mismatched comparisons, like the following:
       *
       * ```ts
       * if (fruit === 0) {}
       * ```
       */
      return setHasAnyElementFromSet(leftEnumTypes, rightEnumTypes);
    }

    function isMismatchedEnumFunctionArgument(
      argumentType: ts.Type, // From the function call
      parameterType: ts.Type, // From the function itself
    ): boolean {
      /**
       * First, recursively check for functions with type containers like the
       * following:
       *
       * ```ts
       * function useFruits(fruits: Fruit[]) {}
       * useFruits([0, 1]);
       * ```
       */
      if (util.isTypeReferenceType(argumentType)) {
        const argumentTypeArguments =
          typeChecker.getTypeArguments(argumentType);

        const parameterSubTypes = tsutils.unionTypeParts(parameterType);
        for (const parameterSubType of parameterSubTypes) {
          if (!util.isTypeReferenceType(parameterSubType)) {
            continue;
          }
          const parameterTypeArguments =
            typeChecker.getTypeArguments(parameterSubType);

          for (let i = 0; i < argumentTypeArguments.length; i++) {
            const argumentTypeArgument = argumentTypeArguments[i];
            const parameterTypeArgument = parameterTypeArguments[i];
            if (
              argumentTypeArgument === undefined ||
              parameterTypeArgument === undefined
            ) {
              continue;
            }

            if (
              isMismatchedEnumFunctionArgument(
                argumentTypeArgument,
                parameterTypeArgument,
              )
            ) {
              return true;
            }
          }
        }

        return false;
      }

      /**
       * Allow function calls that have nothing to do with enums, like the
       * following:
       *
       * ```ts
       * function useNumber(num: number) {}
       * useNumber(0);
       * ```
       */
      const parameterEnumTypes = getEnumTypes(parameterType);
      if (parameterEnumTypes.size === 0) {
        return false;
      }

      /**
       * Allow passing enum values into functions that take in the "any" type
       * and similar types that should basically match any enum, like the
       * following:
       *
       * ```ts
       * function useNumber(num: number) {}
       * useNumber(Fruit.Apple);
       * ```
       */
      const parameterSubTypes = tsutils.unionTypeParts(parameterType);
      for (const parameterSubType of parameterSubTypes) {
        if (
          util.isTypeFlagSet(
            parameterSubType,
            ALLOWED_TYPES_FOR_ANY_ENUM_ARGUMENT,
          )
        ) {
          return false;
        }
      }

      /**
       * Disallow passing number literals or string literals into functions that
       * take in an enum, like the following:
       *
       * ```ts
       * function useFruit(fruit: Fruit) {}
       * declare const fruit: Fruit.Apple | 1;
       * useFruit(fruit)
       * ```
       */
      const argumentSubTypes = tsutils.unionTypeParts(argumentType);
      for (const argumentSubType of argumentSubTypes) {
        if (
          argumentSubType.isLiteral() &&
          !util.isTypeFlagSet(argumentSubType, ts.TypeFlags.EnumLiteral)
        ) {
          return true;
        }
      }

      /**
       * Allow function calls that match one of the types in a union, like the
       * following:
       *
       * ```ts
       * function useApple(fruitOrNull: Fruit | null) {}
       * useApple(null);
       * ```
       */
      const argumentSubTypesSet = new Set(argumentSubTypes);
      const parameterSubTypesSet = new Set(parameterSubTypes);
      if (setHasAnyElementFromSet(argumentSubTypesSet, parameterSubTypesSet)) {
        return false;
      }

      /**
       * Allow function calls that have a base enum that match the function
       * type, like the following:
       *
       * ```ts
       * function useFruit(fruit: Fruit) {}
       * useFruit(Fruit.Apple);
       * ```
       */
      if (
        setHasAnyElementFromSet(getEnumTypes(argumentType), parameterEnumTypes)
      ) {
        return false;
      }

      return true;
    }

    // ------------------
    // AST node callbacks
    // ------------------

    return {
      AssignmentExpression(node): void {
        const leftType = getTypeFromNode(node.left);
        const rightType = getTypeFromNode(node.right);

        if (isAssigningNonEnumValueToEnumVariable(leftType, rightType)) {
          context.report({
            node,
            messageId: 'mismatchedAssignment',
          });
        }
      },

      BinaryExpression(node): void {
        const leftType = getTypeFromNode(node.left);
        const rightType = getTypeFromNode(node.right);

        if (isMismatchedEnumComparison(node.operator, leftType, rightType)) {
          context.report({
            node,
            messageId: 'mismatchedComparison',
          });
        }
      },

      'CallExpression, NewExpression': checkCallExpression,

      UpdateExpression(node): void {
        /**
         * Disallow using enums with unary operators, like the following:
         *
         * ```ts
         * const fruit = Fruit.Apple;
         * fruit++;
         * ```
         */
        if (getEnumTypes(getTypeFromNode(node.argument)).size > 0) {
          context.report({
            node,
            messageId: 'incorrectIncrement',
          });
        }
      },

      /**
       * Allow enum declarations without an initializer, like the following:
       *
       * ```ts
       * let fruit: Fruit;
       * if (something()) {
       *   fruit = Fruit.Apple;
       * } else {
       *   fruit = Fruit.Banana;
       * }
       * ```
       */
      'VariableDeclarator[init]'(
        node: TSESTree.VariableDeclarator & { init: TSESTree.Expression },
      ): void {
        const leftType = getTypeFromNode(node.id);
        const rightType = getTypeFromNode(node.init);

        if (isAssigningNonEnumValueToEnumVariable(leftType, rightType)) {
          context.report({
            messageId: 'mismatchedAssignment',
            node,
          });
        }
      },
    };
  },
});
