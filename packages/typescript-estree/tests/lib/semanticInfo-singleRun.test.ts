import * as glob from 'glob';
import * as path from 'node:path';

import { createProgramFromConfigFile as createProgramFromConfigFileOriginal } from '../../src/create-program/useProvidedPrograms';
import {
  clearParseAndGenerateServicesCalls,
  clearProgramCache,
  parseAndGenerateServices,
} from '../../src/parser';

const mockProgram = {
  getCompilerOptions(): unknown {
    return {};
  },
  getSourceFile(): void {
    return;
  },
  getTypeChecker(): void {
    return;
  },
};

vi.mock('../../src/ast-converter.js', () => {
  return {
    astConverter(): unknown {
      return { astMaps: {}, estree: {} };
    },
  };
});

interface MockProgramWithConfigFile {
  __FROM_CONFIG_FILE__?: string;
}

vi.mock(import('../../src/create-program/shared.js'), async importOriginal => {
  const actual = await importOriginal();

  return {
    ...actual,
    getAstFromProgram: ((program: MockProgramWithConfigFile): unknown => {
      if (
        program.__FROM_CONFIG_FILE__?.endsWith('non-matching-tsconfig.json')
      ) {
        return null;
      }
      // Remove temporary tracking value for the config added by mock createProgramFromConfigFile() below
      delete program.__FROM_CONFIG_FILE__;
      return { ast: {}, program };
    }) as unknown as typeof actual.getAstFromProgram,
  };
});

vi.mock(
  import('../../src/create-program/useProvidedPrograms.js'),
  async importOriginal => {
    const actual = await importOriginal();

    return {
      ...actual,
      createProgramFromConfigFile: vi.fn(
        (configFile): MockProgramWithConfigFile => {
          return {
            // So we can differentiate our mock return values based on which tsconfig this is
            __FROM_CONFIG_FILE__: configFile,
            ...mockProgram,
          };
        },
      ) as unknown as typeof actual.createProgramFromConfigFile,
    };
  },
);

vi.mock(
  import('../../src/create-program/getWatchProgramsForProjects.js'),
  async importOriginal => {
    const actual = await importOriginal();

    return {
      ...actual,
      getWatchProgramsForProjects: vi.fn(() => [
        mockProgram,
      ]) as unknown as typeof actual.getWatchProgramsForProjects,
    };
  },
);

const createProgramFromConfigFile = vi.mocked(
  createProgramFromConfigFileOriginal,
);

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures', 'semanticInfo');
const testFiles = glob.sync(`**/*.src.ts`, {
  cwd: FIXTURES_DIR,
});

const code = 'const foo = 5;';
// File will not be found in the first Program, but will be in the second
const tsconfigs = ['./non-matching-tsconfig.json', './tsconfig.json'];
const options = {
  allowAutomaticSingleRunInference: true,
  filePath: testFiles[0],
  loggerFn: false,
  project: tsconfigs,
  tsconfigRootDir: FIXTURES_DIR,
} as const;

const resolvedProject = (p: string): string => path.resolve(FIXTURES_DIR, p);

describe('semanticInfo - singleRun', () => {
  beforeEach(() => {
    // ensure caches are clean for each test
    clearProgramCache();
    // ensure invocations of mock are clean for each test
    createProgramFromConfigFile.mockClear();
    // Do not track invocations per file across tests
    clearParseAndGenerateServicesCalls();
  });

  it('should not create any programs ahead of time by default when there is no way to infer singleRun=true', () => {
    // For when these tests themselves are running in CI, we need to ignore that for this particular spec
    vi.stubEnv('CI', 'false');

    /**
     * At this point there is nothing to indicate it is a single run, so createProgramFromConfigFile should
     * never be called
     */
    parseAndGenerateServices(code, options);
    expect(createProgramFromConfigFile).not.toHaveBeenCalled();
  });

  it('should not create any programs ahead of time when when TSESTREE_SINGLE_RUN=false, even if other inference criteria apply', () => {
    vi.stubEnv('TSESTREE_SINGLE_RUN', 'false');

    // Normally CI=true would be used to infer singleRun=true, but TSESTREE_SINGLE_RUN is explicitly set to false
    vi.stubEnv('CI', 'true');

    parseAndGenerateServices(code, options);
    expect(createProgramFromConfigFile).not.toHaveBeenCalled();
  });

  it.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    'should lazily create the required program out of the provided "parserOptions.project" one time when TSESTREE_SINGLE_RUN=true',
    () => {
      /**
       * Single run because of explicit environment variable TSESTREE_SINGLE_RUN
       */
      vi.stubEnv('TSESTREE_SINGLE_RUN', 'true');

      const resultProgram = parseAndGenerateServices(code, options).services
        .program;
      expect(resultProgram).toStrictEqual(mockProgram);

      // Call parseAndGenerateServices() again to ensure caching of Programs is working correctly...
      parseAndGenerateServices(code, options);
      // ...by asserting this was only called once per project
      expect(createProgramFromConfigFile).toHaveBeenCalledTimes(
        tsconfigs.length,
      );

      expect(createProgramFromConfigFile).toHaveBeenNthCalledWith(
        1,
        resolvedProject(tsconfigs[0]),
      );
      expect(createProgramFromConfigFile).toHaveBeenNthCalledWith(
        2,
        resolvedProject(tsconfigs[1]),
      );
    },
  );

  it.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    'should lazily create the required program out of the provided "parserOptions.project" one time when singleRun is inferred from CI=true',
    () => {
      /**
       * Single run because of CI=true (we need to make sure we respect the original value
       * so that we won't interfere with our own usage of the variable)
       */
      vi.stubEnv('CI', 'true');

      const resultProgram = parseAndGenerateServices(code, options).services
        .program;
      expect(resultProgram).toStrictEqual(mockProgram);

      // Call parseAndGenerateServices() again to ensure caching of Programs is working correctly...
      parseAndGenerateServices(code, options);
      // ...by asserting this was only called once per project
      expect(createProgramFromConfigFile).toHaveBeenCalledTimes(
        tsconfigs.length,
      );

      expect(createProgramFromConfigFile).toHaveBeenNthCalledWith(
        1,
        resolvedProject(tsconfigs[0]),
      );
      expect(createProgramFromConfigFile).toHaveBeenNthCalledWith(
        2,
        resolvedProject(tsconfigs[1]),
      );
    },
  );

  it.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    'should lazily create the required program out of the provided "parserOptions.project" one time when singleRun is inferred from process.argv',
    () => {
      /**
       * Single run because of process.argv
       */
      vi.stubGlobal('process', {
        ...process,
        argv: ['', path.normalize('node_modules/.bin/eslint'), ''],
      });

      const resultProgram = parseAndGenerateServices(code, options).services
        .program;
      expect(resultProgram).toStrictEqual(mockProgram);

      // Call parseAndGenerateServices() again to ensure caching of Programs is working correctly...
      parseAndGenerateServices(code, options);
      // ...by asserting this was only called once per project
      expect(createProgramFromConfigFile).toHaveBeenCalledTimes(
        tsconfigs.length,
      );

      expect(createProgramFromConfigFile).toHaveBeenNthCalledWith(
        1,
        resolvedProject(tsconfigs[0]),
      );
      expect(createProgramFromConfigFile).toHaveBeenNthCalledWith(
        2,
        resolvedProject(tsconfigs[1]),
      );
    },
  );

  it.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    'should stop iterating through and lazily creating programs for the given "parserOptions.project" once a matching one has been found',
    () => {
      /**
       * Single run because of explicit environment variable TSESTREE_SINGLE_RUN
       */
      vi.stubEnv('TSESTREE_SINGLE_RUN', 'true');

      const optionsWithReversedTsconfigs = {
        ...options,
        //  Now the matching tsconfig comes first
        project: [...options.project].reverse(),
      };

      const resultProgram = parseAndGenerateServices(
        code,
        optionsWithReversedTsconfigs,
      ).services.program;
      expect(resultProgram).toStrictEqual(mockProgram);

      // Call parseAndGenerateServices() again to ensure caching of Programs is working correctly...
      parseAndGenerateServices(code, options);

      expect(createProgramFromConfigFile).toHaveBeenCalledExactlyOnceWith(
        resolvedProject(tsconfigs[1]),
      );
    },
  );
});
