import * as tools from 'ts-api-tools';
import * as ts from 'typescript';

import { isTypeFlagSet } from './typeFlagUtils';

/**
 * @param type Type being checked by name.
 * @param allowedNames Symbol names checking on the type.
 * @returns Whether the type is, extends, or contains all of the allowed names.
 */
export function containsAllTypesByName(
  type: ts.Type,
  allowAny: boolean,
  allowedNames: Set<string>,
): boolean {
  if (isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return !allowAny;
  }

  if (tools.isTypeReference(type)) {
    type = type.target;
  }

  const symbol = type.getSymbol();
  if (symbol && allowedNames.has(symbol.name)) {
    return true;
  }

  if (tools.isUnionOrIntersectionType(type)) {
    return type.types.every(t =>
      containsAllTypesByName(t, allowAny, allowedNames),
    );
  }

  const bases = type.getBaseTypes();
  return (
    typeof bases !== 'undefined' &&
    bases.length > 0 &&
    bases.every(t => containsAllTypesByName(t, allowAny, allowedNames))
  );
}
