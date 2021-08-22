import type { AST_NODE_TYPES } from '../../../ast-node-types';
import type { LiteralBase } from '../../../base/LiteralBase';

export interface RegExpLiteral extends LiteralBase {
  type: AST_NODE_TYPES.Literal;
  value: RegExp | null;
  regex: {
    pattern: string;
    flags: string;
  };
}
