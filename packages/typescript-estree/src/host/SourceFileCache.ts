import path from 'path';
import ts from 'typescript';
import { normaliseFilePath, NormalisedTSConfigPath, toPath } from './common';

interface CachedSourceFile {
  sourceFile: ts.SourceFile;
  refProjects: Set<NormalisedTSConfigPath>;
}

class SourceFileCache {
  private readonly sourceFileCache = new Map<ts.Path, CachedSourceFile>();

  public registerTSConfig(
    tsconfig: ts.ParsedCommandLine,
    tsconfigPath: NormalisedTSConfigPath,
  ): void {
    tsconfig.fileNames.forEach(fileName => {
      if (!this.getSourceFile(fileName, tsconfigPath)) {
        this.createSourceFile(fileName, tsconfigPath);
      }
    });
  }

  /**
   * @returns true if the file was created/updated, false if there were no changes
   */
  public createOrUpdateSourceFile(
    fileName: string,
    tsconfigPath: NormalisedTSConfigPath,
    contents: string,
  ): boolean {
    const filePath = normaliseFilePath(fileName, tsconfigPath);
    if (this.sourceFileCache.has(filePath)) {
      return this.updateSourceFile(fileName, tsconfigPath, contents);
    }

    this.createSourceFile(fileName, tsconfigPath, contents);
    return true;
  }

  private createSourceFile(
    fileName: string,
    tsconfigPath: NormalisedTSConfigPath,
    contents?: string,
  ): void {
    const filePath = normaliseFilePath(fileName, tsconfigPath);
    contents = contents || ts.sys.readFile(filePath);
    if (!contents) {
      throw new Error(`Unable to find file ${filePath}`);
    }

    const sourceFile = ts.createSourceFile(
      fileName,
      contents,
      ts.ScriptTarget.ESNext,
    );

    this.sourceFileCache.set(filePath, {
      sourceFile,
      refProjects: new Set([tsconfigPath]),
    });
  }

  /**
   * @returns true if the file was updated, false otherwise
   */
  private updateSourceFile(
    fileName: string,
    tsconfigPath: NormalisedTSConfigPath,
    contents: string,
  ): boolean {
    const filePath = normaliseFilePath(fileName, tsconfigPath);
    const entry = this.sourceFileCache.get(filePath);
    if (!entry) {
      throw new Error(
        `Attempting to update file that is not in the cache: ${filePath}`,
      );
    }

    if (entry.sourceFile.getText() === contents) {
      return false;
    }

    const sourceFile = ts.createSourceFile(
      fileName,
      contents,
      ts.ScriptTarget.ESNext,
    );

    this.sourceFileCache.set(filePath, {
      sourceFile,
      refProjects: new Set([...entry.refProjects, tsconfigPath]),
    });
    return true;
  }

  public fileExists(
    fileName: string,
    tsconfigPath: NormalisedTSConfigPath,
  ): boolean {
    return this.sourceFileCache.has(normaliseFilePath(fileName, tsconfigPath));
  }

  public readFile(
    fileName: string,
    tsconfigPath: NormalisedTSConfigPath,
  ): string | undefined {
    const filePath = normaliseFilePath(fileName, tsconfigPath);
    const cache = this.sourceFileCache.get(filePath);
    if (cache) {
      if (typeof cache === 'string') {
        return cache;
      }
      return cache.sourceFile.getText();
    }

    return ts.sys.readFile(filePath);
  }

  public getSourceFile(
    fileName: string,
    tsconfigPath: NormalisedTSConfigPath,
  ): ts.SourceFile | undefined {
    return this.getSourceFileByPath(
      fileName,
      toPath(fileName, path.dirname(tsconfigPath)),
      tsconfigPath,
    );
  }

  public getSourceFileByPath(
    _fileName: string,
    filePath: ts.Path,
    tsconfigPath: NormalisedTSConfigPath,
  ): ts.SourceFile | undefined {
    const entry = this.sourceFileCache.get(filePath);
    if (!entry) {
      return undefined;
    }

    entry.refProjects.add(tsconfigPath);

    return entry.sourceFile;
  }

  public onReleaseSourceFile(
    oldSourceFile: ts.SourceFile,
    tsconfigPath: NormalisedTSConfigPath,
  ): void {
    const filePath = normaliseFilePath(oldSourceFile.fileName, tsconfigPath);
    const entry = this.sourceFileCache.get(filePath);

    if (!entry) {
      return;
    }

    entry.refProjects.delete(tsconfigPath);
    if (entry.refProjects.size <= 0) {
      this.sourceFileCache.delete(filePath);
    }
  }

  public clear(): void {
    this.sourceFileCache.clear();
  }
}

export { SourceFileCache };
