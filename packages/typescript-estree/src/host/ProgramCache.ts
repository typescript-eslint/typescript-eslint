import path from 'path';
import ts from 'typescript';
import {
  getCanonicalFileName,
  noop,
  NormalisedTSConfigPath,
  normaliseTSConfigPath,
  TSConfigPath,
} from './common';
import { parseConfigFile } from './parseConfigFile';
import { SourceFileCache } from './SourceFileCache';

interface CachedProgram {
  invalidated: boolean;
  program?: ts.Program;
  timeoutId?: NodeJS.Timeout;
}

const INVALIDATION_TIMEOUT_MS = 10;

class ProgramCache {
  private readonly programCache = new Map<
    NormalisedTSConfigPath,
    CachedProgram
  >();
  private readonly sourceFileCache = new SourceFileCache();

  /**
   * Gets the current program for the given tsconfig path
   */
  public getProgram(tsconfigPath: TSConfigPath): CachedProgram {
    const normalisedTSConfigPath = normaliseTSConfigPath(tsconfigPath);
    return this.getProgramNormalised(normalisedTSConfigPath);
  }
  private getProgramNormalised(
    tsconfigPath: NormalisedTSConfigPath,
  ): CachedProgram {
    const entry = this.programCache.get(tsconfigPath);
    if (!entry) {
      return { invalidated: true };
    }

    return entry;
  }

  public createProgram(
    tsconfigPath: TSConfigPath,
    oldProgram?: ts.Program,
  ): ts.Program {
    const normalisedTSConfigPath = normaliseTSConfigPath(tsconfigPath);
    // ensure the old program is invalidated if it exists
    this.invalidateProgram(this.getProgramNormalised(normalisedTSConfigPath));

    const tsconfig = parseConfigFile(normalisedTSConfigPath);

    this.sourceFileCache.registerTSConfig(tsconfig, normalisedTSConfigPath);

    const createProgramOptions = this.createProgramOptions(
      tsconfig,
      normalisedTSConfigPath,
    );
    createProgramOptions.oldProgram = oldProgram;
    const program = ts.createProgram(createProgramOptions);

    const entry: CachedProgram = {
      program,
      invalidated: false,
    };
    this.programCache.set(normalisedTSConfigPath, entry);
    // schedule the invalidation of the program so we can handle newly created files
    this.scheduleInvalidateProgram(entry);

    return program;
  }

  private createProgramOptions(
    tsconfig: ts.ParsedCommandLine,
    tsconfigPath: NormalisedTSConfigPath,
  ): ts.CreateProgramOptions {
    const compilerHost: ts.CompilerHost = {
      getSourceFile: fileName =>
        this.sourceFileCache.getSourceFile(fileName, tsconfigPath),
      getSourceFileByPath: (fileName, filePath) =>
        this.sourceFileCache.getSourceFileByPath(
          fileName,
          filePath,
          tsconfigPath,
        ),
      getCanonicalFileName,
      useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
      getNewLine: () => ts.sys.newLine,
      getDefaultLibFileName: options => {
        return path.join(
          path.dirname(path.normalize(ts.sys.getExecutingFilePath())),
          ts.getDefaultLibFileName(options),
        );
      },
      writeFile: noop,
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      fileExists: filePath =>
        this.sourceFileCache.fileExists(filePath, tsconfigPath),
      readFile: filePath =>
        this.sourceFileCache.readFile(filePath, tsconfigPath),
      realpath: ts.sys.realpath,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
      readDirectory: ts.sys.readDirectory,
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore - interal TS api - https://github.com/microsoft/TypeScript/blob/dd58bfc51417d0a037ea75fe8e8cd690ee9950eb/src/compiler/types.ts#L5469
      onReleaseOldSourceFile: this.sourceFileCache.onReleaseSourceFile,
    };

    const createProgramOptions: ts.CreateProgramOptions = {
      host: compilerHost,
      options: tsconfig.options,
      rootNames: tsconfig.fileNames,
    };

    return createProgramOptions;
  }

  public createOrUpdateSourceFile(
    contents: string,
    filePath: string,
    tsconfigPath: string,
  ): void {
    const normalisedTSConfigPath = normaliseTSConfigPath(tsconfigPath);
    if (
      this.sourceFileCache.createOrUpdateSourceFile(
        filePath,
        normalisedTSConfigPath,
        contents,
      )
    ) {
      // invalidate the program because the source code changed
      this.invalidateProgram(this.getProgramNormalised(normalisedTSConfigPath));
    }
  }

  public clear(): void {
    this.programCache.clear();
    this.sourceFileCache.clear();
  }

  private scheduleInvalidateProgram(entry: CachedProgram): void {
    if (entry.invalidated) {
      return;
    }

    if (entry.timeoutId !== undefined) {
      clearTimeout(entry.timeoutId);
    }

    entry.timeoutId = setTimeout(() => {
      this.invalidateProgram(entry);
    }, INVALIDATION_TIMEOUT_MS);
  }
  private invalidateProgram(entry: CachedProgram): void {
    if (entry.invalidated) {
      return;
    }

    if (entry.timeoutId !== undefined) {
      clearTimeout(entry.timeoutId);
    }

    entry.invalidated = true;
    delete entry.timeoutId;
  }
}

export { ProgramCache };
