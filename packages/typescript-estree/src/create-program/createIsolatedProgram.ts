import debug from 'debug';
import * as ts from 'typescript';

import type { ParseSettings } from '../parseSettings';
import { getScriptKind } from './getScriptKind';
import type { ASTAndProgram } from './shared';
import { createDefaultCompilerOptionsFromExtra } from './shared';

const log = debug('typescript-eslint:typescript-estree:createIsolatedProgram');

/**
 * @param code The code of the file being linted
 * @returns Returns a new source file and program corresponding to the linted code
 */
function createIsolatedProgram(parseSettings: ParseSettings): ASTAndProgram {
  log(
    'Getting isolated program in %s mode for: %s',
    parseSettings.jsx ? 'TSX' : 'TS',
    parseSettings.filePath,
  );

  const compilerHost: ts.CompilerHost = {
    fileExists() {
      return true;
    },
    getCanonicalFileName() {
      return parseSettings.filePath;
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
        parseSettings.code,
        ts.ScriptTarget.Latest,
        /* setParentNodes */ true,
        getScriptKind(parseSettings.filePath, parseSettings.jsx),
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
    [parseSettings.filePath],
    {
      noResolve: true,
      target: ts.ScriptTarget.Latest,
      jsx: parseSettings.jsx ? ts.JsxEmit.Preserve : undefined,
      ...createDefaultCompilerOptionsFromExtra(parseSettings),
    },
    compilerHost,
  );

  const ast = program.getSourceFile(parseSettings.filePath);
  if (!ast) {
    throw new Error(
      'Expected an ast to be returned for the single-file isolated program.',
    );
  }

  return { ast, program };
}

export { createIsolatedProgram };
