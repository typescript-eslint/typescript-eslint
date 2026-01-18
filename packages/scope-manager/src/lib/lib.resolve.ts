import type { Lib } from '@typescript-eslint/types';

import type { LibDefinition } from '../variable';

import { lib as TSLibraries } from './index';

/**
 * Resolves the provided `lib` option into a complete, deduplicated set of
 * `LibDefinition`s, including all transitive dependencies.
 *
 * This function is responsible for:
 * - Validating lib names passed via the parser options
 * - Resolving lib names to their corresponding LibDefinition objects
 * - Expanding lib dependencies (lib.libs)
 * - Deduplicating results via Set semantics
 *
 * It intentionally performs no side effects and does not interact with scopes.
 */
export function resolveLibDefinitionsWithDependencies(
  libs: Lib[],
): Set<LibDefinition> {
  const resolvedLibs = new Set<LibDefinition>();

  // Resolve the top-level lib names into LibDefinition objects
  for (const lib of libs) {
    const definition = TSLibraries.get(lib);
    if (!definition) {
      throw new Error(`Invalid value for lib provided: ${lib}`);
    }

    resolvedLibs.add(definition);
  }

  // Expand transitive lib dependencies.
  // New entries added to the Set during iteration will be visited exactly once.
  for (const lib of resolvedLibs) {
    for (const dependency of lib.libs) {
      resolvedLibs.add(dependency);
    }
  }

  return resolvedLibs;
}
