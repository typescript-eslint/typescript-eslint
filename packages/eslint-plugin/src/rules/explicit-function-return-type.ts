import type { BlockStatement } from '@typescript-eslint/ast-spec';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';
import {
  ancestorHasReturnType,
  checkFunctionReturnType,
  isValidFunctionExpressionReturnType,
} from '../util/explicitReturnTypeUtils';

type Options = [
  {
    allowExpressions?: boolean;
    allowTypedFunctionExpressions?: boolean;
    allowHigherOrderFunctions?: boolean;
    allowDirectConstAssertionInArrowFunctions?: boolean;
    allowConciseArrowFunctionExpressionsStartingWithVoid?: boolean;
    allowFunctionContainingOnlyOtherFunctionCall?: boolean;
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
          allowConciseArrowFunctionExpressionsStartingWithVoid: {
            description:
              'Whether to allow arrow functions that start with the `void` keyword.',
            type: 'boolean',
          },
          allowExpressions: {
            description:
              'Whether to ignore function expressions (functions which are not part of a declaration).',
            type: 'boolean',
          },
          allowHigherOrderFunctions: {
            description:
              'Whether to ignore functions immediately returning another function expression.',
            type: 'boolean',
          },
          allowTypedFunctionExpressions: {
            description:
              'Whether to ignore type annotations on the variable of function expressions.',
            type: 'boolean',
          },
          allowDirectConstAssertionInArrowFunctions: {
            description:
              'Whether to ignore arrow functions immediately returning a `as const` value.',
            type: 'boolean',
          },
          allowFunctionContainingOnlyOtherFunctionCall: {
            description:
              'Whether to ignore functions immediately returning result of other function.',
            type: 'boolean',
          },
          allowedNames: {
            description:
              'An array of function/method name regexes that will not have their arguments or return values checked.',
            items: {
              type: 'string',
            },
            type: 'array',
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
      allowFunctionContainingOnlyOtherFunctionCall: false,
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
      if (!options.allowedNames?.length) {
        return false;
      }

      if (
        node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        node.type === AST_NODE_TYPES.FunctionExpression
      ) {
        const parent = node.parent;
        let funcName: string | null = null;
        if (node.id?.name) {
          funcName = node.id.name;
        } else if (parent) {
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
                parent.computed === false
              ) {
                funcName = parent.key.name;
              }
              break;
            }
          }
        }
        if (
          !!funcName &&
          !!options.allowedNames.find(name => funcName!.match(name))
        ) {
          return true;
        }
      }
      if (
        node.type === AST_NODE_TYPES.FunctionDeclaration &&
        node.id &&
        node.id.type === AST_NODE_TYPES.Identifier &&
        !!options.allowedNames.includes(node.id.name)
      ) {
        return true;
      }
      return false;
    }

    function doesImmediatelyReturnFunctionCall(block: BlockStatement): boolean {
      if (block.body.length !== 1) {
        return false;
      }
      const innerNode = block.body[0];
      if (
        innerNode.type === AST_NODE_TYPES.ReturnStatement &&
        innerNode.argument?.type === AST_NODE_TYPES.CallExpression
      ) {
        return true;
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

        if (options.allowFunctionContainingOnlyOtherFunctionCall) {
          if (node.body.type === AST_NODE_TYPES.CallExpression) {
            return;
          }
          if (
            node.body.type === AST_NODE_TYPES.BlockStatement &&
            doesImmediatelyReturnFunctionCall(node.body)
          ) {
            return;
          }
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
        if (
          options.allowFunctionContainingOnlyOtherFunctionCall &&
          doesImmediatelyReturnFunctionCall(node.body)
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
    };
  },
});
