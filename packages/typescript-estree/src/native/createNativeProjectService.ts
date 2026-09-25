import type {
  CreateSnapshotParams,
  Project,
  Snapshot,
} from '@typescript/native/unstable/sync';

import { createFileSystemLayer } from '@typescript/native/unstable/fs';
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
  const { options, projectReferences } = project.parsedCommandLine;
  if (projectReferences?.length) {
    throw new Error('TypeScript native project references are not supported.');
  }
  if (options.plugins?.length) {
    throw new Error('TypeScript native TSConfig plugins are not supported.');
  }
}

export function createNativeProjectService(
  cwd = process.cwd(),
): NativeProjectService {
  const contents = new Map<string, string>();
  const fileContexts = new Map<string, NativeProjectContext>();
  const fileProjects = new Map<string, string>();
  const openProjects = new Set<string>();
  let closed = false;
  let snapshot: Snapshot | undefined;
  let api: API;

  try {
    api = new API({ cwd });
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
      contents.clear();

      if (failure) {
        throw failure;
      }
    },

    openFile(filePath, code): NativeProjectContext {
      assertOpen();
      const compilerPath = toCompilerPath(filePath);
      const cacheKey = toCacheKey(compilerPath);
      const previous = contents.get(cacheKey);
      const cachedContext = fileContexts.get(cacheKey);
      if (previous === code && cachedContext) {
        return cachedContext;
      }
      const unchanged = (previous ?? ts.sys.readFile(compilerPath)) === code;
      contents.set(cacheKey, code);
      const fileSystem = unchanged
        ? undefined
        : createFileSystemLayer([[compilerPath, code]]);
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
        return contextFor(
          unchanged && snapshot
            ? snapshot
            : replaceSnapshot({
                ensurePrograms: true,
                fileNotifications: { changed: [compilerPath] },
                fileSystem,
              }),
          knownConfigFileName,
          compilerPath,
        );
      }

      const discoverySnapshot = replaceSnapshot({
        fileSystem,
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
        if (!openProjects.has(configFileName)) {
          verifySupportedConfig(discoveredProject);
        }
        nextSnapshot = replaceSnapshot({
          closeFiles: [compilerPath],
          ensurePrograms: true,
          openProjects: openProjects.has(configFileName)
            ? undefined
            : [configFileName],
        });
      } catch (error) {
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
