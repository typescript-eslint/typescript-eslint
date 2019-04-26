import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

type Options = [
  {
    allowExpressions?: boolean;
    allowTypedFunctionExpressions?: boolean;
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
      recommended: 'warn',
    },
    messages: {
      missingReturnType: 'Missing return type on function.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowExpressions: {
            type: 'boolean',
          },
          allowTypedFunctionExpressions: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowExpressions: false,
      allowTypedFunctionExpressions: false,
    },
  ],
  create(context, [options]) {
    /**
     * Checks if a node is a constructor.
     * @param node The node to check
     */
    function isConstructor(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.MethodDefinition &&
        node.kind === 'constructor'
      );
    }

    /**
     * Checks if a node is a setter.
     */
    function isSetter(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.MethodDefinition && node.kind === 'set'
      );
    }

    /**
     * Checks if a node is a variable declarator with a type annotation.
     */
    function isVariableDeclaratorWithTypeAnnotation(
      node: TSESTree.Node,
    ): boolean {
      return (
        node.type === AST_NODE_TYPES.VariableDeclarator &&
        !!node.id.typeAnnotation
      );
    }

    /**
     * Checks if a node belongs to:
     * const x: Foo = { prop: () => {} }
     */
    function isPropertyOfObjectVariableDeclaratorWithTypeAnnotation(
      node: TSESTree.Node,
    ): boolean {
      let parent = node.parent;
      if (!parent || parent.type !== AST_NODE_TYPES.Property) {
        return false;
      }
      parent = parent.parent;
      if (!parent || parent.type !== AST_NODE_TYPES.ObjectExpression) {
        return false;
      }
      parent = parent.parent;
      return !!parent && isVariableDeclaratorWithTypeAnnotation(parent);
    }

    function isPropertyOfObjectInAsExpression(node: TSESTree.Node): boolean {
      let parent = node.parent;
      if (!parent || parent.type !== AST_NODE_TYPES.Property) {
        return false;
      }
      parent = parent.parent;
      if (!parent || parent.type !== AST_NODE_TYPES.ObjectExpression) {
        return false;
      }
      parent = parent.parent;
      return !!parent && parent.type === AST_NODE_TYPES.TSAsExpression;
    }

    /**
     * Checks if a function declaration/expression has a return type.
     * @param node The node representing a function.
     */
    function checkFunctionReturnType(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): void {
      if (
        options.allowExpressions &&
        node.type !== AST_NODE_TYPES.FunctionDeclaration &&
        node.parent &&
        node.parent.type !== AST_NODE_TYPES.VariableDeclarator &&
        node.parent.type !== AST_NODE_TYPES.MethodDefinition
      ) {
        return;
      }

      if (
        !node.returnType &&
        node.parent &&
        !isConstructor(node.parent) &&
        !isSetter(node.parent) &&
        util.isTypeScriptFile(context.getFilename())
      ) {
        context.report({
          node,
          messageId: 'missingReturnType',
        });
      }
    }

    /**
     * Checks if a function declaration/expression has a return type.
     * @param {ASTNode} node The node representing a function.
     */
    function checkFunctionExpressionReturnType(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ): void {
      if (
        options.allowTypedFunctionExpressions &&
        node.parent &&
        (isVariableDeclaratorWithTypeAnnotation(node.parent) ||
          isPropertyOfObjectVariableDeclaratorWithTypeAnnotation(node) ||
          node.parent.type === AST_NODE_TYPES.TSAsExpression ||
          isPropertyOfObjectInAsExpression(node))
      ) {
        return;
      }

      checkFunctionReturnType(node);
    }

    return {
      ArrowFunctionExpression: checkFunctionExpressionReturnType,
      FunctionDeclaration: checkFunctionReturnType,
      FunctionExpression: checkFunctionExpressionReturnType,
    };
  },
});
