import debug from 'debug';
import * as ts from 'typescript';
import type { Extra } from '../parser-options';
import type { ASTAndProgram } from './shared';
import { createDefaultCompilerOptionsFromExtra } from './shared';
import { getScriptKind } from './getScriptKind';

const log = debug('typescript-eslint:typescript-estree:createIsolatedProgram');

/**
 * @param code The code of the file being linted
 * @returns Returns a new source file and program corresponding to the linted code
 */
function createIsolatedProgram(code: string, extra: Extra): ASTAndProgram {
  log(
    'Getting isolated program in %s mode for: %s',
    extra.jsx ? 'TSX' : 'TS',
    extra.filePath,
  );

  const compilerHost: ts.CompilerHost = {
    fileExists() {
      return true;
    },
    getCanonicalFileName() {
      return extra.filePath;
    },
    getCurrentDirectory() {
      return '';
    },
    getDirectories() {
      return [];
    },
    getDefaultLibFileName() {
      return 'lib.d.ts';
    },

    // TODO: Support Windows CRLF
    getNewLine() {
      return '\n';
    },
    getSourceFile(filename: string) {
      return ts.createSourceFile(
        filename,
        code,
        ts.ScriptTarget.Latest,
        /* setParentNodes */ true,
        getScriptKind(extra.filePath, extra.jsx),
      );
    },
    readFile() {
      return undefined;
    },
    useCaseSensitiveFileNames() {
      return true;
    },
    writeFile() {
      return null;
    },
  };

  const program = ts.createProgram(
    [extra.filePath],
    {
      noResolve: true,
      target: ts.ScriptTarget.Latest,
      jsx: extra.jsx ? ts.JsxEmit.Preserve : undefined,
      ...createDefaultCompilerOptionsFromExtra(extra),
    },
    compilerHost,
  );

  const ast = program.getSourceFile(extra.filePath);
  if (!ast) {
    throw new Error(
      'Expected an ast to be returned for the single-file isolated program.',
    );
  }

  return { ast, program };
}

export { createIsolatedProgram };
