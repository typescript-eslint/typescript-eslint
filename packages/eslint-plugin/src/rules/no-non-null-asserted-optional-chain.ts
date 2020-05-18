import {
  TSESTree,
  TSESLint,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { version } from 'typescript';
import * as semver from 'semver';
import * as util from '../util';

type MessageIds = 'noNonNullOptionalChain' | 'suggestRemovingNonNull';

const is3dot9 = !semver.satisfies(
  version,
  '< 3.9.0 || < 3.9.1-rc || < 3.9.0-beta',
);

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
        if (is3dot9) {
          // TS3.9 made a breaking change to how non-null works with optional chains.
          // Pre-3.9,  `x?.y!.z` means `(x?.y).z` - i.e. it essentially scrubbed the optionality from the chain
          // Post-3.9, `x?.y!.z` means `x?.y!.z`  - i.e. it just asserts that the property `y` is non-null, not the result of `x?.y`.
          // This means that for > 3.9, x?.y!.z is valid!
          // NOTE: these cases are still invalid:
          // - x?.y.z!
          // - (x?.y)!.z
          const nnAssertionParent = node.parent?.parent;
          if (
            nnAssertionParent?.type ===
              AST_NODE_TYPES.OptionalMemberExpression ||
            nnAssertionParent?.type === AST_NODE_TYPES.OptionalCallExpression
          ) {
            return;
          }
        }

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
