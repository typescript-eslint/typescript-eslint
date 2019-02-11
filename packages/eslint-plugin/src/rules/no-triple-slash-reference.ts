/**
 * @fileoverview Enforces triple slash references are not used.
 * @author Danny Fritz
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

export default util.createRule({
  name: 'no-triple-slash-reference',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow `/// <reference path="" />` comments',
      tslintRuleName: 'no-reference',
      category: 'Best Practices',
      recommended: 'error'
    },
    schema: [],
    messages: {
      tripleSlashReference: 'Do not use a triple slash reference.'
    }
  },
  defaultOptions: [],
  create(context) {
    const referenceRegExp = /^\/\s*<reference\s*path=/;
    const sourceCode = context.getSourceCode();

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
});
