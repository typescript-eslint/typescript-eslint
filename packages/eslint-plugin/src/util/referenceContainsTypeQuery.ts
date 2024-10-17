import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

/**
 * Recursively checks whether a given reference has a type query declaration among its parents
 */
export function referenceContainsTypeQuery(node: TSESTree.Node): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.TSTypeQuery:
      return true;

    case AST_NODE_TYPES.TSQualifiedName:
    case AST_NODE_TYPES.Identifier:
      return referenceContainsTypeQuery(node.parent);

    default:
      // if we find a different node, there's no chance that we're in a TSTypeQuery
      return false;
  }
}
