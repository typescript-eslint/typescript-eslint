import path from 'path';

import { inferSingleRun } from '../../src/parseSettings/inferSingleRun';

describe('inferSingleRun', () => {
  beforeEach(() => {
    process.argv = ['node', 'eslint'];
    process.env.CI = undefined;
    process.env.TSESTREE_SINGLE_RUN = undefined;
  });

  it('returns false when options is undefined', () => {
    const actual = inferSingleRun(undefined);

    expect(actual).toBe(false);
  });

  it('returns false when options.project is null', () => {
    const actual = inferSingleRun({ project: null });

    expect(actual).toBe(false);
  });

  it('returns false when options.program is defined', () => {
    const actual = inferSingleRun({ programs: [], project: true });

    expect(actual).toBe(false);
  });

  it("returns false when TSESTREE_SINGLE_RUN is 'false'", () => {
    process.env.TSESTREE_SINGLE_RUN = 'false';

    const actual = inferSingleRun({ project: true });

    expect(actual).toBe(false);
  });

  it("returns true when TSESTREE_SINGLE_RUN is 'true'", () => {
    process.env.TSESTREE_SINGLE_RUN = 'true';

    const actual = inferSingleRun({ project: true });

    expect(actual).toBe(true);
  });

  it("returns true when CI is 'true'", () => {
    process.env.CI = 'true';

    const actual = inferSingleRun({ project: true });

    expect(actual).toBe(true);
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
      });

      expect(actual).toBe(true);
    },
  );

  it('returns true when singleRun is inferred from CI=true', () => {
    process.env.CI = 'true';

    const actual = inferSingleRun({
      programs: null,
      project: './tsconfig.json',
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

  it('returns false when none of the known cases are true', () => {
    const actual = inferSingleRun({ project: true });

    expect(actual).toBe(false);
  });
});
