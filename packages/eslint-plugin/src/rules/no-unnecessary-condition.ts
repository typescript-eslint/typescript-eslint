import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import ts, { TypeFlags } from 'typescript';
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
  | 'literalBooleanExpression'
  | 'never';
export default createRule<Options, MessageId>({
  name: 'no-unnecessary-conditionals',
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
    messages: {
      alwaysTruthy: 'Unnecessary conditional, value is always truthy.',
      alwaysFalsy: 'Unnecessary conditional, value is always falsy.',
      alwaysTruthyFunc:
        'This callback should return a conditional, but return is always truthy',
      alwaysFalsyFunc:
        'This callback should return a conditional, but return is always falsy',
      literalBooleanExpression:
        'Unnecessary conditional, both sides of the expression are literal values',
      never: 'Unnecessary conditional, value is `never`',
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

    function getNodeType(node: TSESTree.Node): ts.Type {
      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      return getConstrainedTypeAtLocation(checker, tsNode);
    }

    function nodeIsArrayType(node: TSESTree.Node): boolean {
      const type = getNodeType(node);
      // TODO: is there a better way to determine if this is an array type?
      //    Currently just checking for a `lastIndexOf` method.
      return !!type.getProperty('lastIndexOf');
    }

    /**
     * Checks if a conditional node is necessary:
     * if the type of the node is always true or always false, it's not necessary.
     */
    function checkNode(node: TSESTree.Node): void {
      const type = getNodeType(node);

      // Conditional is always necessary if it involves:
      //    `any` or `unknown` or a naked type parameter
      if (
        unionTypeParts(type).some(part =>
          isTypeFlagSet(
            part,
            TypeFlags.Any | TypeFlags.Unknown | ts.TypeFlags.TypeParameter,
          ),
        )
      ) {
        return;
      }
      if (isTypeFlagSet(type, TypeFlags.Never)) {
        context.report({ node, messageId: 'never' });
      } else if (!isPossiblyTruthy(type)) {
        context.report({ node, messageId: 'alwaysFalsy' });
      } else if (!isPossiblyFalsy(type)) {
        context.report({ node, messageId: 'alwaysTruthy' });
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
        nodeIsArrayType(callee.object)
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

    return {
      BinaryExpression: checkIfBinaryExpressionIsNecessaryConditional,
      CallExpression: checkCallExpression,
      ConditionalExpression: checkIfTestExpressionIsNecessaryConditional,
      DoWhileStatement: checkIfLoopIsNecessaryConditional,
      ForStatement: checkIfLoopIsNecessaryConditional,
      IfStatement: checkIfTestExpressionIsNecessaryConditional,
      LogicalExpression: checkLogicalExpressionForUnnecessaryConditionals,
      WhileStatement: checkIfLoopIsNecessaryConditional,
    };
  },
});
