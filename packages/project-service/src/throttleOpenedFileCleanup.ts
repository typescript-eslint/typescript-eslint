import type * as ts from 'typescript/lib/tsserverlibrary';

const OPENED_FILE_CLEANUP_THROTTLE_MS = 250;

type Cleanup = (...args: unknown[]) => void;

/**
 * Undocumented TypeScript methods wrapped to throttle cleanup after opening files.
 * TypeScript renamed cleanupAfterOpeningFile to cleanupProjectsAndScriptInfos in 5.5.
 * @see https://github.com/microsoft/TypeScript/blob/v6.0.3/src/server/editorServices.ts#L4809
 * @see https://github.com/microsoft/TypeScript/blob/v5.4.5/src/server/editorServices.ts#L3945
 */
type ProjectServiceInternals = (
  | { cleanupAfterOpeningFile: Cleanup }
  | { cleanupProjectsAndScriptInfos: Cleanup }
) & {
  openClientFileWithNormalizedPath: (...args: unknown[]) => unknown;
};

/**
 * Opening a file scans every open file and script info for cleanup.
 * ESLint opens every linted file and never closes them, making that quadratic.
 * @see https://github.com/typescript-eslint/typescript-eslint/issues/9571
 */
export function throttleOpenedFileCleanup(
  service: ts.server.ProjectService,
): void {
  const internals = service as unknown as ProjectServiceInternals;
  const open = internals.openClientFileWithNormalizedPath;

  let lastCleanup = -Infinity;
  let opening = false;

  function throttle(cleanup: Cleanup) {
    return (...args: unknown[]) => {
      const now = performance.now();
      if (opening && now - lastCleanup < OPENED_FILE_CLEANUP_THROTTLE_MS) {
        return;
      }

      lastCleanup = now;
      cleanup.apply(service, args);
    };
  }

  if ('cleanupProjectsAndScriptInfos' in internals) {
    internals.cleanupProjectsAndScriptInfos = throttle(
      internals.cleanupProjectsAndScriptInfos,
    );
  } else {
    internals.cleanupAfterOpeningFile = throttle(
      internals.cleanupAfterOpeningFile,
    );
  }

  internals.openClientFileWithNormalizedPath = (...args) => {
    opening = true;
    try {
      return open.apply(service, args);
    } finally {
      opening = false;
    }
  };
}
