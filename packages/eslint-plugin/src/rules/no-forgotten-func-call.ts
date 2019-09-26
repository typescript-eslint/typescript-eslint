import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { isFunctionTypeNode } from 'tsutils';
import {
  createRule,
  getParserServices,
  getConstrainedTypeAtLocation,
} from '../util';
import ts from 'typescript';

type ExpressionWithTest =
  | TSESTree.ConditionalExpression
  | TSESTree.DoWhileStatement
  | TSESTree.ForStatement
  | TSESTree.IfStatement
  | TSESTree.WhileStatement;

// No options yet
export type Options = [
  {
    allowAssignmentToAny?: boolean;
    allowCheckAndCallExpressions?: boolean;
  },
];

export type MessageId = 'callExpected';

export default createRule<Options, MessageId>({
  name: 'no-forgotten-func-call',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Finds functions that are not called',
      category: 'Best Practices', // TODO
      recommended: false,
      requiresTypeChecking: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowAssignmentToAny: {
            type: 'boolean',
          },
          allowCheckAndCallExpressions: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      callExpected: 'Unexpected function, call expected.',
    },
  },
  defaultOptions: [
    {
      allowAssignmentToAny: true,
      allowCheckAndCallExpressions: true,
    },
  ],
  create(context, [{ allowAssignmentToAny, allowCheckAndCallExpressions }]) {
    const service = getParserServices(context);
    const checker = service.program.getTypeChecker();

    function getTypeNode(node: TSESTree.Node): ts.TypeNode | undefined {
      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      const type = getConstrainedTypeAtLocation(checker, tsNode);
      return checker.typeToTypeNode(type);
    }

    function isFunctionIdentifier(node: TSESTree.Node): boolean {
      const typeNode = getTypeNode(node);
      return typeNode !== undefined ? isFunctionTypeNode(typeNode) : false;
    }

    function isAnyIdentifier(node: TSESTree.Node): boolean {
      const typeNode = getTypeNode(node);
      // Assume `any` if we can’t find a type
      return (
        typeNode === undefined || typeNode.kind === ts.SyntaxKind.AnyKeyword
      );
    }

    /**
     * Checks if a conditional node is necessary:
     * if the type of the node is always true or always false, it's not necessary.
     */
    function checkNode(node: TSESTree.Node): void {
      if (isFunctionIdentifier(node)) {
        context.report({ node, messageId: 'callExpected' });
      }
    }

    /**
     * Checks that a testable expression does not contain an uncalled function,
     * reports otherwise. Filters all LogicalExpressions to prevent some
     * duplicate reports.
     */
    function checkTestExpression(node: ExpressionWithTest): void {
      if (
        node.test !== null &&
        node.test.type !== AST_NODE_TYPES.LogicalExpression
      ) {
        checkNode(node.test);
      }
    }

    /**
     * Checks that a logical expression does not contain uncalled functions,
     * reports otherwise.
     */
    function checkLogicalExpression(node: TSESTree.LogicalExpression): void {
      const { left, right } = node;
      if (
        allowCheckAndCallExpressions &&
        isFunctionIdentifier(left) &&
        right.type === AST_NODE_TYPES.CallExpression
      ) {
        const leftId =
          left.type === AST_NODE_TYPES.Identifier ? left.name : undefined;
        const { callee } = right;
        const rightId =
          callee.type === AST_NODE_TYPES.Identifier ? callee.name : undefined;
        if (leftId === rightId) {
          return;
        }
      }

      // Fall through
      checkNode(left);
      checkNode(right);
    }

    /**
     * Checks that the right side of an assignment expression is not an
     * uncalled functions, reports otherwise.
     */
    function checkAssignmentExpression(
      node: TSESTree.AssignmentExpression,
    ): void {
      if (isFunctionIdentifier(node.left)) {
        return;
      }
      if (allowAssignmentToAny && isAnyIdentifier(node.left)) {
        return;
      }
      checkNode(node.right);
    }

    return {
      ConditionalExpression: checkTestExpression,
      DoWhileStatement: checkTestExpression,
      ForStatement: checkTestExpression,
      IfStatement: checkTestExpression,
      WhileStatement: checkTestExpression,
      LogicalExpression: checkLogicalExpression,
      AssignmentExpression: checkAssignmentExpression,
    };
  },
});
