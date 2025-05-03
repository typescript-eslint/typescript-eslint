import debug from 'debug';
import * as ts from 'typescript';

import { createProjectService } from '../../src/create-program/createProjectService.js';
import { getParsedConfigFile } from '../../src/create-program/getParsedConfigFile.js';

const mockGetParsedConfigFile = vi.mocked(getParsedConfigFile);

vi.mock(
  import('../../src/create-program/getParsedConfigFile.js'),
  async importOriginal => {
    const actual = await importOriginal();

    return {
      ...actual,
      getParsedConfigFile: vi.fn(actual.getParsedConfigFile),
    };
  },
);

vi.mock(
  import('../../src/create-program/createProjectService.js'),
  async importOriginal => {
    const actual = await importOriginal();

    vi.spyOn(
      ts.server.ProjectService.prototype,
      'setCompilerOptionsForInferredProjects',
    );

    vi.spyOn(ts.server.ProjectService.prototype, 'setHostConfiguration');

    return {
      ...actual,
      createProjectService: vi
        .fn(actual.createProjectService)
        .mockImplementation((...args) => {
          const projectServiceSettings = actual.createProjectService(...args);
          const service =
            projectServiceSettings.service as typeof projectServiceSettings.service & {
              eventHandler: ts.server.ProjectServiceEventHandler | undefined;
            };

          if (service.eventHandler) {
            service.eventHandler({
              eventName: ts.server.ProjectLoadingStartEvent,
            } as ts.server.ProjectLoadingStartEvent);
          }

          return projectServiceSettings;
        }),
    };
  },
);

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

    assert.isUndefined(settings.allowDefaultProject);
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
      (await import('typescript/lib/tsserverlibrary.js')).default,
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
      (await import('typescript/lib/tsserverlibrary.js')).default,
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

    assert.isUndefined(service.logger.getLogFileName());
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
