/**
 * @fileoverview Disallows non-null assertions using the `!` postfix operator.
 * @author Macklin Underdown
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

export default util.createRule({
  name: 'no-non-null-assertion',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows non-null assertions using the `!` postfix operator',
      tslintRuleName: 'no-non-null-assertion',
      category: 'Stylistic Issues',
      recommended: 'error',
    },
    messages: {
      noNonNull: 'Forbidden non-null assertion.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSNonNullExpression(node: TSESTree.TSNonNullExpression) {
        context.report({
          node,
          messageId: 'noNonNull',
        });
      },
    };
  },
});
