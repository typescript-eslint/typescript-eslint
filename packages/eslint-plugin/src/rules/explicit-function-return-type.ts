import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
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
    function isConstructor(node: TSESTree.Node | undefined): boolean {
      return (
        !!node &&
        node.type === AST_NODE_TYPES.MethodDefinition &&
        node.kind === 'constructor'
      );
    }

    /**
     * Checks if a node is a setter.
     */
    function isSetter(node: TSESTree.Node | undefined): boolean {
      return (
        !!node &&
        (node.type === AST_NODE_TYPES.MethodDefinition ||
          node.type === AST_NODE_TYPES.Property) &&
        node.kind === 'set'
      );
    }

    /**
     * Checks if a node is a variable declarator with a type annotation.
     * `const x: Foo = ...`
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
     * Checks if a node is a class property with a type annotation.
     * `public x: Foo = ...`
     */
    function isClassPropertyWithTypeAnnotation(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.ClassProperty && !!node.typeAnnotation
      );
    }

    /**
     * Checks if a node is a type cast
     * `(() => {}) as Foo`
     * `<Foo>(() => {})`
     */
    function isTypeCast(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.TSAsExpression ||
        node.type === AST_NODE_TYPES.TSTypeAssertion
      );
    }

    /**
     * Checks if a node belongs to:
     * `const x: Foo = { prop: () => {} }`
     * `const x = { prop: () => {} } as Foo`
     * `const x = <Foo>{ prop: () => {} }`
     */
    function isPropertyOfObjectWithType(
      parent: TSESTree.Node | undefined,
    ): boolean {
      if (!parent || parent.type !== AST_NODE_TYPES.Property) {
        return false;
      }
      parent = parent.parent; // this shouldn't happen, checking just in case
      /* istanbul ignore if */ if (
        !parent ||
        parent.type !== AST_NODE_TYPES.ObjectExpression
      ) {
        return false;
      }

      parent = parent.parent; // this shouldn't happen, checking just in case
      /* istanbul ignore if */ if (!parent) {
        return false;
      }

      return (
        isTypeCast(parent) ||
        isClassPropertyWithTypeAnnotation(parent) ||
        isVariableDeclaratorWithTypeAnnotation(parent)
      );
    }

    /**
     * Checks if a function declaration/expression has a return type.
     */
    function checkFunctionReturnType(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): void {
      if (
        node.returnType ||
        isConstructor(node.parent) ||
        isSetter(node.parent)
      ) {
        return;
      }

      if (util.isTypeScriptFile(context.getFilename())) {
        context.report({
          node,
          messageId: 'missingReturnType',
        });
      }
    }

    /**
     * Checks if a function declaration/expression has a return type.
     */
    function checkFunctionExpressionReturnType(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ): void {
      if (node.parent) {
        if (options.allowTypedFunctionExpressions) {
          if (
            isTypeCast(node.parent) ||
            isVariableDeclaratorWithTypeAnnotation(node.parent) ||
            isClassPropertyWithTypeAnnotation(node.parent) ||
            isPropertyOfObjectWithType(node.parent)
          ) {
            return;
          }
        }

        if (
          options.allowExpressions &&
          node.parent.type !== AST_NODE_TYPES.VariableDeclarator &&
          node.parent.type !== AST_NODE_TYPES.MethodDefinition
        ) {
          return;
        }
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
