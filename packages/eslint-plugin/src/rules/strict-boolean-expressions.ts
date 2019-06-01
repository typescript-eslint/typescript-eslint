import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import ts from 'typescript';
import * as util from '../util';
import { getTypeName } from '../util';

type ExpressionWithTest =
  | TSESTree.ConditionalExpression
  | TSESTree.DoWhileStatement
  | TSESTree.ForStatement
  | TSESTree.IfStatement
  | TSESTree.WhileStatement;

export default util.createRule({
  name: 'strict-boolean-expressions',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Restricts the types allowed in boolean expressions',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      strictBooleanExpression: 'Unexpected non-boolean in conditional.',
    },
  },
  defaultOptions: [],
  create(context) {
    const service = util.getParserServices(context);
    const checker = service.program.getTypeChecker();

    /**
     * Determines if the node has a boolean type. Does recursion for nodes with
     * left/right operators.
     */
    function isBooleanType(node: TSESTree.Expression): boolean {
      if (node.type === AST_NODE_TYPES.LogicalExpression) {
        return isBooleanType(node.left) && isBooleanType(node.right);
      }

      const tsNode = service.esTreeNodeToTSNodeMap.get<ts.ExpressionStatement>(
        node,
      );
      const type = checker.getTypeAtLocation(tsNode);
      const typeName = getTypeName(checker, type);
      return ['true', 'false', 'boolean'].includes(typeName);
    }

    /**
     * Asserts that a node is a boolean, reports otherwise.
     */
    function assertNodeIsBoolean(node: TSESTree.Expression): void {
      if (!isBooleanType(node)) {
        return context.report({ node, messageId: 'strictBooleanExpression' });
      }
    }

    /**
     * Asserts that an expression contains a boolean, reports otherwise. Filters
     * all LogicalExpressions to prevent some duplicate reports.
     */
    function assertExpressionContainsBoolean(node: ExpressionWithTest): void {
      if (
        node.test !== null &&
        node.test.type !== AST_NODE_TYPES.LogicalExpression
      ) {
        assertNodeIsBoolean(node.test);
      }
    }

    return {
      ConditionalExpression: assertExpressionContainsBoolean,
      DoWhileStatement: assertExpressionContainsBoolean,
      ForStatement: assertExpressionContainsBoolean,
      IfStatement: assertExpressionContainsBoolean,
      WhileStatement: assertExpressionContainsBoolean,
      LogicalExpression(node: TSESTree.LogicalExpression) {
        if (node.operator === '||' || node.operator === '&&') {
          assertNodeIsBoolean(node);
        }
      },
      UnaryExpression(node) {
        if (node.operator === '!') {
          assertNodeIsBoolean(node.argument);
        }
      },
    };
  },
});
