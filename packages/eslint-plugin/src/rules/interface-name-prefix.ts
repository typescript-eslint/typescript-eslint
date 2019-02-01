/**
 * @fileoverview Enforces interface names are prefixed with "I".
 * @author Danny Fritz
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
type Options = ['never' | 'always'];
type MessageIds = 'noPrefix';

const defaultOptions: Options = ['never'];

const rule: RuleModule<'noPrefix', Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require that interface names be prefixed with `I`',
      extraDescription: [util.tslintRule('interface-name')],
      category: 'Stylistic Issues',
      url: util.metaDocsUrl('interface-name-prefix'),
      recommended: 'error'
    },
    messages: {
      noPrefix: 'Interface name must not be prefixed with "I".'
    },
    schema: [
      {
        enum: ['never', 'always']
      }
    ]
  },

  create(context) {
    const option = util.applyDefault(defaultOptions, context.options)[0];
    const never = option !== 'always';

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Checks if a string is prefixed with "I".
     * @param name The string to check
     */
    function isPrefixedWithI(name: string): boolean {
      if (typeof name !== 'string') {
        return false;
      }

      return /^I[A-Z]/.test(name);
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration): void {
        if (never) {
          if (isPrefixedWithI(node.id.name)) {
            context.report({
              node: node.id,
              messageId: 'noPrefix'
            });
          }
        } else {
          if (!isPrefixedWithI(node.id.name)) {
            context.report({
              node: node.id,
              messageId: 'noPrefix'
            });
          }
        }
      }
    };
  }
};
export default rule;
export { Options, MessageIds };
