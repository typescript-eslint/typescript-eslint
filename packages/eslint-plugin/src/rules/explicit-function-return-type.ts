/**
 * @fileoverview Enforces explicit return type for functions
 * @author Scott O'Hara
 */

import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

type Options = [
  {
    allowExpressions?: boolean;
  }
];
type MessageIds = 'missingReturnType';

export default util.createRule<Options, MessageIds>({
  name: 'explicit-function-return-type',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require explicit return types on functions and class methods',
      category: 'Stylistic Issues',
      recommended: 'warn'
    },
    messages: {
      missingReturnType: 'Missing return type on function.'
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowExpressions: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [
    {
      allowExpressions: true
    }
  ],
  create(context, [options]) {
    /**
     * Checks if the parent of a function expression is a constructor.
     * @param parent The parent of a function expression node
     */
    function isConstructor(parent: TSESTree.Node): boolean {
      return (
        parent.type === AST_NODE_TYPES.MethodDefinition &&
        parent.kind === 'constructor'
      );
    }

    /**
     * Checks if the parent of a function expression is a setter.
     * @param parent The parent of a function expression node
     */
    function isSetter(parent: TSESTree.Node): boolean {
      return (
        parent.type === AST_NODE_TYPES.MethodDefinition && parent.kind === 'set'
      );
    }

    /**
     * Checks if a function declaration/expression has a return type.
     * @param node The node representing a function.
     */
    function checkFunctionReturnType(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression
    ): void {
      if (
        !node.returnType &&
        node.parent &&
        !isConstructor(node.parent) &&
        !isSetter(node.parent) &&
        util.isTypescript(context.getFilename())
      ) {
        context.report({
          node,
          messageId: 'missingReturnType'
        });
      }
    }

    /**
     * Checks if a function declaration/expression has a return type.
     * @param {ASTNode} node The node representing a function.
     */
    function checkFunctionExpressionReturnType(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression
    ): void {
      if (
        options.allowExpressions &&
        node.parent &&
        node.parent.type !== AST_NODE_TYPES.VariableDeclarator &&
        node.parent.type !== AST_NODE_TYPES.MethodDefinition
      ) {
        return;
      }

      checkFunctionReturnType(node);
    }

    return {
      ArrowFunctionExpression: checkFunctionExpressionReturnType,
      FunctionDeclaration: checkFunctionReturnType,
      FunctionExpression: checkFunctionExpressionReturnType
    };
  }
});
