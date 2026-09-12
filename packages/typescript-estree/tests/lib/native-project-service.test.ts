import { API, Snapshot } from '@typescript/native/unstable/sync';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { NativeProjectService } from '../../src/native';

import { clearCaches } from '../../src/clear-caches';
import {
  clearNativeProjectService,
  createNativeProjectService,
  getNativeProjectService,
} from '../../src/native';
import { nativeFilePath as filePath, nativeFixtures } from './nativeTestUtils';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

function withService<T>(callback: (service: NativeProjectService) => T): T {
  const service = createNativeProjectService();
  try {
    return callback(service);
  } finally {
    service.close();
  }
}

function readFixture(fixturePath = filePath): string {
  return fs.readFileSync(fixturePath, 'utf8');
}

describe('native project service lifecycle', () => {
  it('replaces and disposes snapshots for edits', () => {
    const dispose = vi.spyOn(Snapshot.prototype, 'dispose');
    const updateSnapshot = vi.spyOn(API.prototype, 'updateSnapshot');

    withService(service => {
      const first = service.openFile(filePath, 'export const value = 1;');
      const second = service.openFile(
        filePath,
        'export const value = "updated";',
      );

      expect(second.project.configFileName).toBe(first.project.configFileName);
      expect(second.sourceFile.text).toContain('"updated"');
      expect(dispose.mock.calls).toHaveLength(
        updateSnapshot.mock.calls.length - 1,
      );

      service.close();

      expect(dispose.mock.calls).toHaveLength(updateSnapshot.mock.calls.length);
    });
  });

  it('reuses the project context when the same file text is reopened', () => {
    const updateSnapshot = vi.spyOn(API.prototype, 'updateSnapshot');

    withService(service => {
      const code = readFixture();
      const first = service.openFile(filePath, code);

      expect(service.openFile(filePath, code)).toBe(first);
      expect(updateSnapshot).toHaveBeenCalledTimes(2);
    });
  });

  it('discovers different configured projects with one process', () => {
    withService(service => {
      const first = service.openFile(filePath, readFixture());
      const secondPath = path.join(nativeFixtures, 'second/file.ts');
      const second = service.openFile(secondPath, readFixture(secondPath));

      expect(second.project.configFileName).not.toBe(
        first.project.configFileName,
      );
    });
  });

  it.each([
    ['unconfigured/file.ts', 'No TypeScript native configured project'],
    ['references/file.ts', 'project references'],
    ['plugins/file.ts', 'TSConfig plugins'],
  ])('rejects unsupported %s and stays usable', (relativePath, message) => {
    const updateSnapshot = vi.spyOn(API.prototype, 'updateSnapshot');

    withService(service => {
      const absolutePath = path.join(nativeFixtures, relativePath);
      expect(() =>
        service.openFile(absolutePath, 'export const value = 1;'),
      ).toThrow(message);
      expect(updateSnapshot.mock.calls.slice(0, 2)).toEqual([
        [{ openFiles: [absolutePath] }],
        [{ closeFiles: [absolutePath] }],
      ]);

      expect(
        service.openFile(filePath, readFixture()).sourceFile.fileName,
      ).toBe(filePath);
    });
  });

  it('rejects opening a file after close and closes idempotently', () => {
    const close = vi.spyOn(API.prototype, 'close');
    const service = createNativeProjectService();
    service.close();
    service.close();

    expect(close).toHaveBeenCalledOnce();
    expect(() => service.openFile(filePath, '')).toThrow('closed');
  });

  it('finishes closing after project closure fails', () => {
    const close = vi.spyOn(API.prototype, 'close');
    const updateSnapshot = vi.spyOn(API.prototype, 'updateSnapshot');
    const service = createNativeProjectService();
    service.openFile(filePath, readFixture());
    const dispose = vi.spyOn(Snapshot.prototype, 'dispose');
    const projectCloseError = new Error('project close failed');
    updateSnapshot.mockImplementationOnce(() => {
      throw projectCloseError;
    });

    expect(() => service.close()).toThrow(projectCloseError);
    expect(close).toHaveBeenCalledOnce();
    expect(dispose).toHaveBeenCalledOnce();
    expect(() => service.openFile(filePath, '')).toThrow('closed');

    service.close();
    expect(close).toHaveBeenCalledOnce();
  });

  it('clears the singleton service', () => {
    const service = getNativeProjectService();
    service.openFile(filePath, readFixture());
    clearNativeProjectService();

    expect(() => service.openFile(filePath, '')).toThrow('closed');
    expect(getNativeProjectService()).not.toBe(service);
    clearNativeProjectService();
  });

  it('clears the singleton service with all parser caches', () => {
    const service = getNativeProjectService();
    service.openFile(filePath, readFixture());
    clearCaches();

    expect(() => service.openFile(filePath, '')).toThrow('closed');
    clearNativeProjectService();
  });
});
