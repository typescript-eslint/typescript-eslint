import type { TSESTree } from '@typescript-eslint/utils';

import { createRule } from '../util';

export default createRule({
  name: 'no-extra-non-null-assertion',
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      recommended: 'recommended',
      description: 'Disallow extra non-null assertions',
    },
    messages: {
      noExtraNonNullAssertion: 'Forbidden extra non-null assertion.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function checkExtraNonNullAssertion(
      node: TSESTree.TSNonNullExpression,
    ): void {
      context.report({
        node,
        messageId: 'noExtraNonNullAssertion',
        fix(fixer) {
          return fixer.removeRange([node.range[1] - 1, node.range[1]]);
        },
      });
    }

    return {
      'CallExpression[optional = true] > TSNonNullExpression.callee':
        checkExtraNonNullAssertion,
      'MemberExpression[optional = true] > TSNonNullExpression.object':
        checkExtraNonNullAssertion,
      'TSNonNullExpression > TSNonNullExpression': checkExtraNonNullAssertion,
    };
  },
});
