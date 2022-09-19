import type * as ts from 'typescript';

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
  const declarations = symbol.getDeclarations();
  return declarations?.[0] ?? null;
}
