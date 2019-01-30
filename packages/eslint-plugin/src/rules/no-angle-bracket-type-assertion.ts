/**
 * @fileoverview Enforces the use of `as Type` assertions instead of `<Type>` assertions.
 * @author Patricio Trevino
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
        'Enforces the use of `as Type` assertions instead of `<Type>` assertions',
      extraDescription: [util.tslintRule('no-angle-bracket-type-assertion')],
      category: 'Style',
      url: util.metaDocsUrl('no-angle-bracket-type-assertion'),
      recommended: 'error'
    },
    schema: []
  },

  create(context: Rule.RuleContext) {
    const sourceCode = context.getSourceCode();

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      TSTypeAssertion(node) {
        context.report({
          node,
          message:
            "Prefer 'as {{cast}}' instead of '<{{cast}}>' when doing type assertions.",
          data: {
            cast: sourceCode.getText(node.typeAnnotation)
          }
        });
      }
    };
  }
};
export = rule;
