import type { TSESLint } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  Awaitable,
  createRule,
  getConstrainedTypeAtLocation,
  getFixOrSuggest,
  getParserServices,
  isAwaitKeyword,
  isTypeAnyType,
  needsToBeAwaited,
  nullThrows,
  NullThrowsReasons,
} from '../util';
import { getForStatementHeadLoc } from '../util/getForStatementHeadLoc';
import { isPromiseAggregatorMethod } from '../util/isPromiseAggregatorMethod';

export type MessageId =
  | 'await'
  | 'awaitUsingOfNonAsyncDisposable'
  | 'convertToOrdinaryFor'
  | 'forAwaitOfNonAsyncIterable'
  | 'invalidPromiseAggregatorInput'
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
      invalidPromiseAggregatorInput:
        'Unexpected iterable of non-Promise (non-"Thenable") values passed to promise aggregator.',
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
        const awaitArgumentEsNode = node.argument;
        const awaitArgumentType =
          services.getTypeAtLocation(awaitArgumentEsNode);
        const awaitArgumentTsNode =
          services.esTreeNodeToTSNodeMap.get(awaitArgumentEsNode);

        const certainty = needsToBeAwaited(
          checker,
          awaitArgumentTsNode,
          awaitArgumentType,
        );

        if (certainty === Awaitable.Never) {
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

      CallExpression(node: TSESTree.CallExpression): void {
        if (!isPromiseAggregatorMethod(context, services, node)) {
          return;
        }

        const argument = node.arguments.at(0);

        if (argument == null) {
          return;
        }

        if (argument.type === TSESTree.AST_NODE_TYPES.ArrayExpression) {
          for (const element of argument.elements) {
            if (element == null) {
              continue;
            }

            const type = getConstrainedTypeAtLocation(services, element);
            const tsNode = services.esTreeNodeToTSNodeMap.get(element);

            if (containsNonAwaitableType(type, tsNode, checker)) {
              context.report({
                node: element,
                messageId: 'invalidPromiseAggregatorInput',
              });
            }
          }

          return;
        }

        const type = getConstrainedTypeAtLocation(services, argument);

        if (
          isInvalidPromiseAggregatorInput(
            checker,
            services.esTreeNodeToTSNodeMap.get(argument),
            type,
          )
        ) {
          context.report({
            node: argument,
            messageId: 'invalidPromiseAggregatorInput',
          });
        }
      },

      'ForOfStatement[await=true]'(node: TSESTree.ForOfStatement): void {
        const type = services.getTypeAtLocation(node.right);
        if (isTypeAnyType(type)) {
          return;
        }

        const hasAsyncIteratorSymbol = tsutils
          .unionConstituents(type)
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
            .unionConstituents(type)
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
    };
  },
});

function isInvalidPromiseAggregatorInput(
  checker: ts.TypeChecker,
  node: ts.Node,
  type: ts.Type,
): boolean {
  // non array/tuple/iterable types already show up as a type error
  if (!isIterable(type, checker)) {
    return false;
  }

  for (const part of tsutils.unionConstituents(type)) {
    const valueTypes = getValueTypesOfArrayLike(part, checker);

    if (valueTypes != null) {
      for (const typeArgument of valueTypes) {
        if (containsNonAwaitableType(typeArgument, node, checker)) {
          return true;
        }
      }
    }
  }

  return false;
}

function getValueTypesOfArrayLike(
  type: ts.Type,
  checker: ts.TypeChecker,
): readonly ts.Type[] | null {
  if (checker.isTupleType(type)) {
    return checker.getTypeArguments(type);
  }

  if (checker.isArrayLikeType(type)) {
    const indexType = type.getNumberIndexType();

    if (indexType != null) {
      return [indexType];
    }

    return null;
  }

  // `Iterable<...>`
  if (tsutils.isTypeReference(type)) {
    return checker.getTypeArguments(type).slice(0, 1);
  }

  return null;
}

function containsNonAwaitableType(
  type: ts.Type,
  node: ts.Node,
  checker: ts.TypeChecker,
): boolean {
  return tsutils
    .unionConstituents(type)
    .some(
      typeArgumentPart =>
        needsToBeAwaited(checker, node, typeArgumentPart) === Awaitable.Never,
    );
}

function isIterable(type: ts.Type, checker: ts.TypeChecker): boolean {
  return tsutils
    .unionConstituents(type)
    .every(
      part =>
        !!tsutils.getWellKnownSymbolPropertyOfType(part, 'iterator', checker),
    );
}
