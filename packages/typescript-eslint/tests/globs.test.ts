import { minimatch } from 'minimatch';

import tseslint from '../src';

const MINIMATCH_OPTIONS = { dot: true };
function createMatcherLikeEslint(pattern: string) {
  // https://github.com/eslint/eslint/blob/main/lib/eslint/eslint-helpers.js
  return new minimatch.Minimatch(pattern, MINIMATCH_OPTIONS);
}

describe('tsDeclaration', () => {
  it.for(['file.d.ts', 'path/to/file.d.ts', 'deeply/nested/path/to/file.d.ts'])(
    'matches standard TypeScript declaration file: "%s"',
    testCase => {
      const matcher = createMatcherLikeEslint(tseslint.globs.tsDeclaration);
      expect(matcher.match(testCase)).toBe(true);
    },
  );

  it.for(['file.d.css.ts', 'file.d.some-other-extension.ts'])(
    'matches TypeScript declaration file with additional extension: "%s"',
    testCase => {
      const matcher = createMatcherLikeEslint(tseslint.globs.tsDeclaration);
      expect(matcher.match(testCase)).toBe(true);
    },
  );

  it.for([
    'file.ts',
    'file.mts',
    'file.cts',
    'file.dts',
    'file.tsx',
    'path/to/file.ts',
  ])('does not match non-declaration file: "%s"', testCase => {
    const matcher = createMatcherLikeEslint(tseslint.globs.tsDeclaration);
    expect(matcher.match(testCase)).toBe(false);
  });
});
