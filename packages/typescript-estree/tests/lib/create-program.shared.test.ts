import path from 'node:path';
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

describe(getCanonicalFileName, () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock(import('typescript'), async importOriginal => {
      const actual = await importOriginal();

      return {
        ...actual,
        sys: { ...actual.sys, useCaseSensitiveFileNames: false },
      };
    });
  });

  afterEach(() => {
    vi.doUnmock('typescript');
    vi.resetModules();
  });

  it('lowercases paths on case-insensitive file systems', async () => {
    const shared = await import('../../src/create-program/shared.js');

    expect(
      shared.getCanonicalFileName(path.join(path.sep, 'Dir', 'File.TS')),
    ).toBe(path.join(path.sep, 'dir', 'file.ts'));
  });

  it('keeps characters that TypeScript does not lowercase in file names', async () => {
    const shared = await import('../../src/create-program/shared.js');

    expect(
      shared.getCanonicalFileName(
        path.join(path.sep, 'Dir', 'GA\u0130N', 'File.ts'),
      ),
    ).toBe(path.join(path.sep, 'dir', 'ga\u0130n', 'file.ts'));
  });
});
