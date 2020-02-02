import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import { TSESLint } from '@typescript-eslint/experimental-utils';

import * as util from '../util';

type Options = [
  {
    ignoreVoid?: boolean;
  },
];

type MessageId = 'floating' | 'floatingVoid' | 'floatingFixVoid';

export default util.createRule<Options, MessageId>({
  name: 'no-floating-promises',
  meta: {
    docs: {
      description: 'Requires Promise-like values to be handled appropriately',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      floating: 'Promises must be handled appropriately',
      floatingVoid:
        'Promises must be handled appropriately' +
        ' or explicitly marked as ignored with the `void` operator',
      floatingFixVoid: 'Add void operator to ignore',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreVoid: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem',
  },
  defaultOptions: [
    {
      ignoreVoid: false,
    },
  ],

  create(context, [options]) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const sourceCode = context.getSourceCode();

    return {
      ExpressionStatement(node): void {
        const { expression } = parserServices.esTreeNodeToTSNodeMap.get(node);

        if (isUnhandledPromise(checker, expression)) {
          if (options.ignoreVoid) {
            context.report({
              node,
              messageId: 'floatingVoid',
              suggest: [
                {
                  messageId: 'floatingFixVoid',
                  fix(fixer): TSESLint.RuleFix {
                    let code = sourceCode.getText(node);
                    code = `void ${code}`;
                    return fixer.replaceText(node, code);
                  },
                },
              ],
            });
          } else {
            context.report({
              node,
              messageId: 'floating',
            });
          }
        }
      },
    };

    function isUnhandledPromise(
      checker: ts.TypeChecker,
      node: ts.Node,
    ): boolean {
      // First, check expressions whose resulting types may not be promise-like
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.CommaToken
      ) {
        // Any child in a comma expression could return a potentially unhandled
        // promise, so we check them all regardless of whether the final returned
        // value is promise-like.
        return (
          isUnhandledPromise(checker, node.left) ||
          isUnhandledPromise(checker, node.right)
        );
      }

      if (ts.isVoidExpression(node) && !options.ignoreVoid) {
        // Similarly, a `void` expression always returns undefined, so we need to
        // see what's inside it without checking the type of the overall expression.
        return isUnhandledPromise(checker, node.expression);
      }

      // Check the type. At this point it can't be unhandled if it isn't a promise
      if (!isPromiseLike(checker, node)) {
        return false;
      }

      if (ts.isCallExpression(node)) {
        // If the outer expression is a call, it must be either a `.then()` or
        // `.catch()` that handles the promise.
        return (
          !isPromiseCatchCallWithHandler(node) &&
          !isPromiseThenCallWithRejectionHandler(node)
        );
      } else if (ts.isConditionalExpression(node)) {
        // We must be getting the promise-like value from one of the branches of the
        // ternary. Check them directly.
        return (
          isUnhandledPromise(checker, node.whenFalse) ||
          isUnhandledPromise(checker, node.whenTrue)
        );
      } else if (
        ts.isPropertyAccessExpression(node) ||
        ts.isIdentifier(node) ||
        ts.isNewExpression(node)
      ) {
        // If it is just a property access chain or a `new` call (e.g. `foo.bar` or
        // `new Promise()`), the promise is not handled because it doesn't have the
        // necessary then/catch call at the end of the chain.
        return true;
      }

      // We conservatively return false for all other types of expressions because
      // we don't want to accidentally fail if the promise is handled internally but
      // we just can't tell.
      return false;
    }
  },
});

// Modified from tsutils.isThenable() to only consider thenables which can be
// rejected/caught via a second parameter. Original source (MIT licensed):
//
//   https://github.com/ajafff/tsutils/blob/49d0d31050b44b81e918eae4fbaf1dfe7b7286af/util/type.ts#L95-L125
function isPromiseLike(checker: ts.TypeChecker, node: ts.Node): boolean {
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

function isPromiseCatchCallWithHandler(expression: ts.CallExpression): boolean {
  return (
    tsutils.isPropertyAccessExpression(expression.expression) &&
    expression.expression.name.text === 'catch' &&
    expression.arguments.length >= 1
  );
}

function isPromiseThenCallWithRejectionHandler(
  expression: ts.CallExpression,
): boolean {
  return (
    tsutils.isPropertyAccessExpression(expression.expression) &&
    expression.expression.name.text === 'then' &&
    expression.arguments.length >= 2
  );
}
