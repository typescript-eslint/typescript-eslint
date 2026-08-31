import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { FIXTURES_DESTINATION_DIR } from './pack-packages.js';

interface SampleResult {
  diagnostics: object[];
  nativeRecentRequests: object[];
  nativeRequestTotals?: object;
  parserServiceCalls: Record<string, number>;
  peakRss: number;
  wallTimeMs: number[];
}

type Backend = 'classic' | 'native';

const fixture = path.join(FIXTURES_DESTINATION_DIR, 'native-project-service');
const runner = path.join(fixture, 'benchmark.mjs');
if (!fs.existsSync(runner)) {
  const prepare = spawnSync(
    'pnpm',
    [
      'exec',
      'vitest',
      'run',
      'tests/native-project-service.test.ts',
      '--config',
      'vitest.config.mts',
    ],
    {
      cwd: path.resolve(import.meta.dirname, '..'),
      encoding: 'utf8',
      env: { ...process.env, KEEP_INTEGRATION_TEST_DIR: 'true' },
    },
  );
  if (prepare.status !== 0 || !fs.existsSync(runner)) {
    throw new Error(
      `Failed to prepare packed benchmark fixture: ${prepare.stderr}`,
    );
  }
}

function runBackend(backend: Backend): SampleResult {
  const result = spawnSync(process.execPath, [runner, backend], {
    cwd: fixture,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`${backend} benchmark failed: ${result.stderr}`);
  }
  return JSON.parse(result.stdout) as SampleResult;
}

function median(samples: number[]): number {
  const sorted = [...samples].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

const classic = runBackend('classic');
const native = runBackend('native');
if (
  JSON.stringify(classic.diagnostics) !== JSON.stringify(native.diagnostics)
) {
  throw new Error('Classic and native benchmark diagnostics differ.');
}

const summarize = (result: SampleResult) => ({
  ...result,
  coldWallTimeMs: result.wallTimeMs[0],
  warmMedianWallTimeMs: median(result.wallTimeMs.slice(1)),
  warmWallTimeMs: result.wallTimeMs.slice(1),
});
const output = {
  acceptance: 'native warm median must not exceed classic warm median',
  backends: {
    classic: summarize(classic),
    native: summarize(native),
  },
  diagnosticsEquivalent: true,
};

console.log(JSON.stringify(output));
if (
  output.backends.native.warmMedianWallTimeMs >
  output.backends.classic.warmMedianWallTimeMs
) {
  process.exitCode = 1;
}
