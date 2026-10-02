import type {
  CreateSnapshotParams,
  Snapshot,
} from '@typescript/native/unstable/sync';

import { createFileSystemLayer } from '@typescript/native/unstable/fs';
import { API } from '@typescript/native/unstable/sync';
import { createHash } from 'node:crypto';
import path from 'node:path';
import * as ts from 'typescript';

import type { NativeProjectContext, NativeProjectService } from './types';

import { getCanonicalFileName } from '../create-program/shared';

const CLOSED_ERROR = 'The TypeScript native project service is closed.';

function startupError(error: unknown): Error {
  return new Error(
    `Failed to start the TypeScript native project service: ${error instanceof Error ? error.message : String(error)}`,
    { cause: error },
  );
}

function isNativeProcessFailure(error: unknown): boolean {
  return (
    error instanceof Error &&
    /EPIPE|Unexpected EOF while reading from child process/.test(error.message)
  );
}

export function toCompilerPath(filePath: string): string {
  return path
    .resolve(filePath)
    .replaceAll('\\', '/')
    .replace(/^[A-Z]:\//, drive => drive.toLowerCase());
}

function hashText(text: string): string {
  return createHash('sha1').update(text).digest('hex');
}

function hashFileOnDisk(compilerPath: string): string | undefined {
  const text = ts.sys.readFile(compilerPath);
  return text == null ? undefined : hashText(text);
}

export function createNativeProjectService(
  cwd = process.cwd(),
): NativeProjectService {
  const contentHashes = new Map<string, string>();
  const fileContexts = new Map<string, NativeProjectContext>();
  const fileProjects = new Map<string, string>();
  const openProjects = new Set<string>();
  let closed = false;
  let snapshot: Snapshot | undefined;

  function startAPI(): API {
    try {
      return new API({ cwd });
    } catch (error) {
      throw startupError(error);
    }
  }

  let api = startAPI();

  /** A crashed native process would otherwise fail every later file. */
  function restart(): void {
    try {
      api.close();
    } catch {
      // Intentionally ignored.
    }
    snapshot = undefined;
    contentHashes.clear();
    fileContexts.clear();
    fileProjects.clear();
    openProjects.clear();
    api = startAPI();
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
    fileContexts.set(getCanonicalFileName(compilerPath), context);
    return context;
  }

  function openFileInSnapshot(
    filePath: string,
    code: string,
  ): NativeProjectContext {
    const compilerPath = toCompilerPath(filePath);
    const cacheKey = getCanonicalFileName(compilerPath);
    const hash = hashText(code);
    const previous = contentHashes.get(cacheKey);
    const cachedContext = fileContexts.get(cacheKey);
    if (previous === hash && cachedContext) {
      return cachedContext;
    }
    const unchanged = (previous ?? hashFileOnDisk(compilerPath)) === hash;
    contentHashes.set(cacheKey, hash);
    const fileSystem = unchanged
      ? undefined
      : createFileSystemLayer([[compilerPath, code]]);
    const knownConfigFileName = fileProjects.get(cacheKey);
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
    return contextFor(nextSnapshot, configFileName, compilerPath);
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
      contentHashes.clear();

      if (failure) {
        throw failure;
      }
    },

    openFile(filePath, code): NativeProjectContext {
      assertOpen();
      try {
        return openFileInSnapshot(filePath, code);
      } catch (error) {
        if (isNativeProcessFailure(error)) {
          restart();
        }
        throw error;
      }
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

export function getNativeProjectService(cwd?: string): NativeProjectService {
  return (nativeProjectService ??= createNativeProjectService(cwd));
}
