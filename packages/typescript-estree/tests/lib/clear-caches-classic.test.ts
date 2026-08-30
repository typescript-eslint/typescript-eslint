import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.doUnmock('@typescript/native/unstable/sync');
  vi.resetModules();
});

it('does not load the native API when clearing classic caches', async () => {
  let nativeModuleLoaded = false;
  vi.doMock('@typescript/native/unstable/sync', () => {
    nativeModuleLoaded = true;
    return {};
  });
  const { clearCaches } = await import('../../src/clear-caches.js');

  clearCaches();

  expect(nativeModuleLoaded).toBe(false);
});
