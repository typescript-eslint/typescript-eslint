import * as ts from 'typescript';

export function isSourceFile(code: unknown): code is ts.SourceFile {
  if (typeof code !== 'object' || code == null) {
    return false;
  }

  const maybeSourceFile = code as Partial<ts.SourceFile>;
  return (
    maybeSourceFile.kind === ts.SyntaxKind.SourceFile &&
    typeof maybeSourceFile.getFullText === 'function'
  );
}

export function getCodeText(code: string | ts.SourceFile): string {
  return isSourceFile(code) ? code.getFullText(code) : code;
}
