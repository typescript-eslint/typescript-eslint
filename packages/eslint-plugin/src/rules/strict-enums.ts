import * as util from '../util';
import {
  getCallSignaturesOfType,
  isSymbolFlagSet,
  isTypeFlagSet,
  unionTypeParts,
} from 'tsutils';
import * as ts from 'typescript';
import { TSESTree } from '@typescript-eslint/utils';

const ALLOWED_ENUM_COMPARISON_OPERATORS = new Set(['===', '!==', '&', '|']);

export type Options = [];
export type MessageIds =
  | 'incorrectComparisonOperator'
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
      incorrectComparisonOperator:
        'You can only compare enum values (or variables that potentially have enum values) with the "===", "!==", "&", or "|" operators. (Enums are supposed to be resilient to reorganization, so you should only explicitly compare them.)',
      incorrectIncrement:
        'You cannot increment or decrement an enum type. (Enums are supposed to be resilient to reorganization, so you should explicitly assign a new value instead.)',
      mismatchedAssignment:
        'The type of the assignment does not match the declared enum type of the variable. In other words, you are trying to assign a Foo enum value to a variable with a Bar type. (Enums are supposed to be resilient to reorganization, so this kind of code can be dangerous.)',
      mismatchedComparison:
        'The two things in the comparison do not have a shared enum type. You might be trying to use a number literal, like `Foo.Value1 === 1`. Or, you might be trying to use a disparate enum type, like `Foo.Value1 === Bar.Value1`. Either way, you need to use a value that corresponds to the correct enum, like `foo === Foo.Value1`, where `foo` is type `Foo`. (Enums are supposed to be resilient to reorganization, so this kind of code can be dangerous.)',
      mismatchedFunctionArgument:
        'The argument in the function call does not match the declared enum type of the function signature. You might be trying to use a number literal, like `useFoo(1);`. Or, you might be trying to use a disparate enum type, like `useFoo(Bar.Value1)`. Either way, you need to use a value that corresponds to the correct enum, like `useFoo(Foo.Value1)`. (Enums are supposed to be resilient to reorganization, so this kind of code can be dangerous.)',
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
     */
    function getBaseEnumType(type: ts.Type): ts.Type {
      const symbol = type.getSymbol();
      if (symbol === undefined) {
        return type;
      }

      if (!isSymbolFlagSet(symbol, ts.SymbolFlags.EnumMember)) {
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
     */
    function getEnumTypes(type: ts.Type): Set<ts.Type> {
      const subTypes = unionTypeParts(type);
      const enumSubTypes = subTypes.filter(subType => isEnum(subType));
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
     * Given a call expression like `foo(1)`, derive the corresponding
     * parameter/argument types of the "real" foo function (as opposed to
     * looking at the arguments of the call expression itself).
     *
     * Note that this function breaks apart types with a union for the purposes
     * of inserting each union member in the set.
     *
     * @returns A `Map` of argument index number to a `Set` of one or more
     * types.
     */
    function getRealFunctionParameterTypes(
      node: TSESTree.CallExpression,
    ): Map<number, Set<ts.Type>> {
      const functionIdentifier = node.callee;
      const functionType = getTypeFromNode(functionIdentifier);

      /**
       * There can be potentially multiple signatures for the same function, so
       * we have to iterate over all of them.
       */
      const signatures = getCallSignaturesOfType(functionType);

      /**
       * Indexed by parameter number. For example, the first function parameter
       * type names are stored at index 0.
       */
      const paramNumToTypesMap = new Map<number, Set<ts.Type>>();

      for (const signature of signatures) {
        for (let i = 0; i < signature.parameters.length; i++) {
          const parameter = signature.parameters[i];
          if (parameter.valueDeclaration === undefined) {
            continue;
          }

          const parameterType = typeChecker.getTypeOfSymbolAtLocation(
            parameter,
            parameter.valueDeclaration,
          );

          let paramTypeSet = paramNumToTypesMap.get(i);
          if (paramTypeSet === undefined) {
            paramTypeSet = new Set<ts.Type>();
            paramNumToTypesMap.set(i, paramTypeSet);
          }

          const parameterSubTypes = unionTypeParts(parameterType);
          for (const parameterSubType of parameterSubTypes) {
            paramTypeSet.add(parameterSubType);
          }
        }
      }

      return paramNumToTypesMap;
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

    function isAssigningNonEnumValueToEnumVariable(
      leftType: ts.Type,
      rightType: ts.Type,
    ): boolean {
      const leftEnumTypes = getEnumTypes(leftType);
      if (leftEnumTypes.size === 0) {
        // This is not an enum assignment
        return false;
      }

      /**
       * As a special case, allow assignment of null and undefined in all
       * circumstances, since the TypeScript compiler should properly type-check
       * this.
       */
      if (isNullOrUndefined(rightType)) {
        return false;
      }

      const rightEnumTypes = getEnumTypes(rightType);
      const intersectingTypes = getIntersectingSet(
        leftEnumTypes,
        rightEnumTypes,
      );
      return intersectingTypes.size === 0;
    }

    function isEnum(type: ts.Type): boolean {
      return isTypeFlagSet(type, ts.TypeFlags.EnumLiteral);
    }

    /**
     * Returns true if one or more of the provided types are null or undefined.
     */
    function isNullOrUndefined(...types: ts.Type[]): boolean {
      return types.some(type => {
        const typeName = getTypeName(type);
        return typeName === 'null' || typeName === 'undefined';
      });
    }

    function isMismatchedEnumFunctionArgument(
      argumentType: ts.Type, // From the function call
      paramTypeSet: Set<ts.Type>, // From the function itself
    ): boolean {
      const argumentEnumTypes = getEnumTypes(argumentType);

      /**
       * First, allow function calls that have nothing to do with enums, like
       * the following:
       *
       * ```ts
       * function useNumber(num: number) {}
       * useNumber(0);
       * ```
       */
      if (argumentEnumTypes.size === 0 && !typeSetHasEnum(paramTypeSet)) {
        return false;
      }

      const argumentSubTypes = unionTypeParts(argumentType);

      /**
       * Allow function calls that exactly match the function type, like the
       * following:
       *
       * ```ts
       * function useApple(apple: Fruit.Apple) {}
       * useApple(Fruit.Apple);
       * ```
       *
       * Additionally, allow function calls that match one of the types in a
       * union, like the following:
       *
       * ```ts
       * function useApple(apple: Fruit.Apple | null) {}
       * useApple(null);
       * ```
       */
      if (setHasAnyElement(paramTypeSet, ...argumentSubTypes)) {
        return false;
      }

      /**
       * Allow function calls that have a base enum that match the function
       * type, like the following:
       *
       * ```ts
       * function useFruit(apple: Fruit) {}
       * useFruit(Fruit.Apple);
       * ```
       */
      if (setHasAnyElementFromSet(paramTypeSet, argumentEnumTypes)) {
        return false;
      }

      /**
       * Allow function calls that match function types with a union, like the
       * following:
       *
       * ```ts
       * function useFruit(fruit: Fruit | null) {}
       * useFruit(Fruit.Apple);
       * ```
       */
      for (const paramType of paramTypeSet.values()) {
        if (!paramType.isUnion()) {
          continue;
        }

        const paramEnumTypes = getEnumTypes(paramType);
        if (setHasAnyElementFromSet(paramEnumTypes, argumentEnumTypes)) {
          return false;
        }
      }

      return true;
    }

    function setHasAnyElement<T>(set: Set<T>, ...elements: T[]): boolean {
      return elements.some(element => set.has(element));
    }

    function setHasAnyElementFromSet<T>(set1: Set<T>, set2: Set<T>): boolean {
      for (const value of set2.values()) {
        if (set1.has(value)) {
          return true;
        }
      }

      return false;
    }

    function typeSetHasEnum(typeSet: Set<ts.Type>): boolean {
      for (const type of typeSet.values()) {
        const subTypes = unionTypeParts(type);
        for (const subType of subTypes) {
          if (isEnum(subType)) {
            return true;
          }
        }
      }

      return false;
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
          context.report({ node, messageId: 'mismatchedAssignment' });
        }
      },

      /** When a comparison between two things happen. */
      BinaryExpression(node): void {
        const leftType = getTypeFromNode(node.left);
        const rightType = getTypeFromNode(node.right);

        const leftEnumTypes = getEnumTypes(leftType);
        const rightEnumTypes = getEnumTypes(rightType);

        if (leftEnumTypes.size === 0 && rightEnumTypes.size === 0) {
          // This is not an enum comparison
          return;
        }

        /**
         * As a special exception, allow comparisons to literal null or literal
         * undefined.
         *
         * The TypeScript compiler should handle these cases properly, so the
         * lint rule is unneeded.
         */
        if (isNullOrUndefined(leftType, rightType)) {
          return;
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
        if (intersectingTypes.size === 0) {
          context.report({ node, messageId: 'mismatchedComparison' });
        }

        /** Only allow certain specific operators for enum comparisons. */
        if (!ALLOWED_ENUM_COMPARISON_OPERATORS.has(node.operator)) {
          context.report({ node, messageId: 'incorrectComparisonOperator' });
        }
      },

      /** When a function is invoked. */
      CallExpression(node): void {
        const paramNumToTypesMap = getRealFunctionParameterTypes(node);

        /**
         * Iterate through the arguments provided to the call function and cross
         * reference their types to the types of the "real" function parameters.
         */
        for (let i = 0; i < node.arguments.length; i++) {
          const argument = node.arguments[i];
          const argumentType = getTypeFromNode(argument);
          const paramTypeSet = paramNumToTypesMap.get(i);
          if (paramTypeSet === undefined) {
            // This should never happen
            continue;
          }

          /**
           * Disallow mismatched function calls, like the following:
           *
           * ```ts
           * function useFruit(fruit: Fruit) {}
           * useFruit(0);
           * ```
           */
          if (isMismatchedEnumFunctionArgument(argumentType, paramTypeSet)) {
            context.report({ node, messageId: 'mismatchedFunctionArgument' });
          }
        }
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

          // We have to use "leftTSNode.name" instead of "leftTSNode" to avoid
          // runtime errors for reasons that I don't understand
          const leftType = getTypeFromTSNode(leftTSNode.name);
          if (leftType === undefined) {
            continue;
          }

          const rightType = getTypeFromTSNode(leftTSNode.initializer);
          if (rightType === undefined) {
            continue;
          }

          if (isAssigningNonEnumValueToEnumVariable(leftType, rightType)) {
            context.report({ node, messageId: 'mismatchedAssignment' });
          }
        }
      },
    };
  },
});
