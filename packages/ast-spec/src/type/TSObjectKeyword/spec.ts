import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';

export interface TSObjectKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSObjectKeyword;
}
