import { addCandidateTSConfigRootDir } from '../../src';
import {
  clearCandidateTSConfigRootDirs,
  getInferredTSConfigRootDir,
} from '../../src/parseSettings/candidateTSConfigRootDirs';

describe(getInferredTSConfigRootDir, () => {
  beforeEach(() => {
    clearCandidateTSConfigRootDirs();
  });

  it('returns process.cwd() when there are no candidates', () => {
    const actual = getInferredTSConfigRootDir();

    expect(actual).toBe(process.cwd());
  });

  it('returns the candidate when there is one candidate', () => {
    const candidate = 'a/b/c';
    addCandidateTSConfigRootDir(candidate);

    const actual = getInferredTSConfigRootDir();

    expect(actual).toBe(candidate);
  });

  it('throws an error when there are multiple candidates', () => {
    addCandidateTSConfigRootDir('a');
    addCandidateTSConfigRootDir('b');

    expect(() => getInferredTSConfigRootDir())
      .toThrowErrorMatchingInlineSnapshot(`
        [Error: No tsconfigRootDir was set, and multiple candidate TSConfigRootDirs are present:
         - a
         - b
        You'll need to explicitly set tsconfigRootDir in your parser options.
        See: https://typescript-eslint.io/packages/parser/#tsconfigrootdir]
      `);
  });
});
