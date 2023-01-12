import { isTypeReference, isUnionOrIntersectionType } from 'tsutils';
import * as ts from 'typescript';

import { isTypeFlagSet } from './typeFlagUtils';

/**
 * @param type Type being checked by name.
 * @param allowAny Whether to consider `any` and `unknown` to match.
 * @param allowedNames Symbol names checking on the type.
 * @param mustMatchAll Whether all parts have to match, as opposed to any parts matching.
 * @returns Whether the type is, extends, or contains the allowed names (or all matches the allowed names, if mustMatchAll is true).
 */
export function containsTypesByName(
  type: ts.Type,
  allowAny: boolean,
  allowedNames: Set<string>,
  mustMatchAll: boolean,
): boolean {
  if (isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return !allowAny;
  }

  if (isTypeReference(type)) {
    type = type.target;
  }

  const symbol = type.getSymbol();
  if (symbol && allowedNames.has(symbol.name)) {
    return true;
  }

  const predicate = (t: ts.Type): boolean =>
    containsTypesByName(t, allowAny, allowedNames, mustMatchAll);

  if (isUnionOrIntersectionType(type)) {
    return mustMatchAll
      ? type.types.every(predicate)
      : type.types.some(predicate);
  }

  const bases = type.getBaseTypes();

  return (
    typeof bases !== 'undefined' &&
    (mustMatchAll
      ? bases.length > 0 && bases.every(predicate)
      : bases.some(predicate))
  );
}
