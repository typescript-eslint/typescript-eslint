/**
 * @fileoverview Disallows non-null assertions using the `!` postfix operator.
 * @author Macklin Underdown
 */

import RuleModule from '../RuleModule';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows non-null assertions using the `!` postfix operator',
      extraDescription: [util.tslintRule('no-non-null-assertion')],
      category: 'TypeScript',
      url: util.metaDocsUrl('no-non-null-assertion'),
      recommended: 'error'
    },
    schema: []
  },
  create(context: Rule.RuleContext) {
    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      TSNonNullExpression(node) {
        context.report({
          node,
          message: 'Forbidden non-null assertion.'
        });
      }
    };
  }
};
export = rule;
