import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { TypeOrValueSpecifier } from '../util';

import {
  createRule,
  getOperatorPrecedence,
  getParserServices,
  getStaticMemberAccessValue,
  isBuiltinSymbolLike,
  OperatorPrecedence,
  readonlynessOptionsDefaults,
  readonlynessOptionsSchema,
  skipChainExpression,
  typeMatchesSomeSpecifier,
} from '../util';
import {
  parseCatchCall,
  parseFinallyCall,
  parseThenCall,
} from '../util/promiseUtils';

export type Options = [
  {
    allowForKnownSafeCalls?: TypeOrValueSpecifier[];
    allowForKnownSafePromises?: TypeOrValueSpecifier[];
    checkThenables?: boolean;
    ignoreIIFE?: boolean;
    ignoreVoid?: boolean;
  },
];

export type MessageId =
  | 'floating'
  | 'floatingFixAwait'
  | 'floatingFixVoid'
  | 'floatingPromiseArray'
  | 'floatingPromiseArrayVoid'
  | 'floatingUselessRejectionHandler'
  | 'floatingUselessRejectionHandlerVoid'
  | 'floatingVoid';

const messageBase =
  'Promises must be awaited, end with a call to .catch, or end with a call to .then with a rejection handler.';

const messageBaseVoid =
  'Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler' +
  ' or be explicitly marked as ignored with the `void` operator.';

const messageRejectionHandler =
  'A rejection handler that is not a function will be ignored.';

const messagePromiseArray =
  "An array of Promises may be unintentional. Consider handling the promises' fulfillment or rejection with Promise.all or similar.";

const messagePromiseArrayVoid =
  "An array of Promises may be unintentional. Consider handling the promises' fulfillment or rejection with Promise.all or similar," +
  ' or explicitly marking the expression as ignored with the `void` operator.';

export default createRule<Options, MessageId>({
  name: 'no-floating-promises',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require Promise-like statements to be handled appropriately',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      floating: messageBase,
      floatingFixAwait: 'Add await operator.',
      floatingFixVoid: 'Add void operator to ignore.',
      floatingPromiseArray: messagePromiseArray,
      floatingPromiseArrayVoid: messagePromiseArrayVoid,
      floatingUselessRejectionHandler: `${messageBase} ${messageRejectionHandler}`,
      floatingUselessRejectionHandlerVoid: `${messageBaseVoid} ${messageRejectionHandler}`,
      floatingVoid: messageBaseVoid,
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowForKnownSafeCalls: {
            ...readonlynessOptionsSchema.properties.allow,
            description:
              'Type specifiers of functions whose calls are safe to float.',
          },
          allowForKnownSafePromises: {
            ...readonlynessOptionsSchema.properties.allow,
            description: 'Type specifiers that are known to be safe to float.',
          },
          checkThenables: {
            type: 'boolean',
            description:
              'Whether to check all "Thenable"s, not just the built-in Promise type.',
          },
          ignoreIIFE: {
            type: 'boolean',
            description:
              'Whether to ignore async IIFEs (Immediately Invoked Function Expressions).',
          },
          ignoreVoid: {
            type: 'boolean',
            description: 'Whether to ignore `void` expressions.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowForKnownSafeCalls: readonlynessOptionsDefaults.allow,
      allowForKnownSafePromises: readonlynessOptionsDefaults.allow,
      checkThenables: false,
      ignoreIIFE: false,
      ignoreVoid: true,
    },
  ],

  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const { checkThenables } = options;

    // TODO: #5439
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const allowForKnownSafePromises = options.allowForKnownSafePromises!;
    const allowForKnownSafeCalls = options.allowForKnownSafeCalls!;
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    return {
      ExpressionStatement(node): void {
        if (options.ignoreIIFE && isAsyncIife(node)) {
          return;
        }

        const expression = skipChainExpression(node.expression);

        if (isKnownSafePromiseReturn(expression)) {
          return;
        }

        const { isUnhandled, nonFunctionHandler, promiseArray } =
          isUnhandledPromise(checker, expression);

        if (isUnhandled) {
          if (promiseArray) {
            context.report({
              node,
              messageId: options.ignoreVoid
                ? 'floatingPromiseArrayVoid'
                : 'floatingPromiseArray',
            });
          } else if (options.ignoreVoid) {
            context.report({
              node,
              messageId: nonFunctionHandler
                ? 'floatingUselessRejectionHandlerVoid'
                : 'floatingVoid',
              suggest: [
                {
                  messageId: 'floatingFixVoid',
                  fix(fixer): TSESLint.RuleFix | TSESLint.RuleFix[] {
                    const tsNode = services.esTreeNodeToTSNodeMap.get(
                      node.expression,
                    );
                    if (isHigherPrecedenceThanUnary(tsNode)) {
                      return fixer.insertTextBefore(node, 'void ');
                    }
                    return [
                      fixer.insertTextBefore(node, 'void ('),
                      fixer.insertTextAfterRange(
                        [expression.range[1], expression.range[1]],
                        ')',
                      ),
                    ];
                  },
                },
                {
                  messageId: 'floatingFixAwait',
                  fix: (fixer): TSESLint.RuleFix | TSESLint.RuleFix[] =>
                    addAwait(fixer, expression, node),
                },
              ],
            });
          } else {
            context.report({
              node,
              messageId: nonFunctionHandler
                ? 'floatingUselessRejectionHandler'
                : 'floating',
              suggest: [
                {
                  messageId: 'floatingFixAwait',
                  fix: (fixer): TSESLint.RuleFix | TSESLint.RuleFix[] =>
                    addAwait(fixer, expression, node),
                },
              ],
            });
          }
        }
      },
    };

    function addAwait(
      fixer: TSESLint.RuleFixer,
      expression: TSESTree.Expression,
      node: TSESTree.ExpressionStatement,
    ): TSESLint.RuleFix | TSESLint.RuleFix[] {
      if (
        expression.type === AST_NODE_TYPES.UnaryExpression &&
        expression.operator === 'void'
      ) {
        return fixer.replaceTextRange(
          [expression.range[0], expression.range[0] + 4],
          'await',
        );
      }
      const tsNode = services.esTreeNodeToTSNodeMap.get(node.expression);
      if (isHigherPrecedenceThanUnary(tsNode)) {
        return fixer.insertTextBefore(node, 'await ');
      }
      return [
        fixer.insertTextBefore(node, 'await ('),
        fixer.insertTextAfterRange(
          [expression.range[1], expression.range[1]],
          ')',
        ),
      ];
    }

    function isKnownSafePromiseReturn(node: TSESTree.Node): boolean {
      if (node.type !== AST_NODE_TYPES.CallExpression) {
        return false;
      }

      const type = services.getTypeAtLocation(node.callee);

      return typeMatchesSomeSpecifier(
        type,
        allowForKnownSafeCalls,
        services.program,
      );
    }

    function isHigherPrecedenceThanUnary(node: ts.Node): boolean {
      const operator = ts.isBinaryExpression(node)
        ? node.operatorToken.kind
        : ts.SyntaxKind.Unknown;
      const nodePrecedence = getOperatorPrecedence(node.kind, operator);
      return nodePrecedence > OperatorPrecedence.Unary;
    }

    function isAsyncIife(node: TSESTree.ExpressionStatement): boolean {
      if (node.expression.type !== AST_NODE_TYPES.CallExpression) {
        return false;
      }

      return (
        node.expression.callee.type ===
          AST_NODE_TYPES.ArrowFunctionExpression ||
        node.expression.callee.type === AST_NODE_TYPES.FunctionExpression
      );
    }

    function isValidRejectionHandler(rejectionHandler: TSESTree.Node): boolean {
      return (
        services.program
          .getTypeChecker()
          .getTypeAtLocation(
            services.esTreeNodeToTSNodeMap.get(rejectionHandler),
          )
          .getCallSignatures().length > 0
      );
    }

    function isUnhandledPromise(
      checker: ts.TypeChecker,
      node: TSESTree.Node,
    ): {
      isUnhandled: boolean;
      nonFunctionHandler?: boolean;
      promiseArray?: boolean;
    } {
      if (node.type === AST_NODE_TYPES.AssignmentExpression) {
        return { isUnhandled: false };
      }

      // First, check expressions whose resulting types may not be promise-like
      if (node.type === AST_NODE_TYPES.SequenceExpression) {
        // Any child in a comma expression could return a potentially unhandled
        // promise, so we check them all regardless of whether the final returned
        // value is promise-like.
        return (
          node.expressions
            .map(item => isUnhandledPromise(checker, item))
            .find(result => result.isUnhandled) ?? { isUnhandled: false }
        );
      }

      if (
        !options.ignoreVoid &&
        node.type === AST_NODE_TYPES.UnaryExpression &&
        node.operator === 'void'
      ) {
        // Similarly, a `void` expression always returns undefined, so we need to
        // see what's inside it without checking the type of the overall expression.
        return isUnhandledPromise(checker, node.argument);
      }

      const tsNode = services.esTreeNodeToTSNodeMap.get(node);

      // Check the type. At this point it can't be unhandled if it isn't a promise
      // or array thereof.

      if (isPromiseArray(tsNode)) {
        return { isUnhandled: true, promiseArray: true };
      }

      // await expression addresses promises, but not promise arrays.
      if (node.type === AST_NODE_TYPES.AwaitExpression) {
        // you would think this wouldn't be strictly necessary, since we're
        // anyway checking the type of the expression, but, unfortunately TS
        // reports the result of `await (promise as Promise<number> & number)`
        // as `Promise<number> & number` instead of `number`.
        return { isUnhandled: false };
      }

      if (!isPromiseLike(tsNode)) {
        return { isUnhandled: false };
      }

      if (node.type === AST_NODE_TYPES.CallExpression) {
        // If the outer expression is a call, a `.catch()` or `.then()` with
        // rejection handler handles the promise.

        const promiseHandlingMethodCall =
          parseCatchCall(node, context) ?? parseThenCall(node, context);
        if (promiseHandlingMethodCall != null) {
          const onRejected = promiseHandlingMethodCall.onRejected;
          if (onRejected != null) {
            if (isValidRejectionHandler(onRejected)) {
              return { isUnhandled: false };
            }
            return { isUnhandled: true, nonFunctionHandler: true };
          }
          return { isUnhandled: true };
        }

        const promiseFinallyCall = parseFinallyCall(node, context);

        if (promiseFinallyCall != null) {
          return isUnhandledPromise(checker, promiseFinallyCall.object);
        }

        // All other cases are unhandled.
        return { isUnhandled: true };
      }

      if (node.type === AST_NODE_TYPES.ConditionalExpression) {
        // We must be getting the promise-like value from one of the branches of the
        // ternary. Check them directly.
        const alternateResult = isUnhandledPromise(checker, node.alternate);
        if (alternateResult.isUnhandled) {
          return alternateResult;
        }
        return isUnhandledPromise(checker, node.consequent);
      }

      if (node.type === AST_NODE_TYPES.LogicalExpression) {
        const leftResult = isUnhandledPromise(checker, node.left);
        if (leftResult.isUnhandled) {
          return leftResult;
        }
        return isUnhandledPromise(checker, node.right);
      }

      // Anything else is unhandled.
      return { isUnhandled: true };
    }

    function isPromiseArray(node: ts.Node): boolean {
      const type = checker.getTypeAtLocation(node);
      for (const ty of tsutils
        .unionTypeParts(type)
        .map(t => checker.getApparentType(t))) {
        if (checker.isArrayType(ty)) {
          const arrayType = checker.getTypeArguments(ty)[0];
          if (isPromiseLike(node, arrayType)) {
            return true;
          }
        }

        if (checker.isTupleType(ty)) {
          for (const tupleElementType of checker.getTypeArguments(ty)) {
            if (isPromiseLike(node, tupleElementType)) {
              return true;
            }
          }
        }
      }
      return false;
    }

    function isPromiseLike(node: ts.Node, type?: ts.Type): boolean {
      type ??= checker.getTypeAtLocation(node);

      // The highest priority is to allow anything allowlisted
      if (
        typeMatchesSomeSpecifier(
          type,
          allowForKnownSafePromises,
          services.program,
        )
      ) {
        return false;
      }

      // Otherwise, we always consider the built-in Promise to be Promise-like...
      const typeParts = tsutils.unionTypeParts(checker.getApparentType(type));
      if (
        typeParts.some(typePart =>
          isBuiltinSymbolLike(services.program, typePart, 'Promise'),
        )
      ) {
        return true;
      }

      // ...and only check all Thenables if explicitly told to
      if (!checkThenables) {
        return false;
      }

      // Modified from tsutils.isThenable() to only consider thenables which can be
      // rejected/caught via a second parameter. Original source (MIT licensed):
      //
      //   https://github.com/ajafff/tsutils/blob/49d0d31050b44b81e918eae4fbaf1dfe7b7286af/util/type.ts#L95-L125
      for (const ty of typeParts) {
        const then = ty.getProperty('then');
        if (then == null) {
          continue;
        }

        const thenType = checker.getTypeOfSymbolAtLocation(then, node);
        if (
          hasMatchingSignature(
            thenType,
            signature =>
              signature.parameters.length >= 2 &&
              isFunctionParam(checker, signature.parameters[0], node) &&
              isFunctionParam(checker, signature.parameters[1], node),
          )
        ) {
          return true;
        }
      }
      return false;
    }
  },
});

function hasMatchingSignature(
  type: ts.Type,
  matcher: (signature: ts.Signature) => boolean,
): boolean {
  for (const t of tsutils.unionTypeParts(type)) {
    if (t.getCallSignatures().some(matcher)) {
      return true;
    }
  }

  return false;
}

function isFunctionParam(
  checker: ts.TypeChecker,
  param: ts.Symbol,
  node: ts.Node,
): boolean {
  const type: ts.Type | undefined = checker.getApparentType(
    checker.getTypeOfSymbolAtLocation(param, node),
  );
  for (const t of tsutils.unionTypeParts(type)) {
    if (t.getCallSignatures().length !== 0) {
      return true;
    }
  }
  return false;
}
