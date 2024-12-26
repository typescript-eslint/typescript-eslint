import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { FunctionInfo } from '../util/explicitReturnTypeUtils';

import { createRule, nullThrows } from '../util';
import {
  ancestorHasReturnType,
  checkFunctionReturnType,
  isValidFunctionExpressionReturnType,
} from '../util/explicitReturnTypeUtils';

export type Options = [
  {
    allowConciseArrowFunctionExpressionsStartingWithVoid?: boolean;
    allowDirectConstAssertionInArrowFunctions?: boolean;
    allowedNames?: string[];
    allowExpressions?: boolean;
    allowFunctionsWithoutTypeParameters?: boolean;
    allowHigherOrderFunctions?: boolean;
    allowIIFEs?: boolean;
    allowTypedFunctionExpressions?: boolean;
  },
];
export type MessageIds = 'missingReturnType';

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

export default createRule<Options, MessageIds>({
  name: 'explicit-function-return-type',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require explicit return types on functions and class methods',
    },
    messages: {
      missingReturnType: 'Missing return type on function.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowConciseArrowFunctionExpressionsStartingWithVoid: {
            type: 'boolean',
            description:
              'Whether to allow arrow functions that start with the `void` keyword.',
          },
          allowDirectConstAssertionInArrowFunctions: {
            type: 'boolean',
            description:
              'Whether to ignore arrow functions immediately returning a `as const` value.',
          },
          allowedNames: {
            type: 'array',
            description:
              'An array of function/method names that will not have their arguments or return values checked.',
            items: {
              type: 'string',
            },
          },
          allowExpressions: {
            type: 'boolean',
            description:
              'Whether to ignore function expressions (functions which are not part of a declaration).',
          },
          allowFunctionsWithoutTypeParameters: {
            type: 'boolean',
            description:
              "Whether to ignore functions that don't have generic type parameters.",
          },
          allowHigherOrderFunctions: {
            type: 'boolean',
            description:
              'Whether to ignore functions immediately returning another function expression.',
          },
          allowIIFEs: {
            type: 'boolean',
            description:
              'Whether to ignore immediately invoked function expressions (IIFEs).',
          },
          allowTypedFunctionExpressions: {
            type: 'boolean',
            description:
              'Whether to ignore type annotations on the variable of function expressions.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowConciseArrowFunctionExpressionsStartingWithVoid: false,
      allowDirectConstAssertionInArrowFunctions: true,
      allowedNames: [],
      allowExpressions: false,
      allowFunctionsWithoutTypeParameters: false,
      allowHigherOrderFunctions: true,
      allowIIFEs: false,
      allowTypedFunctionExpressions: true,
    },
  ],
  create(context, [options]) {
    const functionInfoStack: FunctionInfo<FunctionNode>[] = [];

    function enterFunction(node: FunctionNode): void {
      functionInfoStack.push({
        node,
        returns: [],
      });
    }

    function popFunctionInfo(exitNodeType: string): FunctionInfo<FunctionNode> {
      return nullThrows(
        functionInfoStack.pop(),
        `Stack should exist on ${exitNodeType} exit`,
      );
    }

    function isAllowedFunction(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): boolean {
      if (options.allowFunctionsWithoutTypeParameters && !node.typeParameters) {
        return true;
      }

      if (options.allowIIFEs && isIIFE(node)) {
        return true;
      }

      if (!options.allowedNames?.length) {
        return false;
      }

      if (
        node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        node.type === AST_NODE_TYPES.FunctionExpression
      ) {
        const parent = node.parent;
        let funcName;
        if (node.id?.name) {
          funcName = node.id.name;
        } else {
          switch (parent.type) {
            case AST_NODE_TYPES.VariableDeclarator: {
              if (parent.id.type === AST_NODE_TYPES.Identifier) {
                funcName = parent.id.name;
              }
              break;
            }
            case AST_NODE_TYPES.MethodDefinition:
            case AST_NODE_TYPES.PropertyDefinition:
            case AST_NODE_TYPES.Property: {
              if (
                parent.key.type === AST_NODE_TYPES.Identifier &&
                !parent.computed
              ) {
                funcName = parent.key.name;
              }
              break;
            }
          }
        }
        if (!!funcName && !!options.allowedNames.includes(funcName)) {
          return true;
        }
      }
      if (
        node.type === AST_NODE_TYPES.FunctionDeclaration &&
        node.id &&
        !!options.allowedNames.includes(node.id.name)
      ) {
        return true;
      }
      return false;
    }

    function isIIFE(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): boolean {
      return node.parent.type === AST_NODE_TYPES.CallExpression;
    }

    function exitFunctionExpression(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ): void {
      const info = popFunctionInfo('function expression');

      if (
        options.allowConciseArrowFunctionExpressionsStartingWithVoid &&
        node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
        node.expression &&
        node.body.type === AST_NODE_TYPES.UnaryExpression &&
        node.body.operator === 'void'
      ) {
        return;
      }

      if (isAllowedFunction(node)) {
        return;
      }

      if (
        options.allowTypedFunctionExpressions &&
        (isValidFunctionExpressionReturnType(node, options) ||
          ancestorHasReturnType(node))
      ) {
        return;
      }

      checkFunctionReturnType(info, options, context.sourceCode, loc =>
        context.report({
          loc,
          node,
          messageId: 'missingReturnType',
        }),
      );
    }

    return {
      'ArrowFunctionExpression, FunctionExpression, FunctionDeclaration':
        enterFunction,
      'ArrowFunctionExpression:exit': exitFunctionExpression,
      'FunctionDeclaration:exit'(node): void {
        const info = popFunctionInfo('function declaration');
        if (isAllowedFunction(node)) {
          return;
        }
        if (options.allowTypedFunctionExpressions && node.returnType) {
          return;
        }

        checkFunctionReturnType(info, options, context.sourceCode, loc =>
          context.report({
            loc,
            node,
            messageId: 'missingReturnType',
          }),
        );
      },
      'FunctionExpression:exit': exitFunctionExpression,
      ReturnStatement(node): void {
        functionInfoStack.at(-1)?.returns.push(node);
      },
    };
  },
});
