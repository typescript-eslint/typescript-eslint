import { clearWatchCaches } from './create-program/getWatchProgramsForProjects';
import { clearProgramCache as clearProgramCacheOriginal } from './parser';
import {
  clearTSConfigMatchCache,
  clearTSServerProjectService,
} from './parseSettings/createParseSettings';
import { clearGlobCache } from './parseSettings/resolveProjectList';

/**
 * Clears all of the internal caches.
 * Generally you shouldn't need or want to use this.
 * Examples of intended uses:
 * - In tests to reset parser state to keep tests isolated.
 * - In custom lint tooling that iteratively lints one project at a time to prevent OOMs.
 */
export function clearCaches(): void {
  clearProgramCacheOriginal();
  clearWatchCaches();
  clearTSConfigMatchCache();
  clearTSServerProjectService();
  clearGlobCache();
}

// TODO - delete this in next major
export const clearProgramCache = clearCaches;
