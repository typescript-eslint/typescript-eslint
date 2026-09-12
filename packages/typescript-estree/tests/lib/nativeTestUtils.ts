import path from 'node:path';

import '../../src/native/index.js';
import { clearCaches } from '../../src/index.js';

export const nativeFixtures = path.join(__dirname, '../fixtures/nativeProject');
export const nativeFilePath = path.join(nativeFixtures, 'file.ts');

export function isolateNativeBackend(): void {
  beforeEach(() => {
    vi.stubEnv('TYPESCRIPT_ESLINT_NATIVE_BACKEND', 'false');
  });
  afterEach(clearCaches);
}
