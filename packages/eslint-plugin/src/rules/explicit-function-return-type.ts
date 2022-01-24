import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import * as util from '../util';
import {
  checkFunctionReturnType,
  isValidFunctionExpressionReturnType,
  ancestorHasReturnType,
} from '../util/explicitReturnTypeUtils';

type Options = [
  {
    allowExpressions?: boolean;
    allowTypedFunctionExpressions?: boolean;
    allowHigherOrderFunctions?: boolean;
    allowDirectConstAssertionInArrowFunctions?: boolean;
    allowConciseArrowFunctionExpressionsStartingWithVoid?: boolean;
    allowedNames?: string[];
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
      recommended: false,
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
          allowConciseArrowFunctionExpressionsStartingWithVoid: {
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
      allowExpressions: false,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
      allowDirectConstAssertionInArrowFunctions: true,
      allowConciseArrowFunctionExpressionsStartingWithVoid: false,
      allowedNames: [],
    },
  ],
  create(context, [options]) {
    const sourceCode = context.getSourceCode();
    function isAllowedName(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionExpression
        | TSESTree.FunctionDeclaration,
    ): boolean {
      if (
        node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        node.type === AST_NODE_TYPES.FunctionExpression
      ) {
        const parent = node.parent;
        return (
          parent?.type === AST_NODE_TYPES.VariableDeclarator &&
          parent?.id.type === AST_NODE_TYPES.Identifier &&
          !!options.allowedNames?.includes(parent.id.name)
        );
      }
      if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
        return (
          node.id?.type === AST_NODE_TYPES.Identifier &&
          !!options.allowedNames?.includes(node.id.name)
        );
      }
      return false;
    }
    return {
      'ArrowFunctionExpression, FunctionExpression'(
        node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
      ): void {
        if (
          options.allowConciseArrowFunctionExpressionsStartingWithVoid &&
          node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
          node.expression &&
          node.body.type === AST_NODE_TYPES.UnaryExpression &&
          node.body.operator === 'void'
        ) {
          return;
        }

        if (isAllowedName(node)) {
          return;
        }

        if (
          options.allowTypedFunctionExpressions &&
          (isValidFunctionExpressionReturnType(node, options) ||
            ancestorHasReturnType(node))
        ) {
          return;
        }

        checkFunctionReturnType(node, options, sourceCode, loc =>
          context.report({
            node,
            loc,
            messageId: 'missingReturnType',
          }),
        );
      },
      FunctionDeclaration(node): void {
        if (isAllowedName(node)) {
          return;
        }
        if (options.allowTypedFunctionExpressions && node.returnType) {
          return;
        }

        checkFunctionReturnType(node, options, sourceCode, loc =>
          context.report({
            node,
            loc,
            messageId: 'missingReturnType',
          }),
        );
      },
    };
  },
});
