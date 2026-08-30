import type { Project, Snapshot } from '@typescript/native/unstable/sync';

import { API } from '@typescript/native/unstable/sync';
import path from 'node:path';
import * as ts from 'typescript';

import type {
  NativeFileChanges,
  NativeProjectContext,
  NativeProjectService,
  NativeProjectServiceOptions,
} from './types';

const CLOSED_ERROR = 'The TypeScript native project service is closed.';

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

export function createNativeProjectService(
  options: NativeProjectServiceOptions = {},
): NativeProjectService {
  const overlays = new Map<string, string | null>();
  const fileProjects = new Map<string, string>();
  const openProjects = new Set<string>();
  let closed = false;
  let snapshot: Snapshot | undefined;
  let api: API;

  try {
    api = new API({
      collectTiming: options.collectTiming,
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
      previousSnapshot?.dispose();
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

  return {
    close(): void {
      if (closed) {
        return;
      }
      closed = true;
      const errors: unknown[] = [];
      const attempt = (cleanup: () => void): void => {
        try {
          cleanup();
        } catch (error) {
          errors.push(error);
        }
      };

      if (openProjects.size) {
        attempt(() => {
          replaceSnapshot({ closeProjects: [...openProjects] });
        });
      }
      attempt(() => {
        snapshot?.dispose();
      });
      attempt(() => {
        api.close();
      });
      attempt(() => {
        fileProjects.clear();
        openProjects.clear();
        overlays.clear();
      });

      if (errors.length === 1) {
        throw errors[0];
      }
      if (errors.length > 1) {
        throw new AggregateError(
          errors,
          'Failed to close native project service.',
        );
      }
    },

    openFile(filePath, code): NativeProjectContext {
      assertOpen();
      const normalizedPath = normalizePath(filePath);
      overlays.set(normalizedPath, code);
      const knownConfigFileName = fileProjects.get(normalizedPath);
      if (knownConfigFileName) {
        const nextSnapshot = replaceSnapshot({
          fileChanges: { changed: [normalizedPath] },
        });
        const project = nextSnapshot.getProject(knownConfigFileName);
        const sourceFile = project?.program.getSourceFile(normalizedPath);
        if (!project || !sourceFile) {
          throw new Error(
            `The TypeScript native project did not contain '${normalizedPath}'.`,
          );
        }
        return {
          checker: project.checker,
          program: project.program,
          project,
          snapshot: nextSnapshot,
          sourceFile,
        };
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
        verifySupportedConfig(discoveredProject);
        nextSnapshot = replaceSnapshot({
          closeFiles: [normalizedPath],
          openProjects: openProjects.has(configFileName)
            ? undefined
            : [configFileName],
        });
      } catch (error) {
        try {
          replaceSnapshot({ closeFiles: [normalizedPath] });
        } catch (cleanupError) {
          throw new AggregateError(
            [error, cleanupError],
            error instanceof Error ? error.message : String(error),
            { cause: cleanupError },
          );
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
      return {
        checker: project.checker,
        program: project.program,
        project,
        snapshot: nextSnapshot,
        sourceFile,
      };
    },

    updateFiles(changes: NativeFileChanges): Snapshot {
      assertOpen();
      const fileChanges = {
        changed: changes.changed?.map(normalizePath),
        created: changes.created?.map(normalizePath),
        deleted: changes.deleted?.map(normalizePath),
      };
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
}
