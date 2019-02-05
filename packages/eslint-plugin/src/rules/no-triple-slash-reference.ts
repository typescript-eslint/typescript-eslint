/**
 * @fileoverview Enforces triple slash references are not used.
 * @author Danny Fritz
 */

import RuleModule from 'ts-eslint';
import * as util from '../util';
import { TSESTree } from '@typescript-eslint/typescript-estree';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [];
type MessageIds = 'tripleSlashReference';

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow `/// <reference path="" />` comments',
      extraDescription: [util.tslintRule('no-reference')],
      category: 'Best Practices',
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

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      Program(program: TSESTree.Program): void {
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
    };
  }
};
export default rule;
