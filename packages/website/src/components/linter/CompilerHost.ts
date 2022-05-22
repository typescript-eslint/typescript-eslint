import type { ScriptKind, System, SourceFile, CompilerHost } from 'typescript';

function getScriptKind(
  ts: typeof import('typescript'),
  filePath: string,
): ScriptKind {
  const extension = (/(\.[a-z]+)$/.exec(filePath)?.[0] ?? '').toLowerCase();

  switch (extension) {
    case '.ts':
      return ts.ScriptKind.TS;
    case '.tsx':
      return ts.ScriptKind.TSX;

    case '.js':
      return ts.ScriptKind.JS;
    case '.jsx':
      return ts.ScriptKind.JSX;

    case '.json':
      return ts.ScriptKind.JSON;

    default:
      // unknown extension, force typescript to ignore the file extension, and respect the user's setting
      return ts.ScriptKind.TS;
  }
}

/**
 * Creates an in-memory CompilerHost -which is essentially an extra wrapper to System
 * which works with TypeScript objects - returns both a compiler host, and a way to add new SourceFile
 * instances to the in-memory file system.
 *
 * based on typescript-vfs
 * @see https://github.com/microsoft/TypeScript-Website/blob/d2613c0e57ae1be2f3a76e94b006819a1fc73d5e/packages/typescript-vfs/src/index.ts#L480
 */
export function createVirtualCompilerHost(
  sys: System,
  ts: typeof import('typescript'),
): CompilerHost {
  return {
    ...sys,
    getCanonicalFileName: (fileName: string) => fileName,
    getDefaultLibFileName: options => '/' + ts.getDefaultLibFileName(options),
    getCurrentDirectory: () => '/',
    getDirectories: () => [],
    getNewLine: () => sys.newLine,
    getSourceFile(fileName, languageVersionOrOptions): SourceFile | undefined {
      if (this.fileExists(fileName)) {
        const file = this.readFile(fileName) ?? '';
        return ts.createSourceFile(
          fileName,
          file,
          languageVersionOrOptions,
          true,
          getScriptKind(ts, fileName),
        );
      }
      return undefined;
    },
    useCaseSensitiveFileNames: () => sys.useCaseSensitiveFileNames,
  };
}
