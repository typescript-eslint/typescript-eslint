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
    return declarationFiles.some(declaration => {
      const fileName = getCanonicalFileName(declaration.fileName);
      return (
        fileName.startsWith(cwd) &&
        // A path-less specifier refers to files of the project being linted, so
        // types declared in `node_modules` are never matched by it. An explicit
        // `path` is still matched exactly, even if it points into `node_modules`.
        !fileName.split(/[\\/]/).includes('node_modules')
      );
    });
  }
  const absolutePath = getCanonicalFileName(
    path.join(program.getCurrentDirectory(), relativePath),
  );
  return declarationFiles.some(
    declaration => getCanonicalFileName(declaration.fileName) === absolutePath,
  );
}
