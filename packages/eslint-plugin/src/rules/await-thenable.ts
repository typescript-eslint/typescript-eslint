import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getParserServices,
  isAwaitKeyword,
  isTypeAnyType,
  isTypeUnknownType,
  nullThrows,
  NullThrowsReasons,
} from '../util';
import { getForStatementHeadLoc } from '../util/getForStatementHeadLoc';

type MessageId =
  | 'await'
  | 'forAwaitOfNonThenable'
  | 'removeAwait'
  | 'convertToOrdinaryFor';

export default createRule<[], MessageId>({
  name: 'await-thenable',
  meta: {
    docs: {
      description: 'Disallow awaiting a value that is not a Thenable',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      await: 'Unexpected `await` of a non-Promise (non-"Thenable") value.',
      forAwaitOfNonThenable:
        'Unexpected `for await...of` of a value that is not async iterable.',
      removeAwait: 'Remove unnecessary `await`.',
      convertToOrdinaryFor: 'Convert to an ordinary `for...of` loop.',
    },
    schema: [],
    type: 'problem',
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
            messageId: 'await',
            node,
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

        const asyncIteratorSymbol = tsutils.getWellKnownSymbolPropertyOfType(
          type,
          'asyncIterator',
          checker,
        );

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
    };
  },
});
