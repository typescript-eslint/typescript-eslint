import debug from 'debug';
import * as ts from 'typescript';

import { createProjectService } from '../src/createProjectService.js';

const mockGetParsedConfigFileFromTSServer = vi.fn();

vi.mock('../src/getParsedConfigFileFromTSServer.js', () => ({
  get getParsedConfigFileFromTSServer() {
    return mockGetParsedConfigFileFromTSServer;
  },
}));

const mockSetCompilerOptionsForInferredProjects = vi.fn();
const mockSetHostConfiguration = vi.fn();

vi.mock(import('../src/createProjectService.js'), async importOriginal => {
  const actual = await importOriginal();

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
});

describe(createProjectService, () => {
  const processStderrWriteSpy = vi
    .spyOn(process.stderr, 'write')
    .mockImplementation(() => true);

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ProjectService } = require('typescript/lib/tsserverlibrary').server;

    ProjectService.prototype.setCompilerOptionsForInferredProjects =
      mockSetCompilerOptionsForInferredProjects;
    ProjectService.prototype.setHostConfiguration = mockSetHostConfiguration;
  });

  afterEach(() => {
    debug.disable();
    vi.clearAllMocks();
  });

  describe('defaultProject', () => {
    it('sets allowDefaultProject when options.allowDefaultProject is defined', () => {
      const allowDefaultProject = ['./*.js'];

      const settings = createProjectService({
        options: { allowDefaultProject },
      });

      expect(settings.allowDefaultProject).toBe(allowDefaultProject);
    });

    it('does not set allowDefaultProject when options.allowDefaultProject is not defined', () => {
      const settings = createProjectService();

      assert.isUndefined(settings.allowDefaultProject);
    });

    it('uses the default project compiler options when options.defaultProject is set', () => {
      const compilerOptions: ts.CompilerOptions = { strict: true };
      mockGetParsedConfigFileFromTSServer.mockReturnValueOnce({
        errors: [],
        fileNames: [],
        options: compilerOptions,
      });

      const defaultProject = 'tsconfig.eslint.json';

      createProjectService({
        options: {
          allowDefaultProject: ['file.js'],
          defaultProject,
        },
      });

      expect(mockSetCompilerOptionsForInferredProjects).toHaveBeenCalledWith(
        compilerOptions,
      );

      expect(mockGetParsedConfigFileFromTSServer).toHaveBeenCalledWith(
        expect.any(Object),
        defaultProject,
        true,
        undefined,
      );
    });
  });

  it('uses tsconfigRootDir as getParsedConfigFile projectDirectory when provided', async () => {
    const compilerOptions: ts.CompilerOptions = { strict: true };
    const tsconfigRootDir = 'path/to/repo';
    mockGetParsedConfigFileFromTSServer.mockReturnValueOnce({
      errors: [],
      fileNames: [],
      options: compilerOptions,
    });

    const { service } = createProjectService({
      options: { allowDefaultProject: ['file.js'] },
      tsconfigRootDir,
    });

    expect(service.setCompilerOptionsForInferredProjects).toHaveBeenCalledWith(
      compilerOptions,
    );

    expect(mockGetParsedConfigFileFromTSServer).toHaveBeenCalledWith(
      (await import('typescript/lib/tsserverlibrary.js')).default,
      'tsconfig.json',
      false,
      tsconfigRootDir,
    );
  });

  it('uses the default projects error debugger for error messages when enabled', () => {
    debug.enable('typescript-eslint:project-service:tsserver:err');
    const { service } = createProjectService();

    service.logger.msg('foo', ts.server.Msg.Err);

    const newLocal = service.logger.loggingEnabled();
    expect(newLocal).toBe(true);
    expect(processStderrWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^.*typescript-eslint:project-service:tsserver:err foo\n$/,
      ),
    );
  });

  it('does not use the default projects error debugger for error messages when disabled', () => {
    const { service } = createProjectService();

    service.logger.msg('foo', ts.server.Msg.Err);

    expect(service.logger.loggingEnabled()).toBe(false);
    expect(processStderrWriteSpy).not.toHaveBeenCalled();
  });

  it('uses the default projects info debugger for info messages when enabled', () => {
    debug.enable('typescript-eslint:project-service:tsserver:info');

    const { service } = createProjectService();

    service.logger.info('foo');

    expect(service.logger.loggingEnabled()).toBe(true);
    expect(processStderrWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^.*typescript-eslint:project-service:tsserver:info foo\n$/,
      ),
    );
  });

  it('does not use the default projects info debugger for info messages when disabled', () => {
    const { service } = createProjectService();

    service.logger.info('foo');

    expect(service.logger.loggingEnabled()).toBe(false);
    expect(processStderrWriteSpy).not.toHaveBeenCalled();
  });

  it('uses the default projects perf debugger for perf messages when enabled', () => {
    debug.enable('typescript-eslint:project-service:tsserver:perf');
    const { service } = createProjectService();

    service.logger.perftrc('foo');

    expect(service.logger.loggingEnabled()).toBe(true);
    expect(processStderrWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^.*typescript-eslint:project-service:tsserver:perf foo\n$/,
      ),
    );
  });

  it('does not use the default projects perf debugger for perf messages when disabled', () => {
    const { service } = createProjectService();

    service.logger.perftrc('foo');

    expect(service.logger.loggingEnabled()).toBe(false);
    expect(processStderrWriteSpy).not.toHaveBeenCalled();
  });

  it('enables all log levels for the default projects logger', () => {
    const { service } = createProjectService();

    expect(service.logger.hasLevel(ts.server.LogLevel.terse)).toBe(true);
    expect(service.logger.hasLevel(ts.server.LogLevel.normal)).toBe(true);
    expect(service.logger.hasLevel(ts.server.LogLevel.requestTime)).toBe(true);
    expect(service.logger.hasLevel(ts.server.LogLevel.verbose)).toBe(true);
  });

  it('does not return a log filename with the default projects logger', () => {
    const { service } = createProjectService();

    assert.isUndefined(service.logger.getLogFileName());
  });

  it('uses the default projects event debugger for event handling when enabled', () => {
    debug.enable('typescript-eslint:project-service:tsserver:event');

    createProjectService();

    expect(processStderrWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^.*typescript-eslint:project-service:tsserver:event { eventName: 'projectLoadingStart' }\n$/,
      ),
    );
  });

  it('does not use the default projects event debugger for event handling when disabled', () => {
    createProjectService();

    expect(processStderrWriteSpy).not.toHaveBeenCalled();
  });

  it('provides a stub require to the host system when loadTypeScriptPlugins is falsy', () => {
    const { service } = createProjectService({});

    const required = service.host.require?.('', '');

    expect(required).toStrictEqual({
      error: {
        message:
          'TypeScript plugins are not required when using parserOptions.projectService.',
      },
      module: undefined,
    });
  });

  it('does not provide a require to the host system when loadTypeScriptPlugins is truthy', async () => {
    const { service } = createProjectService({
      options: { loadTypeScriptPlugins: true },
    });

    expect(service.host.require).toBe(
      (
        await vi.importActual<Record<string, Record<string, object>>>(
          'typescript/lib/tsserverlibrary.js',
        )
      ).sys.require,
    );
  });

  it('sets a host configuration', () => {
    createProjectService({
      options: { allowDefaultProject: ['file.js'] },
    });

    expect(mockSetHostConfiguration).toHaveBeenCalledWith({
      preferences: {
        includePackageJsonAutoImports: 'off',
      },
    });
  });

  it('uses watchFile from custom host', () => {
    const watchFile = (): ts.FileWatcher => ({
      close() {
        void 0;
      },
    });
    const { service } = createProjectService({
      host: {
        watchFile,
      },
    });

    expect(service.host.watchFile).toEqual(watchFile);
  });

  it('uses readFile from custom host', () => {
    const readFile = (): string | undefined => undefined;
    const { service } = createProjectService({
      host: {
        readFile,
      },
    });

    expect(service.host.readFile).toEqual(readFile);
  });
});
