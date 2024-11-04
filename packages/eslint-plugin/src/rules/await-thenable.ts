import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import type * as ts from 'typescript';

import {
  createRule,
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
  | 'convertToOrdinaryFor'
  | 'forAwaitOfNonThenable'
  | 'removeAwait'
  | 'notPromises';

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
      convertToOrdinaryFor: 'Convert to an ordinary `for...of` loop.',
      forAwaitOfNonThenable:
        'Unexpected `for await...of` of a value that is not async iterable.',
      removeAwait: 'Remove unnecessary `await`.',
      notPromises: 'Unexpected non-promise input to Promise.{methodName}.',
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

        const asyncIteratorSymbol = tsutils
          .unionTypeParts(type)
          .map(t =>
            tsutils.getWellKnownSymbolPropertyOfType(
              t,
              'asyncIterator',
              checker,
            ),
          )
          .find(symbol => symbol != null);

        if (asyncIteratorSymbol == null) {
          context.report({
            loc: getForStatementHeadLoc(context.sourceCode, node),
            messageId: 'forAwaitOfNonThenable',
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
