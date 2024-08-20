import { createParseSettings } from '../../src/parseSettings/createParseSettings';

const projectService = { service: true };

jest.mock('../../src/create-program/createProjectService', () => ({
  createProjectService: (): typeof projectService => projectService,
}));

describe('createParseSettings', () => {
  describe('projectService', () => {
    it('is created when options.projectService is enabled', () => {
      process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE = 'false';

      const parseSettings = createParseSettings('', {
        projectService: true,
      });

      expect(parseSettings.projectService).toBe(projectService);
    });

    it('is created when options.projectService is undefined, options.project is true, and process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE is true', () => {
      process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE = 'true';

      const parseSettings = createParseSettings('', {
        projectService: undefined,
        project: true,
      });

      expect(parseSettings.projectService).toBe(projectService);
    });

    it('is not created when options.projectService is undefined, options.project is falsy, and process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE is true', () => {
      process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE = 'true';

      const parseSettings = createParseSettings('', {
        projectService: undefined,
      });

      expect(parseSettings.projectService).toBeUndefined();
    });

    it('is not created when options.projectService is false, options.project is true, and process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE is true', () => {
      process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE = 'true';

      const parseSettings = createParseSettings('', {
        projectService: false,
        project: true,
      });

      expect(parseSettings.projectService).toBeUndefined();
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
});
