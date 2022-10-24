import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';

export interface TSAbstractKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSAbstractKeyword;
}
