import type { BaseNode } from './BaseNode';

export interface LiteralBase extends BaseNode {
  raw: string;
  value: RegExp | bigint | boolean | number | string | null;
}
