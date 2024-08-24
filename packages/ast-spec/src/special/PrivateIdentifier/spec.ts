import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';

export interface PrivateIdentifier extends BaseNode {
  name: string;
  type: AST_NODE_TYPES.PrivateIdentifier;
}
