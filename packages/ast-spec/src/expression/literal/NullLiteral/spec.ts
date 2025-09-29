import type { LiteralBase } from '../../../base/LiteralBase';

export interface NullLiteral extends LiteralBase {
  raw: 'null';
  value: null;
}
