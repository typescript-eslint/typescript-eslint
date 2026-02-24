import debug from 'debug';
import * as ts from 'typescript';

import type { ParseSettings } from '../parseSettings';
import type { ASTAndNoProgram } from './shared';

import { isSourceFile } from '../source-files';
import { getScriptKind } from './getScriptKind';

const log = debug(
  'typescript-eslint:typescript-estree:create-program:createSourceFile',
);

export function createSourceFile(parseSettings: ParseSettings): ts.SourceFile {
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
          jsDocParsingMode: parseSettings.jsDocParsingMode,
          languageVersion: ts.ScriptTarget.Latest,
          ...(parseSettings.setExternalModuleIndicator && {
            setExternalModuleIndicator:
              parseSettings.setExternalModuleIndicator,
          }),
        },
        /* setParentNodes */ true,
        getScriptKind(parseSettings.filePath, parseSettings.jsx),
      );
}

export function createNoProgram(parseSettings: ParseSettings): ASTAndNoProgram {
  return {
    ast: createSourceFile(parseSettings),
    program: null,
  };
}
