import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { FIXTURES_DESTINATION_DIR } from './pack-packages.js';

interface SampleResult {
  diagnostics: object[];
  nativeMetrics?: object;
  peakRss: number;
  wallTimeMs: number[];
}

type Mode = 'classic' | 'native' | 'native-instrumented';

const fixture = path.join(FIXTURES_DESTINATION_DIR, 'native-project-service');
const runner = path.join(fixture, 'benchmark.mjs');
fs.rmSync(fixture, { force: true, recursive: true });
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
if (prepare.status !== 0) {
  throw new Error(
    `Failed to prepare packed benchmark fixture: ${prepare.stderr}`,
  );
}

function runMode(mode: Mode): SampleResult {
  const result = spawnSync(process.execPath, [runner, mode], {
    cwd: fixture,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`${mode} benchmark failed: ${result.stderr}`);
  }
  return JSON.parse(result.stdout) as SampleResult;
}

function median(samples: number[]): number {
  const sorted = [...samples].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

const classic = runMode('classic');
const native = runMode('native');
const nativeInstrumented = runMode('native-instrumented');
if (
  JSON.stringify(classic.diagnostics) !== JSON.stringify(native.diagnostics) ||
  JSON.stringify(classic.diagnostics) !==
    JSON.stringify(nativeInstrumented.diagnostics)
) {
  throw new Error('Benchmark diagnostics differ between modes.');
}

const summarize = (result: SampleResult) => ({
  coldWallTimeMs: result.wallTimeMs[0],
  diagnostics: result.diagnostics,
  peakRss: result.peakRss,
  warmMedianWallTimeMs: median(result.wallTimeMs.slice(1)),
  warmWallTimeMs: result.wallTimeMs.slice(1),
});
const classicSummary = summarize(classic);
const nativeSummary = summarize(native);
const passed =
  nativeSummary.warmMedianWallTimeMs <= classicSummary.warmMedianWallTimeMs;
const output = {
  acceptance: {
    criterion:
      'uninstrumented native warm median must not exceed uninstrumented classic warm median',
    passed,
  },
  diagnosticsEquivalent: true,
  fairUninstrumented: {
    classic: classicSummary,
    native: nativeSummary,
    nativeApiTimingEnabled: false,
  },
  nativeInstrumentation: {
    metrics: nativeInstrumented.nativeMetrics,
    observedPerformance: summarize(nativeInstrumented),
    usedForAcceptance: false,
  },
};

console.log(JSON.stringify(output));
if (!passed) {
  process.exitCode = 1;
}
