import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

/**
 *
 * Since #11708, parameter properties can only be simple identifiers or assignment patterns,
 * and when it's an assignment pattern, the left side must be an identifier.
 *
 */
export function getParameterPropertyIdentifier(
  parameter: TSESTree.TSParameterProperty['parameter'],
): TSESTree.Identifier {
  if (parameter.type === AST_NODE_TYPES.Identifier) {
    return parameter;
  }
  if (!('left' in parameter)) {
    throw new Error('Invalid parameter property pattern');
  }
  if (parameter.left.type !== AST_NODE_TYPES.Identifier) {
    throw new Error(
      'Parameter property binding pattern should have been rejected by parser',
    );
  }
  return parameter.left;
}
