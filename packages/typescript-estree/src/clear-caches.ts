import { clearWatchCaches } from './create-program/getWatchProgramsForProjects';
import { clearProgramCache as clearProgramCacheOriginal } from './parser';
import { clearTSConfigMatchCache } from './parseSettings/createParseSettings';
import { clearGlobCache } from './parseSettings/resolveProjectList';

/**
 * Clears all of the internal caches.
 * Generally you shouldn't need or want to use this
 */
export function clearCaches(): void {
  clearProgramCacheOriginal();
  clearWatchCaches();
  clearTSConfigMatchCache();
  clearGlobCache();
}

// TODO - delete this in next major
export const clearProgramCache = clearCaches();
