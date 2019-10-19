import debug from 'debug';
import ts from 'typescript';
import { Extra } from '../parser-options';

const log = debug('typescript-eslint:typescript-estree:createIsolatedProgram');

function createSourceFile(code: string, extra: Extra): ts.SourceFile {
  log('Getting AST without type information for: %s', extra.filePath);

  return ts.createSourceFile(
    extra.filePath,
    code,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
  );
}

export { createSourceFile };
