import fs from 'node:fs';

import type { NativeProjectService } from '../../src/native/types';

import { clearCaches } from '../../src/clear-caches';
import {
  clearNativeProjectService,
  createNativeProjectService,
  getNativeProjectService,
} from '../../src/native/createNativeProjectService';
import {
  nativeFilePath as filePath,
  nativeFixtures,
  nativePath,
} from './nativeTestUtils';

function withService<T>(callback: (service: NativeProjectService) => T) {
  const service = createNativeProjectService();
  try {
    return callback(service);
  } finally {
    service.close();
  }
}

function readFixture(fixturePath = filePath) {
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

  it('discovers different configured projects', () => {
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
      ).toThrow(
        `${absolutePath} was not found by the project service. Consider including it in the tsconfig.json.`,
      );

      expect(
        service.openFile(filePath, readFixture()).sourceFile.fileName,
      ).toBe(filePath);
    });
  });

  it('stays usable after a file beside a composite project', () => {
    withService(service => {
      expect(() =>
        service.openFile(
          nativePath(nativeFixtures, 'composite/outside.ts'),
          'export const outside = 1;',
        ),
      ).toThrow();

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

      expect(
        references.project.program.getSourceFile(secondPath),
      ).toBeDefined();
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

  it('opens a file in its default project after another project includes it', () => {
    withService(service => {
      const includingPath = nativePath(nativeFixtures, 'including/file.ts');
      const includedPath = nativePath(nativeFixtures, 'included/file.ts');
      service.openFile(includingPath, readFixture(includingPath));
      const included = service.openFile(
        includedPath,
        readFixture(includedPath),
      );

      expect(included.project.configFileName).toBe(
        nativePath(nativeFixtures, 'included/tsconfig.json'),
      );
      expect(included.project.program.getCompilerOptions().strict).toBe(true);
    });
  });

  it('opens sibling files in the project their solution references', () => {
    withService(service => {
      const firstPath = nativePath(nativeFixtures, 'solution/src/first.ts');
      const secondPath = nativePath(nativeFixtures, 'solution/src/second.ts');
      service.openFile(firstPath, readFixture(firstPath));

      expect(
        service.openFile(secondPath, readFixture(secondPath)).project
          .configFileName,
      ).toBe(nativePath(nativeFixtures, 'solution/tsconfig.app.json'));
    });
  });

  it('opens a project whose TSConfig lists plugins', () => {
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
