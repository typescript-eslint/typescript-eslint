import type { SourceFile, Program } from 'typescript';
import type { ParserOptions } from '@typescript-eslint/types';
import {
  createProgram,
  createSourceFile,
  ScriptTarget,
  ScriptKind,
  JsxEmit,
  ModuleKind,
} from 'typescript';
import { CompilerHost } from './CompilerHost';

interface ASTAndProgram {
  ast?: SourceFile;
  program: Program;
}

export function createASTProgram(
  code: string,
  parserOptions: ParserOptions,
): ASTAndProgram {
  const isJsx = !!parserOptions?.ecmaFeatures?.jsx;
  const fileName = isJsx ? '/demo.tsx' : '/demo.ts';
  const files = { [fileName]: code };
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
    jsx: isJsx ? JsxEmit.Preserve : undefined,
    module: ModuleKind.ES2015,
  };
  const program = createProgram(
    Object.keys(files),
    compilerOptions,
    compilerHost,
  );
  const ast = program.getSourceFile(fileName);
  return { ast, program };
}
