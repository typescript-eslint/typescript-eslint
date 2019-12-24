import debug from 'debug';
import * as ts from 'typescript';
import { Extra } from '../parser-options';
import { getScriptKind } from './shared';

const log = debug('typescript-eslint:typescript-estree:createSourceFile');

function createSourceFile(code: string, extra: Extra): ts.SourceFile {
  log(
    'Getting AST without type information in %s mode for: %s',
    extra.jsx ? 'TSX' : 'TS',
    extra.filePath,
  );

  return ts.createSourceFile(
    extra.filePath,
    code,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    getScriptKind(extra),
  );
}

export { createSourceFile };
