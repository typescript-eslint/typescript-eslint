import * as ts from 'typescript';

import {
  clearRealPathCache,
  getCanonicalFileName,
  getCanonicalRealPath,
  toFileNameLowerCase,
} from '../../src/create-program/shared';

describe(getCanonicalRealPath, () => {
  afterEach(() => {
    clearRealPathCache();
    vi.restoreAllMocks();
  });

  it('returns the input path when the system cannot resolve its real path', () => {
    const filePath = '/unresolvable/file.ts';
    vi.spyOn(ts.sys, 'realpath').mockReturnValue(undefined as never);

    expect(getCanonicalRealPath(filePath)).toBe(getCanonicalFileName(filePath));
  });
});

describe(toFileNameLowerCase, () => {
  it('lowercases file names', () => {
    expect(toFileNameLowerCase('/Dir/File.TS')).toBe('/dir/file.ts');
  });

  it('keeps characters that TypeScript does not lowercase in file names', () => {
    expect(toFileNameLowerCase('/Dir/GA\u0130N/File.ts')).toBe(
      '/dir/ga\u0130n/file.ts',
    );
  });
});
