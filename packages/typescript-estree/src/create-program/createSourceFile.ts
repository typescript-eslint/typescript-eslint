import debug from 'debug';
import ts from 'typescript';
import { Extra } from '../parser-options';

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
    // force typescript to ignore the file extension
    extra.jsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

export { createSourceFile };
