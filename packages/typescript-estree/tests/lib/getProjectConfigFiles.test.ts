import { existsSync } from 'node:fs';
import path from 'node:path';

import { ExpiringCache } from '../../src/parseSettings/ExpiringCache';
import { getProjectConfigFiles } from '../../src/parseSettings/getProjectConfigFiles';

const mockExistsSync = vi.mocked(existsSync);

vi.mock(import('node:fs'), async importOriginal => {
  const actual = await importOriginal();

  return {
    ...actual,
    default: actual.default,
    existsSync: vi.fn(actual.existsSync),
  };
});

const parseSettings = {
  filePath: path.normalize('/repos/repo/packages/package/file.ts'),
  tsconfigMatchCache: new ExpiringCache<string, string>(1),
  tsconfigRootDir: path.normalize('/repos/repo'),
};

describe(getProjectConfigFiles, () => {
  beforeEach(() => {
    parseSettings.tsconfigMatchCache.clear();
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('returns an array with just the project when given as a string', () => {
    const project = './tsconfig.eslint.json';

    const actual = getProjectConfigFiles(parseSettings, project);

    expect(actual).toStrictEqual([project]);
  });

  it('returns the project when given as a string array', () => {
    const project = ['./tsconfig.eslint.json'];

    const actual = getProjectConfigFiles(parseSettings, project);

    expect(actual).toStrictEqual(project);
  });

  describe('it does not enable type-aware linting when given as', () => {
    const testCases = [[undefined], [null], [false]] as const;

    it.for(testCases)('%o', ([project], { expect }) => {
      const actual = getProjectConfigFiles(parseSettings, project);

      expect(actual).toBeNull();
    });
  });

  describe('when caching hits', () => {
    it('returns a local tsconfig.json without calling existsSync a second time', () => {
      mockExistsSync.mockReturnValueOnce(true);

      getProjectConfigFiles(parseSettings, true);
      const actual = getProjectConfigFiles(parseSettings, true);

      expect(actual).toStrictEqual([
        path.normalize('/repos/repo/packages/package/tsconfig.json'),
      ]);
      expect(mockExistsSync).toHaveBeenCalledOnce();
    });

    it('returns a nearby parent tsconfig.json when it was previously cached by a different directory search', () => {
      mockExistsSync.mockImplementation(
        input => input === path.normalize('/a/tsconfig.json'),
      );

      const tsconfigMatchCache = new ExpiringCache<string, string>(1);

      // This should call to fs.existsSync three times: c, b, a
      getProjectConfigFiles(
        {
          filePath: path.normalize('/a/b/c/d.ts'),
          tsconfigMatchCache,
          tsconfigRootDir: path.normalize('/a'),
        },
        true,
      );

      // This should call to fs.existsSync once: e
      // Then it should retrieve c from cache, pointing to a
      const actual = getProjectConfigFiles(
        {
          filePath: path.normalize('/a/b/c/e/f.ts'),
          tsconfigMatchCache,
          tsconfigRootDir: path.normalize('/a'),
        },
        true,
      );

      expect(actual).toStrictEqual([path.normalize('/a/tsconfig.json')]);
      expect(mockExistsSync).toHaveBeenCalledTimes(4);
    });

    it('returns a distant parent tsconfig.json when it was previously cached by a different directory search', () => {
      mockExistsSync.mockImplementation(
        input => input === path.normalize('/a/tsconfig.json'),
      );

      const tsconfigMatchCache = new ExpiringCache<string, string>(1);

      // This should call to fs.existsSync 4 times: d, c, b, a
      getProjectConfigFiles(
        {
          filePath: path.normalize('/a/b/c/d/e.ts'),
          tsconfigMatchCache,
          tsconfigRootDir: path.normalize('/a'),
        },
        true,
      );

      // This should call to fs.existsSync 2: g, f
      // Then it should retrieve b from cache, pointing to a
      const actual = getProjectConfigFiles(
        {
          filePath: path.normalize('/a/b/f/g/h.ts'),
          tsconfigMatchCache,
          tsconfigRootDir: path.normalize('/a'),
        },
        true,
      );

      expect(actual).toStrictEqual([path.normalize('/a/tsconfig.json')]);
      expect(mockExistsSync).toHaveBeenCalledTimes(6);
    });
  });

  describe('when caching misses', () => {
    it('returns a local tsconfig.json when matched', () => {
      mockExistsSync.mockReturnValueOnce(true);

      const actual = getProjectConfigFiles(parseSettings, true);

      expect(actual).toStrictEqual([
        path.normalize('/repos/repo/packages/package/tsconfig.json'),
      ]);
    });

    it('returns a parent tsconfig.json when matched', () => {
      mockExistsSync.mockImplementation(
        filePath => filePath === path.normalize('/repos/repo/tsconfig.json'),
      );

      const actual = getProjectConfigFiles(parseSettings, true);

      expect(actual).toStrictEqual([
        path.normalize('/repos/repo/tsconfig.json'),
      ]);
    });

    it('throws when searching hits .', async () => {
      // ensure posix-style paths are used for consistent snapshot.
      vi.mock('path', async () => {
        const actual = await vi.importActual<typeof path>('path');
        return {
          ...actual.posix,
          default: actual.posix,
        };
      });

      const { getProjectConfigFiles } = await import(
        '../../src/parseSettings/getProjectConfigFiles.js'
      );

      mockExistsSync.mockReturnValue(false);

      expect(() =>
        getProjectConfigFiles(parseSettings, true),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: project was set to \`true\` but couldn't find any tsconfig.json relative to '/repos/repo/packages/package/file.ts' within '/repos/repo'.]`,
      );
    });

    it('throws when searching passes the tsconfigRootDir', async () => {
      // ensure posix-style paths are used for consistent snapshot.
      vi.mock('path', async () => {
        const actual = await vi.importActual<typeof path>('path');
        return {
          ...actual.posix,
          default: actual.posix,
        };
      });

      const { getProjectConfigFiles } = await import(
        '../../src/parseSettings/getProjectConfigFiles.js'
      );

      mockExistsSync.mockReturnValue(false);

      expect(() =>
        getProjectConfigFiles(
          { ...parseSettings, tsconfigRootDir: path.normalize('/') },
          true,
        ),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: project was set to \`true\` but couldn't find any tsconfig.json relative to '/repos/repo/packages/package/file.ts' within '/'.]`,
      );
    });
  });
});
