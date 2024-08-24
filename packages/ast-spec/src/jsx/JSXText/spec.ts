import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';

export interface JSXText extends BaseNode {
  raw: string;
  type: AST_NODE_TYPES.JSXText;
  value: string;
}
