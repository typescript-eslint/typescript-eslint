import type * as ts from 'typescript';

import { getCanonicalFileName } from '@typescript-eslint/typescript-estree';
import path from 'node:path';

export function typeDeclaredInFile(
  relativePath: string | undefined,
  declarationFiles: ts.SourceFile[],
  program: ts.Program,
): boolean {
  if (relativePath == null) {
    const cwd = getCanonicalFileName(program.getCurrentDirectory());
    return declarationFiles.some(declaration =>
      getCanonicalFileName(declaration.fileName).startsWith(cwd),
    );
  }
  const absolutePath = getCanonicalFileName(
    path.join(program.getCurrentDirectory(), relativePath),
  );
  return declarationFiles.some(
    declaration => getCanonicalFileName(declaration.fileName) === absolutePath,
  );
}
