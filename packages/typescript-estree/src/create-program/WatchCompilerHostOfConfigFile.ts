// These types are internal to TS.
// They have been trimmed down to only include the relevant bits
// We use some special internal TS apis to help us do our parsing flexibly

import * as ts from 'typescript';

// https://github.com/microsoft/TypeScript/blob/b84e65db4ea5c39dbaa2ccd6594efe4653318251/src/compiler/watchUtilities.ts#L6-L18
interface DirectoryStructureHost {
  readDirectory?(
    path: string,
    extensions?: ReadonlyArray<string>,
    exclude?: ReadonlyArray<string>,
    include?: ReadonlyArray<string>,
    depth?: number,
  ): string[];
}

// https://github.com/microsoft/TypeScript/blob/b84e65db4ea5c39dbaa2ccd6594efe4653318251/src/compiler/watchUtilities.ts#L25-L35
interface CachedDirectoryStructureHost extends DirectoryStructureHost {
  readDirectory(
    path: string,
    extensions?: ReadonlyArray<string>,
    exclude?: ReadonlyArray<string>,
    include?: ReadonlyArray<string>,
    depth?: number,
  ): string[];
}

// https://github.com/microsoft/TypeScript/blob/5d36aab06f12b0a3ba6197eb14e98204ec0195fb/src/compiler/watch.ts#L548-L554
interface WatchCompilerHostOfConfigFile<T extends ts.BuilderProgram>
  extends ts.WatchCompilerHostOfConfigFile<T> {
  onCachedDirectoryStructureHostCreate(
    host: CachedDirectoryStructureHost,
  ): void;
  extraFileExtensions?: readonly ts.FileExtensionInfo[];
}

export { WatchCompilerHostOfConfigFile };
