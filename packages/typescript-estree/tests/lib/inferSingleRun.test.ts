import * as path from 'path';

import { inferSingleRun } from '../../src/parseSettings/inferSingleRun';

describe('inferSingleRun', () => {
  const originalEnvCI = process.env.CI;
  const originalProcessArgv = process.argv;
  const originalTSESTreeSingleRun = process.env.TSESTREE_SINGLE_RUN;

  afterEach(() => {
    process.env.CI = originalEnvCI;
    process.argv = originalProcessArgv;
    process.env.TSESTREE_SINGLE_RUN = originalTSESTreeSingleRun;
  });

  it.each(['project', 'programs'])(
    'returns false when given %j is null',
    key => {
      const actual = inferSingleRun({ [key]: null });

      expect(actual).toBe(false);
    },
  );

  it.each([
    ['true', true],
    ['false', false],
  ])('return %s when given TSESTREE_SINGLE_RUN is "%s"', (run, expected) => {
    process.env.TSESTREE_SINGLE_RUN = run;

    const actual = inferSingleRun({
      programs: null,
      project: './tsconfig.json',
    });

    expect(actual).toBe(expected);
  });

  it.each(['node_modules/.bin/eslint', 'node_modules/eslint/bin/eslint.js'])(
    'returns true when singleRun is inferred from process.argv',
    pathName => {
      process.argv = ['', path.normalize(pathName), ''];

      const actual = inferSingleRun({
        programs: null,
        project: './tsconfig.json',
        allowAutomaticSingleRunInference: true,
      });

      expect(actual).toBe(true);
    },
  );

  it('returns true when singleRun is inferred from CI=true', () => {
    process.env.CI = 'true';

    const actual = inferSingleRun({
      programs: null,
      project: './tsconfig.json',
      allowAutomaticSingleRunInference: true,
    });

    expect(actual).toBe(true);
  });

  it('returns false when there is no way to infer singleRun', () => {
    const actual = inferSingleRun({
      programs: null,
      project: './tsconfig.json',
    });

    expect(actual).toBe(false);
  });

  it('returns false even if CI=true when allowAutomaticSingleRunInference is not true', () => {
    process.env.CI = 'true';

    const actual = inferSingleRun({
      programs: null,
      project: './tsconfig.json',
    });

    expect(actual).toBe(false);
  });

  it.each(['node_modules/.bin/eslint', 'node_modules/eslint/bin/eslint.js'])(
    'returns false even if singleRun is inferred from process.argv when allowAutomaticSingleRunInference is not true',
    pathName => {
      process.argv = ['', path.normalize(pathName), ''];

      const actual = inferSingleRun({
        programs: null,
        project: './tsconfig.json',
      });

      expect(actual).toBe(false);
    },
  );
});
