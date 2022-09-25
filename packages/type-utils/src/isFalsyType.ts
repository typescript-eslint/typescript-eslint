import type { Type } from 'typescript';
import { TypeFlags } from 'typescript';

import { isBooleanLiteralType } from './isBooleanLiteralType';
import { isLiteralType } from './isLiteralType';

/** Determine if a type is definitely falsy. This function doesn't unwrap union types. */
export function isFalsyType(type: Type): boolean {
  if (type.flags & (TypeFlags.Undefined | TypeFlags.Null | TypeFlags.Void)) {
    return true;
  }

  if (isLiteralType(type)) {
    return !type.value;
  }

  return isBooleanLiteralType(type, false);
}
