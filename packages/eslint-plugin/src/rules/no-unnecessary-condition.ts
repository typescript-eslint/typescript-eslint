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

type ExpressionWithTest =
  | TSESTree.ConditionalExpression
  | TSESTree.DoWhileStatement
  | TSESTree.ForStatement
  | TSESTree.IfStatement
  | TSESTree.WhileStatement;

export type Options = [
  {
    ignoreRhs?: boolean;
  },
];

export type MessageId =
  | 'alwaysTruthy'
  | 'alwaysFalsy'
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
          ignoreRhs: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      alwaysTruthy: 'Unnecessary conditional, value is always truthy.',
      alwaysFalsy: 'Unnecessary conditional, value is always falsy.',
      literalBooleanExpression:
        'Unnecessary conditional, both sides of the expression are literal values',
      never: 'Unnecessary conditional, value is `never`',
    },
  },
  defaultOptions: [
    {
      ignoreRhs: false,
    },
  ],
  create(context, [{ ignoreRhs }]) {
    const service = getParserServices(context);
    const checker = service.program.getTypeChecker();

    function getNodeType(node: TSESTree.Node): ts.Type {
      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      return getConstrainedTypeAtLocation(checker, tsNode);
    }

    /**
     * Checks if a conditional node is necessary:
     * if the type of the node is always true or always false, it's not necessary.
     */
    function checkNode(node: TSESTree.Node): void {
      const type = getNodeType(node);

      // Conditional is always necessary if it involves `any` or `unknown`
      if (isTypeFlagSet(type, TypeFlags.Any | TypeFlags.Unknown)) {
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
      node: ExpressionWithTest,
    ): void {
      if (
        node.test !== null &&
        node.test.type !== AST_NODE_TYPES.LogicalExpression
      ) {
        checkNode(node.test);
      }
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

    return {
      BinaryExpression: checkIfBinaryExpressionIsNecessaryConditional,
      ConditionalExpression: checkIfTestExpressionIsNecessaryConditional,
      DoWhileStatement: checkIfTestExpressionIsNecessaryConditional,
      ForStatement: checkIfTestExpressionIsNecessaryConditional,
      IfStatement: checkIfTestExpressionIsNecessaryConditional,
      WhileStatement: checkIfTestExpressionIsNecessaryConditional,
      LogicalExpression: checkLogicalExpressionForUnnecessaryConditionals,
    };
  },
});
