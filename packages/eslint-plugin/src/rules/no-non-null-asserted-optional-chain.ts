import {
  TSESTree,
  TSESLint,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as semver from 'semver';
import * as util from '../util';

type MessageIds = 'noNonNullOptionalChain' | 'suggestRemovingNonNull';

const is3dot9 = semver.satisfies(
  ts.version,
  `>= 3.9.0 || >= 3.9.1-rc || >= 3.9.0-beta`,
  {
    includePrerelease: true,
  },
);

export default util.createRule<[], MessageIds>({
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
    const sourceCode = context.getSourceCode();

    function isValidFor3dot9(node: TSESTree.ChainExpression): boolean {
      if (!is3dot9) {
        return false;
      }

      // TS3.9 made a breaking change to how non-null works with optional chains.
      // Pre-3.9,  `x?.y!.z` means `(x?.y).z` - i.e. it essentially scrubbed the optionality from the chain
      // Post-3.9, `x?.y!.z` means `x?.y!.z`  - i.e. it just asserts that the property `y` is non-null, not the result of `x?.y`.
      // This means that for > 3.9, x?.y!.z is valid!
      // NOTE: these cases are still invalid:
      // - x?.y.z!
      // - (x?.y)!.z

      const parent = util.nullThrows(
        node.parent,
        util.NullThrowsReasons.MissingParent,
      );
      const grandparent = util.nullThrows(
        parent.parent,
        util.NullThrowsReasons.MissingParent,
      );

      if (
        grandparent.type !== AST_NODE_TYPES.MemberExpression &&
        grandparent.type !== AST_NODE_TYPES.CallExpression
      ) {
        return false;
      }

      const lastChildToken = util.nullThrows(
        sourceCode.getLastToken(parent, util.isNotNonNullAssertionPunctuator),
        util.NullThrowsReasons.MissingToken('last token', node.type),
      );
      if (util.isClosingParenToken(lastChildToken)) {
        return false;
      }

      const tokenAfterNonNull = sourceCode.getTokenAfter(parent);
      if (
        tokenAfterNonNull != null &&
        util.isClosingParenToken(tokenAfterNonNull)
      ) {
        return false;
      }

      return true;
    }

    return {
      'TSNonNullExpression > ChainExpression'(
        node: TSESTree.ChainExpression,
      ): void {
        if (isValidFor3dot9(node)) {
          return;
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
