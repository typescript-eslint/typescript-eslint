import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import { getSourceCode } from '@typescript-eslint/utils/eslint-utils';
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

export default createRule<Options, MessageIds>({
  name: 'promise-function-async',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Require any function or method that returns a Promise to be marked async',
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
            description:
              'Whether to consider `any` and `unknown` to be Promises.',
            type: 'boolean',
          },
          allowedPromiseNames: {
            description:
              'Any extra names of classes or interfaces to be considered Promises.',
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
      // https://github.com/typescript-eslint/typescript-eslint/issues/5439
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...allowedPromiseNames!,
    ]);
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const sourceCode = getSourceCode(context);

    function validateNode(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): void {
      const signatures = services.getTypeAtLocation(node).getCallSignatures();
      if (!signatures.length) {
        return;
      }
      const returnType = checker.getReturnTypeOfSignature(signatures[0]);

      if (
        !containsAllTypesByName(
          returnType,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          allowAny!,
          allAllowedPromiseNames,
          // If no return type is explicitly set, we check if any parts of the return type match a Promise (instead of requiring all to match).
          node.returnType == null,
        )
      ) {
        // Return type is not a promise
        return;
      }

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

      if (isTypeFlagSet(returnType, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
        // Report without auto fixer because the return type is unknown
        return context.report({
          messageId: 'missingAsync',
          node,
          loc: getFunctionHeadLoc(node, sourceCode),
        });
      }

      context.report({
        messageId: 'missingAsync',
        node,
        loc: getFunctionHeadLoc(node, sourceCode),
        fix: fixer => {
          if (
            node.parent.type === AST_NODE_TYPES.MethodDefinition ||
            (node.parent.type === AST_NODE_TYPES.Property && node.parent.method)
          ) {
            // this function is a class method or object function property shorthand
            const method = node.parent;

            // the token to put `async` before
            let keyToken = nullThrows(
              sourceCode.getFirstToken(method),
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
                sourceCode.getTokenAfter(lastDecorator),
                NullThrowsReasons.MissingToken('key token', 'last decorator'),
              );
            }

            // if current token is a keyword like `static` or `public` then skip it
            while (
              keyToken.type === AST_TOKEN_TYPES.Keyword &&
              keyToken.range[0] < method.key.range[0]
            ) {
              keyToken = nullThrows(
                sourceCode.getTokenAfter(keyToken),
                NullThrowsReasons.MissingToken('token', 'keyword'),
              );
            }

            // check if there is a space between key and previous token
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const insertSpace = sourceCode.isSpaceBetween!(
              nullThrows(
                sourceCode.getTokenBefore(keyToken),
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
