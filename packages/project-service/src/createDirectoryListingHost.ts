import type * as ts from 'typescript/lib/tsserverlibrary';

import fs from 'node:fs';
import path from 'node:path';

interface DirectoryEntries {
  directories: string[];
  files: string[];
}

/**
 * TypeScript's cached directory structure host lists each directory it visits
 * by calling `readDirectory(directory, undefined, undefined, ['*.*'])` and then
 * `getDirectories(directory)`. On `ts.sys`, that `readDirectory` call runs a full
 * pattern match, including a `realpath` and compiling regular expressions, and
 * `getDirectories` then reads the same directory again.
 * @see https://github.com/microsoft/TypeScript/blob/v6.0.3/src/compiler/watchUtilities.ts#L166
 */
export function createDirectoryListingHost(
  sys: ts.System,
): Pick<ts.System, 'getDirectories' | 'readDirectory'> {
  let lastListing: { directory: string; entries: DirectoryEntries } | undefined;

  return {
    getDirectories(directory) {
      const listing = lastListing;
      lastListing = undefined;

      return listing?.directory === directory
        ? listing.entries.directories
        : sys.getDirectories(directory);
    },
    readDirectory(directory, extensions, exclude, include, depth) {
      lastListing = undefined;

      if (
        extensions ||
        exclude ||
        depth != null ||
        include?.length !== 1 ||
        include[0] !== '*.*'
      ) {
        return sys.readDirectory(directory, extensions, exclude, include, depth);
      }

      const entries = readDirectoryEntries(directory);
      lastListing = { directory, entries };

      // '*.*' matches the files directly in the directory that have a '.' in their name.
      const directoryPath = directory.replaceAll('\\', '/');
      return entries.files
        .filter(file => file.includes('.'))
        .map(file => path.posix.join(directoryPath, file));
    },
  };
}

function readDirectoryEntries(directory: string): DirectoryEntries {
  const entries: DirectoryEntries = { directories: [], files: [] };

  let dirents: fs.Dirent[];
  try {
    dirents = fs.readdirSync(directory || '.', { withFileTypes: true });
  } catch {
    return entries;
  }

  for (const dirent of dirents) {
    const stat = dirent.isSymbolicLink()
      ? statOrUndefined(path.join(directory, dirent.name))
      : dirent;

    if (stat?.isFile()) {
      entries.files.push(dirent.name);
    } else if (stat?.isDirectory()) {
      entries.directories.push(dirent.name);
    }
  }

  entries.files.sort();
  entries.directories.sort();

  return entries;
}

function statOrUndefined(filePath: string): fs.Stats | undefined {
  try {
    return fs.statSync(filePath, { throwIfNoEntry: false });
  } catch {
    return undefined;
  }
}
