import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.doUnmock('@typescript/native/package.json');
  vi.doUnmock('@typescript/native/unstable/ast');
  vi.doUnmock('@typescript/native/unstable/sync');
  vi.resetModules();
});

it('rejects unknown native previews before invoking the API constructor', async () => {
  const API = vi.fn();
  vi.doMock('@typescript/native/package.json', () => ({
    default: { version: '7.1.0-dev.20260823.1' },
  }));
  vi.doMock('@typescript/native/unstable/ast', () => ({
    SyntaxKind: { SourceFile: 307 },
  }));
  vi.doMock('@typescript/native/unstable/sync', () => ({ API }));
  const { createNativeProjectService } =
    await import('../../src/native/createNativeProjectService.js');

  expect(createNativeProjectService).toThrow(
    'Incompatible @typescript/native version "7.1.0-dev.20260823.1". This version of typescript-eslint supports only "7.1.0-dev.20260822.1". Install @typescript/native@7.1.0-dev.20260822.1.',
  );
  expect(API).not.toHaveBeenCalled();
});

it('reports a missing required native API member as incompatible', async () => {
  class API {
    getTimingInfo(): void {
      return undefined;
    }

    updateSnapshot(): void {
      return undefined;
    }
  }
  vi.doMock('@typescript/native/package.json', () => ({
    default: { version: '7.1.0-dev.20260822.1' },
  }));
  vi.doMock('@typescript/native/unstable/ast', () => ({
    SyntaxKind: { SourceFile: 307 },
  }));
  vi.doMock('@typescript/native/unstable/sync', () => ({ API }));
  const { createNativeProjectService } =
    await import('../../src/native/createNativeProjectService.js');

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

    getTimingInfo(): void {
      return undefined;
    }

    updateSnapshot(): void {
      return undefined;
    }
  }
  vi.doMock('@typescript/native/package.json', () => ({
    default: { version: '7.1.0-dev.20260822.1' },
  }));
  vi.doMock('@typescript/native/unstable/ast', () => ({
    SyntaxKind: { SourceFile: 307 },
  }));
  vi.doMock('@typescript/native/unstable/sync', () => ({ API }));
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
