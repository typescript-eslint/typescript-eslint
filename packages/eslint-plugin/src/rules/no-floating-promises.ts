import { unionTypeParts } from '@typescript-eslint/type-utils';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import * as util from '../util';

type Options = [
  {
    ignoreVoid?: boolean;
    ignoreIIFE?: boolean;
  },
];

type MessageId = 'floating' | 'floatingVoid' | 'floatingFixVoid';

export default util.createRule<Options, MessageId>({
  name: 'no-floating-promises',
  meta: {
    docs: {
      description:
        'Require Promise-like statements to be handled appropriately',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      floating:
        'Promises must be awaited, end with a call to .catch, or end with a call to .then with a rejection handler.',
      floatingVoid:
        'Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler' +
        ' or be explicitly marked as ignored with the `void` operator.',
      floatingFixVoid: 'Add void operator to ignore.',
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
              'Whether to ignore async IIFEs (Immediately Invocated Function Expressions).',
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
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const sourceCode = context.getSourceCode();

    return {
      ExpressionStatement(node): void {
        if (options.ignoreIIFE && isAsyncIife(node)) {
          return;
        }

        let expression = node.expression;

        if (expression.type === AST_NODE_TYPES.ChainExpression) {
          expression = expression.expression;
        }

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

    function isUnhandledPromise(
      checker: ts.TypeChecker,
      node: TSESTree.Node,
    ): boolean {
      // First, check expressions whose resulting types may not be promise-like
      if (node.type === AST_NODE_TYPES.SequenceExpression) {
        // Any child in a comma expression could return a potentially unhandled
        // promise, so we check them all regardless of whether the final returned
        // value is promise-like.
        return node.expressions.some(item => isUnhandledPromise(checker, item));
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

      // Check the type. At this point it can't be unhandled if it isn't a promise
      if (
        !isPromiseLike(checker, parserServices.esTreeNodeToTSNodeMap.get(node))
      ) {
        return false;
      }

      if (node.type === AST_NODE_TYPES.CallExpression) {
        // If the outer expression is a call, it must be either a `.then()` or
        // `.catch()` that handles the promise.
        return (
          !isPromiseCatchCallWithHandler(node) &&
          !isPromiseThenCallWithRejectionHandler(node) &&
          !isPromiseFinallyCallWithHandler(node)
        );
      } else if (node.type === AST_NODE_TYPES.ConditionalExpression) {
        // We must be getting the promise-like value from one of the branches of the
        // ternary. Check them directly.
        return (
          isUnhandledPromise(checker, node.alternate) ||
          isUnhandledPromise(checker, node.consequent)
        );
      } else if (
        node.type === AST_NODE_TYPES.MemberExpression ||
        node.type === AST_NODE_TYPES.Identifier ||
        node.type === AST_NODE_TYPES.NewExpression
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
  for (const ty of unionTypeParts(checker.getApparentType(type))) {
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
  for (const t of unionTypeParts(type)) {
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
  for (const t of unionTypeParts(type)) {
    if (t.getCallSignatures().length !== 0) {
      return true;
    }
  }
  return false;
}

function isPromiseCatchCallWithHandler(
  expression: TSESTree.CallExpression,
): boolean {
  return (
    expression.callee.type === AST_NODE_TYPES.MemberExpression &&
    expression.callee.property.type === AST_NODE_TYPES.Identifier &&
    expression.callee.property.name === 'catch' &&
    expression.arguments.length >= 1
  );
}

function isPromiseThenCallWithRejectionHandler(
  expression: TSESTree.CallExpression,
): boolean {
  return (
    expression.callee.type === AST_NODE_TYPES.MemberExpression &&
    expression.callee.property.type === AST_NODE_TYPES.Identifier &&
    expression.callee.property.name === 'then' &&
    expression.arguments.length >= 2
  );
}

function isPromiseFinallyCallWithHandler(
  expression: TSESTree.CallExpression,
): boolean {
  return (
    expression.callee.type === AST_NODE_TYPES.MemberExpression &&
    expression.callee.property.type === AST_NODE_TYPES.Identifier &&
    expression.callee.property.name === 'finally' &&
    expression.arguments.length >= 1
  );
}
