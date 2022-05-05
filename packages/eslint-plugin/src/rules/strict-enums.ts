import * as util from '../util';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import { TSESTree } from '@typescript-eslint/utils';

/** These operators are always considered to be safe. */
const ALLOWED_ENUM_OPERATORS = new Set(['in', '|', '&', '|=', '&=']);

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

export default util.createRule<Options, MessageIds>({
  name: 'strict-enums',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows the usage of unsafe enum patterns',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      incorrectIncrement: 'You cannot increment or decrement an enum type.',
      mismatchedAssignment:
        'The type of the enum assignment does not match the declared enum type of the variable.',
      mismatchedComparison:
        'The two things in the comparison do not have a shared enum type.',
      mismatchedFunctionArgument:
        'The {{ ordinal }} argument in the function call does not match the declared enum type of the function signature.',
    },
    schema: [
      {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    // ----------------
    // Helper functions
    // ----------------

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
      if (symbol === undefined) {
        return type;
      }

      if (!util.isSymbolFlagSet(symbol, ts.SymbolFlags.EnumMember)) {
        return type;
      }

      const { valueDeclaration } = symbol;
      if (valueDeclaration === undefined) {
        return type;
      }

      const parentType = getTypeFromTSNode(valueDeclaration.parent);
      if (parentType === undefined) {
        return type;
      }

      return parentType;
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
        isEnum(subType),
      );
      const baseEnumSubTypes = enumSubTypes.map(subType =>
        getBaseEnumType(subType),
      );
      return new Set(baseEnumSubTypes);
    }

    /**
     * Given a set A and set B, return a set that contains only elements that are in
     * both sets.
     */
    function getIntersectingSet<T>(a: Set<T>, b: Set<T>): Set<T> {
      const intersectingValues = [...a.values()].filter(value => b.has(value));
      return new Set(intersectingValues);
    }

    /**
     * From:
     * https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
     */
    function getOrdinalSuffix(i: number): string {
      const j = i % 10;
      const k = i % 100;
      if (j == 1 && k != 11) {
        return `${i}st`;
      }
      if (j == 2 && k != 12) {
        return `${i}nd`;
      }
      if (j == 3 && k != 13) {
        return `${i}rd`;
      }
      return `${i}th`;
    }

    function getTypeFromNode(node: TSESTree.Node): ts.Type {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      return getTypeFromTSNode(tsNode);
    }

    function getTypeFromTSNode(tsNode: ts.Node): ts.Type {
      return typeChecker.getTypeAtLocation(tsNode);
    }

    function getTypeName(type: ts.Type): string {
      return util.getTypeName(typeChecker, type);
    }

    function hasEnumTypes(type: ts.Type): boolean {
      const enumTypes = getEnumTypes(type);
      return enumTypes.size > 0;
    }

    function hasNumber(type: ts.Type): boolean {
      return hasType(type, ts.TypeFlags.NumberLike);
    }

    function hasString(type: ts.Type): boolean {
      return hasType(type, ts.TypeFlags.StringLike);
    }

    /**
     * This will return false for any enum-like type, since it would
     * subsequently not be a "pure" type anymore.
     */
    function hasType(type: ts.Type, typeFlag: ts.TypeFlags): boolean {
      if (type.isUnion()) {
        const unionSubTypes = tsutils.unionTypeParts(type);
        for (const subType of unionSubTypes) {
          if (hasType(subType, typeFlag)) {
            return true;
          }
        }
      }

      if (type.isIntersection()) {
        const intersectionSubTypes = tsutils.intersectionTypeParts(type);
        for (const subType of intersectionSubTypes) {
          if (hasType(subType, typeFlag)) {
            return true;
          }
        }
      }

      return (
        util.isTypeFlagSet(type, typeFlag) &&
        !util.isTypeFlagSet(type, ts.TypeFlags.EnumLike)
      );
    }

    function isEnum(type: ts.Type): boolean {
      return util.isTypeFlagSet(type, ts.TypeFlags.EnumLiteral);
    }

    function isNullOrUndefinedOrAnyOrUnknownOrNever(
      ...types: ts.Type[]
    ): boolean {
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

    function setHasAnyElementFromSet<T>(set1: Set<T>, set2: Set<T>): boolean {
      for (const value of set2.values()) {
        if (set1.has(value)) {
          return true;
        }
      }

      return false;
    }

    // --------------
    // Main functions
    // --------------

    function checkCallExpression(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const signature = typeChecker.getResolvedSignature(tsNode);
      if (signature === undefined) {
        return;
      }

      /**
       * The `getDeclaration` method actually returns
       * `ts.SignatureDeclaration | undefined`, not `ts.SignatureDeclaration`.
       */
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
          const parameterTSNode = getTypeFromTSNode(parameter);
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
            node,
            messageId: 'mismatchedFunctionArgument',
            data: {
              ordinal: getOrdinalSuffix(i + 1), // e.g. 0 --> 1st
              argumentType: getTypeName(argumentType),
              parameterType: getTypeName(parameterType),
            },
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
       * As a special case, allow assignment of certain types that the
       * TypeScript compiler should handle properly.
       */
      if (isNullOrUndefinedOrAnyOrUnknownOrNever(rightType)) {
        return false;
      }

      const rightEnumTypes = getEnumTypes(rightType);
      const intersectingTypes = getIntersectingSet(
        leftEnumTypes,
        rightEnumTypes,
      );
      return intersectingTypes.size === 0;
    }

    function isMismatchedEnumComparison(
      operator: string,
      leftType: ts.Type,
      rightType: ts.Type,
    ): boolean {
      /**
       * Allow any comparisons with the some whitelisted operators.
       */
      if (ALLOWED_ENUM_OPERATORS.has(operator)) {
        return false;
      }

      const leftEnumTypes = getEnumTypes(leftType);
      const rightEnumTypes = getEnumTypes(rightType);

      if (leftEnumTypes.size === 0 && rightEnumTypes.size === 0) {
        // This is not an enum comparison
        return false;
      }

      /**
       * As a special exception, allow comparisons to null or undefined or any.
       *
       * The TypeScript compiler should handle these cases properly, so the
       * lint rule is unneeded.
       */
      if (isNullOrUndefinedOrAnyOrUnknownOrNever(leftType, rightType)) {
        return false;
      }

      /**
       * Allow comparing numbers to numbers and strings to strings in
       * complicated union/intersection types.
       */
      if (hasNumber(leftType) && hasNumber(rightType)) {
        return false;
      }
      if (hasString(leftType) && hasString(rightType)) {
        return false;
      }

      /**
       * Disallow mismatched comparisons, like the following:
       *
       * ```ts
       * if (fruit === 0) {}
       * ```
       */
      const intersectingTypes = getIntersectingSet(
        leftEnumTypes,
        rightEnumTypes,
      );
      return intersectingTypes.size === 0;
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
      const argumentEnumTypes = getEnumTypes(argumentType);
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
        if (argumentSubType.isLiteral() && !isEnum(argumentSubType)) {
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
      if (setHasAnyElementFromSet(argumentEnumTypes, parameterEnumTypes)) {
        return false;
      }

      return true;
    }

    // ------------------
    // AST node callbacks
    // ------------------

    return {
      /** When something is assigned to a variable. */
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

      /** When a comparison between two things happen. */
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

      /** When a function is invoked. */
      CallExpression(node): void {
        checkCallExpression(node);
      },

      /** When something is instantiated with the "new" keyword. */
      NewExpression(node): void {
        /**
         * We need to perform the exact same checks on a class constructor
         * invocation as we do on a normal function invocation.
         */
        checkCallExpression(node);
      },

      /** When a unary operator is invoked. */
      UpdateExpression(node): void {
        const argumentType = getTypeFromNode(node.argument);

        /**
         * Disallow using enums with unary operators, like the following:
         *
         * ```ts
         * const fruit = Fruit.Apple;
         * fruit++;
         * ```
         */
        if (hasEnumTypes(argumentType)) {
          context.report({
            node,
            messageId: 'incorrectIncrement',
          });
        }
      },

      /** When a new variable is created. */
      VariableDeclaration(node): void {
        for (const declaration of node.declarations) {
          const leftTSNode =
            parserServices.esTreeNodeToTSNodeMap.get(declaration);

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
          if (leftTSNode.initializer === undefined) {
            continue;
          }

          /**
           * We have to use `leftTSNode.name` instead of `leftTSNode` to avoid
           * runtime errors because the `typeChecker.getTypeAtLocation` method
           * expects a `ts.BindingName` instead of a`ts.VariableDeclaration`.
           * https://github.com/microsoft/TypeScript/issues/48878
           */
          const leftType = getTypeFromTSNode(leftTSNode.name);
          const rightType = getTypeFromTSNode(leftTSNode.initializer);

          if (isAssigningNonEnumValueToEnumVariable(leftType, rightType)) {
            context.report({
              node,
              messageId: 'mismatchedAssignment',
              data: {
                assignmentType: getTypeName(rightType),
                declaredType: getTypeName(leftType),
              },
            });
          }
        }
      },
    };
  },
});
