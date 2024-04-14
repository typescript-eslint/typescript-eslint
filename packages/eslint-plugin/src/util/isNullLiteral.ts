import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

export function isNullLiteral(i: TSESTree.Node): i is TSESTree.NullLiteral {
  return i.type === AST_NODE_TYPES.Literal && i.value == null;
}
