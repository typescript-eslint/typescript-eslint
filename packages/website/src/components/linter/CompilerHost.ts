import type { LintUtils } from '@typescript-eslint/website-eslint';
import type { CompilerHost, SourceFile, System } from 'typescript';

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
  lintUtils: LintUtils,
): CompilerHost {
  return {
    ...sys,
    getCanonicalFileName: (fileName: string) => fileName,
    getDefaultLibFileName: options =>
      '/' + window.ts.getDefaultLibFileName(options),
    getNewLine: () => sys.newLine,
    getSourceFile(fileName, languageVersionOrOptions): SourceFile | undefined {
      if (this.fileExists(fileName)) {
        const file = this.readFile(fileName) ?? '';
        return window.ts.createSourceFile(
          fileName,
          file,
          languageVersionOrOptions,
          true,
          lintUtils.getScriptKind(fileName, false),
        );
      }
      return undefined;
    },
    useCaseSensitiveFileNames: () => sys.useCaseSensitiveFileNames,
  };
}
