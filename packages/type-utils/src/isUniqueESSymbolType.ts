import type { Type, UniqueESSymbolType } from 'typescript';
import { TypeFlags } from 'typescript';

export function isUniqueESSymbolType(type: Type): type is UniqueESSymbolType {
  return (type.flags & TypeFlags.UniqueESSymbol) !== 0;
}
