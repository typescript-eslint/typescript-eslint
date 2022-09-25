import type { __String, Symbol as SymbolType, Type } from 'typescript';

export function getPropertyOfType(
  type: Type,
  name: __String,
): SymbolType | undefined {
  if (!(<string>name).startsWith('__')) {
    return type.getProperty(<string>name);
  }

  return type.getProperties().find(s => s.escapedName === name);
}
