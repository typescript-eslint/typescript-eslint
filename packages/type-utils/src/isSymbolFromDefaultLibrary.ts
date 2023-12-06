import type * as ts from 'typescript';

export function isSymbolFromDefaultLibrary(
  program: ts.Program,
  symbol: ts.Symbol | undefined,
): boolean {
  if (!symbol) {
    return false;
  }

  const declarations = symbol.getDeclarations() ?? [];
  for (const declaration of declarations) {
    const sourceFile = declaration.getSourceFile();
    if (program.isSourceFileDefaultLibrary(sourceFile)) {
      return true;
    }
  }

  return false;
}
