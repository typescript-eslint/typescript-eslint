import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as util from '../util';

type Options = [
  {
    allowAny?: boolean;
    allowedPromiseNames?: string[];
    checkArrowFunctions?: boolean;
    checkFunctionDeclarations?: boolean;
    checkFunctionExpressions?: boolean;
    checkMethodDeclarations?: boolean;
  },
];
type MessageIds = 'missingAsync';

export default util.createRule<Options, MessageIds>({
  name: 'promise-function-async',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Requires any function or method that returns a Promise to be marked async',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      missingAsync: 'Functions that return promises must be async.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowAny: {
            type: 'boolean',
          },
          allowedPromiseNames: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          checkArrowFunctions: {
            type: 'boolean',
          },
          checkFunctionDeclarations: {
            type: 'boolean',
          },
          checkFunctionExpressions: {
            type: 'boolean',
          },
          checkMethodDeclarations: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowAny: true,
      allowedPromiseNames: [],
      checkArrowFunctions: true,
      checkFunctionDeclarations: true,
      checkFunctionExpressions: true,
      checkMethodDeclarations: true,
    },
  ],
  create(
    context,
    [
      {
        allowAny,
        allowedPromiseNames,
        checkArrowFunctions,
        checkFunctionDeclarations,
        checkFunctionExpressions,
        checkMethodDeclarations,
      },
    ],
  ) {
    const allAllowedPromiseNames = new Set([
      'Promise',
      ...allowedPromiseNames!,
    ]);
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const sourceCode = context.getSourceCode();

    function validateNode(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): void {
      const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const signatures = checker
        .getTypeAtLocation(originalNode)
        .getCallSignatures();
      if (!signatures.length) {
        return;
      }
      const returnType = checker.getReturnTypeOfSignature(signatures[0]);

      if (
        !util.containsAllTypesByName(
          returnType,
          allowAny!,
          allAllowedPromiseNames,
        )
      ) {
        // Return type is not a promise
        return;
      }

      if (node.parent?.type === AST_NODE_TYPES.TSAbstractMethodDefinition) {
        // Abstract method can't be async
        return;
      }

      if (
        node.parent &&
        (node.parent.type === AST_NODE_TYPES.Property ||
          node.parent.type === AST_NODE_TYPES.MethodDefinition) &&
        (node.parent.kind === 'get' || node.parent.kind === 'set')
      ) {
        // Getters and setters can't be async
        return;
      }

      if (
        util.isTypeFlagSet(returnType, ts.TypeFlags.Any | ts.TypeFlags.Unknown)
      ) {
        // Report without auto fixer because the return type is unknown
        return context.report({
          messageId: 'missingAsync',
          node,
          loc: util.getFunctionHeadLoc(node, sourceCode),
        });
      }

      context.report({
        messageId: 'missingAsync',
        node,
        loc: util.getFunctionHeadLoc(node, sourceCode),
        fix: fixer => {
          if (
            node.parent &&
            (node.parent.type === AST_NODE_TYPES.MethodDefinition ||
              (node.parent.type === AST_NODE_TYPES.Property &&
                node.parent.method))
          ) {
            // this function is a class method or object function property shorthand
            const method = node.parent;

            // the token to put `async` before
            let keyToken = sourceCode.getFirstToken(method)!;

            // if there are decorators then skip past them
            if (
              method.type === AST_NODE_TYPES.MethodDefinition &&
              method.decorators
            ) {
              const lastDecorator =
                method.decorators[method.decorators.length - 1];
              keyToken = sourceCode.getTokenAfter(lastDecorator)!;
            }

            // if current token is a keyword like `static` or `public` then skip it
            while (keyToken.type === AST_TOKEN_TYPES.Keyword) {
              keyToken = sourceCode.getTokenAfter(keyToken)!;
            }

            // check if there is a space between key and previous token
            const insertSpace = !sourceCode.isSpaceBetween!(
              sourceCode.getTokenBefore(keyToken)!,
              keyToken,
            );

            let code = 'async ';
            if (insertSpace) {
              code = ` ${code}`;
            }
            return fixer.insertTextBefore(keyToken, code);
          }

          return fixer.insertTextBefore(node, 'async ');
        },
      });
    }

    return {
      'ArrowFunctionExpression[async = false]'(
        node: TSESTree.ArrowFunctionExpression,
      ): void {
        if (checkArrowFunctions) {
          validateNode(node);
        }
      },
      'FunctionDeclaration[async = false]'(
        node: TSESTree.FunctionDeclaration,
      ): void {
        if (checkFunctionDeclarations) {
          validateNode(node);
        }
      },
      'FunctionExpression[async = false]'(
        node: TSESTree.FunctionExpression,
      ): void {
        if (
          node.parent &&
          node.parent.type === AST_NODE_TYPES.MethodDefinition &&
          node.parent.kind === 'method'
        ) {
          if (checkMethodDeclarations) {
            validateNode(node);
          }
          return;
        }
        if (checkFunctionExpressions) {
          validateNode(node);
        }
      },
    };
  },
});
