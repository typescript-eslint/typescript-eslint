import fs from 'fs';
import path from 'path';
import type { Program } from 'typescript';
import * as ts from 'typescript';

import type { ModuleResolver } from '../parser-options';
import type { ParseSettings } from '../parseSettings';

interface ASTAndProgram {
  ast: ts.SourceFile;
  program: ts.Program;
}

/**
 * Compiler options required to avoid critical functionality issues
 */
const CORE_COMPILER_OPTIONS: ts.CompilerOptions = {
  noEmit: true, // required to avoid parse from causing emit to occur

  /**
   * Flags required to make no-unused-vars work
   */
  noUnusedLocals: true,
  noUnusedParameters: true,
};

/**
 * Default compiler options for program generation
 */
const DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
  ...CORE_COMPILER_OPTIONS,
  allowNonTsExtensions: true,
  allowJs: true,
  checkJs: true,
};

function createDefaultCompilerOptionsFromParseSettings(
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
type CanonicalPath = string & { __canonicalPathBrand: unknown };
type TSConfigCanonicalPath = CanonicalPath & {
  __tsconfigCanonicalPathBrand: unknown;
};

// typescript doesn't provide a ts.sys implementation for browser environments
const useCaseSensitiveFileNames =
  ts.sys !== undefined ? ts.sys.useCaseSensitiveFileNames : true;
const correctPathCasing = useCaseSensitiveFileNames
  ? (filePath: string): string => filePath
  : (filePath: string): string => filePath.toLowerCase();

function getCanonicalFileName(filePath: string): CanonicalPath {
  let normalized = path.normalize(filePath);
  if (normalized.endsWith(path.sep)) {
    normalized = normalized.slice(0, -1);
  }
  return correctPathCasing(normalized) as CanonicalPath;
}

function getTsconfigCanonicalFileName(filePath: string): TSConfigCanonicalPath {
  return getCanonicalFileName(filePath) as TSConfigCanonicalPath;
}

function ensureAbsolutePath(p: string, tsconfigRootDir: string): CanonicalPath {
  return getCanonicalFileName(
    path.isAbsolute(p) ? p : path.join(tsconfigRootDir || process.cwd(), p),
  );
}

function canonicalDirname(p: CanonicalPath): CanonicalPath {
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

function getAstFromProgram(
  currentProgram: Program,
  parseSettings: ParseSettings,
): ASTAndProgram | undefined {
  const ast = currentProgram.getSourceFile(parseSettings.filePath);

  // working around https://github.com/typescript-eslint/typescript-eslint/issues/1573
  const expectedExt = getExtension(parseSettings.filePath);
  const returnedExt = getExtension(ast?.fileName);
  if (expectedExt !== returnedExt) {
    return undefined;
  }

  return ast && { ast, program: currentProgram };
}

function getModuleResolver(moduleResolverPath: string): ModuleResolver {
  let moduleResolver: ModuleResolver;

  try {
    moduleResolver = require(moduleResolverPath) as ModuleResolver;
  } catch (error) {
    const errorLines = [
      'Could not find the provided parserOptions.moduleResolver.',
      'Hint: use an absolute path if you are not in control over where the ESLint instance runs.',
    ];

    throw new Error(errorLines.join('\n'));
  }

  return moduleResolver;
}

/**
 * Same fallback hashing algorithm TS uses:
 * https://github.com/microsoft/TypeScript/blob/00dc0b6674eef3fbb3abb86f9d71705b11134446/src/compiler/sys.ts#L54-L66
 */
function generateDjb2Hash(data: string): string {
  let acc = 5381;
  for (let i = 0; i < data.length; i++) {
    acc = (acc << 5) + acc + data.charCodeAt(i);
  }
  return acc.toString();
}

type FileHash = string & { __fileHashBrand: unknown };
/**
 * Hash content for compare content.
 * @param content hashed contend
 * @returns hashed result
 */
function createHash(content: string): FileHash {
  // No ts.sys in browser environments.
  if (ts.sys?.createHash) {
    return ts.sys.createHash(content) as FileHash;
  }
  return generateDjb2Hash(content) as FileHash;
}

/**
 * Caches the last modified time of the tsconfig files
 */
const tsconfigLastModifiedTimestampCache = new Map<
  TSConfigCanonicalPath,
  number
>();

function hasTSConfigChanged(tsconfigPath: TSConfigCanonicalPath): boolean {
  const stat = fs.statSync(tsconfigPath);
  const lastModifiedAt = stat.mtimeMs;
  const cachedLastModifiedAt =
    tsconfigLastModifiedTimestampCache.get(tsconfigPath);

  tsconfigLastModifiedTimestampCache.set(tsconfigPath, lastModifiedAt);

  if (cachedLastModifiedAt === undefined) {
    return false;
  }

  return Math.abs(cachedLastModifiedAt - lastModifiedAt) > Number.EPSILON;
}

type CacheClearer = () => void;
const additionalCacheClearers: CacheClearer[] = [];

/**
 * Clear all of the parser caches.
 * This should only be used in testing to ensure the parser is clean between tests.
 */
function clearWatchCaches(): void {
  tsconfigLastModifiedTimestampCache.clear();
  for (const fn of additionalCacheClearers) {
    fn();
  }
}
function registerAdditionalCacheClearer(fn: CacheClearer): void {
  additionalCacheClearers.push(fn);
}

export {
  ASTAndProgram,
  CORE_COMPILER_OPTIONS,
  canonicalDirname,
  CanonicalPath,
  clearWatchCaches,
  createDefaultCompilerOptionsFromParseSettings as createDefaultCompilerOptionsFromExtra,
  createHash,
  ensureAbsolutePath,
  FileHash,
  getCanonicalFileName,
  getAstFromProgram,
  getModuleResolver,
  getTsconfigCanonicalFileName,
  hasTSConfigChanged,
  registerAdditionalCacheClearer,
  TSConfigCanonicalPath,
  useCaseSensitiveFileNames,
};
