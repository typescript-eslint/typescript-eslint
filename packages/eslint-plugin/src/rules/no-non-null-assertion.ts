/**
 * @fileoverview Disallows non-null assertions using the `!` postfix operator.
 * @author Macklin Underdown
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [];
type MessageIds = 'noNonNull';

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows non-null assertions using the `!` postfix operator',
      extraDescription: [util.tslintRule('no-non-null-assertion')],
      category: 'Stylistic Issues',
      url: util.metaDocsUrl('no-non-null-assertion'),
      recommended: 'error'
    },
    messages: {
      noNonNull: 'Forbidden non-null assertion.'
    },
    schema: []
  },
  create(context) {
    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      TSNonNullExpression(node: TSESTree.TSNonNullExpression) {
        context.report({
          node,
          messageId: 'noNonNull'
        });
      }
    };
  }
};
export default rule;
export { Options, MessageIds };
