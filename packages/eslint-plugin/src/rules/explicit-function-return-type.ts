/**
 * @fileoverview Enforces explicit return type for functions
 * @author Scott O'Hara
 */

import RuleModule from '../RuleModule';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [
  {
    allowExpressions: true
  }
];

const rule: RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require explicit return types on functions and class methods',
      category: 'TypeScript',
      url: util.metaDocsUrl('explicit-function-return-type'),
      recommended: 'warn'
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

  create(context: Rule.RuleContext) {
    const options = util.applyDefault(defaultOptions, context.options)[0];

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Checks if the parent of a function expression is a constructor.
     * @param {ASTNode} parent The parent of a function expression node
     */
    function isConstructor(parent): boolean {
      return (
        parent.type === 'MethodDefinition' && parent.kind === 'constructor'
      );
    }

    /**
     * Checks if the parent of a function expression is a setter.
     * @param {ASTNode} parent The parent of a function expression node
     */
    function isSetter(parent): boolean {
      return parent.type === 'MethodDefinition' && parent.kind === 'set';
    }

    /**
     * Checks if a function declaration/expression has a return type.
     * @param {ASTNode} node The node representing a function.
     */
    function checkFunctionReturnType(node): void {
      if (
        !node.returnType &&
        !isConstructor(node.parent) &&
        !isSetter(node.parent) &&
        util.isTypescript(context.getFilename())
      ) {
        context.report({
          node,
          message: `Missing return type on function.`
        });
      }
    }

    /**
     * Checks if a function declaration/expression has a return type.
     * @param {ASTNode} node The node representing a function.
     */
    function checkFunctionExpressionReturnType(node): void {
      if (
        options.allowExpressions &&
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
      FunctionDeclaration: checkFunctionReturnType,
      FunctionExpression: checkFunctionExpressionReturnType,
      ArrowFunctionExpression: checkFunctionExpressionReturnType
    };
  }
};
export = rule;
