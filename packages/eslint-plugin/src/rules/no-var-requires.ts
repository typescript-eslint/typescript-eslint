/**
 * @fileoverview Disallows the use of require statements except in import statements.
 * @author Macklin Underdown
 */

import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

type Options = [];
type MessageIds = 'noVarReqs';

export default util.createRule<Options, MessageIds>({
  name: 'no-var-requires',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows the use of require statements except in import statements',
      tslintRuleName: 'no-var-requires',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      noVarReqs: 'Require statement not part of import statement.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === 'require' &&
          node.parent &&
          node.parent.type === AST_NODE_TYPES.VariableDeclarator
        ) {
          context.report({
            node,
            messageId: 'noVarReqs',
          });
        }
      },
    };
  },
});
