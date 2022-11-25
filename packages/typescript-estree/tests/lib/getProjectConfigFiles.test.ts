import { getProjectConfigFiles } from '../../src/parseSettings/getProjectConfigFiles';

const mockExistsSync = jest.fn<boolean, [string]>();

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: (filePath: string): boolean => mockExistsSync(filePath),
}));

const parseSettings = {
  filePath: './repos/repo/packages/package/file.ts',
  tsconfigRootDir: './repos/repo',
};

describe('getProjectConfigFiles', () => {
  it('returns the project when given as a string', () => {
    const project = './tsconfig.eslint.json';

    const actual = getProjectConfigFiles(parseSettings, project);

    expect(actual).toBe(project);
  });

  it('returns the project when given as a string array', () => {
    const project = ['./tsconfig.eslint.json'];

    const actual = getProjectConfigFiles(parseSettings, project);

    expect(actual).toBe(project);
  });

  it('returns the project when given as undefined', () => {
    const project = undefined;

    const actual = getProjectConfigFiles(parseSettings, project);

    expect(actual).toBe(project);
  });

  describe('when caching hits', () => {
    beforeAll(() => {
      Date.now = (): number => 0;
    });

    it('returns a local tsconfig.json without calling existsSync a second time', () => {
      mockExistsSync.mockReturnValue(true);

      getProjectConfigFiles(parseSettings, true);
      const actual = getProjectConfigFiles(parseSettings, true);

      expect(actual).toEqual(['repos/repo/packages/package/tsconfig.json']);
      expect(mockExistsSync).toHaveBeenCalledTimes(1);
    });
  });

  describe('when caching misses', () => {
    beforeAll(() => {
      // Tricks Date.now-based caching into always calling to fs.existsSync
      let lastDateNow = 0;
      Date.now = (): number => (lastDateNow += 1000);
    });

    it('returns a local tsconfig.json when matched', () => {
      mockExistsSync.mockReturnValue(true);

      const actual = getProjectConfigFiles(parseSettings, true);

      expect(actual).toEqual(['repos/repo/packages/package/tsconfig.json']);
    });

    it('returns a parent tsconfig.json when matched', () => {
      mockExistsSync.mockImplementation(
        filePath => filePath === 'repos/repo/tsconfig.json',
      );

      const actual = getProjectConfigFiles(parseSettings, true);

      expect(actual).toEqual(['repos/repo/tsconfig.json']);
    });

    it('throws when searching hits .', () => {
      mockExistsSync.mockReturnValue(false);

      expect(() =>
        getProjectConfigFiles(parseSettings, true),
      ).toThrowErrorMatchingInlineSnapshot(
        `"project was set to \`true\` but couldn't find any tsconfig.json relative to './repos/repo/packages/package/file.ts' within './repos/repo'."`,
      );
    });

    it('throws when searching passes the tsconfigRootDir', () => {
      mockExistsSync.mockReturnValue(false);

      expect(() =>
        getProjectConfigFiles({ ...parseSettings, tsconfigRootDir: '/' }, true),
      ).toThrowErrorMatchingInlineSnapshot(
        `"project was set to \`true\` but couldn't find any tsconfig.json relative to './repos/repo/packages/package/file.ts' within '/'."`,
      );
    });
  });
});
