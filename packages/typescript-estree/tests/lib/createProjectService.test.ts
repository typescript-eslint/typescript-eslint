import fs from 'node:fs';
import { join } from 'node:path';

import debug from 'debug';
import * as ts from 'typescript';

import { createProjectService } from '../../src/create-program/createProjectService';
import { CORE_COMPILER_OPTIONS } from '../../src/create-program/shared';

const FIXTURES_DIR = join(__dirname, '../fixtures/projectServicesComplex');

const origSys = ts.sys;
const origGetParsedCommandLineOfConfigFile =
  ts.getParsedCommandLineOfConfigFile;

let mockSys: typeof ts.sys;
const mockGetParsedCommandLineOfConfigFile = jest.fn();
const mockSetCompilerOptionsForInferredProjects = jest.fn();

describe('createProjectService', () => {
  beforeEach(() => {
    jest.resetModules();

    mockSys = origSys;
    // doMock is used over mock to handle the tsserver.sys property mock
    jest.doMock('typescript/lib/tsserverlibrary', () => {
      return {
        ...jest.requireActual('typescript/lib/tsserverlibrary'),
        sys: mockSys,
        getParsedCommandLineOfConfigFile: mockGetParsedCommandLineOfConfigFile,
        server: {
          ProjectService: class {
            setCompilerOptionsForInferredProjects =
              mockSetCompilerOptionsForInferredProjects;
          },
        },
      };
    });
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

  it('throws an error when options.defaultProject is set and getParsedCommandLineOfConfigFile returns an error', () => {
    mockGetParsedCommandLineOfConfigFile.mockReturnValue({
      errors: [
        {
          category: ts.DiagnosticCategory.Error,
          code: 1234,
          file: ts.createSourceFile('./tsconfig.json', '', {
            languageVersion: ts.ScriptTarget.Latest,
          }),
          start: 0,
          length: 0,
          messageText: 'Oh no!',
        },
      ] satisfies ts.Diagnostic[],
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
      /Could not parse default project '\.\/tsconfig.json': .+ error TS1234: Oh no!/,
    );
  });

  it('throws an error when options.defaultProject is absolute and getParsedCommandLineOfConfigFile returns an error', () => {
    mockGetParsedCommandLineOfConfigFile.mockReturnValue({
      errors: [
        {
          category: ts.DiagnosticCategory.Error,
          code: 1234,
          // absolute path triggers getCanonicalFileName for coverage
          file: ts.createSourceFile('/tsconfig.json', '', {
            languageVersion: ts.ScriptTarget.Latest,
          }),
          start: 0,
          length: 0,
          messageText: 'Oh no!',
        },
      ] satisfies ts.Diagnostic[],
    });

    expect(() =>
      createProjectService(
        {
          allowDefaultProject: ['file.js'],
          defaultProject: '/tsconfig.json',
        },
        undefined,
      ),
    ).toThrow(
      /Could not parse default project '\/tsconfig.json': .+ error TS1234: Oh no!/,
    );
  });

  it('throws an error when options.defaultProject is set and getParsedCommandLineOfConfigFile throws an error', () => {
    mockGetParsedCommandLineOfConfigFile.mockImplementation(() => {
      throw new Error('Oh no!');
    });

    expect(() => {
      return createProjectService(
        {
          allowDefaultProject: ['file.js'],
          defaultProject: './tsconfig.json',
        },
        undefined,
      );
    }).toThrow("Could not parse default project './tsconfig.json': Oh no!");
  });

  it('throws an error when options.defaultProject is set and tsserver.sys is undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockSys = undefined as any;
    expect(() => {
      return createProjectService(
        {
          allowDefaultProject: ['file.js'],
          defaultProject: './tsconfig.json',
        },
        undefined,
      );
    }).toThrow(
      "Could not parse default project './tsconfig.json': `createProgramFromConfigFile` is only supported in a Node-like environment.",
    );
  });

  it('uses the default projects compiler options when options.defaultProject is set and getParsedCommandLineOfConfigFile succeeds', () => {
    mockGetParsedCommandLineOfConfigFile.mockImplementation(
      origGetParsedCommandLineOfConfigFile,
    );

    const base = JSON.parse(
      fs.readFileSync(join(FIXTURES_DIR, 'tsconfig.base.json'), 'utf8'),
    );
    const compilerOptions = {
      ...CORE_COMPILER_OPTIONS,
      ...base?.compilerOptions,
    };
    const { service } = createProjectService(
      {
        defaultProject: join(FIXTURES_DIR, 'tsconfig.base.json'),
      },
      undefined,
    );

    expect(service.setCompilerOptionsForInferredProjects).toHaveBeenCalledWith(
      // looser assertion since config parser adds metadata to track references to other files
      expect.objectContaining(compilerOptions),
    );
  });

  it('uses the default projects extended compiler options when options.defaultProject is set and getParsedCommandLineOfConfigFile succeeds', () => {
    mockGetParsedCommandLineOfConfigFile.mockImplementation(
      origGetParsedCommandLineOfConfigFile,
    );

    const base = JSON.parse(
      fs.readFileSync(join(FIXTURES_DIR, 'tsconfig.base.json'), 'utf8'),
    );
    const compilerOptions = {
      ...CORE_COMPILER_OPTIONS,
      ...base?.compilerOptions,
    };
    const { service } = createProjectService(
      {
        defaultProject: join(FIXTURES_DIR, 'tsconfig.json'),
      },
      undefined,
    );

    expect(service.setCompilerOptionsForInferredProjects).toHaveBeenCalledWith(
      // looser assertion since config parser adds metadata to track references to other files
      expect.objectContaining(compilerOptions),
    );
  });

  it('uses the default projects multiple extended compiler options when options.defaultProject is set and getParsedCommandLineOfConfigFile succeeds', () => {
    mockGetParsedCommandLineOfConfigFile.mockImplementation(
      origGetParsedCommandLineOfConfigFile,
    );

    const base = JSON.parse(
      fs.readFileSync(join(FIXTURES_DIR, 'tsconfig.base.json'), 'utf8'),
    );
    const overrides = JSON.parse(
      fs.readFileSync(join(FIXTURES_DIR, 'tsconfig.overrides.json'), 'utf8'),
    );
    const compilerOptions = {
      ...CORE_COMPILER_OPTIONS,
      ...base?.compilerOptions,
      ...overrides?.compilerOptions,
    };
    const { service } = createProjectService(
      {
        // extends tsconfig.base.json and tsconfig.overrides.json
        defaultProject: join(FIXTURES_DIR, 'tsconfig.overridden.json'),
      },
      undefined,
    );

    expect(service.setCompilerOptionsForInferredProjects).toHaveBeenCalledWith(
      // looser assertion since config parser adds metadata to track references to other files
      expect.objectContaining(compilerOptions),
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
