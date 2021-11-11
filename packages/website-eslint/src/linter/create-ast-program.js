import {
  createProgram,
  createSourceFile,
  ScriptTarget,
  ScriptKind,
  JsxEmit,
  ModuleKind,
} from 'typescript';
import { CompilerHost } from './CompilerHost';

export function createASTProgram(code, parserOptions) {
  const isJsx = !!parserOptions?.ecmaFeatures?.jsx;
  const fileName = isJsx ? '/demo.tsx' : '/demo.ts';
  const files = {
    [fileName]: code,
  };
  const sourceFiles = {
    [fileName]: createSourceFile(
      fileName,
      code,
      ScriptTarget.Latest,
      true,
      isJsx ? ScriptKind.TSX : ScriptKind.TS,
    ),
  };
  const compilerHost = new CompilerHost(files, sourceFiles);
  const compilerOptions = {
    noResolve: true,
    strict: true,
    target: ScriptTarget.Latest,
    jsx: isJsx ? JsxEmit.React : undefined,
    module: ModuleKind.ES2015,
  };
  const program = createProgram(
    Object.keys(files),
    compilerOptions,
    compilerHost,
  );
  const ast = program.getSourceFile(fileName);
  return {
    ast,
    program,
  };
}
