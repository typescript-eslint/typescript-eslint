/**
 * @fileoverview Disallow generic `Array` constructors
 * @author Jed Fox
 * @author Matt DuVall <http://www.mattduvall.com/>
 */

import RuleModule from 'ts-eslint';
import * as util from '../util';
import { TSESTree } from '@typescript-eslint/typescript-estree';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
export type Options = [];
export type MessageIds = 'useLiteral';

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow generic `Array` constructors',
      category: 'Stylistic Issues',
      url: util.metaDocsUrl('no-array-constructor'),
      recommended: 'error'
    },
    fixable: 'code',
    messages: {
      useLiteral: 'The array literal notation [] is preferrable.'
    },
    schema: []
  },

  create(context) {
    /**
     * Disallow construction of dense arrays using the Array constructor
     * @param node node to evaluate
     */
    function check(
      node: TSESTree.CallExpression | TSESTree.NewExpression
    ): void {
      if (
        node.arguments.length !== 1 &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'Array' &&
        !node.typeParameters
      ) {
        context.report({
          node,
          messageId: 'useLiteral',
          fix(fixer) {
            if (node.arguments.length === 0) {
              return fixer.replaceText(node, '[]');
            }
            const fullText = context.getSourceCode().getText(node);
            const preambleLength = node.callee.range[1] - node.range[0];

            return fixer.replaceText(
              node,
              `[${fullText.slice(preambleLength + 1, -1)}]`
            );
          }
        });
      }
    }

    return {
      CallExpression: check,
      NewExpression: check
    };
  }
};
export default rule;
