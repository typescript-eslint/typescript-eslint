import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'no-extra-non-null-assertion',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow extra non-null assertion',
      category: 'Stylistic Issues',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noExtraNonNullAssertion: 'Forbidden extra non-null assertion.',
    },
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
      'TSNonNullExpression > TSNonNullExpression': checkExtraNonNullAssertion,
      'MemberExpression[optional = true] > TSNonNullExpression': checkExtraNonNullAssertion,
      'CallExpression[optional = true] > TSNonNullExpression.callee': checkExtraNonNullAssertion,
    };
  },
});
