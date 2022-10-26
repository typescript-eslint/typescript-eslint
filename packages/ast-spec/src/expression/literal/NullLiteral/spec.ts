import type { LiteralBase } from '../../../base/LiteralBase';

export interface NullLiteral extends LiteralBase {
  value: null;
  raw: 'null';
}
