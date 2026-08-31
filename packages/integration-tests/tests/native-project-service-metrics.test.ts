import { nodeIntegrationTest } from '../tools/integration-test-base';

nodeIntegrationTest(__filename, 'metrics.mjs', stderr => {
  const { diagnostics, metrics } = JSON.parse(stderr) as {
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
  };

  expect(diagnostics).toHaveLength(2);
  expect(diagnostics.every(result => result.length === 4)).toBe(true);
  expect(metrics).toMatchObject({
    fileEvents: 0,
    fileOverlays: 1,
    processStarts: 1,
    projectDiscoveries: 1,
    projectHits: 1,
    snapshotsCreated: 2,
    snapshotsDisposed: 1,
    timing: { enabled: true },
  });
  expect(metrics.timing.totals.requestCount).toBeGreaterThan(0);
  expect(metrics.parserServices.getTypeAtLocation).toBeGreaterThan(0);
  expect(metrics.parserServices.getTypesAtLocations).toBeGreaterThan(0);
});
