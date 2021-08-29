import type { BigIntLiteral } from '../expression/literal/BigIntLiteral/spec';
import type { BooleanLiteral } from '../expression/literal/BooleanLiteral/spec';
import type { NullLiteral } from '../expression/literal/NullLiteral/spec';
import type { NumberLiteral } from '../expression/literal/NumberLiteral/spec';
import type { RegExpLiteral } from '../expression/literal/RegExpLiteral/spec';
import type { StringLiteral } from '../expression/literal/StringLiteral/spec';

export type Literal =
  | BigIntLiteral
  | BooleanLiteral
  | NullLiteral
  | NumberLiteral
  | RegExpLiteral
  | StringLiteral;
