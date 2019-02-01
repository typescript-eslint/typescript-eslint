/**
 * @fileoverview Enforces explicit return type for functions
 * @author Scott O'Hara
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
type Options = [
  {
    allowExpressions?: boolean;
  }
];

const defaultOptions: Options = [
  {
    allowExpressions: true
  }
];

const rule: RuleModule<'missingReturnType', Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require explicit return types on functions and class methods',
      category: 'Stylistic Issues',
      url: util.metaDocsUrl('explicit-function-return-type'),
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

  create(context) {
    const options = util.applyDefault(defaultOptions, context.options)[0];

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Checks if the parent of a function expression is a constructor.
     * @param parent The parent of a function expression node
     */
    function isConstructor(parent: TSESTree.Node): boolean {
      return (
        parent.type === 'MethodDefinition' && parent.kind === 'constructor'
      );
    }

    /**
     * Checks if the parent of a function expression is a setter.
     * @param parent The parent of a function expression node
     */
    function isSetter(parent: TSESTree.Node): boolean {
      return parent.type === 'MethodDefinition' && parent.kind === 'set';
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
        node.parent.type !== 'VariableDeclarator' &&
        node.parent.type !== 'MethodDefinition'
      ) {
        return;
      }

      checkFunctionReturnType(node);
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      ArrowFunctionExpression: checkFunctionExpressionReturnType,
      FunctionDeclaration: checkFunctionReturnType,
      FunctionExpression: checkFunctionExpressionReturnType
    };
  }
};
export = rule;
