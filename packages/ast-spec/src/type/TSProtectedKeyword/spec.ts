import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';

export interface TSProtectedKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSProtectedKeyword;
}
