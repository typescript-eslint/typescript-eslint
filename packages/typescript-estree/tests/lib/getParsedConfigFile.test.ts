import fs from 'node:fs';
import path from 'node:path';

import * as ts from 'typescript';

import { getParsedConfigFile } from '../../src/create-program/getParsedConfigFile';

const FIXTURES_DIR = path.resolve(
  __dirname,
  '../fixtures/projectServicesComplex',
);

const mockGetParsedCommandLineOfConfigFile = jest.fn();

const mockTsserver: typeof ts = {
  sys: {} as ts.System,
  formatDiagnostics: ts.formatDiagnostics,
  getParsedCommandLineOfConfigFile: mockGetParsedCommandLineOfConfigFile,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe('getParsedConfigFile', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws an error when tsserver.sys is undefined', () => {
    expect(() =>
      getParsedConfigFile({} as typeof ts, './tsconfig.json'),
    ).toThrow(
      '`getParsedConfigFile` is only supported in a Node-like environment.',
    );
  });

  it('uses the cwd as the default project directory', () => {
    getParsedConfigFile(mockTsserver, './tsconfig.json');
    expect(mockGetParsedCommandLineOfConfigFile).toHaveBeenCalledTimes(1);
    const [_configFileName, _optionsToExtend, host] =
      mockGetParsedCommandLineOfConfigFile.mock.calls[0];
    expect(host.getCurrentDirectory()).toBe(process.cwd());
  });

  it('resolves a relative project directory when passed', () => {
    getParsedConfigFile(
      mockTsserver,
      './tsconfig.json',
      path.relative('./', path.dirname(__filename)),
    );
    expect(mockGetParsedCommandLineOfConfigFile).toHaveBeenCalledTimes(1);
    const [_configFileName, _optionsToExtend, host] =
      mockGetParsedCommandLineOfConfigFile.mock.calls[0];
    expect(host.getCurrentDirectory()).toBe(path.dirname(__filename));
  });

  it('resolves an absolute project directory when passed', () => {
    getParsedConfigFile(mockTsserver, './tsconfig.json', __dirname);
    expect(mockGetParsedCommandLineOfConfigFile).toHaveBeenCalledTimes(1);
    const [_configFileName, _optionsToExtend, host] =
      mockGetParsedCommandLineOfConfigFile.mock.calls[0];
    expect(host.getCurrentDirectory()).toBe(__dirname);
  });

  it('returns a diagnostic string when parsing a config file fails', () => {
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
    expect(getParsedConfigFile(mockTsserver, './tsconfig.json')).toMatch(
      /Could not parse config file '\.\/tsconfig.json': .+ error TS1234: Oh no!/,
    );
  });

  it('uses extended compiler options when parsing a config file', () => {
    mockGetParsedCommandLineOfConfigFile.mockImplementation(
      (
        ...args: Parameters<(typeof ts)['getParsedCommandLineOfConfigFile']>
      ) => {
        return ts.getParsedCommandLineOfConfigFile(...args);
      },
    );
    const base = JSON.parse(
      fs.readFileSync(path.resolve(FIXTURES_DIR, 'tsconfig.base.json'), 'utf8'),
    );
    const config = {
      options: expect.objectContaining(base.compilerOptions),
      raw: JSON.parse(
        fs.readFileSync(path.resolve(FIXTURES_DIR, 'tsconfig.json'), 'utf8'),
      ),
    };
    expect(
      getParsedConfigFile(
        mockTsserver,
        path.resolve(FIXTURES_DIR, 'tsconfig.json'),
      ),
    ).toEqual(expect.objectContaining(config));
  });
});
