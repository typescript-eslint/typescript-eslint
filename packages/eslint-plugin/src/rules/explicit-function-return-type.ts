import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';
import {
  checkFunctionReturnType,
  checkFunctionExpressionReturnType,
} from '../util/explicitReturnTypeUtils';
import { SyntaxKind } from 'typescript';
import {
  RuleFixer,
  ReportFixFunction,
  RuleFix,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';

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
      recommended: 'warn',
      requiresTypeChecking: true,
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
    fixable: 'code',
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
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    if (
      !context.parserServices ||
      !context.parserServices.esTreeNodeToTSNodeMap
    ) {
      /**
       * The user needs to have configured "project" in their parserOptions
       * for @typescript-eslint/parser
       */
      throw new Error(
        'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.',
      );
    }

    function createFixer(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionExpression
        | TSESTree.FunctionDeclaration,
    ): ReportFixFunction {
      return (fixer: RuleFixer): RuleFix | null => {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const signature = checker.getSignatureFromDeclaration(tsNode);

        if (signature != null) {
          const children = tsNode.getChildren();
          // find the last parenthesis
          const lastParens = children.find(
            child => child.kind === SyntaxKind.CloseParenToken,
          );
          if (lastParens !== undefined) {
            const tokens = sourceCode.getTokens(node);
            const lastParensToken = tokens.find(
              token =>
                token.range[0] === lastParens.pos &&
                token.range[1] === lastParens.end,
            );
            if (lastParensToken !== undefined) {
              // insert the type after the last parenthesis
              return fixer.insertTextAfter(
                lastParensToken,
                ': ' +
                  checker.typeToString(
                    signature.getReturnType(),
                    signature.getDeclaration(),
                  ),
              );
            }
          }
        }
        return null;
      };
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

        checkFunctionExpressionReturnType(node, options, sourceCode, loc =>
          context.report({
            node,
            loc,
            messageId: 'missingReturnType',
            fix: createFixer(node),
          }),
        );
      },
      FunctionDeclaration(node): void {
        checkFunctionReturnType(node, options, sourceCode, loc =>
          context.report({
            node,
            loc,
            messageId: 'missingReturnType',
            fix: createFixer(node),
          }),
        );
      },
    };
  },
});
