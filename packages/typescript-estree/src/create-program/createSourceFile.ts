import debug from 'debug';
import * as ts from 'typescript';

import type { ParseSettings } from '../parseSettings';
import { isSourceFile } from '../source-files';
import { getScriptKind } from './getScriptKind';
import type { ASTAndNoProgram } from './shared';

const log = debug('typescript-eslint:typescript-estree:createSourceFile');

function createSourceFile(parseSettings: ParseSettings): ts.SourceFile {
  log(
    'Getting AST without type information in %s mode for: %s',
    parseSettings.jsx ? 'TSX' : 'TS',
    parseSettings.filePath,
  );

  return isSourceFile(parseSettings.code)
    ? parseSettings.code
    : ts.createSourceFile(
        parseSettings.filePath,
        parseSettings.codeFullText,
        {
          languageVersion: ts.ScriptTarget.Latest,
          jsDocParsingMode: parseSettings.jsDocParsingMode,
        },
        /* setParentNodes */ true,
        getScriptKind(parseSettings.filePath, parseSettings.jsx),
      );
}

function createNoProgram(parseSettings: ParseSettings): ASTAndNoProgram {
  return {
    ast: createSourceFile(parseSettings),
    program: null,
  };
}

export { createSourceFile, createNoProgram };
