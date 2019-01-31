/**
 * @fileoverview Enforces interface names are prefixed with "I".
 * @author Danny Fritz
 */

import RuleModule from '../RuleModule';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = ['never'];

const rule: RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require that interface names be prefixed with `I`',
      extraDescription: [util.tslintRule('interface-name')],
      category: 'TypeScript',
      url: util.metaDocsUrl('interface-name-prefix'),
      recommended: 'error'
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
      TSInterfaceDeclaration(node): void {
        if (never) {
          if (isPrefixedWithI(node.id.name)) {
            context.report({
              node: node.id,
              message: 'Interface name must not be prefixed with "I".'
            });
          }
        } else {
          if (!isPrefixedWithI(node.id.name)) {
            context.report({
              node: node.id,
              message: 'Interface name must be prefixed with "I".'
            });
          }
        }
      }
    };
  }
};
export = rule;
