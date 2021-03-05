import type {
  CompilerHost as ICompilerHost,
  CompilerOptions,
  SourceFile,
} from 'typescript';
import { getDefaultLibFileName } from 'typescript';

export class CompilerHost implements ICompilerHost {
  constructor(
    private files: Record<string, string>,
    private sourceFiles: Record<string, SourceFile>,
  ) {}

  fileExists(name: string): boolean {
    return !!this.files[name];
  }
  getCanonicalFileName(name: string): string {
    return name;
  }
  getCurrentDirectory(): string {
    return '/';
  }
  getDirectories(): string[] {
    return [];
  }
  getDefaultLibFileName(options: CompilerOptions): string {
    return '/' + getDefaultLibFileName(options);
  }
  getNewLine(): string {
    return '\n';
  }
  useCaseSensitiveFileNames(): boolean {
    return true;
  }
  writeFile(): null {
    return null;
  }
  readFile(name: string): string | undefined {
    return this.files[name];
  }
  getSourceFile(name: string): SourceFile | undefined {
    return this.sourceFiles[name];
  }
}
