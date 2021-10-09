import type { LiteralBase } from '../../../base/LiteralBase';

export interface BigIntLiteral extends LiteralBase {
  value: bigint | null;
  bigint: string;
}
