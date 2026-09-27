import type * as ts from 'typescript/lib/tsserverlibrary';

import { throttleOpenedFileCleanup } from '../src/throttleOpenedFileCleanup.js';

type CleanupKey = 'cleanupAfterOpeningFile' | 'cleanupProjectsAndScriptInfos';

interface FakeService {
  cleanupAfterOpeningFile?: (...args: unknown[]) => void;
  cleanupProjectsAndScriptInfos?: (...args: unknown[]) => void;
  openClientFileWithNormalizedPath?: (...args: unknown[]) => unknown;
}

function createFakeService(
  cleanupKey: CleanupKey = 'cleanupProjectsAndScriptInfos',
) {
  const cleanup = vi.fn();
  const open = vi.fn(function (this: FakeService, ...args: unknown[]) {
    this[cleanupKey]?.(...args);
    return { configFileName: 'tsconfig.json' };
  });
  const service: FakeService = {
    [cleanupKey]: cleanup,
    openClientFileWithNormalizedPath: open,
  };

  throttleOpenedFileCleanup(service as unknown as ts.server.ProjectService);

  return {
    cleanup,
    open,
    service: service as Required<FakeService>,
  };
}

describe(throttleOpenedFileCleanup, () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['performance'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls cleanup when opening the first file', () => {
    const { cleanup, service } = createFakeService();

    service.openClientFileWithNormalizedPath();

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('skips cleanup when opening a file immediately after a cleanup', () => {
    const { cleanup, service } = createFakeService();

    service.openClientFileWithNormalizedPath();
    service.openClientFileWithNormalizedPath();

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('skips cleanup when opening a file just before the throttle window elapses', () => {
    const { cleanup, service } = createFakeService();

    service.openClientFileWithNormalizedPath();
    vi.advanceTimersByTime(249);
    service.openClientFileWithNormalizedPath();

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('calls cleanup when opening a file once the throttle window elapses', () => {
    const { cleanup, service } = createFakeService();

    service.openClientFileWithNormalizedPath();
    vi.advanceTimersByTime(250);
    service.openClientFileWithNormalizedPath();

    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it('measures the throttle window from the last cleanup when cleanups were skipped', () => {
    const { cleanup, service } = createFakeService();

    service.openClientFileWithNormalizedPath();
    vi.advanceTimersByTime(200);
    service.openClientFileWithNormalizedPath();
    vi.advanceTimersByTime(50);
    service.openClientFileWithNormalizedPath();

    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it('calls cleanup when it is called outside of opening a file within the throttle window', () => {
    const { cleanup, service } = createFakeService();

    service.openClientFileWithNormalizedPath();
    service.cleanupProjectsAndScriptInfos();

    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it('restarts the throttle window when cleanup is called outside of opening a file', () => {
    const { cleanup, service } = createFakeService();

    service.cleanupProjectsAndScriptInfos();
    service.openClientFileWithNormalizedPath();

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('passes arguments and the service to cleanup when cleanup is called', () => {
    const { cleanup, service } = createFakeService();

    service.openClientFileWithNormalizedPath('file.ts', 'content');

    expect(cleanup).toHaveBeenCalledExactlyOnceWith('file.ts', 'content');
    expect(cleanup.mock.contexts[0]).toBe(service);
  });

  it('passes arguments and the service to open when opening a file', () => {
    const { open, service } = createFakeService();

    service.openClientFileWithNormalizedPath('file.ts', 'content');

    expect(open).toHaveBeenCalledExactlyOnceWith('file.ts', 'content');
    expect(open.mock.contexts[0]).toBe(service);
  });

  it('returns the result of open when opening a file', () => {
    const { service } = createFakeService();

    const actual = service.openClientFileWithNormalizedPath();

    expect(actual).toEqual({ configFileName: 'tsconfig.json' });
  });

  it('rethrows the error when opening a file throws', () => {
    const { open, service } = createFakeService();
    const error = new Error('Oh no!');
    open.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => service.openClientFileWithNormalizedPath()).toThrow(error);
  });

  it('stops throttling cleanup outside of opening a file when opening a file threw', () => {
    const { cleanup, open, service } = createFakeService();
    open.mockImplementationOnce(function (this: FakeService) {
      this.cleanupProjectsAndScriptInfos?.();
      throw new Error('Oh no!');
    });

    expect(() => service.openClientFileWithNormalizedPath()).toThrow();
    service.cleanupProjectsAndScriptInfos();

    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it('throttles cleanupAfterOpeningFile when cleanupProjectsAndScriptInfos does not exist', () => {
    const { cleanup, service } = createFakeService('cleanupAfterOpeningFile');

    service.openClientFileWithNormalizedPath();
    service.openClientFileWithNormalizedPath();

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('does not wrap methods when no cleanup method exists', () => {
    const open = vi.fn();
    const service: FakeService = { openClientFileWithNormalizedPath: open };

    throttleOpenedFileCleanup(service as unknown as ts.server.ProjectService);

    expect(service).toEqual({ openClientFileWithNormalizedPath: open });
  });

  it('does not wrap methods when openClientFileWithNormalizedPath does not exist', () => {
    const cleanup = vi.fn();
    const service: FakeService = { cleanupProjectsAndScriptInfos: cleanup };

    throttleOpenedFileCleanup(service as unknown as ts.server.ProjectService);

    expect(service).toEqual({ cleanupProjectsAndScriptInfos: cleanup });
  });
});
