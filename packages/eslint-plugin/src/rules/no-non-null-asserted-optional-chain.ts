import { TSESTree, TSESLint } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type MessageIds = 'noNonNullOptionalChain' | 'suggestRemovingNonNull';

export default util.createRule<[], MessageIds>({
  name: 'no-non-null-asserted-optional-chain',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows using a non-null assertion after an optional chain expression',
      category: 'Possible Errors',
      recommended: false,
      suggestion: true,
    },
    messages: {
      noNonNullOptionalChain:
        'Optional chain expressions can return undefined by design - using a non-null assertion is unsafe and wrong.',
      suggestRemovingNonNull: 'You should remove the non-null assertion.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      'TSNonNullExpression > :matches(OptionalMemberExpression, OptionalCallExpression)'(
        node:
          | TSESTree.OptionalCallExpression
          | TSESTree.OptionalMemberExpression,
      ): void {
        // selector guarantees this assertion
        const parent = node.parent as TSESTree.TSNonNullExpression;
        context.report({
          node,
          messageId: 'noNonNullOptionalChain',
          // use a suggestion instead of a fixer, because this can obviously break type checks
          suggest: [
            {
              messageId: 'suggestRemovingNonNull',
              fix(fixer): TSESLint.RuleFix {
                return fixer.removeRange([
                  parent.range[1] - 1,
                  parent.range[1],
                ]);
              },
            },
          ],
        });
      },
    };
  },
});
