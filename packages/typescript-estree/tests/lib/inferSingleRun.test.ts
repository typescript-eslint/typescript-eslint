import path from 'node:path';

import { inferSingleRun } from '../../src/parseSettings/inferSingleRun';

describe(inferSingleRun, () => {
  beforeEach(() => {
    vi.stubGlobal('process', { ...process, argv: ['node', 'eslint'] });
    vi.stubEnv('CI', undefined);
    vi.stubEnv('TSESTREE_SINGLE_RUN', undefined);
  });

  it('returns false when options is undefined', () => {
    const actual = inferSingleRun(undefined);

    expect(actual).toBe(false);
  });

  it('returns false when options.project is null', () => {
    const actual = inferSingleRun({ project: null });

    expect(actual).toBe(false);
  });

  it('returns false when options.programs is defined', () => {
    const actual = inferSingleRun({ programs: [], project: true });

    expect(actual).toBe(false);
  });

  it("returns false when TSESTREE_SINGLE_RUN is 'false'", () => {
    vi.stubEnv('TSESTREE_SINGLE_RUN', 'false');

    const actual = inferSingleRun({ project: true });

    expect(actual).toBe(false);
  });

  it("returns true when TSESTREE_SINGLE_RUN is 'true'", () => {
    vi.stubEnv('TSESTREE_SINGLE_RUN', 'true');

    const actual = inferSingleRun({ project: true });

    expect(actual).toBe(true);
  });

  it("returns true when CI is 'true'", () => {
    vi.stubEnv('CI', 'true');

    const actual = inferSingleRun({ project: true });

    expect(actual).toBe(true);
  });

  it.for(['project', 'programs'] as const)(
    'returns false when given %s is null',
    (key, { expect }) => {
      const actual = inferSingleRun({ [key]: null });

      expect(actual).toBe(false);
    },
  );

  it.for([
    ['true', true],
    ['false', false],
  ] as const)(
    'return %s when given TSESTREE_SINGLE_RUN is "%s"',
    ([run, expected], { expect }) => {
      vi.stubEnv('TSESTREE_SINGLE_RUN', run);

      const actual = inferSingleRun({
        programs: null,
        project: './tsconfig.json',
      });

      expect(actual).toBe(expected);
    },
  );

  describe.for([
    'node_modules/.bin/eslint',
    'node_modules/eslint/bin/eslint.js',
  ] as const)('%s', pathName => {
    it('returns false when singleRun is inferred from process.argv with --fix', () => {
      vi.stubGlobal('process', {
        ...process,
        argv: ['', path.normalize(pathName), '', '--fix'],
      });

      const actual = inferSingleRun({
        programs: null,
        project: './tsconfig.json',
      });

      expect(actual).toBe(false);
    });

    it('returns true when singleRun is inferred from process.argv without --fix', () => {
      vi.stubGlobal('process', {
        ...process,
        argv: ['', path.normalize(pathName), ''],
      });

      const actual = inferSingleRun({
        programs: null,
        project: './tsconfig.json',
      });

      expect(actual).toBe(true);
    });
  });

  it('returns true when singleRun is inferred from CI=true', () => {
    vi.stubEnv('CI', 'true');

    const actual = inferSingleRun({
      programs: null,
      project: './tsconfig.json',
    });

    expect(actual).toBe(true);
  });

  it('returns true when singleRun can be inferred and options.extraFileExtensions is an empty array', () => {
    vi.stubEnv('CI', 'true');

    const actual = inferSingleRun({
      extraFileExtensions: [],
      project: './tsconfig.json',
    });

    expect(actual).toBe(true);
  });

  it('returns false when singleRun can be inferred options.extraFileExtensions contains entries', () => {
    vi.stubEnv('CI', 'true');

    const actual = inferSingleRun({
      extraFileExtensions: ['.vue'],
      project: './tsconfig.json',
    });

    expect(actual).toBe(false);
  });

  it('returns true when options.extraFileExtensions contains entries and projectService is true', () => {
    vi.stubEnv('CI', 'true');

    const actual = inferSingleRun({
      extraFileExtensions: ['.vue'],
      projectService: true,
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

  it('returns true for project service in single run', () => {
    vi.stubEnv('CI', 'true');
    const actual = inferSingleRun({ projectService: true });

    expect(actual).toBe(true);
  });
});
