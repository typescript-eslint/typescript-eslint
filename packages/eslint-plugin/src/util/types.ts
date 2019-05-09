import {
  isTypeFlagSet,
  isTypeReference,
  isUnionOrIntersectionType,
  unionTypeParts,
} from 'tsutils';
import ts from 'typescript';

/**
 * @param type Type being checked by name.
 * @param allowedNames Symbol names checking on the type.
 * @returns Whether the type is, extends, or contains any of the allowed names.
 */
export function containsTypeByName(
  type: ts.Type,
  allowedNames: Set<string>,
): boolean {
  if (isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return true;
  }

  if (isTypeReference(type)) {
    type = type.target;
  }

  if (
    typeof type.symbol !== 'undefined' &&
    allowedNames.has(type.symbol.name)
  ) {
    return true;
  }

  if (isUnionOrIntersectionType(type)) {
    return type.types.some(t => containsTypeByName(t, allowedNames));
  }

  const bases = type.getBaseTypes();
  return (
    typeof bases !== 'undefined' &&
    bases.some(t => containsTypeByName(t, allowedNames))
  );
}

/**
 * Resolves the given node's type. Will resolve to the type's generic constraint, if it has one.
 */
export function getConstrainedTypeAtLocation(
  checker: ts.TypeChecker,
  node: ts.Node,
): ts.Type {
  const nodeType = checker.getTypeAtLocation(node);
  const constrained = checker.getBaseConstraintOfType(nodeType);

  return constrained || nodeType;
}

/**
 * Checks if the given type is (or accepts) nullable
 * @param isReceiver true if the type is a receiving type (i.e. the type of a called function's parameter)
 */
export function isNullableType(type: ts.Type, isReceiver?: boolean): boolean {
  let flags: ts.TypeFlags = 0;
  for (const t of unionTypeParts(type)) {
    flags |= t.flags;
  }

  flags =
    isReceiver && flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)
      ? -1
      : flags;

  return (flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) !== 0;
}

/**
 * Gets the declaration for the given variable
 */
export function getDeclaration(
  checker: ts.TypeChecker,
  node: ts.Expression,
): ts.Declaration {
  return checker.getSymbolAtLocation(node)!.declarations![0];
}
