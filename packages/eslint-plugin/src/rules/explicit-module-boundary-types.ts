import {
  TSESTree,
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Options = [
  {
    allowTypedFunctionExpressions?: boolean;
    allowHigherOrderFunctions?: boolean;
    allowDirectConstAssertionInArrowFunctions?: boolean;
    allowedNames?: string[];
  },
];
type MessageIds = 'missingReturnType' | 'missingArgType';

export default util.createRule<Options, MessageIds>({
  name: 'explicit-module-boundary-types',
  meta: {
    type: 'problem',
    docs: {
      description:
        "Require explicit return and argument types on exported functions' and classes' public class methods",
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      missingReturnType: 'Missing return type on function.',
      missingArgType: "Argument '{{name}}' should be typed.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowTypedFunctionExpressions: {
            type: 'boolean',
          },
          allowHigherOrderFunctions: {
            type: 'boolean',
          },
          allowDirectConstAssertionInArrowFunctions: {
            type: 'boolean',
          },
          allowedNames: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
      allowDirectConstAssertionInArrowFunctions: true,
      allowedNames: [],
    },
  ],
  create(context, [options]) {
    const sourceCode = context.getSourceCode();

    /**
     * Returns start column position
     * @param node
     */
    function getLocStart(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): TSESTree.LineAndColumnData {
      /* highlight method name */
      const parent = node.parent;
      if (
        parent &&
        (parent.type === AST_NODE_TYPES.MethodDefinition ||
          (parent.type === AST_NODE_TYPES.Property && parent.method))
      ) {
        return parent.loc.start;
      }

      return node.loc.start;
    }

    /**
     * Returns end column position
     * @param node
     */
    function getLocEnd(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): TSESTree.LineAndColumnData {
      /* highlight `=>` */
      if (node.type === AST_NODE_TYPES.ArrowFunctionExpression) {
        return sourceCode.getTokenBefore(
          node.body,
          token =>
            token.type === AST_TOKEN_TYPES.Punctuator && token.value === '=>',
        )!.loc.end;
      }

      return sourceCode.getTokenBefore(node.body!)!.loc.end;
    }

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
     * Checks if a node belongs to:
     * new Foo(() => {})
     *         ^^^^^^^^
     */
    function isConstructorArgument(parent: TSESTree.Node): boolean {
      return parent.type === AST_NODE_TYPES.NewExpression;
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

    function isUnexported(node: TSESTree.Node | undefined): boolean {
      while (node) {
        if (
          node.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
          node.type === AST_NODE_TYPES.ExportNamedDeclaration ||
          node.type === AST_NODE_TYPES.ExportSpecifier
        ) {
          return false;
        }

        node = node.parent;
      }

      return true;
    }

    function isPrivateMethod(
      node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
    ): boolean {
      return node.accessibility === 'private';
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

      // Check if body is a block with a single statement
      if (
        body.type === AST_NODE_TYPES.BlockStatement &&
        body.body.length === 1
      ) {
        const [statement] = body.body;

        // Check if that statement is a return statement with an argument
        if (
          statement.type === AST_NODE_TYPES.ReturnStatement &&
          !!statement.argument
        ) {
          // If so, check that returned argument as body
          body = statement.argument;
        }
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
        (parent.type === AST_NODE_TYPES.CallExpression ||
          parent.type === AST_NODE_TYPES.OptionalCallExpression) &&
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
      const paramIdentifiers = node.params.filter(
        param => param.type === AST_NODE_TYPES.Identifier,
      ) as TSESTree.Identifier[];
      const untypedArgs = paramIdentifiers.filter(isArgumentUntyped);
      if (untypedArgs.length) {
        untypedArgs.forEach(untypedArg =>
          context.report({
            node,
            messageId: 'missingArgType',
            data: {
              name: untypedArg.name,
            },
          }),
        );
      }

      if (isAllowedName(node.parent)) {
        return;
      }

      if (isUnexported(node.parent)) {
        return;
      }

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
        loc: { start: getLocStart(node), end: getLocEnd(node) },
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
        if (
          node.parent.type === AST_NODE_TYPES.MethodDefinition &&
          isPrivateMethod(node.parent)
        ) {
          return;
        }

        if (options.allowTypedFunctionExpressions) {
          if (
            isTypeCast(node.parent) ||
            isVariableDeclaratorWithTypeAnnotation(node.parent) ||
            isClassPropertyWithTypeAnnotation(node.parent) ||
            isPropertyOfObjectWithType(node.parent) ||
            isFunctionArgument(node.parent, node) ||
            isConstructorArgument(node.parent)
          ) {
            return;
          }
        }
      }

      if (
        node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
        options.allowDirectConstAssertionInArrowFunctions &&
        returnsConstAssertionDirectly(node)
      ) {
        return;
      }

      checkFunctionReturnType(node);
    }

    /**
     * Checks if a function name is allowed and should not be checked.
     */
    function isAllowedName(node: TSESTree.Node | undefined): boolean {
      if (!node || !options.allowedNames || !options.allowedNames.length) {
        return false;
      }

      if (node.type === AST_NODE_TYPES.VariableDeclarator) {
        return (
          node.id.type === AST_NODE_TYPES.Identifier &&
          options.allowedNames.includes(node.id.name)
        );
      } else if (
        node.type === AST_NODE_TYPES.MethodDefinition ||
        node.type === AST_NODE_TYPES.TSAbstractMethodDefinition
      ) {
        if (
          node.key.type === AST_NODE_TYPES.Literal &&
          typeof node.key.value === 'string'
        ) {
          return options.allowedNames.includes(node.key.value);
        }
        if (
          node.key.type === AST_NODE_TYPES.TemplateLiteral &&
          node.key.expressions.length === 0
        ) {
          return options.allowedNames.includes(node.key.quasis[0].value.raw);
        }
        if (!node.computed && node.key.type === AST_NODE_TYPES.Identifier) {
          return options.allowedNames.includes(node.key.name);
        }
      }

      return false;
    }

    function isArgumentUntyped(node: TSESTree.Identifier): boolean {
      return (
        !node.typeAnnotation ||
        node.typeAnnotation.typeAnnotation.type === AST_NODE_TYPES.TSAnyKeyword
      );
    }

    return {
      ArrowFunctionExpression: checkFunctionExpressionReturnType,
      FunctionDeclaration: checkFunctionReturnType,
      FunctionExpression: checkFunctionExpressionReturnType,
    };
  },
});
