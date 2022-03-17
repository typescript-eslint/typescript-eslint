import path from 'path';
import * as ts from 'typescript';
import { Program } from 'typescript';
import { Extra, ModuleResolver } from '../parser-options';

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

function createDefaultCompilerOptionsFromExtra(
  extra: Extra,
): ts.CompilerOptions {
  if (extra.debugLevel.has('typescript')) {
    return {
      ...DEFAULT_COMPILER_OPTIONS,
      extendedDiagnostics: true,
    };
  }

  return DEFAULT_COMPILER_OPTIONS;
}

// This narrows the type so we can be sure we're passing canonical names in the correct places
type CanonicalPath = string & { __brand: unknown };

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

function ensureAbsolutePath(p: string, extra: Extra): string {
  return path.isAbsolute(p)
    ? p
    : path.join(extra.tsconfigRootDir || process.cwd(), p);
}

function canonicalDirname(p: CanonicalPath): CanonicalPath {
  return path.dirname(p) as CanonicalPath;
}

function getScriptKind(
  extra: Extra,
  filePath: string = extra.filePath,
): ts.ScriptKind {
  const extension = path.extname(filePath).toLowerCase();
  // note - we respect the user's extension when it is known  we could override it and force it to match their
  // jsx setting, but that could create weird situations where we throw parse errors when TSC doesn't
  switch (extension) {
    case '.ts':
      return ts.ScriptKind.TS;

    case '.tsx':
      return ts.ScriptKind.TSX;

    case '.js':
      return ts.ScriptKind.JS;

    case '.jsx':
      return ts.ScriptKind.JSX;

    case '.json':
      return ts.ScriptKind.JSON;

    default:
      // unknown extension, force typescript to ignore the file extension, and respect the user's setting
      return extra.jsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  }
}

function getExtension(fileName: string | undefined): string | null {
  if (!fileName) {
    return null;
  }
  return fileName.endsWith('.d.ts') ? '.d.ts' : path.extname(fileName);
}

function getAstFromProgram(
  currentProgram: Program,
  extra: Extra,
): ASTAndProgram | undefined {
  const ast = currentProgram.getSourceFile(extra.filePath);

  // working around https://github.com/typescript-eslint/typescript-eslint/issues/1573
  const expectedExt = getExtension(extra.filePath);
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

export {
  ASTAndProgram,
  CORE_COMPILER_OPTIONS,
  canonicalDirname,
  CanonicalPath,
  createDefaultCompilerOptionsFromExtra,
  ensureAbsolutePath,
  getCanonicalFileName,
  getScriptKind,
  getAstFromProgram,
  getModuleResolver,
};
