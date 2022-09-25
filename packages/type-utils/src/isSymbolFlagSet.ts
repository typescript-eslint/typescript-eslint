import type { Symbol as SymbolType, SymbolFlags } from 'typescript';

import { isFlagSet } from './isFlagSet';

export const isSymbolFlagSet: (
  symbol: SymbolType,
  flag: SymbolFlags,
) => boolean = isFlagSet;
