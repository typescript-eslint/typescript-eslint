import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

export function isUndefinedIdentifier(i: TSESTree.Node): boolean {
  return i.type === AST_NODE_TYPES.Identifier && i.name === 'undefined';
}
