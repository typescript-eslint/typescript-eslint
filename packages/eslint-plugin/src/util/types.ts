import {
  isTypeReference,
  isUnionOrIntersectionType,
  unionTypeParts,
} from 'tsutils';
import ts from 'typescript';

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

/**
 * Get the type name of a given type.
 * @param typeChecker The context sensitive TypeScript TypeChecker.
 * @param type The type to get the name of.
 */
export function getTypeName(
  typeChecker: ts.TypeChecker,
  type: ts.Type,
): string {
  // It handles `string` and string literal types as string.
  if ((type.flags & ts.TypeFlags.StringLike) !== 0) {
    return 'string';
  }

  // If the type is a type parameter which extends primitive string types,
  // but it was not recognized as a string like. So check the constraint
  // type of the type parameter.
  if ((type.flags & ts.TypeFlags.TypeParameter) !== 0) {
    // `type.getConstraint()` method doesn't return the constraint type of
    // the type parameter for some reason. So this gets the constraint type
    // via AST.
    const node = type.symbol.declarations[0] as ts.TypeParameterDeclaration;
    if (node.constraint != null) {
      return getTypeName(
        typeChecker,
        typeChecker.getTypeFromTypeNode(node.constraint),
      );
    }
  }

  // If the type is a union and all types in the union are string like,
  // return `string`. For example:
  // - `"a" | "b"` is string.
  // - `string | string[]` is not string.
  if (
    type.isUnion() &&
    type.types
      .map(value => getTypeName(typeChecker, value))
      .every(t => t === 'string')
  ) {
    return 'string';
  }

  // If the type is an intersection and a type in the intersection is string
  // like, return `string`. For example: `string & {__htmlEscaped: void}`
  if (
    type.isIntersection() &&
    type.types
      .map(value => getTypeName(typeChecker, value))
      .some(t => t === 'string')
  ) {
    return 'string';
  }

  return typeChecker.typeToString(type);
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
export function isNullableType(
  type: ts.Type,
  {
    isReceiver = false,
    allowUndefined = true,
  }: { isReceiver?: boolean; allowUndefined?: boolean } = {},
): boolean {
  const flags = getTypeFlags(type);

  if (isReceiver && flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return true;
  }

  if (allowUndefined) {
    return (flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) !== 0;
  } else {
    return (flags & ts.TypeFlags.Null) !== 0;
  }
}

/**
 * Gets the declaration for the given variable
 */
export function getDeclaration(
  checker: ts.TypeChecker,
  node: ts.Expression,
): ts.Declaration | null {
  const symbol = checker.getSymbolAtLocation(node);
  if (!symbol) {
    return null;
  }
  const declarations = symbol.declarations;
  if (!declarations) {
    return null;
  }

  return declarations[0];
}

/**
 * Gets all of the type flags in a type, iterating through unions automatically
 */
export function getTypeFlags(type: ts.Type): ts.TypeFlags {
  let flags: ts.TypeFlags = 0;
  for (const t of unionTypeParts(type)) {
    flags |= t.flags;
  }
  return flags;
}

/**
 * Checks if the given type is (or accepts) the given flags
 * @param isReceiver true if the type is a receiving type (i.e. the type of a called function's parameter)
 */
export function isTypeFlagSet(
  type: ts.Type,
  flagsToCheck: ts.TypeFlags,
  isReceiver?: boolean,
): boolean {
  const flags = getTypeFlags(type);

  if (isReceiver && flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return true;
  }

  return (flags & flagsToCheck) !== 0;
}

/**
 * @returns Whether a type is an instance of the parent type, including for the parent's base types.
 */
export function typeIsOrHasBaseType(
  type: ts.Type,
  parentType: ts.Type,
): boolean {
  if (type.symbol === undefined || parentType.symbol === undefined) {
    return false;
  }

  const typeAndBaseTypes = [type];
  const ancestorTypes = type.getBaseTypes();

  if (ancestorTypes !== undefined) {
    typeAndBaseTypes.push(...ancestorTypes);
  }

  for (const baseType of typeAndBaseTypes) {
    if (
      baseType.symbol !== undefined &&
      baseType.symbol.name === parentType.symbol.name
    ) {
      return true;
    }
  }

  return false;
}
