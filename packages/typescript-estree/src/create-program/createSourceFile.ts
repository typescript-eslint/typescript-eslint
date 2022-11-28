import debug from 'debug';
import * as ts from 'typescript';

import type { ParseSettings } from '../parseSettings';
import { isSourceFile } from '../source-files';
import { getScriptKind } from './getScriptKind';

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
        ts.ScriptTarget.Latest,
        /* setParentNodes */ true,
        getScriptKind(parseSettings.filePath, parseSettings.jsx),
      );
}

export { createSourceFile };
