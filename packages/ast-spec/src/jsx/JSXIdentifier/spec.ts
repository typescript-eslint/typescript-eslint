import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';

export interface JSXIdentifier extends BaseNode {
  name: string;
  type: AST_NODE_TYPES.JSXIdentifier;
}
