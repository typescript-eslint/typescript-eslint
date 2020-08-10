import {
  TSESTree,
  TSESLint,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as semver from 'semver';
import * as util from '../util';

const is3dot9 = semver.satisfies(
  ts.version,
  `>= 3.9.0 || >= 3.9.1-rc || >= 3.9.0-beta`,
  {
    includePrerelease: true,
  },
);

export default util.createRule({
  name: 'no-non-null-asserted-optional-chain',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows using a non-null assertion after an optional chain expression',
      category: 'Possible Errors',
      recommended: 'error',
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
    // TS3.9 made a breaking change to how non-null works with optional chains.
    // Pre-3.9,  `x?.y!.z` means `(x?.y).z` - i.e. it essentially scrubbed the optionality from the chain
    // Post-3.9, `x?.y!.z` means `x?.y!.z`  - i.e. it just asserts that the property `y` is non-null, not the result of `x?.y`.
    // This means that for > 3.9, x?.y!.z is valid!
    //
    // NOTE: these cases are still invalid for 3.9:
    // - x?.y.z!
    // - (x?.y)!.z

    const baseSelectors = {
      // non-nulling a wrapped chain will scrub all nulls introduced by the chain
      // (x?.y)!
      // (x?.())!
      'TSNonNullExpression > ChainExpression'(
        node: TSESTree.ChainExpression,
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

      // non-nulling at the end of a chain will scrub all nulls introduced by the chain
      // x?.y!
      // x?.()!
      'ChainExpression > TSNonNullExpression'(
        node: TSESTree.TSNonNullExpression,
      ): void {
        context.report({
          node,
          messageId: 'noNonNullOptionalChain',
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

    if (is3dot9) {
      return baseSelectors;
    }

    return {
      ...baseSelectors,
      [[
        // > :not(ChainExpression) because that case is handled by a previous selector
        'MemberExpression > TSNonNullExpression.object > :not(ChainExpression)',
        'CallExpression > TSNonNullExpression.callee > :not(ChainExpression)',
      ].join(', ')](child: TSESTree.Node): void {
        // selector guarantees this assertion
        const node = child.parent as TSESTree.TSNonNullExpression;

        let current = child;
        while (current) {
          switch (current.type) {
            case AST_NODE_TYPES.MemberExpression:
              if (current.optional) {
                // found an optional chain! stop traversing
                break;
              }

              current = current.object;
              continue;

            case AST_NODE_TYPES.CallExpression:
              if (current.optional) {
                // found an optional chain! stop traversing
                break;
              }

              current = current.callee;
              continue;

            default:
              // something that's not a ChainElement, which means this is not an optional chain we want to check
              return;
          }
        }

        context.report({
          node,
          messageId: 'noNonNullOptionalChain',
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
