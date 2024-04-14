import type * as ts from 'typescript';

/**
 * @deprecated This is in TypeScript as of 3.7.
 */
export function getTypeArguments(
  type: ts.TypeReference,
  checker: ts.TypeChecker,
): readonly ts.Type[] {
  // getTypeArguments was only added in TS3.7
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (checker.getTypeArguments) {
    return checker.getTypeArguments(type);
  }

  return type.typeArguments ?? [];
}
