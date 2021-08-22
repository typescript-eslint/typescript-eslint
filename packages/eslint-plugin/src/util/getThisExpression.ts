import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

export function getThisExpression(
  node: TSESTree.Node,
): TSESTree.ThisExpression | undefined {
  while (node) {
    if (node.type === AST_NODE_TYPES.CallExpression) {
      node = node.callee;
    } else if (node.type === AST_NODE_TYPES.ThisExpression) {
      return node;
    } else if (node.type === AST_NODE_TYPES.MemberExpression) {
      node = node.object;
    } else if (node.type === AST_NODE_TYPES.ChainExpression) {
      node = node.expression;
    } else {
      break;
    }
  }

  return;
}
