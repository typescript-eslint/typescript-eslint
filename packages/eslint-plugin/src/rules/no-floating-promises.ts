import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getOperatorPrecedence,
  getParserServices,
  OperatorPrecedence,
} from '../util';

type Options = [
  {
    ignoreVoid?: boolean;
    ignoreIIFE?: boolean;
  },
];

type MessageId =
  | 'floating'
  | 'floatingVoid'
  | 'floatingUselessRejectionHandler'
  | 'floatingUselessRejectionHandlerVoid'
  | 'floatingFixAwait'
  | 'floatingFixVoid'
  | 'floatingPromiseArray'
  | 'floatingPromiseArrayVoid';

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
      floatingVoid: messageBaseVoid,
      floatingFixVoid: 'Add void operator to ignore.',
      floatingUselessRejectionHandler:
        messageBase + ' ' + messageRejectionHandler,
      floatingUselessRejectionHandlerVoid:
        messageBaseVoid + ' ' + messageRejectionHandler,

      floatingPromiseArray: messagePromiseArray,
      floatingPromiseArrayVoid: messagePromiseArrayVoid,
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreVoid: {
            description: 'Whether to ignore `void` expressions.',
            type: 'boolean',
          },
          ignoreIIFE: {
            description:
              'Whether to ignore async IIFEs (Immediately Invoked Function Expressions).',
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem',
  },
  defaultOptions: [
    {
      ignoreVoid: true,
      ignoreIIFE: false,
    },
  ],

  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      ExpressionStatement(node): void {
        if (options.ignoreIIFE && isAsyncIife(node)) {
          return;
        }

        let expression = node.expression;

        if (expression.type === AST_NODE_TYPES.ChainExpression) {
          expression = expression.expression;
        }

        const { isUnhandled, nonFunctionHandler, promiseArray } =
          isUnhandledPromise(checker, expression);

        if (isUnhandled) {
          if (!promiseArray) {
            if (options.ignoreVoid) {
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
                    fix(fixer): TSESLint.RuleFix | TSESLint.RuleFix[] {
                      if (
                        expression.type === AST_NODE_TYPES.UnaryExpression &&
                        expression.operator === 'void'
                      ) {
                        return fixer.replaceTextRange(
                          [expression.range[0], expression.range[0] + 4],
                          'await',
                        );
                      }
                      const tsNode = services.esTreeNodeToTSNodeMap.get(
                        node.expression,
                      );
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
                    },
                  },
                ],
              });
            }
          } else {
            context.report({
              node,
              messageId: options.ignoreVoid
                ? 'floatingPromiseArrayVoid'
                : 'floatingPromiseArray',
            });
          }
        }
      },
    };

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
        node.expression.type === AST_NODE_TYPES.CallExpression &&
        (node.expression.callee.type ===
          AST_NODE_TYPES.ArrowFunctionExpression ||
          node.expression.callee.type === AST_NODE_TYPES.FunctionExpression)
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

      if (isPromiseArray(checker, services.esTreeNodeToTSNodeMap.get(node))) {
        return { isUnhandled: true, promiseArray: true };
      }

      // Check the type. At this point it can't be unhandled if it isn't a promise
      if (
        !isPromiseLikeNode(checker, services.esTreeNodeToTSNodeMap.get(node))
      ) {
        return { isUnhandled: false };
      }

      if (node.type === AST_NODE_TYPES.CallExpression) {
        // If the outer expression is a call, a `.catch()` or `.then()` with
        // rejection handler handles the promise.

        const catchRejectionHandler = getRejectionHandlerFromCatchCall(node);
        if (catchRejectionHandler) {
          if (isValidRejectionHandler(catchRejectionHandler)) {
            return { isUnhandled: false };
          }
          return { isUnhandled: true, nonFunctionHandler: true };
        }

        const thenRejectionHandler = getRejectionHandlerFromThenCall(node);
        if (thenRejectionHandler) {
          if (isValidRejectionHandler(thenRejectionHandler)) {
            return { isUnhandled: false };
          }
          return { isUnhandled: true, nonFunctionHandler: true };
        }

        // `x.finally()` is transparent to resolution of the promise, so check `x`.
        // ("object" in this context is the `x` in `x.finally()`)
        const promiseFinallyObject = getObjectFromFinallyCall(node);
        if (promiseFinallyObject) {
          return isUnhandledPromise(checker, promiseFinallyObject);
        }

        // All other cases are unhandled.
        return { isUnhandled: true };
      } else if (node.type === AST_NODE_TYPES.ConditionalExpression) {
        // We must be getting the promise-like value from one of the branches of the
        // ternary. Check them directly.
        const alternateResult = isUnhandledPromise(checker, node.alternate);
        if (alternateResult.isUnhandled) {
          return alternateResult;
        }
        return isUnhandledPromise(checker, node.consequent);
      } else if (
        node.type === AST_NODE_TYPES.MemberExpression ||
        node.type === AST_NODE_TYPES.Identifier ||
        node.type === AST_NODE_TYPES.NewExpression
      ) {
        // If it is just a property access chain or a `new` call (e.g. `foo.bar` or
        // `new Promise()`), the promise is not handled because it doesn't have the
        // necessary then/catch call at the end of the chain.
        return { isUnhandled: true };
      } else if (node.type === AST_NODE_TYPES.LogicalExpression) {
        const leftResult = isUnhandledPromise(checker, node.left);
        if (leftResult.isUnhandled) {
          return leftResult;
        }
        return isUnhandledPromise(checker, node.right);
      }

      // We conservatively return false for all other types of expressions because
      // we don't want to accidentally fail if the promise is handled internally but
      // we just can't tell.
      return { isUnhandled: false };
    }
  },
});

function isPromiseArray(checker: ts.TypeChecker, node: ts.Node): boolean {
  const type = checker.getTypeAtLocation(node);
  if (checker.isArrayType(type)) {
    const arrayType = checker.getTypeArguments(type)[0];
    if (isPromiseLikeType(checker, arrayType)) {
      return true;
    }
  }

  return false;
}

function isPromiseLikeType(checker: ts.TypeChecker, type: ts.Type): boolean {
  // Get the apparent type, which considers type aliases.
  const apparentType = checker.getApparentType(type);

  // is any possible union type Promise-like?
  return tsutils.unionTypeParts(apparentType).some(typeUnionComponent => {
    // Must have 'then' property to be Promise-like.
    const thenProperty = typeUnionComponent.getProperty('then');
    if (!thenProperty) {
      return false;
    }

    // Does the 'then' property have any fitting call signature?
    const hasFittingCallSignature = checker
      .getTypeOfSymbol(thenProperty)
      .getCallSignatures()
      .some(signature => {
        // Call signature must have onFulfilled and onRejected parameters.
        if (!(signature.parameters.length >= 2)) {
          return false;
        }

        const [onFulFilled, onRejected] = signature.parameters;

        // Can each handler parameter accept a callable?
        const bothParametersAreCallable = [onFulFilled, onRejected].every(
          handler => {
            const handlerType = checker.getTypeOfSymbol(handler);

            const acceptsCallable = tsutils
              .unionTypeParts(handlerType)
              .some(
                handlerTypeUnionComponent =>
                  handlerTypeUnionComponent.getCallSignatures().length !== 0,
              );

            return acceptsCallable;
          },
        );

        return bothParametersAreCallable;
      });

    return hasFittingCallSignature;
  });
}

// Modified from tsutils.isThenable() to only consider thenables which can be
// rejected/caught via a second parameter. Original source (MIT licensed):
//
//   https://github.com/ajafff/tsutils/blob/49d0d31050b44b81e918eae4fbaf1dfe7b7286af/util/type.ts#L95-L125
function isPromiseLikeNode(checker: ts.TypeChecker, node: ts.Node): boolean {
  const type = checker.getTypeAtLocation(node);
  for (const ty of tsutils.unionTypeParts(checker.getApparentType(type))) {
    const then = ty.getProperty('then');
    if (then === undefined) {
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

function getRejectionHandlerFromCatchCall(
  expression: TSESTree.CallExpression,
): TSESTree.CallExpressionArgument | undefined {
  if (
    expression.callee.type === AST_NODE_TYPES.MemberExpression &&
    expression.callee.property.type === AST_NODE_TYPES.Identifier &&
    expression.callee.property.name === 'catch' &&
    expression.arguments.length >= 1
  ) {
    return expression.arguments[0];
  }
  return undefined;
}

function getRejectionHandlerFromThenCall(
  expression: TSESTree.CallExpression,
): TSESTree.CallExpressionArgument | undefined {
  if (
    expression.callee.type === AST_NODE_TYPES.MemberExpression &&
    expression.callee.property.type === AST_NODE_TYPES.Identifier &&
    expression.callee.property.name === 'then' &&
    expression.arguments.length >= 2
  ) {
    return expression.arguments[1];
  }
  return undefined;
}

function getObjectFromFinallyCall(
  expression: TSESTree.CallExpression,
): TSESTree.Expression | undefined {
  return expression.callee.type === AST_NODE_TYPES.MemberExpression &&
    expression.callee.property.type === AST_NODE_TYPES.Identifier &&
    expression.callee.property.name === 'finally'
    ? expression.callee.object
    : undefined;
}
