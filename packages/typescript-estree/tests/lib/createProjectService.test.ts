import debug from 'debug';
import * as ts from 'typescript';
import * as tsserver from 'typescript/lib/tsserverlibrary.js';

import type { ProjectServiceSettings } from '../../src/create-program/createProjectService.js';
import type { ProjectServiceOptions } from '../../src/parser-options.js';

import { getParsedConfigFile } from '../../src/create-program/getParsedConfigFile.js';
import { validateDefaultProjectForFilesGlob } from '../../src/create-program/validateDefaultProjectForFilesGlob.js';

const mockGetParsedConfigFile = vi.mocked(getParsedConfigFile);

vi.mock(import('../../src/create-program/getParsedConfigFile.js'), () => ({
  getParsedConfigFile: vi.fn(),
}));

vi.mock(import('typescript/lib/tsserverlibrary.js'), async importOriginal => {
  const actual = await importOriginal();

  return {
    ...actual,
    server: {
      ...actual.server,
      ProjectService: class ProjectService {
        eventHandler: ts.server.ProjectServiceEventHandler | undefined;
        host: ts.server.ServerHost;
        logger: ts.server.Logger;
        setCompilerOptionsForInferredProjects = vi.fn();
        setHostConfiguration = vi.fn();
        constructor(
          ...args: ConstructorParameters<typeof ts.server.ProjectService>
        ) {
          this.eventHandler = args[0].eventHandler;
          this.host = args[0].host;
          this.logger = args[0].logger;
          if (this.eventHandler) {
            this.eventHandler({
              eventName: 'projectLoadingStart',
            } as ts.server.ProjectLoadingStartEvent);
          }
        }
      } as unknown as typeof ts.server.ProjectService,
    },
  };
});

const DEFAULT_PROJECT_MATCHED_FILES_THRESHOLD = 8;

const log = debug(
  'typescript-eslint:typescript-estree:tests:createProjectService:test',
);
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

function createProjectService(
  optionsRaw: boolean | ProjectServiceOptions | undefined,
  jsDocParsingMode: ts.JSDocParsingMode | undefined,
  tsconfigRootDir: string | undefined,
): ProjectServiceSettings {
  const optionsRawObject = typeof optionsRaw === 'object' ? optionsRaw : {};
  const options = {
    defaultProject: 'tsconfig.json',
    ...optionsRawObject,
  };
  validateDefaultProjectForFilesGlob(options.allowDefaultProject);

  const system: ts.server.ServerHost = {
    ...tsserver.sys,
    clearImmediate,
    clearTimeout,
    setImmediate,
    setTimeout,
    watchDirectory: createStubFileWatcher,
    watchFile: createStubFileWatcher,
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
    hasLevel: (): boolean => true,
    info(s) {
      this.msg(s, tsserver.server.Msg.Info);
    },
    loggingEnabled: (): boolean =>
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
    if (optionsRawObject.defaultProject) {
      throw new Error(
        `Could not read project service default project '${options.defaultProject}': ${(error as Error).message}`,
      );
    }
  }

  if (configFile) {
    service.setCompilerOptionsForInferredProjects(
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

describe(createProjectService, () => {
  const processStderrWriteSpy = vi
    .spyOn(process.stderr, 'write')
    .mockImplementation(() => true);

  beforeEach(() => {
    mockGetParsedConfigFile.mockReturnValue({
      errors: [],
      fileNames: [],
      options: {},
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('sets allowDefaultProject when options.allowDefaultProject is defined', () => {
    const allowDefaultProject = ['./*.js'];
    const settings = createProjectService(
      { allowDefaultProject },
      undefined,
      undefined,
    );

    expect(settings.allowDefaultProject).toBe(allowDefaultProject);
  });

  it('does not set allowDefaultProject when options.allowDefaultProject is not defined', () => {
    const settings = createProjectService(undefined, undefined, undefined);

    expect(settings.allowDefaultProject).toBeUndefined();
  });

  it('does not throw an error when options.defaultProject is not provided and getParsedConfigFile throws a diagnostic error', () => {
    mockGetParsedConfigFile.mockImplementation(() => {
      throw new Error('tsconfig.json(1,1): error TS1234: Oh no!');
    });

    expect(() =>
      createProjectService(
        {
          allowDefaultProject: ['file.js'],
        },
        undefined,
        undefined,
      ),
    ).not.toThrow();
  });

  it('throws an error with a relative path when options.defaultProject is set to a relative path and getParsedConfigFile throws a diagnostic error', () => {
    mockGetParsedConfigFile.mockImplementation(() => {
      throw new Error('./tsconfig.eslint.json(1,1): error TS1234: Oh no!');
    });

    expect(() =>
      createProjectService(
        {
          allowDefaultProject: ['file.js'],
          defaultProject: './tsconfig.eslint.json',
        },
        undefined,
        undefined,
      ),
    ).toThrow(
      /Could not read project service default project '\.\/tsconfig.eslint.json': .+ error TS1234: Oh no!/,
    );
  });

  it('throws an error with a local path when options.defaultProject is set to a local path and getParsedConfigFile throws a diagnostic error', () => {
    mockGetParsedConfigFile.mockImplementation(() => {
      throw new Error('./tsconfig.eslint.json(1,1): error TS1234: Oh no!');
    });

    expect(() =>
      createProjectService(
        {
          allowDefaultProject: ['file.js'],
          defaultProject: 'tsconfig.eslint.json',
        },
        undefined,
        undefined,
      ),
    ).toThrow(
      /Could not read project service default project 'tsconfig.eslint.json': .+ error TS1234: Oh no!/,
    );
  });

  it('throws an error when options.defaultProject is set and getParsedConfigFile throws an environment error', () => {
    mockGetParsedConfigFile.mockImplementation(() => {
      throw new Error(
        '`getParsedConfigFile` is only supported in a Node-like environment.',
      );
    });

    expect(() =>
      createProjectService(
        {
          allowDefaultProject: ['file.js'],
          defaultProject: 'tsconfig.json',
        },
        undefined,
        undefined,
      ),
    ).toThrow(
      "Could not read project service default project 'tsconfig.json': `getParsedConfigFile` is only supported in a Node-like environment.",
    );
  });

  it('uses the default project compiler options when options.defaultProject is set and getParsedConfigFile succeeds', async () => {
    const compilerOptions: ts.CompilerOptions = { strict: true };
    mockGetParsedConfigFile.mockReturnValueOnce({
      errors: [],
      fileNames: [],
      options: compilerOptions,
    });

    const defaultProject = 'tsconfig.eslint.json';

    const { service } = createProjectService(
      {
        allowDefaultProject: ['file.js'],
        defaultProject,
      },
      undefined,
      undefined,
    );

    expect(
      service.setCompilerOptionsForInferredProjects,
    ).toHaveBeenCalledExactlyOnceWith(compilerOptions);

    expect(mockGetParsedConfigFile).toHaveBeenCalledExactlyOnceWith(
      await import('typescript/lib/tsserverlibrary.js'),
      defaultProject,
      undefined,
    );
  });

  it('uses tsconfigRootDir as getParsedConfigFile projectDirectory when provided', async () => {
    const compilerOptions: ts.CompilerOptions = { strict: true };
    const tsconfigRootDir = 'path/to/repo';
    mockGetParsedConfigFile.mockReturnValueOnce({
      errors: [],
      fileNames: [],
      options: compilerOptions,
    });

    const { service } = createProjectService(
      {
        allowDefaultProject: ['file.js'],
      },
      undefined,
      tsconfigRootDir,
    );

    expect(
      service.setCompilerOptionsForInferredProjects,
    ).toHaveBeenCalledExactlyOnceWith(compilerOptions);

    expect(mockGetParsedConfigFile).toHaveBeenCalledExactlyOnceWith(
      await import('typescript/lib/tsserverlibrary.js'),
      'tsconfig.json',
      tsconfigRootDir,
    );
  });

  it('uses the default projects error debugger for error messages when enabled', () => {
    const { service } = createProjectService(undefined, undefined, undefined);
    debug.enable('typescript-eslint:typescript-estree:tsserver:err');
    const enabled = service.logger.loggingEnabled();
    service.logger.msg('foo', ts.server.Msg.Err);
    debug.disable();

    expect(enabled).toBe(true);
    expect(processStderrWriteSpy).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(
        /^.*typescript-eslint:typescript-estree:tsserver:err foo\n$/,
      ),
    );
  });

  it('does not use the default projects error debugger for error messages when disabled', () => {
    const { service } = createProjectService(undefined, undefined, undefined);
    const enabled = service.logger.loggingEnabled();
    service.logger.msg('foo', ts.server.Msg.Err);

    expect(enabled).toBe(false);
    expect(processStderrWriteSpy).not.toHaveBeenCalled();
  });

  it('uses the default projects info debugger for info messages when enabled', () => {
    const { service } = createProjectService(undefined, undefined, undefined);
    debug.enable('typescript-eslint:typescript-estree:tsserver:info');
    const enabled = service.logger.loggingEnabled();
    service.logger.info('foo');
    debug.disable();

    expect(enabled).toBe(true);
    expect(processStderrWriteSpy).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(
        /^.*typescript-eslint:typescript-estree:tsserver:info foo\n$/,
      ),
    );
  });

  it('does not use the default projects info debugger for info messages when disabled', () => {
    const { service } = createProjectService(undefined, undefined, undefined);
    const enabled = service.logger.loggingEnabled();
    service.logger.info('foo');

    expect(enabled).toBe(false);
    expect(processStderrWriteSpy).not.toHaveBeenCalled();
  });

  it('uses the default projects perf debugger for perf messages when enabled', () => {
    const { service } = createProjectService(undefined, undefined, undefined);
    debug.enable('typescript-eslint:typescript-estree:tsserver:perf');
    const enabled = service.logger.loggingEnabled();
    service.logger.perftrc('foo');
    debug.disable();

    expect(enabled).toBe(true);
    expect(processStderrWriteSpy).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(
        /^.*typescript-eslint:typescript-estree:tsserver:perf foo\n$/,
      ),
    );
  });

  it('does not use the default projects perf debugger for perf messages when disabled', () => {
    const { service } = createProjectService(undefined, undefined, undefined);
    const enabled = service.logger.loggingEnabled();
    service.logger.perftrc('foo');

    expect(enabled).toBe(false);
    expect(processStderrWriteSpy).not.toHaveBeenCalled();
  });

  it('enables all log levels for the default projects logger', () => {
    const { service } = createProjectService(undefined, undefined, undefined);

    expect(service.logger.hasLevel(ts.server.LogLevel.terse)).toBe(true);
    expect(service.logger.hasLevel(ts.server.LogLevel.normal)).toBe(true);
    expect(service.logger.hasLevel(ts.server.LogLevel.requestTime)).toBe(true);
    expect(service.logger.hasLevel(ts.server.LogLevel.verbose)).toBe(true);
  });

  it('does not return a log filename with the default projects logger', () => {
    const { service } = createProjectService(undefined, undefined, undefined);

    expect(service.logger.getLogFileName()).toBeUndefined();
  });

  it('uses the default projects event debugger for event handling when enabled', () => {
    debug.enable('typescript-eslint:typescript-estree:tsserver:event');
    createProjectService(undefined, undefined, undefined);
    debug.disable();

    expect(processStderrWriteSpy).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(
        /^.*typescript-eslint:typescript-estree:tsserver:event { eventName: 'projectLoadingStart' }\n$/,
      ),
    );
  });

  it('does not use the default projects event debugger for event handling when disabled', () => {
    createProjectService(undefined, undefined, undefined);

    expect(processStderrWriteSpy).not.toHaveBeenCalled();
  });

  it('provides a stub require to the host system when loadTypeScriptPlugins is falsy', () => {
    const { service } = createProjectService({}, undefined, undefined);

    const required = service.host.require?.('', '');

    expect(required).toEqual({
      error: {
        message:
          'TypeScript plugins are not required when using parserOptions.projectService.',
      },
      module: undefined,
    });
  });

  it('does not provide a require to the host system when loadTypeScriptPlugins is truthy', async () => {
    const { service } = createProjectService(
      {
        loadTypeScriptPlugins: true,
      },
      undefined,
      undefined,
    );

    expect(service.host.require).toBe(
      (
        await vi.importActual<Record<string, Record<string, object>>>(
          'typescript/lib/tsserverlibrary.js',
        )
      ).sys.require,
    );
  });

  it('sets a host configuration', () => {
    const { service } = createProjectService(
      {
        allowDefaultProject: ['file.js'],
      },
      undefined,
      undefined,
    );

    expect(service.setHostConfiguration).toHaveBeenCalledExactlyOnceWith({
      preferences: {
        includePackageJsonAutoImports: 'off',
      },
    });
  });
});
