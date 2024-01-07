import { createParseSettings } from '../../src/parseSettings/createParseSettings';

const projectService = { service: true };

jest.mock('../../src/create-program/createProjectService', () => ({
  createProjectService: (): typeof projectService => projectService,
}));

describe('createParseSettings', () => {
  describe('EXPERIMENTAL_projectService', () => {
    it('is created when options.EXPERIMENTAL_useProjectService is enabled', () => {
      process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_TSSERVER = 'false';

      const parseSettings = createParseSettings('', {
        EXPERIMENTAL_useProjectService: true,
      });

      expect(parseSettings.EXPERIMENTAL_projectService).toBe(projectService);
    });

    it('is created when options.EXPERIMENTAL_useProjectService is undefined, options.project is true, and process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_TSSERVER is true', () => {
      process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_TSSERVER = 'true';

      const parseSettings = createParseSettings('', {
        EXPERIMENTAL_useProjectService: undefined,
        project: true,
      });

      expect(parseSettings.EXPERIMENTAL_projectService).toBe(projectService);
    });

    it('is not created when options.EXPERIMENTAL_useProjectService is undefined, options.project is falsy, and process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_TSSERVER is true', () => {
      process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_TSSERVER = 'true';

      const parseSettings = createParseSettings('', {
        EXPERIMENTAL_useProjectService: undefined,
      });

      expect(parseSettings.EXPERIMENTAL_projectService).toBeUndefined();
    });

    it('is not created when options.EXPERIMENTAL_useProjectService is false, options.project is true, and process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_TSSERVER is true', () => {
      process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_TSSERVER = 'true';

      const parseSettings = createParseSettings('', {
        EXPERIMENTAL_useProjectService: false,
        project: true,
      });

      expect(parseSettings.EXPERIMENTAL_projectService).toBeUndefined();
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
