import type { TSESLint } from '@typescript-eslint/utils';
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

export default createRule({
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
      removeAwait: 'Remove unnecessary `await`.',
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
                  const sourceCode = context.getSourceCode();
                  const awaitKeyword = nullThrows(
                    sourceCode.getFirstToken(node, isAwaitKeyword),
                    NullThrowsReasons.MissingToken('await', 'await expression'),
                  );

                  return fixer.remove(awaitKeyword);
                },
              },
            ],
          });
        }
      },
    };
  },
});
