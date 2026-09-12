import * as ts from 'typescript';

import {
  clearRealPathCache,
  getCanonicalFileName,
  getCanonicalRealPath,
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
