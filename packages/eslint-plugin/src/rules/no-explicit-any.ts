/**
 * @fileoverview Enforces the any type is not used.
 * @author Danny Fritz
 * @author Patricio Trevino
 */

import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of the `any` type',
      extraDescription: [util.tslintRule('no-any')],
      category: 'TypeScript',
      url: util.metaDocsUrl('no-explicit-any'),
      recommended: 'warn'
    },
    schema: []
  },

  create(context) {
    return {
      TSAnyKeyword(node) {
        context.report({
          node,
          message: 'Unexpected any. Specify a different type.'
        });
      }
    };
  }
};
export default rule;
