import type * as ts from 'typescript/lib/tsserverlibrary';

const OPENED_FILE_CLEANUP_THROTTLE_MS = 250;

/**
 * Undocumented TypeScript methods wrapped to throttle cleanup after opening files.
 * TypeScript renamed cleanupAfterOpeningFile to cleanupProjectsAndScriptInfos in 5.5.
 * @see https://github.com/microsoft/TypeScript/blob/v6.0.3/src/server/editorServices.ts#L4809
 * @see https://github.com/microsoft/TypeScript/blob/v5.4.5/src/server/editorServices.ts#L3945
 */
interface ProjectServiceInternals {
  cleanupAfterOpeningFile?: (...args: unknown[]) => void;
  cleanupProjectsAndScriptInfos?: (...args: unknown[]) => void;
  openClientFileWithNormalizedPath?: (...args: unknown[]) => unknown;
}

/**
 * Opening a file scans every open file and script info for cleanup.
 * ESLint opens every linted file and never closes them, making that quadratic.
 * @see https://github.com/typescript-eslint/typescript-eslint/issues/9571
 */
export function throttleOpenedFileCleanup(
  service: ts.server.ProjectService,
): void {
  const internals = service as unknown as ProjectServiceInternals;
  const cleanupKey = internals.cleanupProjectsAndScriptInfos
    ? 'cleanupProjectsAndScriptInfos'
    : 'cleanupAfterOpeningFile';
  const cleanup = internals[cleanupKey];
  const open = internals.openClientFileWithNormalizedPath;
  if (!cleanup || !open) {
    return;
  }

  let lastCleanup = -Infinity;
  let opening = false;

  internals[cleanupKey] = (...args) => {
    const now = performance.now();
    if (opening && now - lastCleanup < OPENED_FILE_CLEANUP_THROTTLE_MS) {
      return;
    }

    lastCleanup = now;
    cleanup.apply(service, args);
  };

  internals.openClientFileWithNormalizedPath = (...args) => {
    opening = true;
    try {
      return open.apply(service, args);
    } finally {
      opening = false;
    }
  };
}
