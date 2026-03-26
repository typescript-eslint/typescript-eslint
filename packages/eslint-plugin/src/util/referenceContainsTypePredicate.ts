import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

/**
 * Recursively checks whether a given reference is used in a type predicate (e.g., `arg is string`)
 */
export function referenceContainsTypePredicate(node: TSESTree.Node): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.TSTypePredicate:
      return true;

    case AST_NODE_TYPES.TSQualifiedName:
    case AST_NODE_TYPES.Identifier:
      return referenceContainsTypePredicate(node.parent);

    default:
      return false;
  }
}
