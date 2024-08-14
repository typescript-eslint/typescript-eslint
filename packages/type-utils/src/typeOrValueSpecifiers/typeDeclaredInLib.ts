import type * as ts from 'typescript';

export function typeDeclaredInLib(
  declarationFiles: ts.SourceFile[],
  program: ts.Program,
): boolean {
  // Assertion: The type is not an error type.

  // Intrinsic type (i.e. string, number, boolean, etc) - Treat it as if it's from lib.
  if (declarationFiles.length === 0) {
    return true;
  }
  return declarationFiles.some(declaration =>
    program.isSourceFileDefaultLibrary(declaration),
  );
}
