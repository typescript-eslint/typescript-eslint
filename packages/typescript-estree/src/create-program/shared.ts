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

// This narrows the type so we can be sure we're passing canonical names in the correct places
type CanonicalPath = string & { __brand: unknown };
const getCanonicalFileName = ts.sys.useCaseSensitiveFileNames
  ? (filePath: string): CanonicalPath =>
      path.normalize(filePath) as CanonicalPath
  : (filePath: string): CanonicalPath =>
      path.normalize(filePath).toLowerCase() as CanonicalPath;

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
  const extension = path.extname(filePath);
  // note - we respect the user's extension when it is known  we could override it and force it to match their
  // jsx setting, but that could create weird situations where we throw parse errors when TSC doesn't
  switch (extension.toLowerCase()) {
    case 'ts':
      return ts.ScriptKind.TS;

    case 'tsx':
      return ts.ScriptKind.TSX;

    case 'js':
      return ts.ScriptKind.JS;

    case 'jsx':
      return ts.ScriptKind.JSX;

    case 'json':
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
