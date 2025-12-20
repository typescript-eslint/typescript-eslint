import type { Program } from 'typescript';

import { CORE_COMPILER_OPTIONS } from '@typescript-eslint/tsconfig-utils';
import path from 'node:path';
import * as ts from 'typescript';

import type { ParseSettings } from '../parseSettings';

export interface ASTAndNoProgram {
  ast: ts.SourceFile;
  program: null;
}
export interface ASTAndDefiniteProgram {
  ast: ts.SourceFile;
  program: ts.Program;
}
export type ASTAndProgram = ASTAndDefiniteProgram | ASTAndNoProgram;

/**
 * Default compiler options for program generation
 */
const DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
  ...CORE_COMPILER_OPTIONS,
  allowJs: true,
  allowNonTsExtensions: true,
  checkJs: true,
};

export const DEFAULT_EXTRA_FILE_EXTENSIONS = new Set<string>([
  ts.Extension.Cjs,
  ts.Extension.Cts,
  ts.Extension.Js,
  ts.Extension.Jsx,
  ts.Extension.Mjs,
  ts.Extension.Mts,
  ts.Extension.Ts,
  ts.Extension.Tsx,
]);

export function createDefaultCompilerOptionsFromExtra(
  parseSettings: ParseSettings,
): ts.CompilerOptions {
  if (parseSettings.debugLevel.has('typescript')) {
    return {
      ...DEFAULT_COMPILER_OPTIONS,
      extendedDiagnostics: true,
    };
  }

  return DEFAULT_COMPILER_OPTIONS;
}

// This narrows the type so we can be sure we're passing canonical names in the correct places
export type CanonicalPath = { __brand: unknown } & string;

// typescript doesn't provide a ts.sys implementation for browser environments
const useCaseSensitiveFileNames =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/internal/eqeq-nullish
  ts.sys !== undefined ? ts.sys.useCaseSensitiveFileNames : true;
const correctPathCasing = useCaseSensitiveFileNames
  ? (filePath: string): string => filePath
  : (filePath: string): string => filePath.toLowerCase();

export function getCanonicalFileName(filePath: string): CanonicalPath {
  let normalized = path.normalize(filePath);
  if (normalized.endsWith(path.sep)) {
    normalized = normalized.slice(0, -1);
  }
  return correctPathCasing(normalized) as CanonicalPath;
}

export function ensureAbsolutePath(p: string, tsconfigRootDir: string): string {
  return path.resolve(tsconfigRootDir, p);
}

export function canonicalDirname(p: CanonicalPath): CanonicalPath {
  return path.dirname(p) as CanonicalPath;
}

const DEFINITION_EXTENSIONS = [
  ts.Extension.Dts,
  ts.Extension.Dcts,
  ts.Extension.Dmts,
] as const;
function getExtension(fileName: string | undefined): string | null {
  if (!fileName) {
    return null;
  }

  return (
    DEFINITION_EXTENSIONS.find(definitionExt =>
      fileName.endsWith(definitionExt),
    ) ?? path.extname(fileName)
  );
}

export function getAstFromProgram(
  currentProgram: Program,
  filePath: string,
): ASTAndDefiniteProgram | undefined {
  const ast = currentProgram.getSourceFile(filePath);

  // working around https://github.com/typescript-eslint/typescript-eslint/issues/1573
  const expectedExt = getExtension(filePath);
  const returnedExt = getExtension(ast?.fileName);
  if (expectedExt !== returnedExt) {
    return undefined;
  }

  return ast && { ast, program: currentProgram };
}

/**
 * Hash content for compare content.
 * @param content hashed contend
 * @returns hashed result
 */
export function createHash(content: string): string {
  // No ts.sys in browser environments.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (ts.sys?.createHash) {
    return ts.sys.createHash(content);
  }
  return content;
}
