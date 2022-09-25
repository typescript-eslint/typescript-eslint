import type { LiteralType, Type } from 'typescript';
import { TypeFlags } from 'typescript';

export function isLiteralType(type: Type): type is LiteralType {
  return (
    (type.flags &
      (TypeFlags.StringOrNumberLiteral | TypeFlags.BigIntLiteral)) !==
    0
  );
}
