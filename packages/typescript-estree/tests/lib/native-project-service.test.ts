import { API } from '@typescript/native/unstable/sync';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearCaches } from '../../src/clear-caches';
import {
  clearNativeProjectService,
  createNativeProjectService,
  getNativeProjectService,
} from '../../src/native';
import {
  readNativeMetrics,
  resetNativeMetrics,
} from '../../src/use-at-your-own-risk/nativeMetrics';

const fixtures = path.join(__dirname, '../fixtures/nativeProject');
const filePath = path.join(fixtures, 'file.ts');

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  resetNativeMetrics();
});

describe('native project service lifecycle', () => {
  it('allows timing for only one service in each metrics epoch', () => {
    vi.stubEnv('TYPESCRIPT_ESLINT_NATIVE_TIMING', 'true');
    const service = createNativeProjectService();

    expect(() => createNativeProjectService()).toThrow(
      'Native timing metrics require exactly one service per metrics epoch',
    );

    service.close();
    expect(() => createNativeProjectService()).toThrow(
      'Native timing metrics require exactly one service per metrics epoch',
    );
  });

  it('rejects timing after an untimed service in the same metrics epoch', () => {
    const service = createNativeProjectService();
    service.close();
    vi.stubEnv('TYPESCRIPT_ESLINT_NATIVE_TIMING', 'true');

    expect(() => createNativeProjectService()).toThrow(
      'Native timing metrics require exactly one service per metrics epoch',
    );
  });

  it('enables timing only through the instrumentation environment variable', () => {
    const previousTiming = process.env.TYPESCRIPT_ESLINT_NATIVE_TIMING;
    delete process.env.TYPESCRIPT_ESLINT_NATIVE_TIMING;
    resetNativeMetrics();
    const service = createNativeProjectService();

    expect(readNativeMetrics().timing).toBeUndefined();

    service.close();
    resetNativeMetrics();
    process.env.TYPESCRIPT_ESLINT_NATIVE_TIMING = 'true';
    const timedService = createNativeProjectService();
    expect(readNativeMetrics().timing).toMatchObject({ enabled: true });
    timedService.close();
    resetNativeMetrics();
    if (previousTiming == null) {
      delete process.env.TYPESCRIPT_ESLINT_NATIVE_TIMING;
    } else {
      process.env.TYPESCRIPT_ESLINT_NATIVE_TIMING = previousTiming;
    }
  });

  it('records lifecycle metrics without extra native requests', () => {
    vi.stubEnv('TYPESCRIPT_ESLINT_NATIVE_TIMING', 'true');
    resetNativeMetrics();
    const updateSnapshot = vi.spyOn(API.prototype, 'updateSnapshot');
    const service = createNativeProjectService();
    service.openFile(filePath, fs.readFileSync(filePath, 'utf8'));
    service.openFile(filePath, 'export const value = "updated";');

    expect(readNativeMetrics()).toMatchObject({
      fileOverlays: 2,
      processStarts: 1,
      projectDiscoveries: 1,
      projectHits: 1,
      snapshotsCreated: 3,
      snapshotsDisposed: 2,
      timing: { enabled: true },
    });
    expect(updateSnapshot).toHaveBeenCalledTimes(3);

    resetNativeMetrics();
    vi.unstubAllEnvs();
    updateSnapshot.mockRestore();
    expect(readNativeMetrics()).toMatchObject({
      processStarts: 0,
      snapshotsCreated: 0,
    });
    expect(() => service.openFile(filePath, '')).toThrow('closed');
  });

  it('replaces and disposes snapshots for edits', () => {
    const service = createNativeProjectService();
    try {
      const first = service.openFile(filePath, 'export const value = 1;');
      const second = service.openFile(
        filePath,
        'export const value = "updated";',
      );

      expect(second.project.configFileName).toBe(first.project.configFileName);
      expect(second.sourceFile.text).toContain('"updated"');
      expect(first.snapshot.isDisposed()).toBe(true);
      service.close();
      expect(second.snapshot.isDisposed()).toBe(true);
    } finally {
      service.close();
    }
  });

  it('reuses a project context when an overlay is unchanged', () => {
    const updateSnapshot = vi.spyOn(API.prototype, 'updateSnapshot');
    const service = createNativeProjectService();
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const first = service.openFile(filePath, code);

      expect(service.openFile(filePath, code)).toBe(first);
      expect(updateSnapshot).toHaveBeenCalledTimes(2);
    } finally {
      service.close();
      updateSnapshot.mockRestore();
    }
  });

  it('updates configured project contents for changed files', () => {
    const service = createNativeProjectService();
    try {
      const first = service.openFile(
        filePath,
        fs.readFileSync(filePath, 'utf8'),
      );
      const dependencyPath = path.join(fixtures, 'dependency.ts');
      service.openFile(dependencyPath, 'export const dependency = "changed";');
      const snapshot = service.updateFiles({ changed: [dependencyPath] });
      const project = snapshot.getProject(first.project.configFileName);

      expect(project?.program.getSourceFile(dependencyPath)?.text).toContain(
        '"changed"',
      );
    } finally {
      service.close();
    }
  });

  it('updates configured project inclusion for created and deleted files', () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(fixtures, 'temporary-project-'),
    );
    const temporaryFile = path.join(temporaryDirectory, 'file.ts');
    const addedFile = path.join(temporaryDirectory, 'added.ts');
    fs.writeFileSync(
      path.join(temporaryDirectory, 'tsconfig.json'),
      '{"include":["*.ts"]}',
    );
    fs.writeFileSync(temporaryFile, 'export const initial = true;');
    const service = createNativeProjectService();
    try {
      const first = service.openFile(
        temporaryFile,
        fs.readFileSync(temporaryFile, 'utf8'),
      );
      fs.writeFileSync(addedFile, 'export const added = true;');
      const created = service.updateFiles({ created: [addedFile] });
      expect(
        created
          .getProject(first.project.configFileName)
          ?.program.getSourceFileNames(),
      ).toContain(addedFile);

      fs.rmSync(addedFile);
      const deleted = service.updateFiles({ deleted: [addedFile] });
      expect(
        deleted
          .getProject(first.project.configFileName)
          ?.program.getSourceFileNames(),
      ).not.toContain(addedFile);

      fs.writeFileSync(addedFile, 'export const recreated = true;');
      const recreated = service.updateFiles({ created: [addedFile] });
      expect(
        recreated
          .getProject(first.project.configFileName)
          ?.program.getSourceFile(addedFile)?.text,
      ).toContain('recreated');
    } finally {
      service.close();
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });

  it('discovers different configured projects with one process', () => {
    const service = createNativeProjectService();
    try {
      const first = service.openFile(
        filePath,
        fs.readFileSync(filePath, 'utf8'),
      );
      const secondPath = path.join(fixtures, 'second/file.ts');
      const second = service.openFile(
        secondPath,
        fs.readFileSync(secondPath, 'utf8'),
      );

      expect(second.project.configFileName).not.toBe(
        first.project.configFileName,
      );
    } finally {
      service.close();
    }
  });

  it('rejects an inferred project without a TSConfig', () => {
    const updateSnapshot = vi.spyOn(API.prototype, 'updateSnapshot');
    const service = createNativeProjectService();
    try {
      const unconfiguredPath = path.join(fixtures, 'unconfigured/file.ts');
      expect(() =>
        service.openFile(unconfiguredPath, 'export const value = 1;'),
      ).toThrow('No TypeScript native configured project');
      expect(updateSnapshot.mock.calls.slice(0, 2)).toEqual([
        [{ openFiles: [unconfiguredPath] }],
        [{ closeFiles: [unconfiguredPath] }],
      ]);

      expect(
        service.openFile(filePath, fs.readFileSync(filePath, 'utf8')).sourceFile
          .fileName,
      ).toBe(filePath);
    } finally {
      service.close();
      updateSnapshot.mockRestore();
    }
  });

  it.each([
    ['references/file.ts', 'project references'],
    ['plugins/file.ts', 'TSConfig plugins'],
  ])('rejects unsupported %s', (relativePath, message) => {
    const updateSnapshot = vi.spyOn(API.prototype, 'updateSnapshot');
    const service = createNativeProjectService();
    try {
      const absolutePath = path.join(fixtures, relativePath);
      expect(() =>
        service.openFile(absolutePath, fs.readFileSync(absolutePath, 'utf8')),
      ).toThrow(message);
      expect(updateSnapshot.mock.calls.slice(0, 2)).toEqual([
        [{ openFiles: [absolutePath] }],
        [{ closeFiles: [absolutePath] }],
      ]);

      expect(
        service.openFile(filePath, fs.readFileSync(filePath, 'utf8')).sourceFile
          .fileName,
      ).toBe(filePath);
    } finally {
      service.close();
      updateSnapshot.mockRestore();
    }
  });

  it('rejects operations after close and closes idempotently', () => {
    const service = createNativeProjectService();
    service.close();
    service.close();

    expect(() => service.openFile(filePath, '')).toThrow('closed');
    expect(() => service.updateFiles({ changed: [filePath] })).toThrow(
      'closed',
    );
  });

  it('finishes closing after project closure fails', () => {
    const close = vi.spyOn(API.prototype, 'close');
    const updateSnapshot = vi.spyOn(API.prototype, 'updateSnapshot');
    const service = createNativeProjectService();
    const { snapshot } = service.openFile(
      filePath,
      fs.readFileSync(filePath, 'utf8'),
    );
    const dispose = vi.spyOn(snapshot, 'dispose');
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

  it('preserves multiple close failures', () => {
    const apiCloseError = new Error('API close failed');
    vi.spyOn(API.prototype, 'close').mockImplementationOnce(() => {
      throw apiCloseError;
    });
    const service = createNativeProjectService();
    const { snapshot } = service.openFile(
      filePath,
      fs.readFileSync(filePath, 'utf8'),
    );
    const snapshotError = new Error('snapshot disposal failed');
    vi.spyOn(snapshot, 'dispose').mockImplementationOnce(() => {
      throw snapshotError;
    });

    expect(() => service.close()).toThrow(
      expect.objectContaining({
        errors: expect.arrayContaining([snapshotError, apiCloseError]),
      }),
    );
    expect(() => service.updateFiles({ changed: [filePath] })).toThrow(
      'closed',
    );
  });

  it('clears the singleton service', () => {
    const service = getNativeProjectService();
    service.openFile(filePath, fs.readFileSync(filePath, 'utf8'));
    clearNativeProjectService();

    expect(() => service.openFile(filePath, '')).toThrow('closed');
    expect(getNativeProjectService()).not.toBe(service);
    clearNativeProjectService();
  });

  it('drops the singleton when closing it fails', () => {
    const service = getNativeProjectService();
    service.openFile(filePath, fs.readFileSync(filePath, 'utf8'));
    const closeError = new Error('project close failed');
    vi.spyOn(API.prototype, 'updateSnapshot').mockImplementationOnce(() => {
      throw closeError;
    });

    expect(() => clearNativeProjectService()).toThrow(closeError);
    expect(getNativeProjectService()).not.toBe(service);
    clearNativeProjectService();
  });

  it('clears the singleton service with all parser caches', () => {
    const service = getNativeProjectService();
    service.openFile(filePath, fs.readFileSync(filePath, 'utf8'));
    clearCaches();

    expect(() => service.openFile(filePath, '')).toThrow('closed');
    clearNativeProjectService();
  });
});
