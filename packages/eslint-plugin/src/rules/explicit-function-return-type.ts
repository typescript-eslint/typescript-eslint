import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Options = [
  {
    allowExpressions?: boolean;
    allowTypedFunctionExpressions?: boolean;
    allowHigherOrderFunctions?: boolean;
    allowDirectConstAssertionInArrowFunctions?: boolean;
  },
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
          allowHigherOrderFunctions: {
            type: 'boolean',
          },
          allowDirectConstAssertionInArrowFunctions: {
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
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
      allowDirectConstAssertionInArrowFunctions: true,
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
      property: TSESTree.Node | undefined,
    ): boolean {
      if (!property || property.type !== AST_NODE_TYPES.Property) {
        return false;
      }
      const objectExpr = property.parent; // this shouldn't happen, checking just in case
      /* istanbul ignore if */ if (
        !objectExpr ||
        objectExpr.type !== AST_NODE_TYPES.ObjectExpression
      ) {
        return false;
      }

      const parent = objectExpr.parent; // this shouldn't happen, checking just in case
      /* istanbul ignore if */ if (!parent) {
        return false;
      }

      return (
        isTypeCast(parent) ||
        isClassPropertyWithTypeAnnotation(parent) ||
        isVariableDeclaratorWithTypeAnnotation(parent) ||
        isFunctionArgument(parent)
      );
    }

    /**
     * Checks if a function belongs to:
     * `() => () => ...`
     * `() => function () { ... }`
     * `() => { return () => ... }`
     * `() => { return function () { ... } }`
     * `function fn() { return () => ... }`
     * `function fn() { return function() { ... } }`
     */
    function doesImmediatelyReturnFunctionExpression({
      body,
    }:
      | TSESTree.ArrowFunctionExpression
      | TSESTree.FunctionDeclaration
      | TSESTree.FunctionExpression): boolean {
      // Should always have a body; really checking just in case
      /* istanbul ignore if */ if (!body) {
        return false;
      }

      // Check if body is a block with a return statement
      if (body.type === AST_NODE_TYPES.BlockStatement) {
        // Check if ReturnStatement exist among body and use that argument
        // for checking whether it is a function expression
        body.body.some(statement => {
          if (
            statement.type === AST_NODE_TYPES.ReturnStatement &&
            !!statement.argument
          ) {
            // If so, check that returned argument as body
            body = statement.argument;
            return;
          }
        });
      }

      // Check if the body being returned is a function expression
      return (
        body.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        body.type === AST_NODE_TYPES.FunctionExpression
      );
    }

    /**
     * Checks if a node belongs to:
     * `foo(() => 1)`
     */
    function isFunctionArgument(
      parent: TSESTree.Node,
      callee?: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ): boolean {
      return (
        parent.type === AST_NODE_TYPES.CallExpression &&
        // make sure this isn't an IIFE
        parent.callee !== callee
      );
    }

    /**
     * Checks if a function belongs to:
     * `() => ({ action: 'xxx' }) as const`
     */
    function returnsConstAssertionDirectly(
      node: TSESTree.ArrowFunctionExpression,
    ): boolean {
      const { body } = node;
      if (body.type === AST_NODE_TYPES.TSAsExpression) {
        const { typeAnnotation } = body;
        if (typeAnnotation.type === AST_NODE_TYPES.TSTypeReference) {
          const { typeName } = typeAnnotation;
          if (
            typeName.type === AST_NODE_TYPES.Identifier &&
            typeName.name === 'const'
          ) {
            return true;
          }
        }
      }

      return false;
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
        options.allowHigherOrderFunctions &&
        doesImmediatelyReturnFunctionExpression(node)
      ) {
        return;
      }

      if (
        node.returnType ||
        isConstructor(node.parent) ||
        isSetter(node.parent)
      ) {
        return;
      }

      context.report({
        node,
        messageId: 'missingReturnType',
      });
    }

    /**
     * Checks if a function declaration/expression has a return type.
     */
    function checkFunctionExpressionReturnType(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ): void {
      // Should always have a parent; checking just in case
      /* istanbul ignore else */ if (node.parent) {
        if (options.allowTypedFunctionExpressions) {
          if (
            isTypeCast(node.parent) ||
            isVariableDeclaratorWithTypeAnnotation(node.parent) ||
            isClassPropertyWithTypeAnnotation(node.parent) ||
            isPropertyOfObjectWithType(node.parent) ||
            isFunctionArgument(node.parent, node)
          ) {
            return;
          }
        }

        if (
          options.allowExpressions &&
          node.parent.type !== AST_NODE_TYPES.VariableDeclarator &&
          node.parent.type !== AST_NODE_TYPES.MethodDefinition &&
          node.parent.type !== AST_NODE_TYPES.ExportDefaultDeclaration
        ) {
          return;
        }
      }

      // https://github.com/typescript-eslint/typescript-eslint/issues/653
      if (
        node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
        options.allowDirectConstAssertionInArrowFunctions &&
        returnsConstAssertionDirectly(node)
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
