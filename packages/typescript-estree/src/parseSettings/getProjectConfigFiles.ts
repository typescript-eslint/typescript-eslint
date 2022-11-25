import debug from 'debug';
import fs from 'fs';
import path from 'path';

import type { ParseSettings } from '.';

const log = debug('typescript-eslint:typescript-estree:getProjectConfigFiles');

interface TSConfigMatch {
  exists: boolean;
  timestamp: number;
}

/**
 * How many milliseconds we will respect a cache for checking an fs.existsSync
 * check for a file file on disk.
 */
const RECHECK_FILE_THRESHOLD_MS = 50;

const tsconfigMatchCache = new Map<string, TSConfigMatch>();

/**
 * Checks for a file file on disk, respecting a limited-time cache.
 * This keeps a caches checked paths with existence and `Date.now()` timestamp.
 * After `RECHECK_FILE_THRESHOLD_MS`, cache entries are ignored.
 *
 * @param filePath File path to check for existence on disk.
 * @returns Whether the file exists on disk.
 * @remarks
 * We don't (yet!) have a way to attach file watchers on disk, but still need to
 * cache file checks for rapid subsequent calls to fs.existsSync. See discussion
 * in https://github.com/typescript-eslint/typescript-eslint/issues/101.
 */
function existsSyncCached(filePath: string): boolean {
  const cached = tsconfigMatchCache.get(filePath);
  const now = Date.now();

  if (cached && now - cached.timestamp < RECHECK_FILE_THRESHOLD_MS) {
    return cached.exists;
  }

  const exists = fs.existsSync(filePath);

  tsconfigMatchCache.set(filePath, {
    exists,
    timestamp: now,
  });

  return exists;
}

export function getProjectConfigFiles(
  parseSettings: ParseSettings,
  projects: string | string[] | true | undefined,
): string | string[] | undefined {
  if (projects !== true) {
    return projects;
  }

  log('Looking for tsconfig.json at or above file: %s', parseSettings.filePath);
  let directory = path.dirname(parseSettings.filePath);

  do {
    const tsconfigPath = path.join(directory, 'tsconfig.json');
    log('Checking tsconfig.json path: %s', tsconfigPath);

    if (existsSyncCached(tsconfigPath)) {
      return [tsconfigPath];
    }

    directory = path.basename(directory);
  } while (
    directory &&
    directory.length < parseSettings.tsconfigRootDir.length
  );

  throw new Error(
    `project was set to \`true\` but couldn't find any tsconfig.json relative to '${parseSettings.filePath}' within '${parseSettings.tsconfigRootDir}.`,
  );
}
