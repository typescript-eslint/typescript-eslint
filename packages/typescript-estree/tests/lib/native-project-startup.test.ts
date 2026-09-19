import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.doUnmock('@typescript/native/unstable/sync');
  vi.resetModules();
});

async function importWithNative(API: unknown) {
  vi.doMock('@typescript/native/unstable/sync', () => ({ API }));
  return (await import('../../src/native/createNativeProjectService.js'))
    .createNativeProjectService;
}

it.each([
  ['the requested root directory', '/project/root', '/project/root'],
  ['the process directory when none is given', undefined, process.cwd()],
])('anchors the compiler process at %s', async (_name, requested, expected) => {
  const options: unknown[] = [];
  function API(apiOptions: unknown): void {
    options.push(apiOptions);
  }
  const createNativeProjectService = await importWithNative(API);

  createNativeProjectService(requested);

  expect(options).toHaveLength(1);
  expect((options[0] as { cwd: string }).cwd).toBe(expected);
});

it('wraps native API startup failures with their cause', async () => {
  const cause = new Error('native process failed');
  function API(): void {
    throw cause;
  }
  const createNativeProjectService = await importWithNative(API);

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
