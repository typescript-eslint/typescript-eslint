import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

export function getThisExpression(
  node: TSESTree.Node,
): TSESTree.ThisExpression | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
