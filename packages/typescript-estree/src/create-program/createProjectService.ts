/* eslint-disable @typescript-eslint/no-empty-function -- for TypeScript APIs*/
import os from 'node:os';

import debug from 'debug';
import type * as ts from 'typescript/lib/tsserverlibrary';

import type { ProjectServiceOptions } from '../parser-options';
import { validateDefaultProjectForFilesGlob } from './validateDefaultProjectForFilesGlob';

const DEFAULT_PROJECT_MATCHED_FILES_THRESHOLD = 8;

const logTsserverErr = debug(
  'typescript-eslint:typescript-estree:tsserver:err',
);
const logTsserverInfo = debug(
  'typescript-eslint:typescript-estree:tsserver:info',
);
const logTsserverPerf = debug(
  'typescript-eslint:typescript-estree:tsserver:perf',
);
const logTsserverEvent = debug(
  'typescript-eslint:typescript-estree:tsserver:event',
);

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

  const logger: ts.server.Logger = {
    close: doNothing,
    endGroup: doNothing,
    getLogFileName: (): undefined => undefined,
    // The debug library doesn't use levels without creating a namespace for each.
    // Log levels are not passed to the writer so we wouldn't be able to forward
    // to a respective namespace.  Supporting would require an additional flag for
    // grainular control.  Defaulting to all levels for now.
    hasLevel: (): boolean => true,
    info(s) {
      this.msg(s, tsserver.server.Msg.Info);
    },
    loggingEnabled: (): boolean =>
      // if none of the debug namespaces are enabled, then don't enable logging in tsserver
      logTsserverInfo.enabled ||
      logTsserverErr.enabled ||
      logTsserverPerf.enabled,
    msg: (s, type) => {
      switch (type) {
        case tsserver.server.Msg.Err:
          logTsserverErr(s);
          break;
        case tsserver.server.Msg.Perf:
          logTsserverPerf(s);
          break;
        default:
          logTsserverInfo(s);
      }
    },
    perftrc(s) {
      this.msg(s, tsserver.server.Msg.Perf);
    },
    startGroup: doNothing,
  };

  const service = new tsserver.server.ProjectService({
    host: system,
    cancellationToken: { isCancellationRequested: (): boolean => false },
    useSingleInferredProject: false,
    useInferredProjectPerProjectRoot: false,
    logger,
    eventHandler: (e): void => {
      logTsserverEvent(e);
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
