import type * as ts from 'typescript';

function isFlagSet(obj: { flags: number }, flag: number): boolean {
  return (obj.flags & flag) !== 0;
}

export const isSymbolFlagSet: (
  symbol: ts.Symbol,
  flag: ts.SymbolFlags,
) => boolean = isFlagSet;
