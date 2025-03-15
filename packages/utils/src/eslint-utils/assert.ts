import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

export function assert(cond: boolean, message: string): asserts cond {
  if (!cond) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function assertNode<T extends AST_NODE_TYPES>(
  actualNode: TSESTree.Node,
  expectedType: T,
): asserts actualNode is TSESTree.Node & { type: T } {
  assert(
    actualNode.type === expectedType,
    `Expected node type to be ${expectedType}, but got ${actualNode.type}.`,
  );
}
