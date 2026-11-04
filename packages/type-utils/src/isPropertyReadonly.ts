import type * as ts from 'typescript';

import * as tsutils from 'ts-api-utils';

// TypeScript's CheckFlags.Readonly — compiler-internal, not in the public API.
const CHECK_FLAGS_READONLY = 8;

function hasReadonlyCheckFlag(property: ts.Symbol): boolean {
  const { links } = property;
  return links != null && (links.checkFlags & CHECK_FLAGS_READONLY) !== 0;
}

/** Whether `property` is readonly on `type`, including `CheckFlags.Readonly`. */
export function isPropertyReadonly(
  type: ts.Type,
  property: ts.Symbol,
  checker: ts.TypeChecker,
): boolean {
  return (
    hasReadonlyCheckFlag(property) ||
    tsutils.isPropertyReadonlyInType(type, property.getEscapedName(), checker)
  );
}
