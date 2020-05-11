import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';
import {
  checkFunctionReturnType,
  checkFunctionExpressionReturnType,
} from '../util/explicitReturnTypeUtils';

type Options = [
  {
    allowExpressions?: boolean;
    allowTypedFunctionExpressions?: boolean;
    allowHigherOrderFunctions?: boolean;
    allowDirectConstAssertionInArrowFunctions?: boolean;
    allowConciseArrowFunctionExpressionsStartingWithVoid?: boolean;
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
    },
  ],
  create(context, [options]) {
    const sourceCode = context.getSourceCode();

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

        checkFunctionExpressionReturnType(node, options, sourceCode, loc =>
          context.report({
            node,
            loc,
            messageId: 'missingReturnType',
          }),
        );
      },
      FunctionDeclaration(node): void {
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
