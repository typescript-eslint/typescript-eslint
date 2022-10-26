import type * as ts from 'typescript';

export function getTypeArguments(
  type: ts.TypeReference,
  checker: ts.TypeChecker,
): readonly ts.Type[] {
  // getTypeArguments was only added in TS3.7
  if (checker.getTypeArguments) {
    return checker.getTypeArguments(type);
  }

  return type.typeArguments ?? [];
}
