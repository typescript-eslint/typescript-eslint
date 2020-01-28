import {
  TSESTree,
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import {
  isTypeFlagSet,
  unionTypeParts,
  isFalsyType,
  isBooleanLiteralType,
  isLiteralType,
  getCallSignaturesOfType,
} from 'tsutils';
import {
  createRule,
  getParserServices,
  getConstrainedTypeAtLocation,
  isNullableType,
  nullThrows,
  NullThrowsReasons,
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
    ignoreRhs?: boolean;
    checkArrayPredicates?: boolean;
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
  | 'never'
  | 'neverOptionalChain';
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
          ignoreRhs: {
            type: 'boolean',
          },
          checkArrayPredicates: {
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
        'This callback should return a conditional, but return is always truthy',
      alwaysFalsyFunc:
        'This callback should return a conditional, but return is always falsy',
      neverNullish:
        'Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined.',
      alwaysNullish:
        'Unnecessary conditional, left-hand side of `??` operator is always `null` or `undefined`',
      literalBooleanExpression:
        'Unnecessary conditional, both sides of the expression are literal values',
      never: 'Unnecessary conditional, value is `never`',
      neverOptionalChain: 'Unnecessary optional chain on a non-nullish value',
    },
  },
  defaultOptions: [
    {
      allowConstantLoopConditions: false,
      ignoreRhs: false,
      checkArrayPredicates: false,
    },
  ],
  create(
    context,
    [{ allowConstantLoopConditions, checkArrayPredicates, ignoreRhs }],
  ) {
    const service = getParserServices(context);
    const checker = service.program.getTypeChecker();
    const sourceCode = context.getSourceCode();

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

    /**
     * Checks if a conditional node is necessary:
     * if the type of the node is always true or always false, it's not necessary.
     */
    function checkNode(node: TSESTree.Expression): void {
      // Index signature
      if (node.type === AST_NODE_TYPES.MemberExpression && node.computed) {
        // Since typescript array index signature types don't represent the
        //  possibility of out-of-bounds access, if we're indexing into an array
        //  just skip the check, to avoid false positives
        if (
          nodeIsArrayType(node.object) ||
          (nodeIsTupleType(node.object) &&
            // Exception: literal index into a tuple - will have a sound type
            node.property.type !== AST_NODE_TYPES.Literal)
        ) {
          return;
        }
      }

      const type = getNodeType(node);

      // Conditional is always necessary if it involves:
      //    `any` or `unknown` or a naked type parameter
      if (
        unionTypeParts(type).some(part =>
          isTypeFlagSet(
            part,
            ts.TypeFlags.Any |
              ts.TypeFlags.Unknown |
              ts.TypeFlags.TypeParameter,
          ),
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
      const type = getNodeType(node);
      // Conditional is always necessary if it involves `any` or `unknown`
      if (isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
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
      if (
        BOOL_OPERATORS.has(node.operator) &&
        isLiteral(getNodeType(node.left)) &&
        isLiteral(getNodeType(node.right))
      ) {
        context.report({ node, messageId: 'literalBooleanExpression' });
      }
    }

    /**
     * Checks that a testable expression is necessarily conditional, reports otherwise.
     * Filters all LogicalExpressions to prevent some duplicate reports.
     */
    function checkIfTestExpressionIsNecessaryConditional(
      node: TSESTree.ConditionalExpression | TSESTree.IfStatement,
    ): void {
      if (node.test.type === AST_NODE_TYPES.LogicalExpression) {
        return;
      }

      checkNode(node.test);
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
      checkNode(node.left);
      if (!ignoreRhs) {
        checkNode(node.right);
      }
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
      if (
        node.test === null ||
        node.test.type === AST_NODE_TYPES.LogicalExpression
      ) {
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
    function shouldCheckCallback(node: TSESTree.CallExpression): boolean {
      const { callee } = node;
      return (
        // option is on
        !!checkArrayPredicates &&
        // looks like `something.filter` or `something.find`
        callee.type === AST_NODE_TYPES.MemberExpression &&
        callee.property.type === AST_NODE_TYPES.Identifier &&
        ARRAY_PREDICATE_FUNCTIONS.has(callee.property.name) &&
        // and the left-hand side is an array, according to the types
        (nodeIsArrayType(callee.object) || nodeIsTupleType(callee.object))
      );
    }
    function checkCallExpression(node: TSESTree.CallExpression): void {
      const {
        arguments: [callback],
      } = node;
      if (callback && shouldCheckCallback(node)) {
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

    function checkOptionalChain(
      node: TSESTree.OptionalMemberExpression | TSESTree.OptionalCallExpression,
      beforeOperator: TSESTree.Node,
      fix: '' | '.',
    ): void {
      // We only care if this step in the chain is optional. If just descend
      // from an optional chain, then that's fine.
      if (!node.optional) {
        return;
      }

      const type = getNodeType(node);
      if (
        isTypeFlagSet(type, ts.TypeFlags.Any) ||
        isTypeFlagSet(type, ts.TypeFlags.Unknown) ||
        isNullableType(type, { allowUndefined: true })
      ) {
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
      node: TSESTree.OptionalMemberExpression,
    ): void {
      checkOptionalChain(node, node.object, '.');
    }

    function checkOptionalCallExpression(
      node: TSESTree.OptionalCallExpression,
    ): void {
      checkOptionalChain(node, node.callee, '');
    }

    return {
      BinaryExpression: checkIfBinaryExpressionIsNecessaryConditional,
      CallExpression: checkCallExpression,
      ConditionalExpression: checkIfTestExpressionIsNecessaryConditional,
      DoWhileStatement: checkIfLoopIsNecessaryConditional,
      ForStatement: checkIfLoopIsNecessaryConditional,
      IfStatement: checkIfTestExpressionIsNecessaryConditional,
      LogicalExpression: checkLogicalExpressionForUnnecessaryConditionals,
      WhileStatement: checkIfLoopIsNecessaryConditional,
      OptionalMemberExpression: checkOptionalMemberExpression,
      OptionalCallExpression: checkOptionalCallExpression,
    };
  },
});
