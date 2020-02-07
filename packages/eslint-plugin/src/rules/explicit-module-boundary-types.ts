import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';
import {
  checkFunctionExpressionReturnType,
  checkFunctionReturnType,
  isTypedFunctionExpression,
} from '../util/explicitReturnTypeUtils';

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

    function isUnexported(node: TSESTree.Node | undefined): boolean {
      let isReturnedValue = false;
      while (node) {
        if (
          node.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
          node.type === AST_NODE_TYPES.ExportNamedDeclaration ||
          node.type === AST_NODE_TYPES.ExportSpecifier
        ) {
          return false;
        }

        if (node.type === AST_NODE_TYPES.ReturnStatement) {
          isReturnedValue = true;
        }

        if (
          node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
          node.type === AST_NODE_TYPES.FunctionDeclaration ||
          node.type === AST_NODE_TYPES.FunctionExpression
        ) {
          isReturnedValue = false;
        }

        if (node.type === AST_NODE_TYPES.BlockStatement && !isReturnedValue) {
          return true;
        }

        node = node.parent;
      }

      return true;
    }

    function isArgumentUntyped(node: TSESTree.Identifier): boolean {
      return (
        !node.typeAnnotation ||
        node.typeAnnotation.typeAnnotation.type === AST_NODE_TYPES.TSAnyKeyword
      );
    }

    /**
     * Checks if a function declaration/expression has a return type.
     */
    function checkArguments(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): void {
      const paramIdentifiers = node.params.filter(util.isIdentifier);
      const untypedArgs = paramIdentifiers.filter(isArgumentUntyped);
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

    return {
      'ArrowFunctionExpression, FunctionExpression'(
        node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
      ): void {
        if (
          node.parent?.type === AST_NODE_TYPES.MethodDefinition &&
          node.parent.accessibility === 'private'
        ) {
          // don't check private methods as they aren't part of the public signature
          return;
        }

        if (
          isAllowedName(node.parent) ||
          isUnexported(node) ||
          isTypedFunctionExpression(node, options)
        ) {
          return;
        }

        checkFunctionExpressionReturnType(node, options, sourceCode, loc =>
          context.report({
            node,
            loc,
            messageId: 'missingReturnType',
          }),
        );

        checkArguments(node);
      },
      FunctionDeclaration(node): void {
        if (isAllowedName(node.parent) || isUnexported(node)) {
          return;
        }

        checkFunctionReturnType(node, options, sourceCode, loc =>
          context.report({
            node,
            loc,
            messageId: 'missingReturnType',
          }),
        );

        checkArguments(node);
      },
    };
  },
});
