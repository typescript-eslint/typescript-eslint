import path from 'node:path';

import * as ts from 'typescript';

import { getParsedConfigFile } from '../../src/create-program/getParsedConfigFile';

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

  it('throws a diagnostic error when getParsedCommandLineOfConfigFile returns an error', () => {
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
    expect(() => getParsedConfigFile(mockTsserver, './tsconfig.json')).toThrow(
      /.+ error TS1234: Oh no!/,
    );
  });

  it('throws a diagnostic error when getParsedCommandLineOfConfigFile throws an error', () => {
    mockGetParsedCommandLineOfConfigFile.mockImplementation(
      (
        ...[_configFileName, _optionsToExtend, host]: Parameters<
          typeof ts.getParsedCommandLineOfConfigFile
        >
      ) => {
        host.onUnRecoverableConfigFileDiagnostic({
          category: ts.DiagnosticCategory.Error,
          code: 1234,
          file: ts.createSourceFile('./tsconfig.json', '', {
            languageVersion: ts.ScriptTarget.Latest,
          }),
          start: 0,
          length: 0,
          messageText: 'Oh no!',
        } satisfies ts.Diagnostic);
      },
    );
    expect(() => getParsedConfigFile(mockTsserver, './tsconfig.json')).toThrow(
      /.+ error TS1234: Oh no!/,
    );
  });

  it('uses compiler options when parsing a config file succeeds', () => {
    const parsedConfigFile = {
      options: { strict: true },
      raw: { compilerOptions: { strict: true } },
      errors: [],
    };
    mockGetParsedCommandLineOfConfigFile.mockReturnValue(parsedConfigFile);
    expect(getParsedConfigFile(mockTsserver, 'tsconfig.json')).toEqual(
      expect.objectContaining(parsedConfigFile),
    );
  });
});
