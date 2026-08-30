import type { CreateProjectServiceSettings } from '@typescript-eslint/project-service';
import type { ParserOptions } from '@typescript-eslint/types';
import type * as ts from 'typescript';

import {
  addCandidateTSConfigRootDir,
  clearCandidateTSConfigRootDirs,
} from '../../src/parseSettings/candidateTSConfigRootDirs';
import {
  clearTSServerProjectService,
  createParseSettings,
  validateNativeProjectServiceOptions,
} from '../../src/parseSettings/createParseSettings';

const { createProjectService, projectService } = vi.hoisted(() => {
  const projectService = { service: true };
  return {
    createProjectService: vi.fn(
      (_settings: CreateProjectServiceSettings) => projectService,
    ),
    projectService,
  };
});
const nativeProjectServiceOptions = {
  projectService: { backend: 'native' },
} satisfies ParserOptions;

const isWindows = process.platform === 'win32';

vi.mock('@typescript-eslint/project-service', () => ({
  createProjectService,
}));

describe(createParseSettings, () => {
  describe('projectService', () => {
    beforeEach(() => {
      clearTSServerProjectService();
      createProjectService.mockClear();
    });

    it('preserves the native backend literal type', () => {
      expectTypeOf(
        nativeProjectServiceOptions.projectService.backend,
      ).toEqualTypeOf<'native'>();
    });

    it('is created when options.projectService is enabled', () => {
      vi.stubEnv('TYPESCRIPT_ESLINT_PROJECT_SERVICE', 'false');

      const parseSettings = createParseSettings('', {
        projectService: true,
      });

      expect(parseSettings.projectService).toBe(projectService);
    });

    it('forwards classic options without a backend', () => {
      const options = {
        backend: undefined,
        maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 9,
      };

      createParseSettings('', { projectService: options });

      expect(createProjectService.mock.calls[0][0].options).toStrictEqual({
        maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 9,
      });
    });

    it('is created when options.projectService is undefined, options.project is true, and process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE is true', () => {
      vi.stubEnv('TYPESCRIPT_ESLINT_PROJECT_SERVICE', 'true');
      vi.stubEnv(
        'TYPESCRIPT_ESLINT_IGNORE_PROJECT_AND_PROJECT_SERVICE_ERROR',
        'true',
      );

      const parseSettings = createParseSettings('', {
        project: true,
        projectService: undefined,
      });

      expect(parseSettings.projectService).toBe(projectService);
    });

    it('complains when options.projectService is true, options.project is true, and process.env.TYPESCRIPT_ESLINT_IGNORE_PROJECT_AND_PROJECT_SERVICE_ERROR is not set', () => {
      expect(() =>
        createParseSettings('', {
          project: true,
          projectService: true,
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Enabling "project" does nothing when "projectService" is enabled. You can remove the "project" setting.]`,
      );
    });

    it('is not created when options.projectService is undefined, options.project is falsy, and process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE is true', () => {
      vi.stubEnv('TYPESCRIPT_ESLINT_PROJECT_SERVICE', 'true');

      const parseSettings = createParseSettings('', {
        projectService: undefined,
      });

      assert.isUndefined(parseSettings.projectService);
    });

    it('is not created when options.projectService is false, options.project is true, and process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE is true', () => {
      vi.stubEnv('TYPESCRIPT_ESLINT_PROJECT_SERVICE', 'true');

      const parseSettings = createParseSettings('', {
        project: true,
        projectService: false,
      });

      assert.isUndefined(parseSettings.projectService);
    });

    it.each([
      [{ project: './tsconfig.json' }, 'parserOptions.project'],
      [{ programs: [{} as ts.Program] }, 'parserOptions.programs'],
      [
        {
          projectService: {
            allowDefaultProject: ['*.ts'],
            backend: 'native' as const,
          },
        },
        'allowDefaultProject',
      ],
      [
        {
          projectService: {
            backend: 'native' as const,
            defaultProject: 'tsconfig.eslint.json',
          },
        },
        'defaultProject',
      ],
      [
        {
          projectService: {
            backend: 'native' as const,
            loadTypeScriptPlugins: true,
          },
        },
        'loadTypeScriptPlugins',
      ],
      [
        {
          projectService: {
            backend: 'native' as const,
            maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 9,
          },
        },
        'maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING',
      ],
      [{ extraFileExtensions: ['.vue'] }, 'extraFileExtensions'],
    ])('rejects unsupported native option %s', (options, identifyingTerm) => {
      expect(() =>
        createParseSettings('', {
          filePath: '/project/file.ts',
          projectService: { backend: 'native' },
          ...options,
        }),
      ).toThrow(identifyingTerm);
      expect(createProjectService).not.toHaveBeenCalled();
    });

    it('stores valid native options without creating the classic service', () => {
      const options = { backend: 'native' as const };

      const parseSettings = createParseSettings('', {
        filePath: '/project/file.ts',
        projectService: options,
      });

      expect(parseSettings.nativeProjectService).toBe(options);
      expect(parseSettings.projectService).toBeUndefined();
      expect(createProjectService).not.toHaveBeenCalled();
    });

    it('requires Node.js 22 for the native service', () => {
      expect(() =>
        validateNativeProjectServiceOptions(
          { projectService: { backend: 'native' } },
          '20.19.0',
        ),
      ).toThrow(
        'The experimental native project service requires Node.js 22 or newer.',
      );
    });

    it('allows the classic service on Node.js 20', () => {
      expect(
        validateNativeProjectServiceOptions(
          { projectService: true },
          '20.19.0',
        ),
      ).toBeUndefined();

      const parseSettings = createParseSettings('', { projectService: true });

      expect(parseSettings.projectService).toBe(projectService);
      expect(createProjectService).toHaveBeenCalledOnce();
    });
  });

  describe('tsconfigMatchCache', () => {
    it('reuses the TSConfig match cache when called a subsequent time', () => {
      const parseSettings1 = createParseSettings('input.ts');
      const parseSettings2 = createParseSettings('input.ts');

      expect(parseSettings1.tsconfigMatchCache).toBe(
        parseSettings2.tsconfigMatchCache,
      );
    });
  });

  describe('tsconfigRootDir', () => {
    beforeEach(() => {
      clearCandidateTSConfigRootDirs();
    });

    it('errors on non-absolute path', () => {
      expect(() =>
        createParseSettings('', { tsconfigRootDir: 'a/b/c' }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: parserOptions.tsconfigRootDir must be an absolute path, but received: "a/b/c". This is a bug in your configuration; please supply an absolute path.]`,
      );
    });

    it.runIf(isWindows)(
      'complains about missing drive letter on windows',
      () => {
        expect(() =>
          createParseSettings('', { tsconfigRootDir: '\\a\\b\\c' }),
        ).toThrowErrorMatchingInlineSnapshot(
          `[Error: parserOptions.tsconfigRootDir must be an absolute path, but received: "\\\\a\\\\b\\\\c". This is a bug in your configuration; please supply an absolute path.]`,
        );
      },
    );

    it('normalizes crazy tsconfigRootDir', () => {
      const parseSettings = createParseSettings('', {
        tsconfigRootDir: !isWindows
          ? '/a/b////..//c///'
          : 'E:\\a\\b\\\\\\\\..\\\\c\\\\\\',
      });

      expect(parseSettings.tsconfigRootDir).toBe(
        !isWindows ? '/a/c' : 'E:\\a\\c',
      );
    });

    it('errors on invalid tsconfigRootDir', () => {
      expect(() =>
        createParseSettings('', {
          // @ts-expect-error -- testing invalid input
          tsconfigRootDir: 42,
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: If provided, parserOptions.tsconfigRootDir must be a string, but received a value of type "number"]`,
      );
    });

    it('uses the provided tsconfigRootDir when it exists and no candidates exist', () => {
      const tsconfigRootDir = !isWindows ? '/a/b/c' : 'F:\\b\\c';

      const parseSettings = createParseSettings('', { tsconfigRootDir });

      expect(parseSettings.tsconfigRootDir).toBe(tsconfigRootDir);
    });

    it('uses the provided tsconfigRootDir when it exists and a candidate exists', () => {
      addCandidateTSConfigRootDir('candidate');
      const tsconfigRootDir = !isWindows ? '/a/b/c' : 'F:\\a\\b\\c';

      const parseSettings = createParseSettings('', { tsconfigRootDir });

      expect(parseSettings.tsconfigRootDir).toBe(tsconfigRootDir);
    });

    it('uses the inferred candidate when no tsconfigRootDir is provided and a candidate exists', () => {
      const tsconfigRootDir = !isWindows ? '/a/b/c' : 'G:\\a\\b\\c';
      addCandidateTSConfigRootDir(tsconfigRootDir);

      const parseSettings = createParseSettings('');

      expect(parseSettings.tsconfigRootDir).toBe(tsconfigRootDir);
    });

    it('should error if inferred tsconfig is not clean', () => {
      addCandidateTSConfigRootDir('a/b/c');

      expect(() => createParseSettings('')).toThrowErrorMatchingInlineSnapshot(
        `[Error: inferred tsconfigRootDir should be a resolved absolute path, but received: "a/b/c". This is a bug in typescript-eslint! Please report it to us at https://github.com/typescript-eslint/typescript-eslint/issues/new/choose.]`,
      );
    });
  });
});
