import type { API } from '@typescript/native/unstable/sync';

/**
 * Calls made through the classic `ts.TypeChecker` facade, keyed by method name.
 * Every entry is one or more round trips to the native compiler process, so
 * this is the number to watch when comparing backends.
 */
export type NativeCheckerMethodCounts = Record<string, number>;

export interface NativeMetrics {
  checker: NativeCheckerMethodCounts;
  fileEvents: number;
  fileOverlays: number;
  processStarts: number;
  projectDiscoveries: number;
  projectHits: number;
  snapshotsCreated: number;
  snapshotsDisposed: number;
  timing: ReturnType<API['getTimingInfo']> | undefined;
}

type ScalarMetric = Exclude<keyof NativeMetrics, 'checker' | 'timing'>;

const activeServices = new Set<() => void>();
const timingReaders = new Set<() => ReturnType<API['getTimingInfo']>>();
let registeredServices = 0;
let timingServiceRegistered = false;

let metrics = createEmptyMetrics();

function createEmptyMetrics(): NativeMetrics {
  return {
    checker: {},
    fileEvents: 0,
    fileOverlays: 0,
    processStarts: 0,
    projectDiscoveries: 0,
    projectHits: 0,
    snapshotsCreated: 0,
    snapshotsDisposed: 0,
    timing: undefined,
  };
}

export function incrementNativeMetric(metric: ScalarMetric, by = 1): void {
  metrics[metric] += by;
}

export function incrementNativeCheckerMetric(method: string): void {
  metrics.checker[method] = (metrics.checker[method] ?? 0) + 1;
}

export function registerNativeMetricService(
  close: () => void,
  readTiming?: () => ReturnType<API['getTimingInfo']>,
): () => void {
  if (timingServiceRegistered || (readTiming && registeredServices > 0)) {
    throw new Error(
      'Native timing metrics require exactly one service per metrics epoch. Call resetNativeMetrics() before creating another service.',
    );
  }
  registeredServices += 1;
  timingServiceRegistered ||= readTiming != null;
  activeServices.add(close);
  if (readTiming) {
    timingReaders.add(readTiming);
  }
  return () => {
    activeServices.delete(close);
    if (readTiming) {
      timingReaders.delete(readTiming);
    }
  };
}

/**
 * Returns a detached snapshot. To keep native timing and local counters in the
 * same scope, a timing-enabled metrics epoch may contain exactly one service.
 */
export function readNativeMetrics(): NativeMetrics {
  const readTiming = [...timingReaders].at(-1);
  return {
    ...metrics,
    checker: { ...metrics.checker },
    timing: readTiming?.(),
  };
}

/** Closes every instrumented service, then begins a new zeroed metrics epoch. */
export function resetNativeMetrics(): void {
  const errors: unknown[] = [];
  for (const close of activeServices) {
    try {
      close();
    } catch (error) {
      errors.push(error);
    }
  }
  activeServices.clear();
  timingReaders.clear();
  registeredServices = 0;
  timingServiceRegistered = false;
  metrics = createEmptyMetrics();
  if (errors.length) {
    throw new AggregateError(errors, 'Failed to reset native metrics.');
  }
}
