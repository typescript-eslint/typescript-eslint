import glob from 'glob';
import * as path from 'path';

import { getCanonicalFileName } from '../../src/create-program/shared';
import {
  clearParseAndGenerateServicesCalls,
  clearProgramCache,
  parseAndGenerateServices,
} from '../../src/parser';

const mockProgram = {
  getSourceFile(): void {
    return;
  },
  getTypeChecker(): void {
    return;
  },
};

jest.mock('../../src/ast-converter', () => {
  return {
    astConverter(): unknown {
      return { estree: {}, astMaps: {} };
    },
  };
});

interface MockProgramWithConfigFile {
  __FROM_CONFIG_FILE__?: string;
}

jest.mock('../../src/create-program/shared.ts', () => {
  return {
    ...jest.requireActual('../../src/create-program/shared.ts'),
    getAstFromProgram(program: MockProgramWithConfigFile): unknown {
      if (
        program.__FROM_CONFIG_FILE__?.endsWith('non-matching-tsconfig.json')
      ) {
        return null;
      }
      // Remove temporary tracking value for the config added by mock createProgramFromConfigFile() below
      delete program.__FROM_CONFIG_FILE__;
      return { ast: {}, program };
    },
  };
});

jest.mock('../../src/create-program/useProvidedPrograms.ts', () => {
  return {
    ...jest.requireActual('../../src/create-program/useProvidedPrograms.ts'),
    createProgramFromConfigFile: jest
      .fn()
      .mockImplementation((configFile): MockProgramWithConfigFile => {
        return {
          // So we can differentiate our mock return values based on which tsconfig this is
          __FROM_CONFIG_FILE__: configFile,
          ...mockProgram,
        };
      }),
  };
});

jest.mock('../../src/create-program/getWatchProgramsForProjects', () => {
  return {
    ...jest.requireActual(
      '../../src/create-program/getWatchProgramsForProjects',
    ),
    getWatchProgramsForProjects: jest.fn(() => [mockProgram]),
  };
});

const {
  createProgramFromConfigFile,
} = require('../../src/create-program/useProvidedPrograms');

const FIXTURES_DIR = './tests/fixtures/semanticInfo';
const testFiles = glob.sync(`**/*.src.ts`, {
  cwd: FIXTURES_DIR,
});

const code = 'const foo = 5;';
// File will not be found in the first Program, but will be in the second
const tsconfigs = ['./non-matching-tsconfig.json', './tsconfig.json'];
const options = {
  filePath: testFiles[0],
  tsconfigRootDir: path.join(process.cwd(), FIXTURES_DIR),
  loggerFn: false,
  project: tsconfigs,
  allowAutomaticSingleRunInference: true,
} as const;

const resolvedProject = (p: string): string =>
  getCanonicalFileName(path.resolve(path.join(process.cwd(), FIXTURES_DIR), p));

describe('semanticInfo - singleRun', () => {
  beforeEach(() => {
    // ensure caches are clean for each test
    clearProgramCache();
    // ensure invocations of mock are clean for each test
    (createProgramFromConfigFile as jest.Mock).mockClear();
    // Do not track invocations per file across tests
    clearParseAndGenerateServicesCalls();
  });

  it('should not create any programs ahead of time by default when there is no way to infer singleRun=true', () => {
    // For when these tests themselves are running in CI, we need to ignore that for this particular spec
    const originalEnvCI = process.env.CI;
    process.env.CI = 'false';

    /**
     * At this point there is nothing to indicate it is a single run, so createProgramFromConfigFile should
     * never be called
     */
    parseAndGenerateServices(code, options);
    expect(createProgramFromConfigFile).not.toHaveBeenCalled();

    // Restore process data
    process.env.CI = originalEnvCI;
  });

  it('should not create any programs ahead of time when when TSESTREE_SINGLE_RUN=false, even if other inferrence criteria apply', () => {
    const originalTSESTreeSingleRun = process.env.TSESTREE_SINGLE_RUN;
    process.env.TSESTREE_SINGLE_RUN = 'false';

    // Normally CI=true would be used to infer singleRun=true, but TSESTREE_SINGLE_RUN is explicitly set to false
    const originalEnvCI = process.env.CI;
    process.env.CI = 'true';

    parseAndGenerateServices(code, options);
    expect(createProgramFromConfigFile).not.toHaveBeenCalled();

    // Restore process data
    process.env.TSESTREE_SINGLE_RUN = originalTSESTreeSingleRun;
    process.env.CI = originalEnvCI;
  });

  it('should lazily create the required program out of the provided "parserOptions.project" one time when TSESTREE_SINGLE_RUN=true', () => {
    /**
     * Single run because of explicit environment variable TSESTREE_SINGLE_RUN
     */
    const originalTSESTreeSingleRun = process.env.TSESTREE_SINGLE_RUN;
    process.env.TSESTREE_SINGLE_RUN = 'true';

    const resultProgram = parseAndGenerateServices(code, options).services
      .program;
    expect(resultProgram).toEqual(mockProgram);

    // Call parseAndGenerateServices() again to ensure caching of Programs is working correctly...
    parseAndGenerateServices(code, options);
    // ...by asserting this was only called once per project
    expect(createProgramFromConfigFile).toHaveBeenCalledTimes(tsconfigs.length);

    expect(createProgramFromConfigFile).toHaveBeenNthCalledWith(
      1,
      resolvedProject(tsconfigs[0]),
    );
    expect(createProgramFromConfigFile).toHaveBeenNthCalledWith(
      2,
      resolvedProject(tsconfigs[1]),
    );

    // Restore process data
    process.env.TSESTREE_SINGLE_RUN = originalTSESTreeSingleRun;
  });

  it('should lazily create the required program out of the provided "parserOptions.project" one time when singleRun is inferred from CI=true', () => {
    /**
     * Single run because of CI=true (we need to make sure we respect the original value
     * so that we won't interfere with our own usage of the variable)
     */
    const originalEnvCI = process.env.CI;
    process.env.CI = 'true';

    const resultProgram = parseAndGenerateServices(code, options).services
      .program;
    expect(resultProgram).toEqual(mockProgram);

    // Call parseAndGenerateServices() again to ensure caching of Programs is working correctly...
    parseAndGenerateServices(code, options);
    // ...by asserting this was only called once per project
    expect(createProgramFromConfigFile).toHaveBeenCalledTimes(tsconfigs.length);

    expect(createProgramFromConfigFile).toHaveBeenNthCalledWith(
      1,
      resolvedProject(tsconfigs[0]),
    );
    expect(createProgramFromConfigFile).toHaveBeenNthCalledWith(
      2,
      resolvedProject(tsconfigs[1]),
    );

    // Restore process data
    process.env.CI = originalEnvCI;
  });

  it('should lazily create the required program out of the provided "parserOptions.project" one time when singleRun is inferred from process.argv', () => {
    /**
     * Single run because of process.argv
     */
    const originalProcessArgv = process.argv;
    process.argv = ['', path.normalize('node_modules/.bin/eslint'), ''];

    const resultProgram = parseAndGenerateServices(code, options).services
      .program;
    expect(resultProgram).toEqual(mockProgram);

    // Call parseAndGenerateServices() again to ensure caching of Programs is working correctly...
    parseAndGenerateServices(code, options);
    // ...by asserting this was only called once per project
    expect(createProgramFromConfigFile).toHaveBeenCalledTimes(tsconfigs.length);

    expect(createProgramFromConfigFile).toHaveBeenNthCalledWith(
      1,
      resolvedProject(tsconfigs[0]),
    );
    expect(createProgramFromConfigFile).toHaveBeenNthCalledWith(
      2,
      resolvedProject(tsconfigs[1]),
    );

    // Restore process data
    process.argv = originalProcessArgv;
  });

  it('should stop iterating through and lazily creating programs for the given "parserOptions.project" once a matching one has been found', () => {
    /**
     * Single run because of explicit environment variable TSESTREE_SINGLE_RUN
     */
    const originalTSESTreeSingleRun = process.env.TSESTREE_SINGLE_RUN;
    process.env.TSESTREE_SINGLE_RUN = 'true';

    const optionsWithReversedTsconfigs = {
      ...options,
      //  Now the matching tsconfig comes first
      project: options.project.reverse(),
    };

    const resultProgram = parseAndGenerateServices(
      code,
      optionsWithReversedTsconfigs,
    ).services.program;
    expect(resultProgram).toEqual(mockProgram);

    // Call parseAndGenerateServices() again to ensure caching of Programs is working correctly...
    parseAndGenerateServices(code, options);
    // ...by asserting this was only called only once
    expect(createProgramFromConfigFile).toHaveBeenCalledTimes(1);

    expect(createProgramFromConfigFile).toHaveBeenNthCalledWith(
      1,
      resolvedProject(tsconfigs[0]),
    );

    // Restore process data
    process.env.TSESTREE_SINGLE_RUN = originalTSESTreeSingleRun;
  });
});
