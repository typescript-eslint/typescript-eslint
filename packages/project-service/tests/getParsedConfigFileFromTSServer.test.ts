import type * as ts from 'typescript/lib/tsserverlibrary';

import { getParsedConfigFileFromTSServer } from '../src/getParsedConfigFileFromTSServer.js';

const mockGetParsedConfigFile = vi.fn();

vi.mock('@typescript-eslint/tsconfig-utils', () => ({
  get getParsedConfigFile() {
    return mockGetParsedConfigFile;
  },
}));

const mockConfigFile = {
  fileNames: [],
};

const mockTSServer = {} as unknown as typeof ts;
const mockTSConfigRootDir = '/mock/tsconfig/root/dir';

describe(getParsedConfigFileFromTSServer, () => {
  it('returns the parsed config file when getParsedConfigFile succeeds', () => {
    mockGetParsedConfigFile.mockReturnValueOnce(mockConfigFile);

    const actual = getParsedConfigFileFromTSServer(
      mockTSServer,
      'tsconfig.json',
      false,
      mockTSConfigRootDir,
    );

    expect(actual).toBe(mockConfigFile);
  });

  it('returns undefined when getParsedConfigFile fails and throwOnFailure is false', () => {
    mockGetParsedConfigFile.mockImplementationOnce(() => {
      throw new Error('Oh no!');
    });

    const actual = getParsedConfigFileFromTSServer(
      mockTSServer,
      'tsconfig.json',
      false,
    );

    expect(actual).toBeUndefined();
  });

  it('throws the error when getParsedConfigFile fails and throwOnFailure is true', () => {
    mockGetParsedConfigFile.mockImplementationOnce(() => {
      throw new Error('Oh no!');
    });

    expect(() =>
      getParsedConfigFileFromTSServer(mockTSServer, 'tsconfig.json', true),
    ).toThrow(
      new Error(
        `Could not read Project Service default project 'tsconfig.json': Oh no!`,
      ),
    );
  });
});
