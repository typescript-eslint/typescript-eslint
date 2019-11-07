import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

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
    /**
     * checks if node has extra non null assertion
     * @param node the node to be validated
     */
    function hasExtraNonNullAssertion(
      node: TSESTree.TSNonNullExpression,
    ): boolean {
      const parent = node.parent;
      if (!parent) {
        return false;
      }

      return (
        parent.type === AST_NODE_TYPES.TSNonNullExpression &&
        node.expression.type !== AST_NODE_TYPES.TSNonNullExpression
      );
    }

    return {
      TSNonNullExpression(node): void {
        if (hasExtraNonNullAssertion(node)) {
          context.report({ messageId: 'noExtraNonNullAssertion', node });
        }
      },
    };
  },
});
