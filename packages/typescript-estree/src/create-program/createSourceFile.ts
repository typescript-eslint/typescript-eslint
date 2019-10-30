import debug from 'debug';
import * as ts from 'typescript'; // leave this as * as ts so people using util package don't need syntheticDefaultImports
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
