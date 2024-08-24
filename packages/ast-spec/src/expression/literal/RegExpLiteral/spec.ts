import type { LiteralBase } from '../../../base/LiteralBase';

export interface RegExpLiteral extends LiteralBase {
  regex: {
    flags: string;
    pattern: string;
  };
  value: RegExp | null;
}
