import * as util from '../util';
import {
  getCallSignaturesOfType,
  isSymbolFlagSet,
  isTypeFlagSet,
  unionTypeParts,
} from 'tsutils';
import * as ts from 'typescript';
import { TSESTree } from '@typescript-eslint/utils';

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
        'You can only compare enum values (or variables that potentially have enum values) with the strict equality (===) and the strict inequality (!==) operators. (Enums are supposed to be resilient to reorganization, so you should only explicitly compare them.)',
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
     * @returns A `Map` of argument index number to a `Set` of one or more
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

          let typeSet = paramNumToTypesMap.get(i);
          if (typeSet === undefined) {
            typeSet = new Set<ts.Type>();
            paramNumToTypesMap.set(i, typeSet);
          }

          typeSet.add(parameterType);
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

    function typeIncludesNull(type: ts.Type): boolean {
      return typeIncludesTypeName(type, 'null');
    }

    function typeIncludesTypeName(type: ts.Type, typeName: string): boolean {
      const subTypes = unionTypeParts(type);
      const subTypeNames = subTypes.map(subType => getTypeName(subType));
      return subTypeNames.includes(typeName);
    }

    function typeIncludesUndefined(type: ts.Type): boolean {
      return typeIncludesTypeName(type, 'undefined');
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
      if (typeIncludesNull(rightType) || typeIncludesUndefined(rightType)) {
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

    function isMismatchedEnumFunctionArgument(
      i: number,
      type: ts.Type,
      paramNumToTypesMap: Map<number, Set<ts.Type>>,
    ): boolean {
      const typeSet = paramNumToTypesMap.get(i);
      if (typeSet === undefined) {
        // This should never happen
        return false;
      }

      // First, ignore all function arguments that don't have any enum types
      if (!typeSetHasEnum(typeSet)) {
        return false;
      }

      /**
       * Allow function calls that exactly match the function type, like the
       * following:
       *
       * ```ts
       * function useApple(apple: Fruit.Apple) {}
       * useApple(Fruit.Apple);
       * ```
       */
      if (typeSet.has(type)) {
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
      const baseEnumType = getBaseEnumType(type);
      if (typeSet.has(baseEnumType)) {
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
      for (const paramType of typeSet.values()) {
        if (!paramType.isUnion()) {
          continue;
        }

        /**
         * Naively, you would expect the parts of a "Fruit | null" type to be:
         * [Fruit, null]
         *
         * Instead, they are actually:
         * [Fruit.Apple, Fruit.Banana, Fruit.Pear, null]
         *
         * Thus, we must get the base types.
         */
        const subTypes = unionTypeParts(paramType);

        for (const subType of subTypes) {
          const baseEnumTypeSubType = getBaseEnumType(subType);
          if (baseEnumType === baseEnumTypeSubType) {
            return false;
          }
        }
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

        /**
         * Only allow the strict equality and strict inequality operators for
         * enums comparisons.
         */
        if (node.operator !== '===' && node.operator !== '!==') {
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

          /**
           * Disallow mismatched function calls, like the following:
           *
           * ```ts
           * function useFruit(fruit: Fruit) {}
           * useFruit(0);
           * ```
           */
          if (
            isMismatchedEnumFunctionArgument(
              i,
              argumentType,
              paramNumToTypesMap,
            )
          ) {
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
