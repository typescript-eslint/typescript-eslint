import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

export function isNull(i: TSESTree.Node): boolean {
  return i.type === AST_NODE_TYPES.Literal && i.value === null;
}
