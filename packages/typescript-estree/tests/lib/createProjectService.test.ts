import fs from 'node:fs';
import { join } from 'node:path';

import * as ts from 'typescript';

import { createProjectService } from '../../src/create-program/createProjectService';
import { CORE_COMPILER_OPTIONS } from '../../src/create-program/shared';

const FIXTURES_DIR = join(__dirname, '../fixtures/projectServicesComplex');

const mockGetParsedCommandLineOfConfigFile = jest.fn();
const mockSetCompilerOptionsForInferredProjects = jest.fn();

const origGetParsedCommandLineOfConfigFile =
  ts.getParsedCommandLineOfConfigFile;

jest.mock('typescript/lib/tsserverlibrary', () => ({
  ...jest.requireActual('typescript/lib/tsserverlibrary'),
  getParsedCommandLineOfConfigFile: mockGetParsedCommandLineOfConfigFile,
  server: {
    ProjectService: class {
      setCompilerOptionsForInferredProjects =
        mockSetCompilerOptionsForInferredProjects;
    },
  },
}));

describe('createProjectService', () => {
  // not strictly needed but removes the dependency on tests running in a specific order
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

  it('throws an error when options.defaultProject is set and readConfigFile throws an error', () => {
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

  it('uses the default projects compiler options when options.defaultProject is set and getParsedCommandLineOfConfigFile succeeds', () => {
    mockGetParsedCommandLineOfConfigFile.mockImplementation(
      origGetParsedCommandLineOfConfigFile,
    );
    const base = JSON.parse(
      fs.readFileSync(join(FIXTURES_DIR, 'tsconfig.base.json'), 'utf8'),
    );
    const compilerOptions = base?.compilerOptions;

    const { service } = createProjectService(
      {
        defaultProject: join(FIXTURES_DIR, 'tsconfig.base.json'),
      },
      undefined,
    );

    expect(service.setCompilerOptionsForInferredProjects).toHaveBeenCalledWith(
      // Looser assertion since config parser tacks on some meta data to track references to other files.
      // See https://github.com/microsoft/TypeScript/blob/27bcd4cb5a98bce46c9cdd749752703ead021a4b/src/compiler/commandLineParser.ts#L2888
      // See https://github.com/microsoft/TypeScript/blob/27bcd4cb5a98bce46c9cdd749752703ead021a4b/src/compiler/commandLineParser.ts#L3125
      expect.objectContaining({ ...CORE_COMPILER_OPTIONS, ...compilerOptions }),
    );
  });

  it('uses the default projects compiler options when options.defaultProject is set with a single extends', () => {
    mockGetParsedCommandLineOfConfigFile.mockImplementation(
      origGetParsedCommandLineOfConfigFile,
    );
    const base = JSON.parse(
      fs.readFileSync(join(FIXTURES_DIR, 'tsconfig.base.json'), 'utf8'),
    );
    const compilerOptions = base?.compilerOptions;

    const { service } = createProjectService(
      {
        defaultProject: join(FIXTURES_DIR, 'tsconfig.json'),
      },
      undefined,
    );

    expect(service.setCompilerOptionsForInferredProjects).toHaveBeenCalledWith(
      // Looser assertion since config parser tacks on some meta data to track references to other files.
      // See https://github.com/microsoft/TypeScript/blob/27bcd4cb5a98bce46c9cdd749752703ead021a4b/src/compiler/commandLineParser.ts#L2888
      // See https://github.com/microsoft/TypeScript/blob/27bcd4cb5a98bce46c9cdd749752703ead021a4b/src/compiler/commandLineParser.ts#L3125
      expect.objectContaining({ ...CORE_COMPILER_OPTIONS, ...compilerOptions }),
    );
  });

  it('uses the default projects compiler options when options.defaultProject is set with multiple extends', () => {
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
      ...base?.compilerOptions,
      ...overrides?.compilerOptions,
    };

    const { service } = createProjectService(
      {
        defaultProject: join(FIXTURES_DIR, 'tsconfig.overridden.json'),
      },
      undefined,
    );

    expect(service.setCompilerOptionsForInferredProjects).toHaveBeenCalledWith(
      // Looser assertion since config parser tacks on some meta data to track references to other files.
      // See https://github.com/microsoft/TypeScript/blob/27bcd4cb5a98bce46c9cdd749752703ead021a4b/src/compiler/commandLineParser.ts#L2888
      // See https://github.com/microsoft/TypeScript/blob/27bcd4cb5a98bce46c9cdd749752703ead021a4b/src/compiler/commandLineParser.ts#L3125
      expect.objectContaining({ ...CORE_COMPILER_OPTIONS, ...compilerOptions }),
    );
  });
});
