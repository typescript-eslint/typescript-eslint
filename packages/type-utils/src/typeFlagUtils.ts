import { unionTypeParts } from 'tsutils';
import * as ts from 'typescript';

/**
 * Gets all of the type flags in a type, iterating through unions automatically
 */
export function getTypeFlags(type: ts.Type): number {
  let flags = 0;
  for (const t of unionTypeParts(type)) {
    flags |= t.flags;
  }
  return flags;
}

/**
 * Checks if the given type is (or accepts) the given flags
 * @param flagsToCheck composition of one or more `ts.TypeFlags`
 * @param isReceiver true if the type is a receiving type (i.e. the type of a called function's parameter)
 */
export function isTypeFlagSet(
  type: ts.Type,
  flagsToCheck: number,
  isReceiver?: boolean,
): boolean {
  const flags = getTypeFlags(type);

  if (isReceiver && flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return true;
  }

  return (flags & flagsToCheck) !== 0;
}
