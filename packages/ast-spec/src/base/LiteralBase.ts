import type { AST_NODE_TYPES } from '../ast-node-types';
import type { BaseNode } from './BaseNode';

export interface LiteralBase extends BaseNode {
  raw: string;
  type: AST_NODE_TYPES.Literal;
  value: RegExp | bigint | boolean | number | string | null;
}
