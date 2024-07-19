import debug from 'debug';
import * as ts from 'typescript';

import { createProjectService } from '../../src/create-program/createProjectService';

const mockReadConfigFile = jest.fn();
const mockSetCompilerOptionsForInferredProjects = jest.fn();

jest.mock('typescript/lib/tsserverlibrary', () => ({
  ...jest.requireActual('typescript/lib/tsserverlibrary'),
  readConfigFile: mockReadConfigFile,
  server: {
    ...jest.requireActual('typescript/lib/tsserverlibrary').server,
    ProjectService: class {
      logger: ts.server.Logger;
      eventHandler: ts.server.ProjectServiceEventHandler | undefined;
      constructor(
        ...args: ConstructorParameters<typeof ts.server.ProjectService>
      ) {
        this.logger = args[0].logger;
        this.eventHandler = args[0].eventHandler;
        if (this.eventHandler) {
          this.eventHandler({
            eventName: 'projectLoadingStart',
          } as ts.server.ProjectLoadingStartEvent);
        }
      }
      setCompilerOptionsForInferredProjects =
        mockSetCompilerOptionsForInferredProjects;
    },
  },
}));

describe('createProjectService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('sets allowDefaultProject when options.allowDefaultProject is defined', () => {
    const allowDefaultProject = ['./*.js'];
    const settings = createProjectService({ allowDefaultProject }, undefined);

    expect(settings.allowDefaultProject).toBe(allowDefaultProject);
  });

  it('does not set allowDefaultProject when options.allowDefaultProject is not defined', () => {
    const settings = createProjectService(undefined, undefined);

    expect(settings.allowDefaultProject).toBeUndefined();
  });

  it('throws an error when options.defaultProject is set and readConfigFile returns an error', () => {
    mockReadConfigFile.mockReturnValue({
      error: {
        category: ts.DiagnosticCategory.Error,
        code: 1234,
        file: ts.createSourceFile('./tsconfig.json', '', {
          languageVersion: ts.ScriptTarget.Latest,
        }),
        start: 0,
        length: 0,
        messageText: 'Oh no!',
      } satisfies ts.Diagnostic,
    });

    expect(() =>
      createProjectService(
        {
          allowDefaultProject: ['file.js'],
          defaultProject: './tsconfig.json',
        },
        undefined,
      ),
    ).toThrow(
      /Could not read default project '\.\/tsconfig.json': .+ error TS1234: Oh no!/,
    );
  });

  it('throws an error when options.defaultProject is set and readConfigFile throws an error', () => {
    mockReadConfigFile.mockImplementation(() => {
      throw new Error('Oh no!');
    });

    expect(() =>
      createProjectService(
        {
          allowDefaultProject: ['file.js'],
          defaultProject: './tsconfig.json',
        },
        undefined,
      ),
    ).toThrow("Could not parse default project './tsconfig.json': Oh no!");
  });

  it('uses the default projects compiler options when options.defaultProject is set and readConfigFile succeeds', () => {
    const compilerOptions = { strict: true };
    mockReadConfigFile.mockReturnValue({ config: { compilerOptions } });

    const { service } = createProjectService(
      {
        allowDefaultProject: ['file.js'],
        defaultProject: './tsconfig.json',
      },
      undefined,
    );

    expect(service.setCompilerOptionsForInferredProjects).toHaveBeenCalledWith(
      compilerOptions,
    );
  });

  it('uses the default projects error debugger for error messages when enabled', () => {
    jest.spyOn(process.stderr, 'write').mockImplementation();
    const { service } = createProjectService(undefined, undefined);
    debug.enable('typescript-eslint:typescript-estree:tsserver:err');
    const enabled = service.logger.loggingEnabled();
    service.logger.msg('foo', ts.server.Msg.Err);
    debug.disable();

    expect(enabled).toBe(true);
    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringMatching(
        /^.*typescript-eslint:typescript-estree:tsserver:err foo\n$/,
      ),
    );
  });

  it('does not use the default projects error debugger for error messages when disabled', () => {
    jest.spyOn(process.stderr, 'write').mockImplementation();
    const { service } = createProjectService(undefined, undefined);
    const enabled = service.logger.loggingEnabled();
    service.logger.msg('foo', ts.server.Msg.Err);

    expect(enabled).toBe(false);
    expect(process.stderr.write).toHaveBeenCalledTimes(0);
  });

  it('uses the default projects info debugger for info messages when enabled', () => {
    jest.spyOn(process.stderr, 'write').mockImplementation();
    const { service } = createProjectService(undefined, undefined);
    debug.enable('typescript-eslint:typescript-estree:tsserver:info');
    const enabled = service.logger.loggingEnabled();
    service.logger.info('foo');
    debug.disable();

    expect(enabled).toBe(true);
    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringMatching(
        /^.*typescript-eslint:typescript-estree:tsserver:info foo\n$/,
      ),
    );
  });

  it('does not use the default projects info debugger for info messages when disabled', () => {
    jest.spyOn(process.stderr, 'write').mockImplementation();
    const { service } = createProjectService(undefined, undefined);
    const enabled = service.logger.loggingEnabled();
    service.logger.info('foo');

    expect(enabled).toBe(false);
    expect(process.stderr.write).toHaveBeenCalledTimes(0);
  });

  it('uses the default projects perf debugger for perf messages when enabled', () => {
    jest.spyOn(process.stderr, 'write').mockImplementation();
    const { service } = createProjectService(undefined, undefined);
    debug.enable('typescript-eslint:typescript-estree:tsserver:perf');
    const enabled = service.logger.loggingEnabled();
    service.logger.perftrc('foo');
    debug.disable();

    expect(enabled).toBe(true);
    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringMatching(
        /^.*typescript-eslint:typescript-estree:tsserver:perf foo\n$/,
      ),
    );
  });

  it('does not use the default projects perf debugger for perf messages when disabled', () => {
    jest.spyOn(process.stderr, 'write').mockImplementation();
    const { service } = createProjectService(undefined, undefined);
    const enabled = service.logger.loggingEnabled();
    service.logger.perftrc('foo');

    expect(enabled).toBe(false);
    expect(process.stderr.write).toHaveBeenCalledTimes(0);
  });

  it('enables all log levels for the default projects logger', () => {
    const { service } = createProjectService(undefined, undefined);

    expect(service.logger.hasLevel(ts.server.LogLevel.terse)).toBe(true);
    expect(service.logger.hasLevel(ts.server.LogLevel.normal)).toBe(true);
    expect(service.logger.hasLevel(ts.server.LogLevel.requestTime)).toBe(true);
    expect(service.logger.hasLevel(ts.server.LogLevel.verbose)).toBe(true);
  });

  it('does not return a log filename with the default projects logger', () => {
    const { service } = createProjectService(undefined, undefined);

    expect(service.logger.getLogFileName()).toBeUndefined();
  });

  it('uses the default projects event debugger for event handling when enabled', () => {
    jest.spyOn(process.stderr, 'write').mockImplementation();

    debug.enable('typescript-eslint:typescript-estree:tsserver:event');
    createProjectService(undefined, undefined);
    debug.disable();

    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringMatching(
        /^.*typescript-eslint:typescript-estree:tsserver:event { eventName: 'projectLoadingStart' }\n$/,
      ),
    );
  });

  it('does not use the default projects event debugger for event handling when disabled', () => {
    jest.spyOn(process.stderr, 'write').mockImplementation();

    createProjectService(undefined, undefined);

    expect(process.stderr.write).toHaveBeenCalledTimes(0);
  });
});
