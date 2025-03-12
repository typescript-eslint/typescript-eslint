import debug from 'debug';
import { sync as globSync } from 'fast-glob';
import isGlob from 'is-glob';

import type { CanonicalPath } from '../create-program/shared';
import type { TSESTreeOptions } from '../parser-options';

import {
  createHash,
  ensureAbsolutePath,
  getCanonicalFileName,
} from '../create-program/shared';
import {
  DEFAULT_TSCONFIG_CACHE_DURATION_SECONDS,
  ExpiringCache,
} from './ExpiringCache';

const log = debug(
  'typescript-eslint:typescript-estree:parseSettings:resolveProjectList',
);

let RESOLUTION_CACHE: ExpiringCache<
  string,
  ReadonlyMap<CanonicalPath, string>
> | null = null;

export function clearGlobCache(): void {
  RESOLUTION_CACHE?.clear();
}

/**
 * Normalizes, sanitizes, resolves and filters the provided project paths
 */
export function resolveProjectList(
  options: Readonly<{
    cacheLifetime?: TSESTreeOptions['cacheLifetime'];
    project: string[] | null;
    projectFolderIgnoreList: TSESTreeOptions['projectFolderIgnoreList'];
    singleRun: boolean;
    tsconfigRootDir: string;
  }>,
): ReadonlyMap<CanonicalPath, string> {
  const sanitizedProjects: string[] = [];

  // Normalize and sanitize the project paths
  if (options.project != null) {
    for (const project of options.project) {
      if (typeof project === 'string') {
        sanitizedProjects.push(project);
      }
    }
  }

  if (sanitizedProjects.length === 0) {
    return new Map();
  }

  const projectFolderIgnoreList = (
    options.projectFolderIgnoreList ?? ['**/node_modules/**']
  )
    .filter(folder => typeof folder === 'string')
    // prefix with a ! for not match glob
    .map(folder => (folder.startsWith('!') ? folder : `!${folder}`));

  const cacheKey = getHash({
    project: sanitizedProjects,
    projectFolderIgnoreList,
    tsconfigRootDir: options.tsconfigRootDir,
  });
  if (RESOLUTION_CACHE == null) {
    // note - we initialize the global cache based on the first config we encounter.
    //        this does mean that you can't have multiple lifetimes set per folder
    //        I doubt that anyone will really bother reconfiguring this, let alone
    //        try to do complicated setups, so we'll deal with this later if ever.
    RESOLUTION_CACHE = new ExpiringCache(
      options.singleRun
        ? 'Infinity'
        : (options.cacheLifetime?.glob ??
          DEFAULT_TSCONFIG_CACHE_DURATION_SECONDS),
    );
  } else {
    const cached = RESOLUTION_CACHE.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Transform glob patterns into paths
  const nonGlobProjects = sanitizedProjects.filter(project => !isGlob(project));
  const globProjects = sanitizedProjects.filter(project => isGlob(project));

  let globProjectPaths: string[] = [];

  if (globProjects.length > 0) {
    // Although fast-glob supports multiple patterns, fast-glob returns arbitrary order of results
    // to improve performance. To ensure the order is correct, we need to call fast-glob for each pattern
    // separately and then concatenate the results in patterns' order.
    globProjectPaths = globProjects.flatMap(pattern =>
      globSync(pattern, {
        cwd: options.tsconfigRootDir,
        ignore: projectFolderIgnoreList,
      }),
    );
  }

  const uniqueCanonicalProjectPaths = new Map(
    [...nonGlobProjects, ...globProjectPaths].map(project => [
      getCanonicalFileName(
        ensureAbsolutePath(project, options.tsconfigRootDir),
      ),
      ensureAbsolutePath(project, options.tsconfigRootDir),
    ]),
  );

  log(
    'parserOptions.project (excluding ignored) matched projects: %s',
    uniqueCanonicalProjectPaths,
  );

  RESOLUTION_CACHE.set(cacheKey, uniqueCanonicalProjectPaths);
  return uniqueCanonicalProjectPaths;
}

function getHash({
  project,
  projectFolderIgnoreList,
  tsconfigRootDir,
}: Readonly<{
  project: readonly string[];
  projectFolderIgnoreList: readonly string[];
  tsconfigRootDir: string;
}>): string {
  // create a stable representation of the config
  const hashObject = {
    tsconfigRootDir,
    // the project order does matter and can impact the resolved globs
    project,
    // the ignore order won't doesn't ever matter
    projectFolderIgnoreList: [...projectFolderIgnoreList].sort(),
  };

  return createHash(JSON.stringify(hashObject));
}

/**
 * Exported for testing purposes only
 * @internal
 */
export function clearGlobResolutionCache(): void {
  RESOLUTION_CACHE?.clear();
  RESOLUTION_CACHE = null;
}
