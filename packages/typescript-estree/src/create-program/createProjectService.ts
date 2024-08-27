/* eslint-disable @typescript-eslint/no-empty-function -- for TypeScript APIs*/
import debug from 'debug';
import type * as ts from 'typescript/lib/tsserverlibrary';

import type { ProjectServiceOptions } from '../parser-options';
import { getParsedConfigFile } from './getParsedConfigFile';
import { validateDefaultProjectForFilesGlob } from './validateDefaultProjectForFilesGlob';

const DEFAULT_PROJECT_MATCHED_FILES_THRESHOLD = 8;

const log = debug('typescript-eslint:typescript-estree:createProjectService');
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
  lastReloadTimestamp: number;
  maximumDefaultProjectFileMatchCount: number;
  service: TypeScriptProjectService;
}

export function createProjectService(
  optionsRaw: boolean | ProjectServiceOptions | undefined,
  jsDocParsingMode: ts.JSDocParsingMode | undefined,
  tsconfigRootDir: string | undefined,
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
    // granular control.  Defaulting to all levels for now.
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

  log('Creating project service with: %o', options);

  const service = new tsserver.server.ProjectService({
    host: system,
    cancellationToken: { isCancellationRequested: (): boolean => false },
    useSingleInferredProject: false,
    useInferredProjectPerProjectRoot: false,
    logger,
    eventHandler: logTsserverEvent.enabled
      ? (e): void => {
          logTsserverEvent(e);
        }
      : undefined,
    session: undefined,
    jsDocParsingMode,
  });

  service.setHostConfiguration({
    preferences: {
      includePackageJsonAutoImports: 'off',
    },
  });

  if (options.defaultProject) {
    log('Enabling default project: %s', options.defaultProject);
    let configFile: ts.ParsedCommandLine;

    try {
      configFile = getParsedConfigFile(
        tsserver,
        options.defaultProject,
        tsconfigRootDir,
      );
    } catch (error) {
      throw new Error(
        `Could not read default project '${options.defaultProject}': ${(error as Error).message}`,
      );
    }

    service.setCompilerOptionsForInferredProjects(
      // NOTE: The inferred projects API is not intended for source files when a tsconfig
      // exists.  There is no API that generates an InferredProjectCompilerOptions suggesting
      // it is meant for hard coded options passed in. Hard asserting as a work around.
      // See https://github.com/microsoft/TypeScript/blob/27bcd4cb5a98bce46c9cdd749752703ead021a4b/src/server/protocol.ts#L1904
      configFile.options as ts.server.protocol.InferredProjectCompilerOptions,
    );
  }

  return {
    allowDefaultProject: options.allowDefaultProject,
    lastReloadTimestamp: performance.now(),
    maximumDefaultProjectFileMatchCount:
      options.maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING ??
      DEFAULT_PROJECT_MATCHED_FILES_THRESHOLD,
    service,
  };
}
