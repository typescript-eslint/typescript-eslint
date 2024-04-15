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

  it('returns true when run by the ESLint CLI in npm/yarn', () => {
    process.argv = ['node', 'node_modules/.bin/eslint'];

    const actual = inferSingleRun({ project: true });

    expect(actual).toBe(true);
  });

  it('returns true when run by the ESLint CLI in pnpm', () => {
    process.argv = ['node', 'node_modules/eslint/bin/eslint.js'];

    const actual = inferSingleRun({ project: true });

    expect(actual).toBe(true);
  });

  it('returns false when none of the known cases are true', () => {
    const actual = inferSingleRun({ project: true });

    expect(actual).toBe(false);
  });
});
