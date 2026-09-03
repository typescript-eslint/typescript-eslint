import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

export function isConditionalTest(node: TSESTree.Node): boolean {
  const parent = node.parent;
  if (parent == null) {
    return false;
  }

  if (parent.type === AST_NODE_TYPES.LogicalExpression) {
    return isConditionalTest(parent);
  }

  if (
    parent.type === AST_NODE_TYPES.ConditionalExpression &&
    (parent.consequent === node || parent.alternate === node)
  ) {
    return isConditionalTest(parent);
  }

  if (
    parent.type === AST_NODE_TYPES.SequenceExpression &&
    parent.expressions.at(-1) === node
  ) {
    return isConditionalTest(parent);
  }

  if (
    parent.type === AST_NODE_TYPES.UnaryExpression &&
    parent.operator === '!'
  ) {
    return isConditionalTest(parent);
  }

  if (
    (parent.type === AST_NODE_TYPES.ConditionalExpression ||
      parent.type === AST_NODE_TYPES.DoWhileStatement ||
      parent.type === AST_NODE_TYPES.IfStatement ||
      parent.type === AST_NODE_TYPES.ForStatement ||
      parent.type === AST_NODE_TYPES.WhileStatement) &&
    parent.test === node
  ) {
    return true;
  }

  return false;
}
