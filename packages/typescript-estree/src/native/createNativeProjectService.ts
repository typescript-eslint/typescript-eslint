import type {
  CreateSnapshotParams,
  Snapshot,
} from '@typescript/native/unstable/sync';

import { createFileSystemLayer } from '@typescript/native/unstable/fs';
import { API } from '@typescript/native/unstable/sync';
import path from 'node:path';

import type { NativeProjectContext, NativeProjectService } from './types';

import { getCanonicalFileName } from '../create-program/shared';

const CLOSED_ERROR = 'The TypeScript native project service is closed.';

function startupError(error: unknown): Error {
  return new Error(
    `Failed to start the TypeScript native project service: ${error instanceof Error ? error.message : String(error)}`,
    { cause: error },
  );
}

function notFoundError(filePath: string): Error {
  return new Error(
    `${filePath} was not found by the project service. Consider including it in the tsconfig.json.`,
  );
}

function isNativeProcessFailure(error: unknown): boolean {
  return (
    error instanceof Error &&
    /EBADF|EPIPE|Unexpected EOF while reading from child process/.test(
      error.message,
    )
  );
}

export function toCompilerPath(filePath: string): string {
  return path
    .resolve(filePath)
    .replaceAll('\\', '/')
    .replace(/^[A-Z]:\//, drive => drive.toLowerCase());
}

export function createNativeProjectService(
  cwd = process.cwd(),
): NativeProjectService {
  const fileContexts = new Map<string, NativeProjectContext>();
  const fileProjects = new Map<string, string>();
  const openProjects = new Set<string>();
  let closed = false;
  let snapshot: Snapshot | undefined;

  function startAPI() {
    try {
      return new API({ cwd });
    } catch (error) {
      throw startupError(error);
    }
  }

  let api = startAPI();

  function reset() {
    try {
      api.close();
    } catch {
      // Intentionally ignored.
    }
    snapshot = undefined;
    fileContexts.clear();
    fileProjects.clear();
    openProjects.clear();
  }

  function replaceSnapshot(params: CreateSnapshotParams) {
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
  ) {
    const project = nextSnapshot.getConfiguredProject(configFileName);
    const sourceFile = project?.program.getSourceFile(compilerPath);
    if (!project || !sourceFile) {
      throw new Error(
        `The TypeScript native project did not contain '${compilerPath}'.`,
      );
    }
    const context = { project, sourceFile };
    fileContexts.set(getCanonicalFileName(compilerPath), context);
    return context;
  }

  function withCode(
    context: NativeProjectContext,
    compilerPath: string,
    code: string,
  ) {
    return context.sourceFile.text === code
      ? context
      : contextFor(
          replaceSnapshot({
            ensurePrograms: true,
            fileSystem: createFileSystemLayer([[compilerPath, code]]),
          }),
          context.project.configFileName,
          compilerPath,
        );
  }

  function openFileInSnapshot(filePath: string, code: string) {
    const compilerPath = toCompilerPath(filePath);
    const cacheKey = getCanonicalFileName(compilerPath);
    const cachedContext = fileContexts.get(cacheKey);
    if (cachedContext) {
      return withCode(cachedContext, compilerPath, code);
    }
    const knownConfigFileName = fileProjects.get(cacheKey);
    if (knownConfigFileName && snapshot) {
      return withCode(
        contextFor(snapshot, knownConfigFileName, compilerPath),
        compilerPath,
        code,
      );
    }

    const discoverySnapshot = replaceSnapshot({
      fileSystem: createFileSystemLayer([[compilerPath, code]]),
      openFiles: [compilerPath],
    });
    let configFileName: string | undefined;
    let nextSnapshot: Snapshot;
    try {
      configFileName =
        discoverySnapshot.getDefaultProjectForFile(
          compilerPath,
        )?.configFileName;
      if (!configFileName) {
        throw notFoundError(filePath);
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
    if (!openProjects.has(configFileName)) {
      openProjects.add(configFileName);
      for (const fileName of nextSnapshot.getConfiguredProject(configFileName)
        ?.parsedCommandLine.fileNames ?? []) {
        const fileKey = getCanonicalFileName(fileName);
        if (!fileProjects.has(fileKey)) {
          fileProjects.set(fileKey, configFileName);
        }
      }
    }
    fileProjects.set(cacheKey, configFileName);
    return withCode(
      contextFor(nextSnapshot, configFileName, compilerPath),
      compilerPath,
      code,
    );
  }

  return {
    close() {
      if (!closed) {
        closed = true;
        reset();
      }
    },

    openFile(filePath, code) {
      if (closed) {
        throw new Error(CLOSED_ERROR);
      }
      try {
        return openFileInSnapshot(filePath, code);
      } catch (error) {
        if (!isNativeProcessFailure(error)) {
          throw error;
        }
        reset();
        api = startAPI();
        return openFileInSnapshot(filePath, code);
      }
    },
  };
}

let nativeProjectService: NativeProjectService | undefined;

export function clearNativeProjectService(): void {
  const service = nativeProjectService;
  nativeProjectService = undefined;
  service?.close();
}

export function getNativeProjectService(cwd?: string): NativeProjectService {
  return (nativeProjectService ??= createNativeProjectService(cwd));
}
