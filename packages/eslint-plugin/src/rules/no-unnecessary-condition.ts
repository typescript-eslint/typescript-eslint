import {
  TSESTree,
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import {
  unionTypeParts,
  isFalsyType,
  isBooleanLiteralType,
  isLiteralType,
  getCallSignaturesOfType,
  isStrictCompilerOptionEnabled,
} from 'tsutils';
import {
  isTypeFlagSet,
  createRule,
  getParserServices,
  getConstrainedTypeAtLocation,
  isNullableType,
  nullThrows,
  NullThrowsReasons,
  isIdentifier,
  isTypeAnyType,
  isTypeUnknownType,
  getTypeName,
} from '../util';

// Truthiness utilities
// #region
const isTruthyLiteral = (type: ts.Type): boolean =>
  isBooleanLiteralType(type, true) || (isLiteralType(type) && !!type.value);

const isPossiblyFalsy = (type: ts.Type): boolean =>
  unionTypeParts(type)
    // PossiblyFalsy flag includes literal values, so exclude ones that
    // are definitely truthy
    .filter(t => !isTruthyLiteral(t))
    .some(type => isTypeFlagSet(type, ts.TypeFlags.PossiblyFalsy));

const isPossiblyTruthy = (type: ts.Type): boolean =>
  unionTypeParts(type).some(type => !isFalsyType(type));

// Nullish utilities
const nullishFlag = ts.TypeFlags.Undefined | ts.TypeFlags.Null;
const isNullishType = (type: ts.Type): boolean =>
  isTypeFlagSet(type, nullishFlag);

const isPossiblyNullish = (type: ts.Type): boolean =>
  unionTypeParts(type).some(isNullishType);

const isAlwaysNullish = (type: ts.Type): boolean =>
  unionTypeParts(type).every(isNullishType);

// isLiteralType only covers numbers and strings, this is a more exhaustive check.
const isLiteral = (type: ts.Type): boolean =>
  isBooleanLiteralType(type, true) ||
  isBooleanLiteralType(type, false) ||
  type.flags === ts.TypeFlags.Undefined ||
  type.flags === ts.TypeFlags.Null ||
  type.flags === ts.TypeFlags.Void ||
  isLiteralType(type);
// #endregion

export type Options = [
  {
    allowConstantLoopConditions?: boolean;
    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
  },
];

export type MessageId =
  | 'alwaysTruthy'
  | 'alwaysFalsy'
  | 'alwaysTruthyFunc'
  | 'alwaysFalsyFunc'
  | 'neverNullish'
  | 'alwaysNullish'
  | 'literalBooleanExpression'
  | 'noOverlapBooleanExpression'
  | 'never'
  | 'neverOptionalChain'
  | 'noStrictNullCheck';

export default createRule<Options, MessageId>({
  name: 'no-unnecessary-condition',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prevents conditionals where the type is always truthy or always falsy',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowConstantLoopConditions: {
            type: 'boolean',
          },
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: 'code',
    messages: {
      alwaysTruthy: 'Unnecessary conditional, value is always truthy.',
      alwaysFalsy: 'Unnecessary conditional, value is always falsy.',
      alwaysTruthyFunc:
        'This callback should return a conditional, but return is always truthy.',
      alwaysFalsyFunc:
        'This callback should return a conditional, but return is always falsy.',
      neverNullish:
        'Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined.',
      alwaysNullish:
        'Unnecessary conditional, left-hand side of `??` operator is always `null` or `undefined`.',
      literalBooleanExpression:
        'Unnecessary conditional, both sides of the expression are literal values',
      noOverlapBooleanExpression:
        'Unnecessary conditional, the types have no overlap',
      never: 'Unnecessary conditional, value is `never`',
      neverOptionalChain: 'Unnecessary optional chain on a non-nullish value',
      noStrictNullCheck:
        'This rule requires the `strictNullChecks` compiler option to be turned on to function correctly.',
    },
  },
  defaultOptions: [
    {
      allowConstantLoopConditions: false,
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
    },
  ],
  create(
    context,
    [
      {
        allowConstantLoopConditions,
        allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing,
      },
    ],
  ) {
    const service = getParserServices(context);
    const checker = service.program.getTypeChecker();
    const sourceCode = context.getSourceCode();
    const compilerOptions = service.program.getCompilerOptions();
    const isStrictNullChecks = isStrictCompilerOptionEnabled(
      compilerOptions,
      'strictNullChecks',
    );

    if (
      !isStrictNullChecks &&
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing !== true
    ) {
      context.report({
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
        messageId: 'noStrictNullCheck',
      });
    }

    function getNodeType(node: TSESTree.Expression): ts.Type {
      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      return getConstrainedTypeAtLocation(checker, tsNode);
    }

    function nodeIsArrayType(node: TSESTree.Expression): boolean {
      const nodeType = getNodeType(node);
      return checker.isArrayType(nodeType);
    }
    function nodeIsTupleType(node: TSESTree.Expression): boolean {
      const nodeType = getNodeType(node);
      return checker.isTupleType(nodeType);
    }

    function isArrayIndexExpression(node: TSESTree.Expression): boolean {
      return (
        // Is an index signature
        node.type === AST_NODE_TYPES.MemberExpression &&
        node.computed &&
        // ...into an array type
        (nodeIsArrayType(node.object) ||
          // ... or a tuple type
          (nodeIsTupleType(node.object) &&
            // Exception: literal index into a tuple - will have a sound type
            node.property.type !== AST_NODE_TYPES.Literal))
      );
    }

    /**
     * Checks if a conditional node is necessary:
     * if the type of the node is always true or always false, it's not necessary.
     */
    function checkNode(node: TSESTree.Expression): void {
      // Since typescript array index signature types don't represent the
      //  possibility of out-of-bounds access, if we're indexing into an array
      //  just skip the check, to avoid false positives
      if (isArrayIndexExpression(node)) {
        return;
      }

      // When checking logical expressions, only check the right side
      //  as the left side has been checked by checkLogicalExpressionForUnnecessaryConditionals
      if (node.type === AST_NODE_TYPES.LogicalExpression) {
        return checkNode(node.right);
      }

      const type = getNodeType(node);

      // Conditional is always necessary if it involves:
      //    `any` or `unknown` or a naked type parameter
      if (
        unionTypeParts(type).some(
          part =>
            isTypeAnyType(part) ||
            isTypeUnknownType(part) ||
            isTypeFlagSet(part, ts.TypeFlags.TypeParameter),
        )
      ) {
        return;
      }
      const messageId = isTypeFlagSet(type, ts.TypeFlags.Never)
        ? 'never'
        : !isPossiblyTruthy(type)
        ? 'alwaysFalsy'
        : !isPossiblyFalsy(type)
        ? 'alwaysTruthy'
        : undefined;

      if (messageId) {
        context.report({ node, messageId });
      }
    }

    function checkNodeForNullish(node: TSESTree.Expression): void {
      // Since typescript array index signature types don't represent the
      //  possibility of out-of-bounds access, if we're indexing into an array
      //  just skip the check, to avoid false positives
      if (isArrayIndexExpression(node)) {
        return;
      }
      const type = getNodeType(node);
      // Conditional is always necessary if it involves `any` or `unknown`
      if (isTypeAnyType(type) || isTypeUnknownType(type)) {
        return;
      }
      const messageId = isTypeFlagSet(type, ts.TypeFlags.Never)
        ? 'never'
        : !isPossiblyNullish(type)
        ? 'neverNullish'
        : isAlwaysNullish(type)
        ? 'alwaysNullish'
        : undefined;

      if (messageId) {
        context.report({ node, messageId });
      }
    }

    /**
     * Checks that a binary expression is necessarily conditional, reports otherwise.
     * If both sides of the binary expression are literal values, it's not a necessary condition.
     *
     * NOTE: It's also unnecessary if the types that don't overlap at all
     *    but that case is handled by the Typescript compiler itself.
     *    Known exceptions:
     *      * https://github.com/microsoft/TypeScript/issues/32627
     *      * https://github.com/microsoft/TypeScript/issues/37160 (handled)
     */
    const BOOL_OPERATORS = new Set([
      '<',
      '>',
      '<=',
      '>=',
      '==',
      '===',
      '!=',
      '!==',
    ]);
    function checkIfBinaryExpressionIsNecessaryConditional(
      node: TSESTree.BinaryExpression,
    ): void {
      if (!BOOL_OPERATORS.has(node.operator)) {
        return;
      }
      const leftType = getNodeType(node.left);
      const rightType = getNodeType(node.right);
      if (isLiteral(leftType) && isLiteral(rightType)) {
        context.report({ node, messageId: 'literalBooleanExpression' });
        return;
      }
      // Workaround for https://github.com/microsoft/TypeScript/issues/37160
      if (isStrictNullChecks) {
        const UNDEFINED = ts.TypeFlags.Undefined;
        const NULL = ts.TypeFlags.Null;
        const isComparable = (type: ts.Type, flag: ts.TypeFlags): boolean => {
          // Allow comparison to `any`, `unknown` or a naked type parameter.
          flag |=
            ts.TypeFlags.Any |
            ts.TypeFlags.Unknown |
            ts.TypeFlags.TypeParameter;

          // Allow loose comparison to nullish values.
          if (node.operator === '==' || node.operator === '!=') {
            flag |= NULL | UNDEFINED;
          }

          return isTypeFlagSet(type, flag);
        };

        if (
          (leftType.flags === UNDEFINED &&
            !isComparable(rightType, UNDEFINED)) ||
          (rightType.flags === UNDEFINED &&
            !isComparable(leftType, UNDEFINED)) ||
          (leftType.flags === NULL && !isComparable(rightType, NULL)) ||
          (rightType.flags === NULL && !isComparable(leftType, NULL))
        ) {
          context.report({ node, messageId: 'noOverlapBooleanExpression' });
          return;
        }
      }
    }

    /**
     * Checks that a logical expression contains a boolean, reports otherwise.
     */
    function checkLogicalExpressionForUnnecessaryConditionals(
      node: TSESTree.LogicalExpression,
    ): void {
      if (node.operator === '??') {
        checkNodeForNullish(node.left);
        return;
      }
      // Only checks the left side, since the right side might not be "conditional" at all.
      // The right side will be checked if the LogicalExpression is used in a conditional context
      checkNode(node.left);
    }

    /**
     * Checks that a testable expression of a loop is necessarily conditional, reports otherwise.
     */
    function checkIfLoopIsNecessaryConditional(
      node:
        | TSESTree.DoWhileStatement
        | TSESTree.ForStatement
        | TSESTree.WhileStatement,
    ): void {
      if (node.test === null) {
        // e.g. `for(;;)`
        return;
      }

      /**
       * Allow:
       *   while (true) {}
       *   for (;true;) {}
       *   do {} while (true)
       */
      if (
        allowConstantLoopConditions &&
        isBooleanLiteralType(getNodeType(node.test), true)
      ) {
        return;
      }

      checkNode(node.test);
    }

    const ARRAY_PREDICATE_FUNCTIONS = new Set([
      'filter',
      'find',
      'some',
      'every',
    ]);
    function isArrayPredicateFunction(node: TSESTree.CallExpression): boolean {
      const { callee } = node;
      return (
        // looks like `something.filter` or `something.find`
        callee.type === AST_NODE_TYPES.MemberExpression &&
        callee.property.type === AST_NODE_TYPES.Identifier &&
        ARRAY_PREDICATE_FUNCTIONS.has(callee.property.name) &&
        // and the left-hand side is an array, according to the types
        (nodeIsArrayType(callee.object) || nodeIsTupleType(callee.object))
      );
    }
    function checkCallExpression(node: TSESTree.CallExpression): void {
      // If this is something like arr.filter(x => /*condition*/), check `condition`
      if (isArrayPredicateFunction(node) && node.arguments.length) {
        const callback = node.arguments[0]!;
        // Inline defined functions
        if (
          (callback.type === AST_NODE_TYPES.ArrowFunctionExpression ||
            callback.type === AST_NODE_TYPES.FunctionExpression) &&
          callback.body
        ) {
          // Two special cases, where we can directly check the node that's returned:
          // () => something
          if (callback.body.type !== AST_NODE_TYPES.BlockStatement) {
            return checkNode(callback.body);
          }
          // () => { return something; }
          const callbackBody = callback.body.body;
          if (
            callbackBody.length === 1 &&
            callbackBody[0].type === AST_NODE_TYPES.ReturnStatement &&
            callbackBody[0].argument
          ) {
            return checkNode(callbackBody[0].argument);
          }
          // Potential enhancement: could use code-path analysis to check
          //   any function with a single return statement
          // (Value to complexity ratio is dubious however)
        }
        // Otherwise just do type analysis on the function as a whole.
        const returnTypes = getCallSignaturesOfType(
          getNodeType(callback),
        ).map(sig => sig.getReturnType());
        /* istanbul ignore if */ if (returnTypes.length === 0) {
          // Not a callable function
          return;
        }
        if (!returnTypes.some(isPossiblyFalsy)) {
          return context.report({
            node: callback,
            messageId: 'alwaysTruthyFunc',
          });
        }
        if (!returnTypes.some(isPossiblyTruthy)) {
          return context.report({
            node: callback,
            messageId: 'alwaysFalsyFunc',
          });
        }
      }
    }

    // Recursively searches an optional chain for an array index expression
    //  Has to search the entire chain, because an array index will "infect" the rest of the types
    //  Example:
    //  ```
    //  [{x: {y: "z"} }][n] // type is {x: {y: "z"}}
    //    ?.x // type is {y: "z"}
    //    ?.y // This access is considered "unnecessary" according to the types
    //  ```
    function optionChainContainsArrayIndex(
      node: TSESTree.MemberExpression | TSESTree.CallExpression,
    ): boolean {
      const lhsNode =
        node.type === AST_NODE_TYPES.CallExpression ? node.callee : node.object;
      if (isArrayIndexExpression(lhsNode)) {
        return true;
      }
      if (
        lhsNode.type === AST_NODE_TYPES.MemberExpression ||
        lhsNode.type === AST_NODE_TYPES.CallExpression
      ) {
        return optionChainContainsArrayIndex(lhsNode);
      }
      return false;
    }

    function isNullablePropertyType(
      objType: ts.Type,
      propertyType: ts.Type,
    ): boolean {
      if (propertyType.isUnion()) {
        return propertyType.types.some(type =>
          isNullablePropertyType(objType, type),
        );
      }
      if (propertyType.isNumberLiteral() || propertyType.isStringLiteral()) {
        const propType = checker.getTypeOfPropertyOfType(
          objType,
          propertyType.value.toString(),
        );
        if (propType) {
          return isNullableType(propType, { allowUndefined: true });
        }
      }
      const typeName = getTypeName(checker, propertyType);
      return !!(
        (typeName === 'string' &&
          checker.getIndexInfoOfType(objType, ts.IndexKind.String)) ||
        (typeName === 'number' &&
          checker.getIndexInfoOfType(objType, ts.IndexKind.Number))
      );
    }

    // Checks whether a member expression is nullable or not regardless of it's previous node.
    //  Example:
    //  ```
    //  // 'bar' is nullable if 'foo' is null.
    //  // but this function checks regardless of 'foo' type, so returns 'true'.
    //  declare const foo: { bar : { baz: string } } | null
    //  foo?.bar;
    //  ```
    function isNullableOriginFromPrev(
      node: TSESTree.MemberExpression,
    ): boolean {
      const prevType = getNodeType(node.object);
      const property = node.property;
      if (prevType.isUnion() && isIdentifier(property)) {
        const isOwnNullable = prevType.types.some(type => {
          if (node.computed) {
            const propertyType = getNodeType(node.property);
            return isNullablePropertyType(type, propertyType);
          }
          const propType = checker.getTypeOfPropertyOfType(type, property.name);
          return propType && isNullableType(propType, { allowUndefined: true });
        });
        return (
          !isOwnNullable && isNullableType(prevType, { allowUndefined: true })
        );
      }
      return false;
    }

    function isOptionableExpression(
      node: TSESTree.LeftHandSideExpression,
    ): boolean {
      const type = getNodeType(node);
      const isOwnNullable =
        node.type === AST_NODE_TYPES.MemberExpression
          ? !isNullableOriginFromPrev(node)
          : true;
      return (
        isTypeAnyType(type) ||
        isTypeUnknownType(type) ||
        (isNullableType(type, { allowUndefined: true }) && isOwnNullable)
      );
    }

    function checkOptionalChain(
      node: TSESTree.MemberExpression | TSESTree.CallExpression,
      beforeOperator: TSESTree.Node,
      fix: '' | '.',
    ): void {
      // We only care if this step in the chain is optional. If just descend
      // from an optional chain, then that's fine.
      if (!node.optional) {
        return;
      }

      // Since typescript array index signature types don't represent the
      //  possibility of out-of-bounds access, if we're indexing into an array
      //  just skip the check, to avoid false positives
      if (optionChainContainsArrayIndex(node)) {
        return;
      }

      const nodeToCheck =
        node.type === AST_NODE_TYPES.CallExpression ? node.callee : node.object;

      if (isOptionableExpression(nodeToCheck)) {
        return;
      }

      const questionDotOperator = nullThrows(
        sourceCode.getTokenAfter(
          beforeOperator,
          token =>
            token.type === AST_TOKEN_TYPES.Punctuator && token.value === '?.',
        ),
        NullThrowsReasons.MissingToken('operator', node.type),
      );

      context.report({
        node,
        loc: questionDotOperator.loc,
        messageId: 'neverOptionalChain',
        fix(fixer) {
          return fixer.replaceText(questionDotOperator, fix);
        },
      });
    }

    function checkOptionalMemberExpression(
      node: TSESTree.MemberExpression,
    ): void {
      checkOptionalChain(node, node.object, node.computed ? '' : '.');
    }

    function checkOptionalCallExpression(node: TSESTree.CallExpression): void {
      checkOptionalChain(node, node.callee, '');
    }

    return {
      BinaryExpression: checkIfBinaryExpressionIsNecessaryConditional,
      CallExpression: checkCallExpression,
      ConditionalExpression: (node): void => checkNode(node.test),
      DoWhileStatement: checkIfLoopIsNecessaryConditional,
      ForStatement: checkIfLoopIsNecessaryConditional,
      IfStatement: (node): void => checkNode(node.test),
      LogicalExpression: checkLogicalExpressionForUnnecessaryConditionals,
      WhileStatement: checkIfLoopIsNecessaryConditional,
      'MemberExpression[optional = true]': checkOptionalMemberExpression,
      'CallExpression[optional = true]': checkOptionalCallExpression,
    };
  },
});
