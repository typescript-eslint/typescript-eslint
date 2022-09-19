import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

export function isNullLiteral(i: TSESTree.Node): boolean {
  return i.type === AST_NODE_TYPES.Literal && i.value === null;
}
