/**
 * @fileoverview Enforces the use of `as Type` assertions instead of `<Type>` assertions.
 * @author Patricio Trevino
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [];
type MessageIds = 'preferAs';

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforces the use of `as Type` assertions instead of `<Type>` assertions',
      extraDescription: [util.tslintRule('no-angle-bracket-type-assertion')],
      category: 'Stylistic Issues',
      url: util.metaDocsUrl('no-angle-bracket-type-assertion'),
      recommended: 'error'
    },
    messages: {
      preferAs:
        "Prefer 'as {{cast}}' instead of '<{{cast}}>' when doing type assertions."
    },
    schema: []
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      TSTypeAssertion(node: TSESTree.TSTypeAssertion) {
        context.report({
          node,
          messageId: 'preferAs',
          data: {
            cast: sourceCode.getText(node.typeAnnotation)
          }
        });
      }
    };
  }
};
export default rule;
export { Options, MessageIds };
