import { nodeIntegrationTest } from '../tools/integration-test-base';

nodeIntegrationTest(__filename, 'metrics.mjs', stderr => {
  const { diagnostics, metrics, normalOutput } = JSON.parse(stderr) as {
    diagnostics: string[][];
    metrics: {
      fileEvents: number;
      fileOverlays: number;
      parserServices: Record<string, number>;
      processStarts: number;
      projectDiscoveries: number;
      projectHits: number;
      snapshotsCreated: number;
      snapshotsDisposed: number;
      timing: { enabled: boolean; totals: { requestCount: number } };
    };
    normalOutput: Record<string, unknown>[];
  };

  expect(diagnostics).toHaveLength(2);
  expect(diagnostics.every(result => result.length === 4)).toBe(true);
  expect(
    normalOutput.every(
      result => !('metrics' in result) && !('timing' in result),
    ),
  ).toBe(true);
  expect(metrics).toMatchObject({
    fileEvents: 0,
    fileOverlays: 2,
    processStarts: 1,
    projectDiscoveries: 2,
    projectHits: 0,
    snapshotsCreated: 4,
    snapshotsDisposed: 3,
    timing: { enabled: true },
  });
  expect(metrics.timing.totals.requestCount).toBeGreaterThan(0);
  expect(metrics.parserServices.getTypeAtLocation).toBeGreaterThan(0);
  expect(metrics.parserServices.getTypesAtLocations).toBeGreaterThan(0);
});
