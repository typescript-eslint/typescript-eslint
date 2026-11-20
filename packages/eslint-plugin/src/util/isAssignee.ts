import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

export function isAssignee(node: TSESTree.Node): boolean {
  const parent = node.parent;
  if (!parent) {
    return false;
  }

  // a[i] = 1, a[i] += 1, etc.
  if (
    parent.type === AST_NODE_TYPES.AssignmentExpression &&
    parent.left === node
  ) {
    return true;
  }

  // delete a[i]
  if (
    parent.type === AST_NODE_TYPES.UnaryExpression &&
    parent.operator === 'delete' &&
    parent.argument === node
  ) {
    return true;
  }

  // a[i]++, --a[i], etc.
  if (
    parent.type === AST_NODE_TYPES.UpdateExpression &&
    parent.argument === node
  ) {
    return true;
  }

  // [a[i]] = [0]
  if (parent.type === AST_NODE_TYPES.ArrayPattern) {
    return true;
  }

  // [...a[i]] = [0]
  if (parent.type === AST_NODE_TYPES.RestElement) {
    return true;
  }

  // [a[i] = 0] = [], ({ foo: a[i] = 0 } = {}), etc.
  if (
    parent.type === AST_NODE_TYPES.AssignmentPattern &&
    parent.left === node
  ) {
    return true;
  }

  // for (a[i] of b) {}, for (a[i] in b) {}
  if (
    (parent.type === AST_NODE_TYPES.ForInStatement ||
      parent.type === AST_NODE_TYPES.ForOfStatement) &&
    parent.left === node
  ) {
    return true;
  }

  // ({ foo: a[i] } = { foo: 0 }), and the invalid ({ foo: a[i] }) = { foo: 0 }
  // that typescript-estree parses with an ObjectExpression on the left
  if (
    parent.type === AST_NODE_TYPES.Property &&
    parent.value === node &&
    (parent.parent.type === AST_NODE_TYPES.ObjectPattern ||
      isAssignee(parent.parent))
  ) {
    return true;
  }

  // (a[i] as number)++, [...a[i]!] = [0], etc.
  if (
    (parent.type === AST_NODE_TYPES.TSNonNullExpression ||
      parent.type === AST_NODE_TYPES.TSAsExpression ||
      parent.type === AST_NODE_TYPES.TSTypeAssertion ||
      parent.type === AST_NODE_TYPES.TSSatisfiesExpression) &&
    isAssignee(parent)
  ) {
    return true;
  }

  return false;
}
