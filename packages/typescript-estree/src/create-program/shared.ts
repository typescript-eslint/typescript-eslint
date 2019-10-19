import path from 'path';
import ts from 'typescript';
import { Extra } from '../parser-options';

interface ASTAndProgram {
  ast: ts.SourceFile;
  program: ts.Program | undefined;
}

/**
 * Default compiler options for program generation from single root file
 */
const DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
  allowNonTsExtensions: true,
  allowJs: true,
  checkJs: true,
  noEmit: true,
  // extendedDiagnostics: true,
};

function getTsconfigPath(tsconfigPath: string, extra: Extra): string {
  return path.isAbsolute(tsconfigPath)
    ? tsconfigPath
    : path.join(extra.tsconfigRootDir || process.cwd(), tsconfigPath);
}

export { ASTAndProgram, DEFAULT_COMPILER_OPTIONS, getTsconfigPath };
