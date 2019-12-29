import path from 'path';
import * as ts from 'typescript';
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
  noUnusedLocals: true,
  noUnusedParameters: true,
};

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
  if (normalized.endsWith('/')) {
    normalized = normalized.substr(0, normalized.length - 1);
  }
  return correctPathCasing(normalized) as CanonicalPath;
}

function getTsconfigPath(tsconfigPath: string, extra: Extra): CanonicalPath {
  return getCanonicalFileName(
    path.isAbsolute(tsconfigPath)
      ? tsconfigPath
      : path.join(extra.tsconfigRootDir || process.cwd(), tsconfigPath),
  );
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

export {
  ASTAndProgram,
  canonicalDirname,
  CanonicalPath,
  DEFAULT_COMPILER_OPTIONS,
  getCanonicalFileName,
  getScriptKind,
  getTsconfigPath,
};
