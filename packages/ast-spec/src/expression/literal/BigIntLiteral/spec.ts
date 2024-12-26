import type { LiteralBase } from '../../../base/LiteralBase';

export interface BigIntLiteral extends LiteralBase {
  bigint: string;
  value: bigint | null;
}
