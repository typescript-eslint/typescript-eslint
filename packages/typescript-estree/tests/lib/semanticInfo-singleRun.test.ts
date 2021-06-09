import glob from 'glob';
import * as path from 'path';
import { clearProgramCache, parseAndGenerateServices } from '../../src';

const mockProgram = {
  getSourceFile(): void {
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

jest.mock('../../src/create-program/useProvidedPrograms.ts', () => {
  return {
    ...jest.requireActual('../../src/create-program/useProvidedPrograms.ts'),
    useProvidedPrograms: jest.fn(() => {
      return {
        ast: {
          parseDiagnostics: [],
        },
        program: mockProgram,
      };
    }),
    createProgramFromConfigFile: jest.fn(() => mockProgram),
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
const tsconfigs = ['./tsconfig.json', './badTSConfig/tsconfig.json'];
const options = {
  filePath: testFiles[0],
  tsconfigRootDir: path.join(process.cwd(), FIXTURES_DIR),
  loggerFn: false,
  project: tsconfigs,
} as const;

const resolvedProject = (p: string): string =>
  path.resolve(path.join(process.cwd(), FIXTURES_DIR), p).toLowerCase();

describe('semanticInfo - singleRun', () => {
  beforeEach(() => {
    // ensure caches are clean for each test
    clearProgramCache();
    // ensure invocations of mock are clean for each test
    (createProgramFromConfigFile as jest.Mock).mockClear();
  });

  it('should not create any programs ahead of time by default when there is no way to infer singleRun=true', () => {
    /**
     * Nothing to indicate it is a single run, so createProgramFromConfigFile should
     * never be called
     */
    parseAndGenerateServices(code, options);
    expect(createProgramFromConfigFile).not.toHaveBeenCalled();
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

  it('should create all programs for provided "parserOptions.project" once ahead of time when TSESTREE_SINGLE_RUN=true', () => {
    /**
     * Single run because of explicit environment variable TSESTREE_SINGLE_RUN
     */
    const originalTSESTreeSingleRun = process.env.TSESTREE_SINGLE_RUN;
    process.env.TSESTREE_SINGLE_RUN = 'true';

    const resultProgram = parseAndGenerateServices(code, options).services
      .program;
    expect(resultProgram).toBe(mockProgram);

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

  it('should create all programs for provided "parserOptions.project" once ahead of time when singleRun is inferred from CI=true', () => {
    /**
     * Single run because of CI=true (we need to make sure we respect the original value
     * so that we won't interfere with our own usage of the variable)
     */
    const originalEnvCI = process.env.CI;
    process.env.CI = 'true';

    const resultProgram = parseAndGenerateServices(code, options).services
      .program;
    expect(resultProgram).toBe(mockProgram);

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

  it('should create all programs for provided "parserOptions.project" once ahead of time when singleRun is inferred from process.argv', () => {
    /**
     * Single run because of process.argv
     */
    const originalProcessArgv = process.argv;
    process.argv = ['', 'node_modules/.bin/eslint', ''];

    const resultProgram = parseAndGenerateServices(code, options).services
      .program;
    expect(resultProgram).toBe(mockProgram);

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
});
