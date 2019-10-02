import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import ts from 'typescript';
import * as tsutils from 'tsutils';
import * as util from '../util';

type ExpressionWithTest =
  | TSESTree.ConditionalExpression
  | TSESTree.DoWhileStatement
  | TSESTree.ForStatement
  | TSESTree.IfStatement
  | TSESTree.WhileStatement;

type Options = [
  {
    ignoreRhs?: boolean;
    allowNullable?: boolean;
  },
];

export default util.createRule<Options, 'strictBooleanExpression'>({
  name: 'strict-boolean-expressions',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Restricts the types allowed in boolean expressions',
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
          allowNullable: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      strictBooleanExpression: 'Unexpected non-boolean in conditional.',
    },
  },
  defaultOptions: [
    {
      ignoreRhs: false,
      allowNullable: false,
    },
  ],
  create(context, [options]) {
    const service = util.getParserServices(context);
    const checker = service.program.getTypeChecker();

    /**
     * Determines if the node has a boolean type.
     */
    function isBooleanType(node: TSESTree.Node): boolean {
      const tsNode = service.esTreeNodeToTSNodeMap.get<ts.ExpressionStatement>(
        node,
      );
      const type = util.getConstrainedTypeAtLocation(checker, tsNode);

      if (tsutils.isTypeFlagSet(type, ts.TypeFlags.BooleanLike)) {
        return true;
      }

      // Check variants of union
      if (tsutils.isTypeFlagSet(type, ts.TypeFlags.Union)) {
        let hasBoolean = false;
        for (const ty of (type as ts.UnionType).types) {
          if (tsutils.isTypeFlagSet(ty, ts.TypeFlags.BooleanLike)) {
            hasBoolean = true;
            continue;
          }
          if (options.allowNullable) {
            if (tsutils.isTypeFlagSet(ty, ts.TypeFlags.Null)) {
              continue;
            }
            if (tsutils.isTypeFlagSet(ty, ts.TypeFlags.Undefined)) {
              continue;
            }
          }
          // Union variant is something else
          return false;
        }
        return hasBoolean;
      }

      return false;
    }

    /**
     * Asserts that a testable expression contains a boolean, reports otherwise.
     * Filters all LogicalExpressions to prevent some duplicate reports.
     */
    function assertTestExpressionContainsBoolean(
      node: ExpressionWithTest,
    ): void {
      if (
        node.test !== null &&
        node.test.type !== AST_NODE_TYPES.LogicalExpression &&
        !isBooleanType(node.test)
      ) {
        reportNode(node.test);
      }
    }

    /**
     * Asserts that a logical expression contains a boolean, reports otherwise.
     */
    function assertLocalExpressionContainsBoolean(
      node: TSESTree.LogicalExpression,
    ): void {
      if (
        !isBooleanType(node.left) ||
        (!options.ignoreRhs && !isBooleanType(node.right))
      ) {
        reportNode(node);
      }
    }

    /**
     * Asserts that a unary expression contains a boolean, reports otherwise.
     */
    function assertUnaryExpressionContainsBoolean(
      node: TSESTree.UnaryExpression,
    ): void {
      if (!isBooleanType(node.argument)) {
        reportNode(node.argument);
      }
    }

    /**
     * Reports an offending node in context.
     */
    function reportNode(node: TSESTree.Node): void {
      context.report({ node, messageId: 'strictBooleanExpression' });
    }

    return {
      ConditionalExpression: assertTestExpressionContainsBoolean,
      DoWhileStatement: assertTestExpressionContainsBoolean,
      ForStatement: assertTestExpressionContainsBoolean,
      IfStatement: assertTestExpressionContainsBoolean,
      WhileStatement: assertTestExpressionContainsBoolean,
      LogicalExpression: assertLocalExpressionContainsBoolean,
      'UnaryExpression[operator="!"]': assertUnaryExpressionContainsBoolean,
    };
  },
});
