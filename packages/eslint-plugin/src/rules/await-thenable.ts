import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getFixOrSuggest,
  getParserServices,
  isAwaitKeyword,
  isTypeAnyType,
  isTypeReferenceType,
  isTypeUnknownType,
  nullThrows,
  NullThrowsReasons,
} from '../util';
import { getForStatementHeadLoc } from '../util/getForStatementHeadLoc';

type MessageId =
  | 'await'
  | 'awaitUsingOfNonAsyncDisposable'
  | 'convertToOrdinaryFor'
  | 'forAwaitOfNonAsyncIterable'
  | 'notPromises'
  | 'removeAwait';

export default createRule<[], MessageId>({
  name: 'await-thenable',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow awaiting a value that is not a Thenable',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      await: 'Unexpected `await` of a non-Promise (non-"Thenable") value.',
      awaitUsingOfNonAsyncDisposable:
        'Unexpected `await using` of a value that is not async disposable.',
      convertToOrdinaryFor: 'Convert to an ordinary `for...of` loop.',
      forAwaitOfNonAsyncIterable:
        'Unexpected `for await...of` of a value that is not async iterable.',
      notPromises: 'Unexpected non-promise input to Promise.{methodName}.',
      removeAwait: 'Remove unnecessary `await`.',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      AwaitExpression(node): void {
        const type = services.getTypeAtLocation(node.argument);
        if (isTypeAnyType(type) || isTypeUnknownType(type)) {
          return;
        }

        const originalNode = services.esTreeNodeToTSNodeMap.get(node);

        if (!tsutils.isThenableType(checker, originalNode.expression, type)) {
          context.report({
            node,
            messageId: 'await',
            suggest: [
              {
                messageId: 'removeAwait',
                fix(fixer): TSESLint.RuleFix {
                  const awaitKeyword = nullThrows(
                    context.sourceCode.getFirstToken(node, isAwaitKeyword),
                    NullThrowsReasons.MissingToken('await', 'await expression'),
                  );

                  return fixer.remove(awaitKeyword);
                },
              },
            ],
          });
        }
      },

      'ForOfStatement[await=true]'(node: TSESTree.ForOfStatement): void {
        const type = services.getTypeAtLocation(node.right);
        if (isTypeAnyType(type)) {
          return;
        }

        const hasAsyncIteratorSymbol = tsutils
          .unionTypeParts(type)
          .some(
            typePart =>
              tsutils.getWellKnownSymbolPropertyOfType(
                typePart,
                'asyncIterator',
                checker,
              ) != null,
          );

        if (!hasAsyncIteratorSymbol) {
          context.report({
            loc: getForStatementHeadLoc(context.sourceCode, node),
            messageId: 'forAwaitOfNonAsyncIterable',
            suggest: [
              // Note that this suggestion causes broken code for sync iterables
              // of promises, since the loop variable is not awaited.
              {
                messageId: 'convertToOrdinaryFor',
                fix(fixer): TSESLint.RuleFix {
                  const awaitToken = nullThrows(
                    context.sourceCode.getFirstToken(node, isAwaitKeyword),
                    NullThrowsReasons.MissingToken('await', 'for await loop'),
                  );
                  return fixer.remove(awaitToken);
                },
              },
            ],
          });
        }
      },

      'VariableDeclaration[kind="await using"]'(
        node: TSESTree.VariableDeclaration,
      ): void {
        for (const declarator of node.declarations) {
          const init = declarator.init;
          if (init == null) {
            continue;
          }
          const type = services.getTypeAtLocation(init);
          if (isTypeAnyType(type)) {
            continue;
          }

          const hasAsyncDisposeSymbol = tsutils
            .unionTypeParts(type)
            .some(
              typePart =>
                tsutils.getWellKnownSymbolPropertyOfType(
                  typePart,
                  'asyncDispose',
                  checker,
                ) != null,
            );

          if (!hasAsyncDisposeSymbol) {
            context.report({
              node: init,
              messageId: 'awaitUsingOfNonAsyncDisposable',
              // let the user figure out what to do if there's
              // await using a = b, c = d, e = f;
              // it's rare and not worth the complexity to handle.
              ...getFixOrSuggest({
                fixOrSuggest:
                  node.declarations.length === 1 ? 'suggest' : 'none',

                suggestion: {
                  messageId: 'removeAwait',
                  fix(fixer): TSESLint.RuleFix {
                    const awaitToken = nullThrows(
                      context.sourceCode.getFirstToken(node, isAwaitKeyword),
                      NullThrowsReasons.MissingToken('await', 'await using'),
                    );
                    return fixer.remove(awaitToken);
                  },
                },
              }),
            });
          }
        }
      },

      // Check for e.g. `Promise.all(nonPromises)`
      CallExpression(node): void {
        if (
          node.callee.type === AST_NODE_TYPES.MemberExpression &&
          node.callee.object.type === AST_NODE_TYPES.Identifier &&
          node.callee.object.name === 'Promise' &&
          node.callee.property.type === AST_NODE_TYPES.Identifier &&
          (node.callee.property.name === 'all' ||
            node.callee.property.name === 'allSettled' ||
            node.callee.property.name === 'race')
        ) {
          // Get the type of the thing being used in the method call.
          const argument = node.arguments[0];
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (argument === undefined) {
            return;
          }

          const tsNode = services.esTreeNodeToTSNodeMap.get(argument);
          const type = checker.getTypeAtLocation(tsNode);
          if (!isTypeReferenceType(type) || type.typeArguments === undefined) {
            return;
          }

          const typeArg = type.typeArguments[0];
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (typeArg === undefined) {
            return;
          }

          const typeName = getTypeNameSimple(type);
          const typeArgName = getTypeNameSimple(typeArg);

          if (typeName === 'Array' && typeArgName !== 'Promise') {
            context.report({
              loc: node.loc,
              messageId: 'notPromises',
            });
          }
        }
      },
    };
  },
});

/** This is a simplified version of the `getTypeName` utility function. */
function getTypeNameSimple(type: ts.Type): string | undefined {
  return type.getSymbol()?.escapedName as string | undefined;
}
