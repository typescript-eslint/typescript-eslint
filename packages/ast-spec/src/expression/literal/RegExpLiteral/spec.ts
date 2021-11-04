import type { LiteralBase } from '../../../base/LiteralBase';

export interface RegExpLiteral extends LiteralBase {
  value: RegExp | null;
  regex: {
    pattern: string;
    flags: string;
  };
}
