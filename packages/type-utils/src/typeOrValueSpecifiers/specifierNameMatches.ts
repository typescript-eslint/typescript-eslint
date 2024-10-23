import type * as ts from 'typescript';

import * as tsutils from 'ts-api-utils';

export function specifierNameMatches(
  type: ts.Type,
  names: string | string[],
): boolean {
  if (typeof names === 'string') {
    names = [names];
  }

  const symbol = type.aliasSymbol ?? type.getSymbol();
  const candidateNames = symbol
    ? [symbol.escapedName as string, type.intrinsicName]
    : [type.intrinsicName];

  if (names.some(item => candidateNames.includes(item))) {
    return true;
  }

  if (tsutils.isIntersectionType(type)) {
    return type.types.some(subType => specifierNameMatches(subType, names));
  }

  return false;
}
