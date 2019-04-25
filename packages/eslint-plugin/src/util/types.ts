import * as tsutils from 'tsutils';
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
  if (tsutils.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return true;
  }

  if (tsutils.isTypeReference(type)) {
    type = type.target;
  }

  if (
    typeof type.symbol !== 'undefined' &&
    allowedNames.has(type.symbol.name)
  ) {
    return true;
  }

  if (tsutils.isUnionOrIntersectionType(type)) {
    return type.types.some(t => containsTypeByName(t, allowedNames));
  }

  const bases = type.getBaseTypes();
  return (
    typeof bases !== 'undefined' &&
    bases.some(t => containsTypeByName(t, allowedNames))
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
