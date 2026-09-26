import path from 'node:path';

import '../../src/native/index.js';
import { clearCaches } from '../../src/index.js';

export function nativePath(...segments: string[]): string {
  return path
    .join(...segments)
    .replaceAll('\\', '/')
    .replace(/^[A-Z]:\//, drive => drive.toLowerCase());
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
