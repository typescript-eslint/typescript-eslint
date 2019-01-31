/**
 * @fileoverview Enforces triple slash references are not used.
 * @author Danny Fritz
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
      description: 'Disallow `/// <reference path="" />` comments',
      extraDescription: [util.tslintRule('no-reference')],
      category: 'TypeScript',
      url: util.metaDocsUrl('no-triple-slash-reference'),
      recommended: 'error'
    },
    schema: [],
    messages: {
      tripleSlashReference: 'Do not use a triple slash reference.'
    }
  },

  create(context) {
    const referenceRegExp = /^\/\s*<reference\s*path=/;
    const sourceCode = context.getSourceCode();

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Checks if property has an accessibility modifier.
     * @param {ASTNode} program The node representing a Program.
     */
    function checkTripleSlashReference(program): void {
      const commentsBefore = sourceCode.getCommentsBefore(program);

      commentsBefore.forEach(comment => {
        if (comment.type !== 'Line') {
          return;
        }
        if (referenceRegExp.test(comment.value)) {
          context.report({
            node: comment,
            messageId: 'tripleSlashReference'
          });
        }
      });
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      Program: checkTripleSlashReference
    };
  }
};
export = rule;
