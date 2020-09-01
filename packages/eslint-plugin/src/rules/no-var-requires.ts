import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
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
      CallExpression(node: TSESTree.CallExpression): void {
        const parent =
          node.parent?.type === AST_NODE_TYPES.ChainExpression
            ? node.parent.parent
            : node.parent;
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === 'require' &&
          parent &&
          (parent.type === AST_NODE_TYPES.VariableDeclarator ||
            parent.type === AST_NODE_TYPES.CallExpression ||
            parent.type === AST_NODE_TYPES.TSAsExpression ||
            parent.type === AST_NODE_TYPES.MemberExpression)
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
