import type * as ts from 'typescript';

export function isSymbolFromDefaultLibrary(
  program: ts.Program,
  symbol: ts.Symbol | undefined,
  nameOrPredicate?: string | ((symbol: ts.Symbol) => boolean),
): boolean {
  if (!symbol) {
    return false;
  }

  if (
    typeof nameOrPredicate === 'string'
      ? symbol.getName() === nameOrPredicate
      : nameOrPredicate
        ? nameOrPredicate(symbol)
        : true
  ) {
    const declarations = symbol.getDeclarations() ?? [];
    for (const declaration of declarations) {
      const sourceFile = declaration.getSourceFile();
      if (program.isSourceFileDefaultLibrary(sourceFile)) {
        return true;
      }
    }
  }

  return false;
}
