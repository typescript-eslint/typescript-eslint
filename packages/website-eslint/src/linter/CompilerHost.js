import { getDefaultLibFileName } from 'typescript';

export class CompilerHost {
  constructor(files, sourceFiles) {
    this.files = files;
    this.sourceFiles = sourceFiles;
  }

  fileExists(name) {
    return !!this.files[name];
  }

  getCanonicalFileName(name) {
    return name;
  }

  getCurrentDirectory() {
    return '/';
  }

  getDirectories() {
    return [];
  }

  getDefaultLibFileName(options) {
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

  readFile(name) {
    return this.files[name];
  }

  getSourceFile(name) {
    return this.sourceFiles[name];
  }
}
