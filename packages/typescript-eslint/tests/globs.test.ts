import { minimatch } from 'minimatch';

import tseslint from '../src';

const MINIMATCH_OPTIONS = { dot: true };
/**
 * Helper function to call minimatch in roughly the same way that eslint uses it.
 * https://github.com/eslint/eslint/blob/main/lib/eslint/eslint-helpers.js
 */
function callMinimatch(testString: string, pattern: string): boolean {
  const matcher = new minimatch.Minimatch(pattern, MINIMATCH_OPTIONS);
  return matcher.match(testString);
}

describe('tsDeclaration', () => {
  it.for(['file.d.ts', 'path/to/file.d.ts', 'deeply/nested/path/to/file.d.ts'])(
    'matches standard TypeScript declaration file: "%s"',
    testCase => {
      expect(callMinimatch(testCase, tseslint.globs.tsDeclaration)).toBe(true);
    },
  );

  it.for(['file.d.css.ts', 'file.d.some-other-extension.ts'])(
    'matches TypeScript declaration file with additional extension: "%s"',
    testCase => {
      expect(callMinimatch(testCase, tseslint.globs.tsDeclaration)).toBe(true);
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
    expect(callMinimatch(testCase, tseslint.globs.tsDeclaration)).toBe(false);
  });
});
