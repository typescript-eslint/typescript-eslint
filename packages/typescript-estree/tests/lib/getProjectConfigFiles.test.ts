import { existsSync } from 'node:fs';

import type { ParseSettings } from '../../src/parseSettings';

import { ExpiringCache } from '../../src/parseSettings/ExpiringCache';
import { getProjectConfigFiles } from '../../src/parseSettings/getProjectConfigFiles';

const isWindows = process.platform === 'win32';

const mockExistsSync = vi.mocked(existsSync);

vi.mock(import('node:fs'), async importOriginal => {
  const actual = await importOriginal();

  return {
    ...actual,
    existsSync: vi.fn(actual.existsSync),
  };
});

type TestParseSettings = Pick<
  ParseSettings,
  'filePath' | 'tsconfigMatchCache' | 'tsconfigRootDir'
> & { tsconfigMatchCache: ExpiringCache<string, string> };

const parseSettingsWindows: TestParseSettings = {
  filePath: 'H:\\repos\\repo\\packages\\package\\file.ts',
  tsconfigMatchCache: new ExpiringCache<string, string>(1),
  tsconfigRootDir: 'H:\\repos\\repo',
};

const parseSettingsPosix: TestParseSettings = {
  filePath: '/repos/repo/packages/package/file.ts',
  tsconfigMatchCache: new ExpiringCache<string, string>(1),
  tsconfigRootDir: '/repos/repo',
};

const parseSettings: TestParseSettings = !isWindows
  ? parseSettingsPosix
  : parseSettingsWindows;

describe(getProjectConfigFiles, () => {
  beforeEach(() => {
    parseSettings.tsconfigMatchCache.clear();
    vi.clearAllMocks();
    vi.resetModules();
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
        !isWindows
          ? '/repos/repo/packages/package/tsconfig.json'
          : 'H:\\repos\\repo\\packages\\package\\tsconfig.json',
      ]);
      expect(mockExistsSync).toHaveBeenCalledOnce();
    });

    it('returns a nearby parent tsconfig.json when it was previously cached by a different directory search', () => {
      mockExistsSync.mockImplementation(
        input =>
          input === (!isWindows ? '/a/tsconfig.json' : 'H:\\a\\tsconfig.json'),
      );

      const tsconfigMatchCache = new ExpiringCache<string, string>(1);

      // This should call to fs.existsSync three times: c, b, a
      getProjectConfigFiles(
        {
          filePath: !isWindows ? '/a/b/c/d.ts' : 'H:\\a\\b\\c\\d.ts',
          tsconfigMatchCache,
          tsconfigRootDir: !isWindows ? '/a' : 'H:\\a',
        },
        true,
      );

      // This should call to fs.existsSync once: e
      // Then it should retrieve c from cache, pointing to a
      const actual = getProjectConfigFiles(
        {
          filePath: !isWindows ? '/a/b/c/e/f.ts' : 'H:\\a\\b\\c\\e\\f.ts',
          tsconfigMatchCache,
          tsconfigRootDir: !isWindows ? '/a' : 'H:\\a',
        },
        true,
      );

      expect(actual).toStrictEqual([
        !isWindows ? '/a/tsconfig.json' : 'H:\\a\\tsconfig.json',
      ]);
      expect(mockExistsSync).toHaveBeenCalledTimes(4);
    });

    it('returns a distant parent tsconfig.json when it was previously cached by a different directory search', () => {
      mockExistsSync.mockImplementation(
        input =>
          input === (!isWindows ? '/a/tsconfig.json' : 'H:\\a\\tsconfig.json'),
      );

      const tsconfigMatchCache = new ExpiringCache<string, string>(1);

      // This should call to fs.existsSync 4 times: d, c, b, a
      getProjectConfigFiles(
        {
          filePath: !isWindows ? '/a/b/c/d/e.ts' : 'H:\\a\\b\\c\\d\\e.ts',
          tsconfigMatchCache,
          tsconfigRootDir: !isWindows ? '/a' : 'H:\\a',
        },
        true,
      );

      // This should call to fs.existsSync 2: g, f
      // Then it should retrieve b from cache, pointing to a
      const actual = getProjectConfigFiles(
        {
          filePath: !isWindows ? '/a/b/f/g/h.ts' : 'H:\\a\\b\\f\\g\\h.ts',
          tsconfigMatchCache,
          tsconfigRootDir: !isWindows ? '/a' : 'H:\\a',
        },
        true,
      );

      expect(actual).toStrictEqual([
        !isWindows ? '/a/tsconfig.json' : 'H:\\a\\tsconfig.json',
      ]);
      expect(mockExistsSync).toHaveBeenCalledTimes(6);
    });
  });

  describe('when caching misses', () => {
    it.for([
      ['posix', '/other/file.ts', '/repos/repo'],
      ['posix', '/repos/repo/file.ts', '/repos/repo/src'],
      ['posix', '/repos/repo-other/file.ts', '/repos/repo'],
      ['win32', 'H:\\other\\file.ts', 'H:\\repos\\repo'],
      ['win32', 'H:\\repos\\repo\\file.ts', 'H:\\repos\\repo\\src'],
      ['win32', 'H:\\repos\\repo-other\\file.ts', 'H:\\repos\\repo'],
      ['win32', 'I:\\other\\file.ts', 'H:\\repos\\repo'],
    ] as const)(
      'explains a failed lookup outside the search root (%s, %s)',
      async ([pathType, filePath, tsconfigRootDir]) => {
        vi.doMock(import('node:path'), async importActual => {
          const actualPath = await importActual();
          return { ...actualPath[pathType], default: actualPath[pathType] };
        });

        try {
          const { getProjectConfigFiles } =
            await import('../../src/parseSettings/getProjectConfigFiles.js');

          mockExistsSync.mockReturnValue(false);

          expect(() =>
            getProjectConfigFiles(
              { ...parseSettings, filePath, tsconfigRootDir },
              true,
            ),
          ).toThrow(
            `The file '${filePath}' is outside of the configured tsconfigRootDir '${tsconfigRootDir}'. ` +
              'Set parserOptions.tsconfigRootDir to a directory that contains the file, ' +
              'or set parserOptions.project to an explicit TSConfig path.',
          );
        } finally {
          vi.doUnmock(import('node:path'));
        }
      },
    );

    it('still returns an existing local TSConfig outside the search root', () => {
      mockExistsSync.mockReturnValueOnce(true);

      expect(
        getProjectConfigFiles(
          {
            ...parseSettings,
            tsconfigRootDir: !isWindows ? '/unrelated' : 'H:\\unrelated',
          },
          true,
        ),
      ).toStrictEqual([
        !isWindows
          ? '/repos/repo/packages/package/tsconfig.json'
          : 'H:\\repos\\repo\\packages\\package\\tsconfig.json',
      ]);
    });

    it('returns a local tsconfig.json when matched', () => {
      mockExistsSync.mockReturnValueOnce(true);

      const actual = getProjectConfigFiles(parseSettings, true);

      expect(actual).toStrictEqual([
        !isWindows
          ? '/repos/repo/packages/package/tsconfig.json'
          : 'H:\\repos\\repo\\packages\\package\\tsconfig.json',
      ]);
    });

    it('returns a parent tsconfig.json when matched', () => {
      mockExistsSync.mockImplementation(
        filePath =>
          filePath ===
          (!isWindows
            ? '/repos/repo/tsconfig.json'
            : 'H:\\repos\\repo\\tsconfig.json'),
      );

      const actual = getProjectConfigFiles(parseSettings, true);

      expect(actual).toStrictEqual([
        !isWindows
          ? '/repos/repo/tsconfig.json'
          : 'H:\\repos\\repo\\tsconfig.json',
      ]);
    });

    it('throws when searching hits .', async () => {
      // ensure posix-style paths are used for consistent snapshot.
      vi.doMock(import('node:path'), async importActual => {
        const actualPath = await importActual();
        return {
          ...actualPath.posix,
          default: actualPath.posix,
        };
      });

      try {
        const { getProjectConfigFiles } =
          await import('../../src/parseSettings/getProjectConfigFiles.js');

        mockExistsSync.mockReturnValue(false);

        expect(() =>
          getProjectConfigFiles(parseSettingsPosix, true),
        ).toThrowErrorMatchingInlineSnapshot(
          `[Error: project was set to \`true\` but couldn't find any tsconfig.json relative to '/repos/repo/packages/package/file.ts' within '/repos/repo'.]`,
        );
      } finally {
        vi.doUnmock(import('node:path'));
      }
    });

    it('throws when searching passes the tsconfigRootDir', async () => {
      // ensure posix-style paths are used for consistent snapshot.
      vi.doMock(import('node:path'), async importActual => {
        const actualPath = await importActual();
        return { ...actualPath.posix, default: actualPath.posix };
      });
      try {
        const { getProjectConfigFiles } =
          await import('../../src/parseSettings/getProjectConfigFiles.js');

        mockExistsSync.mockReturnValue(false);

        expect(() =>
          getProjectConfigFiles(
            { ...parseSettingsPosix, tsconfigRootDir: '/' },
            true,
          ),
        ).toThrowErrorMatchingInlineSnapshot(
          `[Error: project was set to \`true\` but couldn't find any tsconfig.json relative to '/repos/repo/packages/package/file.ts' within '/'.]`,
        );
      } finally {
        vi.doUnmock(import('node:path'));
      }
    });
  });
});
