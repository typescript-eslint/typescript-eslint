import type { AST_NODE_TYPES } from '../../../ast-node-types';
import type { LiteralBase } from '../../../base/LiteralBase';

export interface NullLiteral extends LiteralBase {
  type: AST_NODE_TYPES.Literal;
  value: null;
  raw: 'null';
}
