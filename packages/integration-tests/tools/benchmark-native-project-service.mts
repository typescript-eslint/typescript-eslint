import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { FIXTURES_DESTINATION_DIR } from './pack-packages.js';

interface BackendResult {
  backend: 'classic' | 'native';
  metrics: unknown;
  peakRss: number;
  samples: number[];
}

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

function runBackend(backend: BackendResult['backend']): BackendResult {
  const result = spawnSync(process.execPath, [runner, backend], {
    cwd: fixture,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`${backend} benchmark failed: ${result.stderr}`);
  }
  return JSON.parse(result.stdout) as BackendResult;
}

function median(samples: number[]): number {
  const sorted = [...samples].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

const classic = runBackend('classic');
const native = runBackend('native');
const output = {
  acceptance: 'native warm median must not exceed classic warm median',
  backends: {
    classic: { ...classic, warmMedian: median(classic.samples.slice(1)) },
    native: { ...native, warmMedian: median(native.samples.slice(1)) },
  },
};

console.log(JSON.stringify(output));
if (output.backends.native.warmMedian > output.backends.classic.warmMedian) {
  process.exitCode = 1;
}
