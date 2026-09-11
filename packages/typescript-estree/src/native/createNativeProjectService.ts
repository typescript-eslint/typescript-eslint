import type { Project, Snapshot } from '@typescript/native/unstable/sync';

import nativePackage from '@typescript/native/package.json';
import { SyntaxKind } from '@typescript/native/unstable/ast';
import { API } from '@typescript/native/unstable/sync';
import path from 'node:path';
import * as ts from 'typescript';

import type {
  NativeFileChanges,
  NativeProjectContext,
  NativeProjectService,
} from './types';

const CLOSED_ERROR = 'The TypeScript native project service is closed.';
const SUPPORTED_NATIVE_VERSION = '7.1.0-dev.20260822.1';

function verifyNativeCompatibility(): void {
  if (nativePackage.version !== SUPPORTED_NATIVE_VERSION) {
    throw new Error(
      `Incompatible @typescript/native version "${nativePackage.version}". This version of typescript-eslint supports only "${SUPPORTED_NATIVE_VERSION}". Install @typescript/native@${SUPPORTED_NATIVE_VERSION}.`,
    );
  }

  const nativeAPI: unknown = API;
  const apiPrototype =
    typeof nativeAPI === 'function'
      ? (nativeAPI as { prototype?: Record<string, unknown> }).prototype
      : undefined;
  const nativeSyntaxKind: unknown = SyntaxKind;
  const sourceFileKind =
    typeof nativeSyntaxKind === 'object' && nativeSyntaxKind
      ? (nativeSyntaxKind as Record<string, unknown>).SourceFile
      : undefined;
  const requiredFunctions = [
    ['API', nativeAPI],
    ['API.prototype.updateSnapshot', apiPrototype?.updateSnapshot],
    ['API.prototype.close', apiPrototype?.close],
  ] as const;
  const missingFunction = requiredFunctions.find(
    ([, value]) => typeof value !== 'function',
  );
  const missingSurface =
    missingFunction?.[0] ??
    (typeof sourceFileKind === 'number' ? undefined : 'SyntaxKind.SourceFile');
  if (missingSurface) {
    throw new Error(
      `Incompatible @typescript/native API version "${nativePackage.version}": required surface "${missingSurface}" is missing. Reinstall @typescript/native@${SUPPORTED_NATIVE_VERSION}.`,
    );
  }
}

function normalizePath(filePath: string): string {
  const absolutePath = path.normalize(path.resolve(filePath));
  return process.platform === 'win32'
    ? absolutePath.toLowerCase()
    : absolutePath;
}

function verifySupportedConfig(project: Project): void {
  if (project.parsedCommandLine.projectReferences?.length) {
    throw new Error('TypeScript native project references are not supported.');
  }
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

export function createNativeProjectService(): NativeProjectService {
  verifyNativeCompatibility();
  const overlays = new Map<string, string | null>();
  // The text the server currently has for a path, whether it came from an
  // overlay or from the file itself.
  const syncedFiles = new Map<string, string>();
  // Config files already checked for unsupported settings. Parsing a TSConfig
  // walks every directory its `include` globs can reach, so checking one per
  // linted file is quadratic in the size of the project. The answer depends
  // only on the config file, and this service is discarded when caches are
  // cleared, so a config edit is picked up by the next service.
  const verifiedConfigs = new Set<string>();
  const fileContexts = new Map<string, NativeProjectContext>();
  const fileProjects = new Map<string, string>();
  const openProjects = new Set<string>();
  let closed = false;
  let snapshot: Snapshot | undefined;
  let api: API;

  try {
    api = new API({
      cwd: process.cwd(),
      fs: {
        fileExists: fileName =>
          overlays.has(normalizePath(fileName))
            ? overlays.get(normalizePath(fileName)) != null
            : undefined,
        readFile: fileName => overlays.get(normalizePath(fileName)),
      },
    });
  } catch (error) {
    throw new Error(
      `Failed to start the TypeScript native project service: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
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
        throw new Error(
          `Failed to start the TypeScript native project service: ${error instanceof Error ? error.message : String(error)}`,
          { cause: error },
        );
      }
      throw error;
    }
    return snapshot;
  }

  const service: NativeProjectService = {
    close(): void {
      if (closed) {
        return;
      }
      closed = true;

      // Every step runs even if an earlier one fails, so that a failure part
      // way through still shuts the compiler process down rather than leaking
      // it. The first failure is the one reported.
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

      // The overlay exists to show the server text that differs from disk.
      // ESLint usually hands over exactly what it read, so there is often
      // nothing to show. Leaving the overlay unset lets the server read the
      // file itself, which skips both the overlay and the snapshot
      // replacement that would tell the server to re-read it.
      //
      // Comparing against disk only helps on a file with no overlay yet. Once
      // one exists the server has already read it, so a matching disk file
      // would still leave the stale overlay in place.
      const servedFromDisk =
        !overlays.has(normalizedPath) &&
        ts.sys.readFile(normalizedPath) === code;
      if (!servedFromDisk) {
        overlays.set(normalizedPath, code);
      }
      syncedFiles.set(normalizedPath, code);
      let knownConfigFileName = fileProjects.get(normalizedPath);

      // Discovery costs two snapshot replacements and a default-project
      // lookup, and each response describes the whole project. A file that an
      // already-open project's program contains needs none of it.
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
        // Replacing the snapshot tells the server to re-read the file.
        // When the overlay is byte-identical to the one the server already
        // read, there is nothing to re-read. Comparing against the previous
        // overlay rather than against disk is what makes this safe: a file
        // whose text changed still forces the update.
        const unchanged = servedFromDisk || previousSynced === code;
        const nextSnapshot =
          unchanged && snapshot
            ? snapshot
            : replaceSnapshot({ fileChanges: { changed: [normalizedPath] } });
        const project = nextSnapshot.getProject(knownConfigFileName);
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
          snapshot: nextSnapshot,
          sourceFile,
        };
        fileContexts.set(normalizedPath, context);
        return context;
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
        if (!verifiedConfigs.has(discoveredProject.configFileName)) {
          verifySupportedConfig(discoveredProject);
          verifiedConfigs.add(discoveredProject.configFileName);
        }
        nextSnapshot = replaceSnapshot({
          closeFiles: [normalizedPath],
          openProjects: openProjects.has(configFileName)
            ? undefined
            : [configFileName],
        });
      } catch (error) {
        // Close the file even though discovery failed, so a later parse does
        // not inherit a half-open state. The discovery failure is the one
        // worth reporting, so a failure to clean up does not mask it.
        try {
          replaceSnapshot({ closeFiles: [normalizedPath] });
        } catch {
          // Intentionally ignored.
        }
        throw error;
      }
      openProjects.add(configFileName);
      fileProjects.set(normalizedPath, configFileName);
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
        snapshot: nextSnapshot,
        sourceFile,
      };
      fileContexts.set(normalizedPath, context);
      return context;
    },

    updateFiles(changes: NativeFileChanges): Snapshot {
      assertOpen();
      const fileChanges = {
        changed: changes.changed?.map(normalizePath),
        created: changes.created?.map(normalizePath),
        deleted: changes.deleted?.map(normalizePath),
      };
      for (const filePath of [
        ...(fileChanges.changed ?? []),
        ...(fileChanges.created ?? []),
        ...(fileChanges.deleted ?? []),
      ]) {
        syncedFiles.delete(filePath);
      }
      for (const filePath of fileChanges.deleted ?? []) {
        overlays.set(filePath, null);
      }
      for (const filePath of fileChanges.created ?? []) {
        if (overlays.get(filePath) == null && overlays.has(filePath)) {
          overlays.delete(filePath);
        }
      }
      return replaceSnapshot({ fileChanges });
    },
  };
  return service;
}
