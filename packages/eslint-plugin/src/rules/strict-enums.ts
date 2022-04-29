import * as util from '../util';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import { TSESTree } from '@typescript-eslint/utils';

const NULL_OR_UNDEFINED = ts.TypeFlags.Null | ts.TypeFlags.Undefined;

const ALLOWED_TYPES_FOR_ANY_ENUM_ARGUMENT =
  ts.TypeFlags.Any |
  ts.TypeFlags.Unknown |
  ts.TypeFlags.Number |
  ts.TypeFlags.String;

const ALLOWED_ENUM_BINARY_COMPARISON_OPERATORS = new Set(['&', '|']);
const ALLOWED_ENUM_NON_BINARY_COMPARISON_OPERATORS = new Set(['===', '!==']);
const ALLOWED_ENUM_COMPARISON_OPERATORS = new Set([
  ...ALLOWED_ENUM_BINARY_COMPARISON_OPERATORS.values(),
  ...ALLOWED_ENUM_NON_BINARY_COMPARISON_OPERATORS.values(),
]);

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
        'You cannot compare enums with the "{{ operator }}" operator. You can only compare with the "===", "!==", "&", or "|" operators.',
      incorrectIncrement: 'You cannot increment or decrement an enum type.',
      mismatchedAssignment:
        'The type of the enum assignment ({{ assignmentType }}) does not match the declared enum type ({{ declaredType }}) of the variable.',
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

      if (!tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.EnumMember)) {
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

    function isEnum(type: ts.Type): boolean {
      return util.isTypeFlagSet(type, ts.TypeFlags.EnumLiteral);
    }

    function isNullOrUndefined(...types: ts.Type[]): boolean {
      return types.some(type => util.isTypeFlagSet(type, NULL_OR_UNDEFINED));
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
        const subTypes = tsutils.unionTypeParts(type);
        for (const subType of subTypes) {
          if (isEnum(subType)) {
            return true;
          }
        }
      }

      return false;
    }

    // --------------
    // Main functions
    // --------------

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
      const signatures = tsutils.getCallSignaturesOfType(functionType);

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

          const parameterSubTypes = tsutils.unionTypeParts(parameterType);
          for (const parameterSubType of parameterSubTypes) {
            paramTypeSet.add(parameterSubType);
          }
        }
      }

      return paramNumToTypesMap;
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

    function isMismatchedEnumComparison(
      operator: string,
      leftType: ts.Type,
      rightType: ts.Type,
      leftEnumTypes: Set<ts.Type>,
      rightEnumTypes: Set<ts.Type>,
    ): boolean {
      /**
       * Allow composing a variable based on enum literals using binary
       * operators, like the following:
       *
       * ```ts
       * const flags = Flag.Value1 | Flag.Value2;
       * ```
       *
       * (Even though this is an assignment, it still matches the
       * `BinaryExpression` node type.)
       */
      if (ALLOWED_ENUM_BINARY_COMPARISON_OPERATORS.has(operator)) {
        return false;
      }

      /**
       * As a special exception, allow comparisons to literal null or literal
       * undefined.
       *
       * The TypeScript compiler should handle these cases properly, so the
       * lint rule is unneeded.
       */
      if (isNullOrUndefined(leftType, rightType)) {
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

      /**
       * Allow passing enum values into functions that take in generic types
       * that should basically match any enum, like the following:
       *
       * ```ts
       * function useNumber(num: number) {}
       * useNumber(Fruit.Apple);
       * ```
       */
      for (const paramType of paramTypeSet.values()) {
        if (
          util.isTypeFlagSet(paramType, ALLOWED_TYPES_FOR_ANY_ENUM_ARGUMENT)
        ) {
          return false;
        }
      }

      const argumentSubTypes = tsutils.unionTypeParts(argumentType);

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
              assignmentType: getTypeName(leftType),
              declaredType: getTypeName(rightType),
            },
          });
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

        /** Only allow certain specific operators for enum comparisons. */
        if (!ALLOWED_ENUM_COMPARISON_OPERATORS.has(node.operator)) {
          context.report({
            node,
            messageId: 'incorrectComparisonOperator',
            data: {
              operator: node.operator,
            },
          });
        }

        if (
          isMismatchedEnumComparison(
            node.operator,
            leftType,
            rightType,
            leftEnumTypes,
            rightEnumTypes,
          )
        ) {
          context.report({ node, messageId: 'mismatchedComparison' });
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
            context.report({
              node,
              messageId: 'mismatchedFunctionArgument',
              data: {
                ordinal: getOrdinalSuffix(i + 1), // e.g. 0 --> 1st
              },
            });
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
            context.report({ node, messageId: 'mismatchedAssignment' });
          }
        }
      },
    };
  },
});
