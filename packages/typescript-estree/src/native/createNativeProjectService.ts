import type {
  CreateSnapshotParams,
  Project,
  Snapshot,
} from '@typescript/native/unstable/sync';

import { API } from '@typescript/native/unstable/sync';
import path from 'node:path';
import * as ts from 'typescript';

import type { NativeProjectContext, NativeProjectService } from './types';

const CLOSED_ERROR = 'The TypeScript native project service is closed.';

function startupError(error: unknown): Error {
  return new Error(
    `Failed to start the TypeScript native project service: ${error instanceof Error ? error.message : String(error)}`,
    { cause: error },
  );
}

/**
 * The compiler echoes this back as `SourceFile#fileName`, and normalizes both
 * the separators and a Windows drive letter on the way.
 */
function toCompilerPath(filePath: string): string {
  return path
    .resolve(filePath)
    .replaceAll('\\', '/')
    .replace(/^[A-Z]:\//, drive => drive.toLowerCase());
}

function toCacheKey(compilerPath: string): string {
  return process.platform === 'win32'
    ? compilerPath.toLowerCase()
    : compilerPath;
}

function verifySupportedConfig(project: Project): void {
  if (project.parsedCommandLine.projectReferences?.length) {
    throw new Error('TypeScript native project references are not supported.');
  }
  // Native carries no `plugins`, nor a `raw` showing one an extended config set.
  const parsed = ts.getParsedCommandLineOfConfigFile(
    project.configFileName,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: () => undefined,
    },
  );
  if (Array.isArray(parsed?.options.plugins) && parsed.options.plugins.length) {
    throw new Error('TypeScript native TSConfig plugins are not supported.');
  }
}

export function createNativeProjectService(
  cwd = process.cwd(),
): NativeProjectService {
  const overlays = new Map<string, string>();
  const syncedFiles = new Map<string, string>();
  const verifiedConfigs = new Set<string>();
  const fileContexts = new Map<string, NativeProjectContext>();
  const fileProjects = new Map<string, string>();
  const openProjects = new Set<string>();
  let closed = false;
  let snapshot: Snapshot | undefined;
  let api: API;

  try {
    api = new API({
      cwd,
      fs: {
        fileExists: fileName =>
          overlays.has(toCacheKey(toCompilerPath(fileName))) ? true : undefined,
        readFile: fileName =>
          overlays.get(toCacheKey(toCompilerPath(fileName))),
      },
    });
  } catch (error) {
    throw startupError(error);
  }

  function assertOpen(): void {
    if (closed) {
      throw new Error(CLOSED_ERROR);
    }
  }

  function replaceSnapshot(params: CreateSnapshotParams): Snapshot {
    const previousSnapshot = snapshot;
    let nextSnapshot: Snapshot;
    try {
      nextSnapshot = previousSnapshot
        ? previousSnapshot.update(params)
        : api.createSnapshot(params);
    } catch (error) {
      if (!previousSnapshot) {
        throw startupError(error);
      }
      throw error;
    }
    snapshot = nextSnapshot;
    fileContexts.clear();
    previousSnapshot?.dispose();
    return nextSnapshot;
  }

  function contextFor(
    nextSnapshot: Snapshot,
    configFileName: string,
    compilerPath: string,
  ): NativeProjectContext {
    const project = nextSnapshot.getConfiguredProject(configFileName);
    const sourceFile = project?.program.getSourceFile(compilerPath);
    if (!project || !sourceFile) {
      throw new Error(
        `The TypeScript native project did not contain '${compilerPath}'.`,
      );
    }
    const context = {
      checker: project.checker,
      program: project.program,
      project,
      sourceFile,
    };
    fileContexts.set(toCacheKey(compilerPath), context);
    return context;
  }

  const service: NativeProjectService = {
    close(): void {
      if (closed) {
        return;
      }
      closed = true;

      let failure: Error | undefined;
      const attempt = (cleanup: () => void): void => {
        try {
          cleanup();
        } catch (error) {
          failure ??= error instanceof Error ? error : new Error(String(error));
        }
      };

      if (openProjects.size) {
        attempt(() => {
          replaceSnapshot({ closeProjects: [...openProjects] });
        });
      }
      attempt(() => snapshot?.dispose());
      attempt(() => {
        api.close();
      });
      fileContexts.clear();
      fileProjects.clear();
      openProjects.clear();
      overlays.clear();
      syncedFiles.clear();

      if (failure) {
        throw failure;
      }
    },

    openFile(filePath, code): NativeProjectContext {
      assertOpen();
      const compilerPath = toCompilerPath(filePath);
      const cacheKey = toCacheKey(compilerPath);
      const cachedContext = fileContexts.get(cacheKey);
      if (syncedFiles.get(cacheKey) === code && cachedContext) {
        return cachedContext;
      }
      const previousSynced = syncedFiles.get(cacheKey);

      // Once an overlay exists the server has read it, so a matching disk file
      // would leave that overlay stale — hence the `has` check.
      const servedFromDisk =
        !overlays.has(cacheKey) && ts.sys.readFile(compilerPath) === code;
      if (!servedFromDisk) {
        overlays.set(cacheKey, code);
      }
      syncedFiles.set(cacheKey, code);
      let knownConfigFileName = fileProjects.get(cacheKey);

      if (!knownConfigFileName && snapshot && openProjects.size) {
        for (const candidate of openProjects) {
          if (
            snapshot
              .getConfiguredProject(candidate)
              ?.program.getSourceFile(compilerPath)
          ) {
            knownConfigFileName = candidate;
            fileProjects.set(cacheKey, candidate);
            break;
          }
        }
      }
      if (knownConfigFileName) {
        const unchanged = servedFromDisk || previousSynced === code;
        return contextFor(
          unchanged && snapshot
            ? snapshot
            : replaceSnapshot({
                ensurePrograms: true,
                fileNotifications: { changed: [compilerPath] },
              }),
          knownConfigFileName,
          compilerPath,
        );
      }

      const discoverySnapshot = replaceSnapshot({
        openFiles: [compilerPath],
      });
      let configFileName: string;
      let nextSnapshot: Snapshot;
      try {
        const discoveredProject =
          discoverySnapshot.getDefaultProjectForFile(compilerPath);
        if (!discoveredProject) {
          throw new Error(
            `No TypeScript native project was located for '${compilerPath}'.`,
          );
        }
        configFileName = discoveredProject.configFileName;
        if (!ts.sys.fileExists(configFileName)) {
          throw new Error(
            `No TypeScript native configured project was located for '${compilerPath}'.`,
          );
        }
        if (!verifiedConfigs.has(configFileName)) {
          verifySupportedConfig(discoveredProject);
          verifiedConfigs.add(configFileName);
        }
        nextSnapshot = replaceSnapshot({
          closeFiles: [compilerPath],
          ensurePrograms: true,
          openProjects: openProjects.has(configFileName)
            ? undefined
            : [configFileName],
        });
      } catch (error) {
        // Leave no half-open file behind, without masking the real failure.
        try {
          replaceSnapshot({ closeFiles: [compilerPath] });
        } catch {
          // Intentionally ignored.
        }
        throw error;
      }
      openProjects.add(configFileName);
      fileProjects.set(cacheKey, configFileName);
      return contextFor(nextSnapshot, configFileName, compilerPath);
    },
  };
  return service;
}

let nativeProjectService: NativeProjectService | undefined;

export function clearNativeProjectService(): void {
  const service = nativeProjectService;
  nativeProjectService = undefined;
  service?.close();
}

/** One process is shared, so only the first `cwd` passed takes effect. */
export function getNativeProjectService(cwd?: string): NativeProjectService {
  return (nativeProjectService ??= createNativeProjectService(cwd));
}
