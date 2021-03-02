import {
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

  fileExists(name: string) {
    return !!this.files[name];
  }
  getCanonicalFileName(name: string) {
    return name;
  }
  getCurrentDirectory() {
    return '/';
  }
  getDirectories() {
    return [];
  }
  getDefaultLibFileName(options: CompilerOptions) {
    return '/' + getDefaultLibFileName(options);
  }
  getNewLine() {
    return '\n';
  }
  useCaseSensitiveFileNames() {
    return true;
  }
  writeFile() {
    return null;
  }
  readFile(name: string) {
    return this.files[name];
  }
  getSourceFile(name: string) {
    return this.sourceFiles[name];
  }
}
