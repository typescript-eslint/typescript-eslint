import fs from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { NativeProjectService } from '../../src/native';

import { clearCaches } from '../../src/clear-caches';
import {
  clearNativeProjectService,
  createNativeProjectService,
  getNativeProjectService,
} from '../../src/native';
import {
  nativeFilePath as filePath,
  nativeFixtures,
  nativePath,
} from './nativeTestUtils';

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
  it('serves edited text from the same project', () => {
    withService(service => {
      const first = service.openFile(filePath, 'export const value = 1;');
      const second = service.openFile(
        filePath,
        'export const value = "updated";',
      );

      expect(second.project.configFileName).toBe(first.project.configFileName);
      expect(second.sourceFile.text).toContain('"updated"');
    });
  });

  it('reuses the project context when the same file text is reopened', () => {
    withService(service => {
      const code = readFixture();
      const first = service.openFile(filePath, code);

      expect(service.openFile(filePath, code)).toBe(first);
    });
  });

  it('discovers different configured projects with one process', () => {
    withService(service => {
      const first = service.openFile(filePath, readFixture());
      const secondPath = nativePath(nativeFixtures, 'second/file.ts');
      const second = service.openFile(secondPath, readFixture(secondPath));

      expect(second.project.configFileName).not.toBe(
        first.project.configFileName,
      );
    });
  });

  it('rejects an unconfigured file and stays usable', () => {
    withService(service => {
      const absolutePath = nativePath(nativeFixtures, 'unconfigured/file.ts');
      expect(() =>
        service.openFile(absolutePath, 'export const value = 1;'),
      ).toThrow('No TypeScript native configured project');

      expect(
        service.openFile(filePath, readFixture()).sourceFile.fileName,
      ).toBe(filePath);
    });
  });

  it('resolves project references from source', () => {
    withService(service => {
      const referencesPath = nativePath(nativeFixtures, 'references/file.ts');
      const secondPath = nativePath(nativeFixtures, 'second/file.ts');
      const references = service.openFile(
        referencesPath,
        readFixture(referencesPath),
      );

      expect(references.program.getSourceFile(secondPath)).toBeDefined();
    });
  });

  it('opens a referenced file in its own project after its referencer', () => {
    withService(service => {
      const referencesPath = nativePath(nativeFixtures, 'references/file.ts');
      const secondPath = nativePath(nativeFixtures, 'second/file.ts');
      service.openFile(referencesPath, readFixture(referencesPath));
      const second = service.openFile(secondPath, readFixture(secondPath));

      expect(second.project.configFileName).toBe(
        nativePath(nativeFixtures, 'second/tsconfig.json'),
      );
    });
  });

  it('ignores TSConfig plugins', () => {
    withService(service => {
      const pluginsPath = nativePath(nativeFixtures, 'plugins/file.ts');

      expect(
        service.openFile(pluginsPath, readFixture(pluginsPath)).project
          .configFileName,
      ).toBe(nativePath(nativeFixtures, 'plugins/tsconfig.json'));
    });
  });

  it('rejects opening a file after close and closes idempotently', () => {
    const service = createNativeProjectService();
    service.openFile(filePath, readFixture());
    service.close();
    service.close();

    expect(() => service.openFile(filePath, '')).toThrow('closed');
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
