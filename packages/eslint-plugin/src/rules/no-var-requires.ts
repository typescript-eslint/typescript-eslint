/**
 * @fileoverview Disallows the use of require statements except in import statements.
 * @author Macklin Underdown
 */

import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [];
type MessageIds = 'noVarReqs';

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows the use of require statements except in import statements',
      extraDescription: [util.tslintRule('no-var-requires')],
      category: 'Best Practices',
      url: util.metaDocsUrl('no-var-requires'),
      recommended: 'error'
    },
    messages: {
      noVarReqs: 'Require statement not part of import statement.'
    },
    schema: []
  },
  create(context) {
    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === 'require' &&
          node.parent &&
          node.parent.type === AST_NODE_TYPES.VariableDeclarator
        ) {
          context.report({
            node,
            messageId: 'noVarReqs'
          });
        }
      }
    };
  }
};
export default rule;
export { Options, MessageIds };
