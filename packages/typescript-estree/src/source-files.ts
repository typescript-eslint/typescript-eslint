import * as ts from 'typescript';

export function isSourceFile(code: unknown): code is ts.SourceFile {
  return (
    typeof code !== 'string' &&
    (code as Partial<ts.SourceFile> | undefined)?.kind ===
      ts.SyntaxKind.SourceFile &&
    !!(code as Partial<ts.SourceFile>).getFullText
  );
}

export function getCodeText(code: string | ts.SourceFile): string {
  return isSourceFile(code) ? code.getFullText(code) : code;
}
