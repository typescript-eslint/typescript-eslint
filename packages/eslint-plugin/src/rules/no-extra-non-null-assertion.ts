import type { TSESTree } from '@typescript-eslint/utils';

import { createRule } from '../util';

export default createRule({
  defaultOptions: [],
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow extra non-null assertions',
      recommended: 'recommended',
    },
    fixable: 'code',
    messages: {
      noExtraNonNullAssertion: 'Forbidden extra non-null assertion.',
    },
    schema: [],
  },
  name: 'no-extra-non-null-assertion',
  create(context) {
    function checkExtraNonNullAssertion(
      node: TSESTree.TSNonNullExpression,
    ): void {
      context.report({
        fix(fixer) {
          return fixer.removeRange([node.range[1] - 1, node.range[1]]);
        },
        messageId: 'noExtraNonNullAssertion',
        node,
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
