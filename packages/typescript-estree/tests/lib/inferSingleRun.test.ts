import * as path from 'path';

import { inferSingleRun } from '../../src/parseSettings/inferSingleRun';

describe('inferSingleRun', () => {
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
    const originalTSESTreeSingleRun = process.env.TSESTREE_SINGLE_RUN;
    process.env.TSESTREE_SINGLE_RUN = run;

    const actual = inferSingleRun({
      programs: null,
      project: './tsconfig.json',
    });

    expect(actual).toBe(expected);

    // Restore process data
    process.env.TSESTREE_SINGLE_RUN = originalTSESTreeSingleRun;
  });

  it.each(['node_modules/.bin/eslint', 'node_modules/eslint/bin/eslint.js'])(
    'returns true when singleRun is inferred from process.argv',
    pathName => {
      const originalProcessArgv = process.argv;
      process.argv = ['', path.normalize(pathName), ''];

      const actual = inferSingleRun({
        programs: null,
        project: './tsconfig.json',
        allowAutomaticSingleRunInference: true,
      });

      expect(actual).toBe(true);

      // Restore process data
      process.argv = originalProcessArgv;
    },
  );

  it('returns true when singleRun is inferred from CI=true', () => {
    const originalEnvCI = process.env.CI;
    process.env.CI = 'true';

    const actual = inferSingleRun({
      programs: null,
      project: './tsconfig.json',
      allowAutomaticSingleRunInference: true,
    });

    expect(actual).toBe(true);

    // Restore process data
    process.env.CI = originalEnvCI;
  });

  it('returns false when there is no way to infer singleRun', () => {
    const actual = inferSingleRun({
      programs: null,
      project: './tsconfig.json',
    });

    expect(actual).toBe(false);
  });
});
