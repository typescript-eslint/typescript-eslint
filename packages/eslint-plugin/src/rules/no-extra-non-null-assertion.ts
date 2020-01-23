import * as util from '../util';
import { TSESTree } from '@typescript-eslint/experimental-utils';

export default util.createRule({
  name: 'no-extra-non-null-assertion',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow extra non-null assertion',
      category: 'Stylistic Issues',
      recommended: false,
    },
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
      context.report({ messageId: 'noExtraNonNullAssertion', node });
    }

    return {
      'TSNonNullExpression > TSNonNullExpression': checkExtraNonNullAssertion,
      'OptionalMemberExpression > TSNonNullExpression': checkExtraNonNullAssertion,
    };
  },
});
