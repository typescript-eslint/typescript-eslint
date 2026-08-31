import type { API } from '@typescript/native/unstable/sync';

export interface NativeParserServiceMethodCounts {
  getContextualType: number;
  getResolvedSignature: number;
  getSymbolAtLocation: number;
  getTypeAtLocation: number;
  getTypesAtLocations: number;
}

export interface NativeMetrics {
  fileEvents: number;
  fileOverlays: number;
  parserServices: NativeParserServiceMethodCounts;
  processStarts: number;
  projectDiscoveries: number;
  projectHits: number;
  snapshotsCreated: number;
  snapshotsDisposed: number;
  timing: ReturnType<API['getTimingInfo']> | undefined;
}

type ScalarMetric = Exclude<keyof NativeMetrics, 'parserServices' | 'timing'>;

const activeServices = new Set<() => void>();
const timingReaders = new Set<() => ReturnType<API['getTimingInfo']>>();
let registeredServices = 0;
let timingServiceRegistered = false;

const createParserServiceCounts = (): NativeParserServiceMethodCounts => ({
  getContextualType: 0,
  getResolvedSignature: 0,
  getSymbolAtLocation: 0,
  getTypeAtLocation: 0,
  getTypesAtLocations: 0,
});

let metrics = createEmptyMetrics();

function createEmptyMetrics(): NativeMetrics {
  return {
    fileEvents: 0,
    fileOverlays: 0,
    parserServices: createParserServiceCounts(),
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

export function incrementNativeParserServiceMetric(
  method: keyof NativeParserServiceMethodCounts,
): void {
  metrics.parserServices[method] += 1;
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
    parserServices: { ...metrics.parserServices },
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
