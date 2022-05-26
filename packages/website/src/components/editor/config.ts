import type Monaco from 'monaco-editor';

export function createCompilerOptions(
  jsx = false,
  tsConfig: Record<string, unknown> = {},
): Monaco.languages.typescript.CompilerOptions {
  return {
    noResolve: true,
    // ts and monaco has different type as monaco types are not changing base on ts version
    target: window.ts.ScriptTarget.ESNext as number,
    module: window.ts.ModuleKind.ESNext as number,
    ...tsConfig,
    jsx: jsx ? window.ts.JsxEmit.Preserve : window.ts.JsxEmit.None,
  };
}
