import { unionTypeParts } from 'tsutils';
import * as ts from 'typescript';

const ANY_OR_UNKNOWN = ts.TypeFlags.Any | ts.TypeFlags.Unknown;

/**
 * Gets all of the type flags in a type, iterating through unions automatically.
 */
export function getTypeFlags(type: ts.Type): number {
  let flags = 0;
  for (const t of unionTypeParts(type)) {
    flags |= t.flags;
  }
  return flags;
}

function isFlagSet(flags: number, flag: number): boolean {
  return (flags & flag) !== 0;
}

/**
 * @param flagsToCheck The composition of one or more `ts.SymbolFlags`.
 */
export function isSymbolFlagSet(
  symbol: ts.Symbol,
  flagsToCheck: number,
): boolean {
  return isFlagSet(symbol.flags, flagsToCheck);
}

/**
 * Note that if the type is a union, this function will decompose it into the
 * parts and get the flags of every union constituent. If this is not desired,
 * use the `isTypeFlagSetSimple` function instead.
 *
 * @param flagsToCheck The composition of one or more `ts.TypeFlags`.
 * @param isReceiver True if the type is a receiving type (i.e. the type of a
 * called function's parameter).
 */
export function isTypeFlagSet(
  type: ts.Type,
  flagsToCheck: number,
  isReceiver?: boolean,
): boolean {
  const flags = getTypeFlags(type);

  if (isReceiver && isFlagSet(flags, ANY_OR_UNKNOWN)) {
    return true;
  }

  return isFlagSet(flags, flagsToCheck);
}

/**
 * Similar to the `isTypeFlagSet` function, but does not decompose unions.
 *
 * This is just a very simple bit flag check.
 */
export function isTypeFlagSetSimple(
  type: ts.Type,
  flagsToCheck: number,
): boolean {
  return isFlagSet(type.flags, flagsToCheck);
}
