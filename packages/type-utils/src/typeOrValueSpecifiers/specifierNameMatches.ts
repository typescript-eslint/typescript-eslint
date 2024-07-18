import type * as ts from 'typescript';

export function specifierNameMatches(
  type: ts.Type,
  name: string[] | string,
): boolean {
  if (typeof name === 'string') {
    name = [name];
  }
  if (name.some(item => item === type.intrinsicName)) {
    return true;
  }
  const symbol = type.aliasSymbol ?? type.getSymbol();
  if (symbol === undefined) {
    return false;
  }
  return name.some(item => (item as ts.__String) === symbol.escapedName);
}
