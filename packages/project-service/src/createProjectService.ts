import type { ProjectServiceOptions } from '@typescript-eslint/types';
import type * as ts from 'typescript/lib/tsserverlibrary';

import { getParsedConfigFile } from '@typescript-eslint/tsconfig-utils';
import debug from 'debug';

const DEFAULT_PROJECT_MATCHED_FILES_THRESHOLD = 8;

const log = debug('typescript-eslint:project-service:createProjectService');
const logTsserverErr = debug('typescript-eslint:project-service:tsserver:err');
const logTsserverInfo = debug(
  'typescript-eslint:project-service:tsserver:info',
);
const logTsserverPerf = debug(
  'typescript-eslint:project-service:tsserver:perf',
);
const logTsserverEvent = debug(
  'typescript-eslint:project-service:tsserver:event',
);

// For TypeScript APIs that expect a function to be passed in
// eslint-disable-next-line @typescript-eslint/no-empty-function
const doNothing = (): void => {};

const createStubFileWatcher = (): ts.FileWatcher => ({
  close: doNothing,
});

export type TypeScriptProjectService = ts.server.ProjectService;

/**
 * A created Project Service instances, as well as metadata on its creation.
 */
export interface ProjectServiceAndMetadata {
  /**
   * Files allowed to be loaded from the default project, if any were specified.
   */
  allowDefaultProject: string[] | undefined;

  /**
   * The performance.now() timestamp of the last reload of the project service.
   */
  lastReloadTimestamp: number;

  /**
   * The maximum number of files that can be matched by the default project.
   */
  maximumDefaultProjectFileMatchCount: number;

  /**
   * The created TypeScript Project Service instance.
   */
  service: TypeScriptProjectService;
}

export interface CreateProjectServiceSettings {
  options?: ProjectServiceOptions;
  jsDocParsingMode?: ts.JSDocParsingMode;
  tsconfigRootDir?: string;
}

/**
 * @param settings Settings to create a new Project Service instance.
 * @returns A new Project Service instance, as well as metadata on its creation.
 * @example
 * ```ts
 * import { createProjectService } from '@typescript-eslint/project-service';
 *
 * const { service } = createProjectService();
 *
 * service.openClientFile('index.ts');
 * ```
 */
export function createProjectService({
  jsDocParsingMode,
  options: optionsRaw,
  tsconfigRootDir,
}: CreateProjectServiceSettings = {}): ProjectServiceAndMetadata {
  const options = {
    defaultProject: 'tsconfig.json',
    ...optionsRaw,
  };

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

    // We stop loading any TypeScript plugins by default, to prevent them from attaching disk watchers
    // See https://github.com/typescript-eslint/typescript-eslint/issues/9905
    ...(!options.loadTypeScriptPlugins && {
      require: () => ({
        error: {
          message:
            'TypeScript plugins are not required when using parserOptions.projectService.',
        },
        module: undefined,
      }),
    }),
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

  log('Creating Project Service with: %o', options);

  const service = new tsserver.server.ProjectService({
    cancellationToken: { isCancellationRequested: (): boolean => false },
    eventHandler: logTsserverEvent.enabled
      ? (e): void => {
          logTsserverEvent(e);
        }
      : undefined,
    host: system,
    jsDocParsingMode,
    logger,
    session: undefined,
    useInferredProjectPerProjectRoot: false,
    useSingleInferredProject: false,
  });

  service.setHostConfiguration({
    preferences: {
      includePackageJsonAutoImports: 'off',
    },
  });

  log('Enabling default project: %s', options.defaultProject);
  let configFile: ts.ParsedCommandLine | undefined;

  try {
    configFile = getParsedConfigFile(
      tsserver,
      options.defaultProject,
      tsconfigRootDir,
    );
  } catch (error) {
    if (options.defaultProject) {
      throw new Error(
        `Could not read Project Service default project '${options.defaultProject}': ${(error as Error).message}`,
      );
    }
  }

  if (configFile) {
    service.setCompilerOptionsForInferredProjects(
      // NOTE: The inferred projects API is not intended for source files when a tsconfig
      // exists. There is no API that generates an InferredProjectCompilerOptions suggesting
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

export { type ProjectServiceOptions } from '@typescript-eslint/types';
