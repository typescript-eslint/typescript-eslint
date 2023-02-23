import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { isTypeFlagSet } from './typeFlagUtils';

/**
 * @param type Type being checked by name.
 * @param allowAny Whether to consider `any` and `unknown` to match.
 * @param allowedNames Symbol names checking on the type.
 * @param matchAnyInstead Whether to instead just check if any parts match, rather than all parts.
 * @returns Whether the type is, extends, or contains the allowed names (or all matches the allowed names, if mustMatchAll is true).
 */
export function containsAllTypesByName(
  type: ts.Type,
  allowAny: boolean,
  allowedNames: Set<string>,
  matchAnyInstead = false,
): boolean {
  if (isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return !allowAny;
  }

  if (tsutils.isTypeReference(type)) {
    type = type.target;
  }

  const symbol = type.getSymbol();
  if (symbol && allowedNames.has(symbol.name)) {
    return true;
  }

  const predicate = (t: ts.Type): boolean =>
    containsAllTypesByName(t, allowAny, allowedNames, matchAnyInstead);

  if (tsutils.isUnionOrIntersectionType(type)) {
    return matchAnyInstead
      ? type.types.some(predicate)
      : type.types.every(predicate);
  }

  const bases = type.getBaseTypes();

  return (
    typeof bases !== 'undefined' &&
    (matchAnyInstead
      ? bases.some(predicate)
      : bases.length > 0 && bases.every(predicate))
  );
}
