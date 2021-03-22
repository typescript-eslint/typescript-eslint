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
    }

    if (node.type === AST_NODE_TYPES.ThisExpression) {
      return node;
    }

    if ('object' in node) {
      node = node.object;
    } else {
      break;
    }
  }

  return;
}
