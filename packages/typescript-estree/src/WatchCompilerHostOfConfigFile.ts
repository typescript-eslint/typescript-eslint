// These types are internal to typescript

import * as ts from 'typescript'; // leave this as * as ts so people using util package don't need syntheticDefaultImports

interface DirectoryStructureHost {
  fileExists(path: string): boolean;
  readFile(path: string, encoding?: string): string | undefined;

  // TODO: GH#18217 Optional methods are frequently used as non-optional
  directoryExists?(path: string): boolean;
  getDirectories?(path: string): string[];
  readDirectory?(
    path: string,
    extensions?: ReadonlyArray<string>,
    exclude?: ReadonlyArray<string>,
    include?: ReadonlyArray<string>,
    depth?: number,
  ): string[];
  realpath?(path: string): string;

  createDirectory?(path: string): void;
  writeFile?(path: string, data: string, writeByteOrderMark?: boolean): void;
}

interface CachedDirectoryStructureHost extends DirectoryStructureHost {
  readDirectory(
    path: string,
    extensions?: ReadonlyArray<string>,
    exclude?: ReadonlyArray<string>,
    include?: ReadonlyArray<string>,
    depth?: number,
  ): string[];
}

interface WatchCompilerHostOfConfigFile<T extends ts.BuilderProgram>
  extends ts.WatchCompilerHostOfConfigFile<T> {
  onCachedDirectoryStructureHostCreate(
    host: CachedDirectoryStructureHost,
  ): void;
}

export { WatchCompilerHostOfConfigFile };
