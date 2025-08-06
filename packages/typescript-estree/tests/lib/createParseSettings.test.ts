import {
  addCandidateTSConfigRootDir,
  clearCandidateTSConfigRootDirs,
} from '../../src/parseSettings/candidateTSConfigRootDirs';
import { createParseSettings } from '../../src/parseSettings/createParseSettings';

const projectService = { service: true };

vi.mock('@typescript-eslint/project-service', () => ({
  createProjectService: () => projectService,
}));

describe(createParseSettings, () => {
  describe('projectService', () => {
    it('is created when options.projectService is enabled', () => {
      vi.stubEnv('TYPESCRIPT_ESLINT_PROJECT_SERVICE', 'false');

      const parseSettings = createParseSettings('', {
        projectService: true,
      });

      expect(parseSettings.projectService).toBe(projectService);
    });

    it('is created when options.projectService is undefined, options.project is true, and process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE is true', () => {
      vi.stubEnv('TYPESCRIPT_ESLINT_PROJECT_SERVICE', 'true');

      const parseSettings = createParseSettings('', {
        project: true,
        projectService: undefined,
      });

      expect(parseSettings.projectService).toBe(projectService);
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
        `[Error: parserOptions.tsconfigRootDir must be an absolute path, but received: "a/b/c"]`,
      );
    });

    it('errors on invalid tsconfigRootDir', () => {
      expect(() =>
        createParseSettings('', {
          // @ts-expect-error -- testing invalid input
          tsconfigRootDir: 42,
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: if provided, parserOptions.tsconfigRootDir must be a string, but received a value of type "number"]`,
      );
    });

    it('uses the provided tsconfigRootDir when it exists and no candidates exist', () => {
      const tsconfigRootDir = '/a/b/c';

      const parseSettings = createParseSettings('', { tsconfigRootDir });

      expect(parseSettings.tsconfigRootDir).toBe(tsconfigRootDir);
    });

    it('uses the provided tsconfigRootDir when it exists and a candidate exists', () => {
      addCandidateTSConfigRootDir('candidate');
      const tsconfigRootDir = '/a/b/c';

      const parseSettings = createParseSettings('', { tsconfigRootDir });

      expect(parseSettings.tsconfigRootDir).toBe(tsconfigRootDir);
    });

    it('uses the inferred candidate when no tsconfigRootDir is provided and a candidate exists', () => {
      const tsconfigRootDir = '/a/b/c';
      addCandidateTSConfigRootDir(tsconfigRootDir);

      const parseSettings = createParseSettings('');

      expect(parseSettings.tsconfigRootDir).toBe(tsconfigRootDir);
    });
  });
});
