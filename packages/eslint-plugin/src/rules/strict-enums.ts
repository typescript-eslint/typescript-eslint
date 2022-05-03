import * as util from '../util';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import { TSESTree } from '@typescript-eslint/utils';

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
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      incorrectIncrement: 'You cannot increment or decrement an enum type.',
      mismatchedAssignment:
        'The type of the enum assignment ({{ assignmentType }}) does not match the declared enum type ({{ declaredType }}) of the variable.',
      mismatchedComparison:
        'The two things in the comparison ({{ leftType }} and {{ rightType }}) do not have a shared enum type.',
      mismatchedFunctionArgument:
        'The {{ ordinal }} argument in the function call ({{ argumentType}}) does not match the declared enum type of the function signature ({{ parameterType }}).',
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

    function hasNumberType(type: ts.Type): boolean {
      return hasType(type, ts.TypeFlags.Number);
    }

    function hasNumberLiteralType(type: ts.Type): boolean {
      return hasType(type, ts.TypeFlags.NumberLiteral);
    }

    function hasStringType(type: ts.Type): boolean {
      return hasType(type, ts.TypeFlags.String);
    }

    function hasStringLiteralType(type: ts.Type): boolean {
      return hasType(type, ts.TypeFlags.StringLiteral);
    }

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

      return util.isTypeFlagSet(type, typeFlag);
    }

    function isArray(
      type: ts.Type,
    ): type is ts.TypeReference | ts.TupleTypeReference {
      const typeName = getTypeName(type);
      return (
        typeChecker.isArrayType(type) ||
        typeChecker.isTupleType(type) ||
        typeName.startsWith('Iterable<')
      );
    }

    function isEnum(type: ts.Type): boolean {
      return util.isTypeFlagSet(type, ts.TypeFlags.EnumLiteral);
    }

    function isNever(type: ts.Type): boolean {
      return util.isTypeFlagSet(type, ts.TypeFlags.Never);
    }

    function isNullOrUndefinedOrAny(...types: ts.Type[]): boolean {
      return types.some(type =>
        util.isTypeFlagSet(
          type,
          ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.Any,
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
      // Handle arrays recursively
      if (isArray(leftType)) {
        const leftArrayType = typeChecker.getTypeArguments(leftType)[0];
        if (leftArrayType === undefined) {
          return false;
        }

        const rightSubTypes = tsutils.unionTypeParts(rightType);

        for (const rightSubType of rightSubTypes) {
          if (!isArray(rightSubType)) {
            continue;
          }

          const rightArrayType = typeChecker.getTypeArguments(rightSubType)[0];
          if (rightArrayType === undefined) {
            return false;
          }

          /**
           * Allow empty arrays, like the following:
           *
           * ```ts
           * const fruitArray: Fruit[] = [];
           * ```
           */
          if (isNever(rightArrayType)) {
            return false;
          }

          if (
            !isAssigningNonEnumValueToEnumVariable(
              leftArrayType,
              rightArrayType,
            )
          ) {
            return false;
          }
        }

        return true;
      }

      const leftEnumTypes = getEnumTypes(leftType);
      if (leftEnumTypes.size === 0) {
        // This is not an enum assignment
        return false;
      }

      /**
       * As a special case, allow assignment of null and undefined and any in
       * all circumstances, since the TypeScript compiler should properly
       * type-check this.
       */
      if (isNullOrUndefinedOrAny(rightType)) {
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
      if (isNullOrUndefinedOrAny(leftType, rightType)) {
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
      const argumentSubTypes = tsutils.unionTypeParts(argumentType);
      const parameterSubTypes = tsutils.unionTypeParts(parameterType);

      // Handle arrays recursively
      if (isArray(argumentType)) {
        const argumentArrayType = typeChecker.getTypeArguments(argumentType)[0];
        if (argumentArrayType === undefined) {
          return false;
        }

        let atLeastOneParamIsEnum = false;
        for (const parameterSubType of parameterSubTypes) {
          if (!isArray(parameterSubType)) {
            continue;
          }

          const parameterArrayType =
            typeChecker.getTypeArguments(parameterSubType)[0];
          if (parameterArrayType === undefined) {
            return false;
          }

          if (hasEnumTypes(parameterArrayType)) {
            atLeastOneParamIsEnum = true;
          }

          if (
            !isMismatchedEnumFunctionArgument(
              argumentArrayType,
              parameterArrayType,
            )
          ) {
            return false;
          }
        }

        return atLeastOneParamIsEnum;
      }

      /**
       * First, allow function calls that have nothing to do with enums, like
       * the following:
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
            data: {
              assignmentType: getTypeName(rightType),
              declaredType: getTypeName(leftType),
            },
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
            data: {
              leftType: getTypeName(leftType),
              rightType: getTypeName(rightType),
            },
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
          context.report({ node, messageId: 'incorrectIncrement' });
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
          if (leftType === undefined) {
            continue;
          }

          const rightType = getTypeFromTSNode(leftTSNode.initializer);
          if (rightType === undefined) {
            continue;
          }

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
