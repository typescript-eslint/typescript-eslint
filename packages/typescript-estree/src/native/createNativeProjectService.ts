import type { Project, Snapshot } from '@typescript/native/unstable/sync';

import nativePackage from '@typescript/native/package.json';
import { SyntaxKind } from '@typescript/native/unstable/ast';
import { API } from '@typescript/native/unstable/sync';
import path from 'node:path';
import * as ts from 'typescript';

import type { NativeProjectContext, NativeProjectService } from './types';

const CLOSED_ERROR = 'The TypeScript native project service is closed.';
const SUPPORTED_NATIVE_VERSION = '7.1.0-dev.20260822.1';

function verifyNativeCompatibility(): void {
  if (nativePackage.version !== SUPPORTED_NATIVE_VERSION) {
    throw new Error(
      `Incompatible @typescript/native version "${nativePackage.version}". This version of typescript-eslint supports only "${SUPPORTED_NATIVE_VERSION}". Install @typescript/native@${SUPPORTED_NATIVE_VERSION}.`,
    );
  }

  const api: unknown = API;
  const prototype = (api as { prototype?: Record<string, unknown> }).prototype;
  const missingSurface = (
    [
      ['API', api],
      ['API.prototype.updateSnapshot', prototype?.updateSnapshot],
      ['API.prototype.close', prototype?.close],
      ['SyntaxKind.SourceFile', SyntaxKind.SourceFile],
    ] as const
  ).find(
    ([, value]) => typeof value !== 'function' && typeof value !== 'number',
  )?.[0];
  if (missingSurface) {
    throw new Error(
      `Incompatible @typescript/native API version "${nativePackage.version}": required surface "${missingSurface}" is missing. Reinstall @typescript/native@${SUPPORTED_NATIVE_VERSION}.`,
    );
  }
}

function startupError(error: unknown): Error {
  return new Error(
    `Failed to start the TypeScript native project service: ${error instanceof Error ? error.message : String(error)}`,
    { cause: error },
  );
}

function normalizePath(filePath: string): string {
  const absolutePath = path.resolve(filePath);
  return process.platform === 'win32'
    ? absolutePath.toLowerCase()
    : absolutePath;
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
  verifyNativeCompatibility();
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
          overlays.has(normalizePath(fileName)) ? true : undefined,
        readFile: fileName => overlays.get(normalizePath(fileName)),
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

  function replaceSnapshot(
    params: Parameters<API['updateSnapshot']>[0],
  ): Snapshot {
    try {
      const previousSnapshot = snapshot;
      snapshot = api.updateSnapshot(params);
      fileContexts.clear();
      if (previousSnapshot) {
        previousSnapshot.dispose();
      }
    } catch (error) {
      if (!snapshot) {
        throw startupError(error);
      }
      throw error;
    }
    return snapshot;
  }

  function contextFor(
    nextSnapshot: Snapshot,
    configFileName: string,
    normalizedPath: string,
  ): NativeProjectContext {
    const project = nextSnapshot.getProject(configFileName);
    const sourceFile = project?.program.getSourceFile(normalizedPath);
    if (!project || !sourceFile) {
      throw new Error(
        `The TypeScript native project did not contain '${normalizedPath}'.`,
      );
    }
    const context = {
      checker: project.checker,
      program: project.program,
      project,
      sourceFile,
    };
    fileContexts.set(normalizedPath, context);
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
      const normalizedPath = normalizePath(filePath);
      const cachedContext = fileContexts.get(normalizedPath);
      if (syncedFiles.get(normalizedPath) === code && cachedContext) {
        return cachedContext;
      }
      const previousSynced = syncedFiles.get(normalizedPath);

      // Once an overlay exists the server has read it, so a matching disk file
      // would leave that overlay stale — hence the `has` check.
      const servedFromDisk =
        !overlays.has(normalizedPath) &&
        ts.sys.readFile(normalizedPath) === code;
      if (!servedFromDisk) {
        overlays.set(normalizedPath, code);
      }
      syncedFiles.set(normalizedPath, code);
      let knownConfigFileName = fileProjects.get(normalizedPath);

      if (!knownConfigFileName && snapshot && openProjects.size) {
        for (const candidate of openProjects) {
          if (
            snapshot
              .getProject(candidate)
              ?.program.getSourceFile(normalizedPath)
          ) {
            knownConfigFileName = candidate;
            fileProjects.set(normalizedPath, candidate);
            break;
          }
        }
      }
      if (knownConfigFileName) {
        const unchanged = servedFromDisk || previousSynced === code;
        return contextFor(
          unchanged && snapshot
            ? snapshot
            : replaceSnapshot({ fileChanges: { changed: [normalizedPath] } }),
          knownConfigFileName,
          normalizedPath,
        );
      }

      const discoverySnapshot = replaceSnapshot({
        openFiles: [normalizedPath],
      });
      let configFileName: string;
      let nextSnapshot: Snapshot;
      try {
        const discoveredProject =
          discoverySnapshot.getDefaultProjectForFile(normalizedPath);
        if (!discoveredProject) {
          throw new Error(
            `No TypeScript native project was located for '${normalizedPath}'.`,
          );
        }
        configFileName = discoveredProject.configFileName;
        if (!ts.sys.fileExists(configFileName)) {
          throw new Error(
            `No TypeScript native configured project was located for '${normalizedPath}'.`,
          );
        }
        if (!verifiedConfigs.has(configFileName)) {
          verifySupportedConfig(discoveredProject);
          verifiedConfigs.add(configFileName);
        }
        nextSnapshot = replaceSnapshot({
          closeFiles: [normalizedPath],
          openProjects: openProjects.has(configFileName)
            ? undefined
            : [configFileName],
        });
      } catch (error) {
        // Leave no half-open file behind, without masking the real failure.
        try {
          replaceSnapshot({ closeFiles: [normalizedPath] });
        } catch {
          // Intentionally ignored.
        }
        throw error;
      }
      openProjects.add(configFileName);
      fileProjects.set(normalizedPath, configFileName);
      return contextFor(nextSnapshot, configFileName, normalizedPath);
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
