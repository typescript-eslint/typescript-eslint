import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.doUnmock('@typescript/native/unstable/sync');
  vi.resetModules();
});

it('wraps native API startup failures with their cause', async () => {
  const cause = new Error('native process failed');
  vi.doMock('@typescript/native/unstable/sync', () => ({
    API: function API() {
      throw cause;
    },
  }));
  const { createNativeProjectService } =
    await import('../../src/native/createNativeProjectService.js');

  try {
    createNativeProjectService();
    throw new Error('Expected startup to fail.');
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toMatch(
      /^Failed to start the TypeScript native project service:/,
    );
    expect((error as Error).cause).toBe(cause);
  }
});
