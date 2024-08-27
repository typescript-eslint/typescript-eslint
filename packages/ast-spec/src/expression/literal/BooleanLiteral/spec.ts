import type { LiteralBase } from '../../../base/LiteralBase';

export interface BooleanLiteral extends LiteralBase {
  raw: 'false' | 'true';
  value: boolean;
}
