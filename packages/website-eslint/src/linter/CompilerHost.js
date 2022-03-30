import {
  getDefaultLibFileName,
  ScriptKind,
  createSourceFile,
  ScriptTarget,
} from 'typescript';

function getScriptKind(isJsx, filePath) {
  const extension = (/(\.[a-z]+)$/.exec(filePath)?.[0] || '').toLowerCase();

  switch (extension) {
    case '.ts':
      return ScriptKind.TS;
    case '.tsx':
      return ScriptKind.TSX;
    case '.js':
      return ScriptKind.JS;

    case '.jsx':
      return ScriptKind.JSX;

    case '.json':
      return ScriptKind.JSON;

    default:
      // unknown extension, force typescript to ignore the file extension, and respect the user's setting
      return isJsx ? ScriptKind.TSX : ScriptKind.TS;
  }
}

export class CompilerHost {
  constructor(libs, isJsx) {
    this.files = [];
    this.isJsx = isJsx || false;

    if (libs) {
      for (const [key, value] of libs) {
        this.files[key] = value;
      }
    }
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
    if (this.fileExists(name)) {
      return this.files[name];
    } else {
      return ''; // fallback, in case if file is not available
    }
  }

  getSourceFile(name) {
    return createSourceFile(
      name,
      this.readFile(name),
      ScriptTarget.Latest,
      /* setParentNodes */ true,
      getScriptKind(this.isJsx, name),
    );
  }
}
