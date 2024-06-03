/* eslint-disable @typescript-eslint/no-empty-function -- for TypeScript APIs*/
import os from 'node:os';

import type * as ts from 'typescript/lib/tsserverlibrary';

import type { ProjectServiceOptions } from '../parser-options';
import { validateDefaultProjectForFilesGlob } from './validateDefaultProjectForFilesGlob';

const DEFAULT_PROJECT_MATCHED_FILES_THRESHOLD = 8;

const doNothing = (): void => {};

const createStubFileWatcher = (): ts.FileWatcher => ({
  close: doNothing,
});

export type TypeScriptProjectService = ts.server.ProjectService;

export interface ProjectServiceSettings {
  allowDefaultProject: string[] | undefined;
  maximumDefaultProjectFileMatchCount: number;
  service: TypeScriptProjectService;
}

export function createProjectService(
  optionsRaw: boolean | ProjectServiceOptions | undefined,
  jsDocParsingMode: ts.JSDocParsingMode | undefined,
): ProjectServiceSettings {
  const options = typeof optionsRaw === 'object' ? optionsRaw : {};
  validateDefaultProjectForFilesGlob(options);

  // We import this lazily to avoid its cost for users who don't use the service
  // TODO: Once we drop support for TS<5.3 we can import from "typescript" directly
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const tsserver = require('typescript/lib/tsserverlibrary') as typeof ts;

  // TODO: see getWatchProgramsForProjects
  // We don't watch the disk, we just refer to these when ESLint calls us
  // there's a whole separate update pass in maybeInvalidateProgram at the bottom of getWatchProgramsForProjects
  // (this "goes nuclear on TypeScript")
  const system: ts.server.ServerHost = {
    ...tsserver.sys,
    clearImmediate,
    clearTimeout,
    setImmediate,
    setTimeout,
    watchDirectory: createStubFileWatcher,
    watchFile: createStubFileWatcher,
  };

  const service = new tsserver.server.ProjectService({
    host: system,
    cancellationToken: { isCancellationRequested: (): boolean => false },
    useSingleInferredProject: false,
    useInferredProjectPerProjectRoot: false,
    logger: {
      close: doNothing,
      endGroup: doNothing,
      getLogFileName: (): undefined => undefined,
      hasLevel: (): boolean => false,
      info: doNothing,
      loggingEnabled: (): boolean => false,
      msg: doNothing,
      perftrc: doNothing,
      startGroup: doNothing,
    },
    session: undefined,
    jsDocParsingMode,
  });

  if (options.defaultProject) {
    let configRead;

    try {
      configRead = tsserver.readConfigFile(
        options.defaultProject,
        system.readFile,
      );
    } catch (error) {
      throw new Error(
        `Could not parse default project '${options.defaultProject}': ${(error as Error).message}`,
      );
    }

    if (configRead.error) {
      throw new Error(
        `Could not read default project '${options.defaultProject}': ${tsserver.formatDiagnostic(
          configRead.error,
          {
            getCurrentDirectory: system.getCurrentDirectory,
            getCanonicalFileName: fileName => fileName,
            getNewLine: () => os.EOL,
          },
        )}`,
      );
    }

    service.setCompilerOptionsForInferredProjects(
      (
        configRead.config as {
          compilerOptions: ts.server.protocol.InferredProjectCompilerOptions;
        }
      ).compilerOptions,
    );
  }

  return {
    allowDefaultProject: options.allowDefaultProject,
    maximumDefaultProjectFileMatchCount:
      options.maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING ??
      DEFAULT_PROJECT_MATCHED_FILES_THRESHOLD,
    service,
  };
}
