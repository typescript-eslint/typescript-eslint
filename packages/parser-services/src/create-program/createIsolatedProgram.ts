import debug from 'debug';
import * as ts from 'typescript';

import type { ParseSettings } from '../parseSettings';
import type { ASTAndDefiniteProgram } from './shared';

import { getScriptKind } from './getScriptKind';
import { createDefaultCompilerOptionsFromExtra } from './shared';

const log = debug(
  'typescript-eslint:parser-services:create-program:createIsolatedProgram',
);

/**
 * @returns Returns a new source file and program corresponding to the linted code
 */
export function createIsolatedProgram(
  parseSettings: ParseSettings,
): ASTAndDefiniteProgram {
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
    getDefaultLibFileName() {
      return 'lib.d.ts';
    },
    getDirectories() {
      return [];
    },

    // TODO: Support Windows CRLF
    getNewLine() {
      return '\n';
    },
    getSourceFile(filename: string) {
      return ts.createSourceFile(
        filename,
        parseSettings.codeFullText,
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
      jsDocParsingMode: parseSettings.jsDocParsingMode,
      jsx: parseSettings.jsx ? ts.JsxEmit.Preserve : undefined,
      noResolve: true,
      target: ts.ScriptTarget.Latest,
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
