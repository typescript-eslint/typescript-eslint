import type { LiteralBase } from '../../../base/LiteralBase';

export interface BooleanLiteral extends LiteralBase {
  value: boolean;
  raw: 'false' | 'true';
}
