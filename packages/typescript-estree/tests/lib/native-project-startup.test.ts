import { afterEach, expect, it, vi } from 'vitest';

const SUPPORTED_VERSION = '7.1.0-dev.20260822.1';

afterEach(() => {
  vi.doUnmock('@typescript/native/package.json');
  vi.doUnmock('@typescript/native/unstable/ast');
  vi.doUnmock('@typescript/native/unstable/sync');
  vi.resetModules();
});

async function importWithNative(version: string, API: unknown) {
  vi.doMock('@typescript/native/package.json', () => ({
    default: { version },
  }));
  vi.doMock('@typescript/native/unstable/ast', () => ({
    SyntaxKind: { SourceFile: 307 },
  }));
  vi.doMock('@typescript/native/unstable/sync', () => ({ API }));
  return (await import('../../src/native/createNativeProjectService.js'))
    .createNativeProjectService;
}

it.each([
  ['the requested root directory', '/project/root', '/project/root'],
  ['the process directory when none is given', undefined, process.cwd()],
])('anchors the compiler process at %s', async (_name, requested, expected) => {
  const options: unknown[] = [];
  class API {
    constructor(apiOptions: unknown) {
      options.push(apiOptions);
    }

    close(): void {
      return undefined;
    }

    updateSnapshot(): void {
      return undefined;
    }
  }
  const createNativeProjectService = await importWithNative(
    SUPPORTED_VERSION,
    API,
  );

  createNativeProjectService(requested);

  expect(options).toHaveLength(1);
  expect((options[0] as { cwd: string }).cwd).toBe(expected);
});

it('rejects unknown native previews before invoking the API constructor', async () => {
  const API = vi.fn();
  const createNativeProjectService = await importWithNative(
    '7.1.0-dev.20260823.1',
    API,
  );

  expect(createNativeProjectService).toThrow(
    'Incompatible @typescript/native version "7.1.0-dev.20260823.1". This version of typescript-eslint supports only "7.1.0-dev.20260822.1". Install @typescript/native@7.1.0-dev.20260822.1.',
  );
  expect(API).not.toHaveBeenCalled();
});

it('reports a missing required native API member as incompatible', async () => {
  class API {
    updateSnapshot(): void {
      return undefined;
    }
  }
  const createNativeProjectService = await importWithNative(
    SUPPORTED_VERSION,
    API,
  );

  expect(createNativeProjectService).toThrow(
    'Incompatible @typescript/native API version "7.1.0-dev.20260822.1": required surface "API.prototype.close" is missing. Reinstall @typescript/native@7.1.0-dev.20260822.1.',
  );
});

it('wraps native API startup failures with their cause', async () => {
  const cause = new Error('native process failed');
  class API {
    constructor() {
      throw cause;
    }

    close(): void {
      return undefined;
    }

    updateSnapshot(): void {
      return undefined;
    }
  }
  const createNativeProjectService = await importWithNative(
    SUPPORTED_VERSION,
    API,
  );

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
