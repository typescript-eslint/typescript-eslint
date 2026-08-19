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

const realPathCache = new Map<string, string>();

export function clearRealPathCache(): void {
  realPathCache.clear();
}

function getRealPath(filePath: string): string {
  let realPath = realPathCache.get(filePath);
  if (realPath == null) {
    // ts.sys doesn't exist in browser environments and isn't required to
    // implement realpath. It returns the given path when it can't resolve one.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    realPath = ts.sys?.realpath?.(filePath) ?? filePath;
    realPathCache.set(filePath, realPath);
  }
  return realPath;
}

export function getCanonicalRealPath(filePath: string): CanonicalPath {
  return getCanonicalFileName(getRealPath(filePath));
}

/**
 * Maps the canonical real path of each directory that is only reachable through
 * a symlink to the path it's referred to by.
 *
 * TypeScript de-duplicates directories by real path when it expands a TSConfig's
 * `include`s, so a directory reachable both directly and through a symlink is
 * only visited once. Files under it then exist in the project solely under
 * whichever of the two paths was visited first.
 * https://github.com/typescript-eslint/typescript-eslint/issues/2987
 */
export function createSymlinkedDirectories(
  fileNames: Iterable<string>,
): ReadonlyMap<CanonicalPath, string> {
  const directories = new Set(
    [...fileNames].map(fileName => path.dirname(fileName)),
  );

  return new Map(
    [...directories]
      .map(directory => [directory, getRealPath(directory)] as const)
      .filter(([directory, realPath]) => directory !== realPath)
      .map(([directory, realPath]) => [
        getCanonicalFileName(realPath),
        directory,
      ]),
  );
}

/**
 * Resolves the path a symlinked directory's files are referred to by, for a path
 * that refers to the same file on disk.
 */
export function getPathToSameFile(
  symlinkedDirectories: ReadonlyMap<CanonicalPath, string>,
  filePath: string,
): string | undefined {
  const realPath = getRealPath(filePath);
  const directory = symlinkedDirectories.get(
    getCanonicalFileName(path.dirname(realPath)),
  );

  return directory == null
    ? undefined
    : path.join(directory, path.basename(realPath));
}

const programSymlinkedDirectories = new WeakMap<
  ts.Program,
  ReadonlyMap<CanonicalPath, string>
>();

function getSymlinkedDirectories(
  program: ts.Program,
): ReadonlyMap<CanonicalPath, string> {
  let symlinkedDirectories = programSymlinkedDirectories.get(program);
  if (!symlinkedDirectories) {
    // Only a project's root files can be under a directory it knows by a
    // symlinked path: files pulled in by imports resolve to their real path.
    symlinkedDirectories = createSymlinkedDirectories(
      program.getRootFileNames(),
    );
    programSymlinkedDirectories.set(program, symlinkedDirectories);
  }
  return symlinkedDirectories;
}

/**
 * Retrieves a program's source file for a path, including when the program knows
 * the file by a different path that resolves to the same file on disk.
 */
export function getSourceFileFromProgram(
  program: ts.Program,
  filePath: string,
): ts.SourceFile | undefined {
  const sourceFile = program.getSourceFile(filePath);
  if (sourceFile) {
    return sourceFile;
  }

  const realPath = getRealPath(filePath);
  const fromRealPath =
    realPath === filePath ? undefined : program.getSourceFile(realPath);
  if (fromRealPath) {
    return fromRealPath;
  }

  const symlinkedFilePath = getPathToSameFile(
    getSymlinkedDirectories(program),
    filePath,
  );

  return symlinkedFilePath == null
    ? undefined
    : program.getSourceFile(symlinkedFilePath);
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
  const ast = getSourceFileFromProgram(currentProgram, filePath);

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
