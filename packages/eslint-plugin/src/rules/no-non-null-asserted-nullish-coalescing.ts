import { TSESTree, TSESLint } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'no-non-null-asserted-nullish-coalescing',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows using a non-null assertion in the left operand of the nullish coalescing operator',
      category: 'Possible Errors',
      recommended: false,
      suggestion: true,
    },
    messages: {
      noNonNullAssertedNullishCoalescing:
        'The nullish coalescing operator is designed to handle undefined and null - using a non-null assertion is not needed.',
      suggestRemovingNonNull: 'You should remove the non-null assertion.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      'LogicalExpression[operator = "??"] > TSNonNullExpression.left'(
        node: TSESTree.TSNonNullExpression,
      ): void {
        context.report({
          node,
          messageId: 'noNonNullAssertedNullishCoalescing',
          // use a suggestion instead of a fixer, because this can obviously break type checks
          suggest: [
            {
              messageId: 'suggestRemovingNonNull',
              fix(fixer): TSESLint.RuleFix {
                return fixer.removeRange([node.range[1] - 1, node.range[1]]);
              },
            },
          ],
        });
      },
    };
  },
});
