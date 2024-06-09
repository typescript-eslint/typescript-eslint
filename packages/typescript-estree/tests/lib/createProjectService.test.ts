import fs from 'node:fs';
import { join } from 'node:path';

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
});
