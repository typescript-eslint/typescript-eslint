import path from 'node:path';

import '../../src/native/index.js';
import { clearCaches } from '../../src/index.js';

/** Matches how the compiler spells paths back, so Windows comparisons line up. */
export function nativePath(...segments: string[]): string {
  return path.join(...segments).replaceAll('\\', '/');
}

export const nativeFixtures = nativePath(
  __dirname,
  '../fixtures/nativeProject',
);
export const nativeFilePath = nativePath(nativeFixtures, 'file.ts');

export function isolateNativeBackend(): void {
  beforeEach(() => {
    vi.stubEnv('TYPESCRIPT_ESLINT_NATIVE_BACKEND', 'false');
  });
  afterEach(clearCaches);
}
