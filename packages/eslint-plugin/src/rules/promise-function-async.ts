import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  containsAllTypesByName,
  createRule,
  getFunctionHeadLoc,
  getParserServices,
  isTypeFlagSet,
  nullThrows,
  NullThrowsReasons,
} from '../util';

export type Options = [
  {
    allowAny?: boolean;
    allowedPromiseNames?: string[];
    checkArrowFunctions?: boolean;
    checkFunctionDeclarations?: boolean;
    checkFunctionExpressions?: boolean;
    checkMethodDeclarations?: boolean;
  },
];
export type MessageIds = 'missingAsync' | 'missingAsyncHybridReturn';

export default createRule<Options, MessageIds>({
  name: 'promise-function-async',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require any function or method that returns a Promise to be marked async',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      missingAsync: 'Functions that return promises must be async.',
      missingAsyncHybridReturn:
        'Functions that return promises must be async. Consider adding an explicit return type annotation if the function is intended to return both a promise and a non-promise.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowAny: {
            type: 'boolean',
            description:
              'Whether to consider `any` and `unknown` to be Promises.',
          },
          allowedPromiseNames: {
            type: 'array',
            description:
              'Any extra names of classes or interfaces to be considered Promises.',
            items: {
              type: 'string',
            },
          },
          checkArrowFunctions: {
            type: 'boolean',
            description: 'Whether to check arrow functions.',
          },
          checkFunctionDeclarations: {
            type: 'boolean',
            description: 'Whether to check standalone function declarations.',
          },
          checkFunctionExpressions: {
            type: 'boolean',
            description: 'Whether to check inline function expressions',
          },
          checkMethodDeclarations: {
            type: 'boolean',
            description:
              'Whether to check methods on classes and object literals.',
          },
        },
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
      // https://github.com/typescript-eslint/typescript-eslint/issues/5439
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...allowedPromiseNames!,
    ]);
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function validateNode(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): void {
      if (node.parent.type === AST_NODE_TYPES.TSAbstractMethodDefinition) {
        // Abstract method can't be async
        return;
      }

      if (
        (node.parent.type === AST_NODE_TYPES.Property ||
          node.parent.type === AST_NODE_TYPES.MethodDefinition) &&
        (node.parent.kind === 'get' || node.parent.kind === 'set')
      ) {
        // Getters and setters can't be async
        return;
      }

      const signatures = services.getTypeAtLocation(node).getCallSignatures();
      if (!signatures.length) {
        return;
      }

      const returnTypes = signatures.map(signature =>
        checker.getReturnTypeOfSignature(signature),
      );

      if (
        !allowAny &&
        returnTypes.some(type =>
          isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown),
        )
      ) {
        // Report without auto fixer because the return type is unknown
        return context.report({
          loc: getFunctionHeadLoc(node, context.sourceCode),
          node,
          messageId: 'missingAsync',
        });
      }

      if (
        // require all potential return types to be promise/any/unknown
        returnTypes.every(type =>
          containsAllTypesByName(
            type,
            true,
            allAllowedPromiseNames,
            // If no return type is explicitly set, we check if any parts of the return type match a Promise (instead of requiring all to match).
            node.returnType == null,
          ),
        )
      ) {
        const isHybridReturnType = returnTypes.some(
          type =>
            type.isUnion() &&
            !type.types.every(part =>
              containsAllTypesByName(part, true, allAllowedPromiseNames),
            ),
        );

        context.report({
          loc: getFunctionHeadLoc(node, context.sourceCode),
          node,
          messageId: isHybridReturnType
            ? 'missingAsyncHybridReturn'
            : 'missingAsync',
          fix: fixer => {
            if (
              node.parent.type === AST_NODE_TYPES.MethodDefinition ||
              (node.parent.type === AST_NODE_TYPES.Property &&
                node.parent.method)
            ) {
              // this function is a class method or object function property shorthand
              const method = node.parent;

              // the token to put `async` before
              let keyToken = nullThrows(
                context.sourceCode.getFirstToken(method),
                NullThrowsReasons.MissingToken('key token', 'method'),
              );

              // if there are decorators then skip past them
              if (
                method.type === AST_NODE_TYPES.MethodDefinition &&
                method.decorators.length
              ) {
                const lastDecorator =
                  method.decorators[method.decorators.length - 1];
                keyToken = nullThrows(
                  context.sourceCode.getTokenAfter(lastDecorator),
                  NullThrowsReasons.MissingToken('key token', 'last decorator'),
                );
              }

              // if current token is a keyword like `static` or `public` then skip it
              while (
                keyToken.type === AST_TOKEN_TYPES.Keyword &&
                keyToken.range[0] < method.key.range[0]
              ) {
                keyToken = nullThrows(
                  context.sourceCode.getTokenAfter(keyToken),
                  NullThrowsReasons.MissingToken('token', 'keyword'),
                );
              }

              // check if there is a space between key and previous token
              const insertSpace = !context.sourceCode.isSpaceBetween(
                nullThrows(
                  context.sourceCode.getTokenBefore(keyToken),
                  NullThrowsReasons.MissingToken('token', 'keyword'),
                ),
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
    }

    return {
      ...(checkArrowFunctions && {
        'ArrowFunctionExpression[async = false]'(
          node: TSESTree.ArrowFunctionExpression,
        ): void {
          validateNode(node);
        },
      }),
      ...(checkFunctionDeclarations && {
        'FunctionDeclaration[async = false]'(
          node: TSESTree.FunctionDeclaration,
        ): void {
          validateNode(node);
        },
      }),
      'FunctionExpression[async = false]'(
        node: TSESTree.FunctionExpression,
      ): void {
        if (
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
