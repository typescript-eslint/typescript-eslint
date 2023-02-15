import { ExpiringCache } from '../../src/parseSettings/ExpiringCache';
import { getProjectConfigFiles } from '../../src/parseSettings/getProjectConfigFiles';

const mockExistsSync = jest.fn<boolean, [string]>();

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: (filePath: string): boolean => mockExistsSync(filePath),
}));

const parseSettings = {
  filePath: './repos/repo/packages/package/file.ts',
  tsconfigMatchCache: new ExpiringCache<string, string>(1),
  tsconfigRootDir: './repos/repo',
};

beforeEach(() => {
  parseSettings.tsconfigMatchCache.clear();
  jest.clearAllMocks();
});

describe('getProjectConfigFiles', () => {
  it('returns an array with just the project when given as a string', () => {
    const project = './tsconfig.eslint.json';

    const actual = getProjectConfigFiles(parseSettings, project);

    expect(actual).toEqual([project]);
  });

  it('returns the project when given as a string array', () => {
    const project = ['./tsconfig.eslint.json'];

    const actual = getProjectConfigFiles(parseSettings, project);

    expect(actual).toEqual(project);
  });

  it('returns the project when given as undefined', () => {
    const project = undefined;

    const actual = getProjectConfigFiles(parseSettings, project);

    expect(actual).toBeNull();
  });

  describe('when caching hits', () => {
    it('returns a local tsconfig.json without calling existsSync a second time', () => {
      mockExistsSync.mockReturnValue(true);

      getProjectConfigFiles(parseSettings, true);
      const actual = getProjectConfigFiles(parseSettings, true);

      expect(actual).toEqual(['repos/repo/packages/package/tsconfig.json']);
      expect(mockExistsSync).toHaveBeenCalledTimes(1);
    });

    it('returns a nearby parent tsconfig.json when it was previously cached by a different directory search', () => {
      mockExistsSync.mockImplementation(input => input === 'a/tsconfig.json');

      const tsconfigMatchCache = new ExpiringCache<string, string>(1);

      // This should call to fs.existsSync three times: c, b, a
      getProjectConfigFiles(
        {
          filePath: './a/b/c/d.ts',
          tsconfigRootDir: './a',
          tsconfigMatchCache,
        },
        true,
      );

      // This should call to fs.existsSync once: e
      // Then it should retrieve c from cache, pointing to a
      const actual = getProjectConfigFiles(
        {
          filePath: './a/b/c/e/f.ts',
          tsconfigRootDir: './a',
          tsconfigMatchCache,
        },
        true,
      );

      expect(actual).toEqual(['a/tsconfig.json']);
      expect(mockExistsSync).toHaveBeenCalledTimes(4);
    });

    it('returns a distant parent tsconfig.json when it was previously cached by a different directory search', () => {
      mockExistsSync.mockImplementation(input => input === 'a/tsconfig.json');

      const tsconfigMatchCache = new ExpiringCache<string, string>(1);

      // This should call to fs.existsSync 4 times: d, c, b, a
      getProjectConfigFiles(
        {
          filePath: './a/b/c/d/e.ts',
          tsconfigRootDir: './a',
          tsconfigMatchCache,
        },
        true,
      );

      // This should call to fs.existsSync 2: g, f
      // Then it should retrieve b from cache, pointing to a
      const actual = getProjectConfigFiles(
        {
          filePath: './a/b/f/g/h.ts',
          tsconfigRootDir: './a',
          tsconfigMatchCache,
        },
        true,
      );

      expect(actual).toEqual(['a/tsconfig.json']);
      expect(mockExistsSync).toHaveBeenCalledTimes(6);
    });
  });

  describe('when caching misses', () => {
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
