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

type Options = [];
type MessageIds = 'unexpectedAny';

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of the `any` type',
      extraDescription: [util.tslintRule('no-any')],
      category: 'Best Practices',
      url: util.metaDocsUrl('no-explicit-any'),
      recommended: 'warn'
    },
    messages: {
      unexpectedAny: 'Unexpected any. Specify a different type.'
    },
    schema: []
  },

  create(context) {
    return {
      TSAnyKeyword(node) {
        context.report({
          node,
          messageId: 'unexpectedAny'
        });
      }
    };
  }
};
export default rule;
export { Options, MessageIds };
