import type { ViteUserConfig } from 'vitest/config';
import type { TestSpecification } from 'vitest/node';

import * as fs from 'node:fs';
import * as path from 'node:path';
import ts from 'typescript';
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import { BaseSequencer } from 'vitest/node';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const isOldTypeScript = ts.version.startsWith('4.8.');

const oldTypeScriptSkippedTests = [
  // TODO: these rules have known failures on TS < 4.9
  // See https://github.com/typescript-eslint/typescript-eslint/pull/13024#issuecomment-6161399272
  './rules/no-unnecessary-type-parameters.test.ts',
  './rules/no-unsafe-enum-assignment.test.ts',
];

// Sharded CI jobs run this package as their only Nx task, so Vitest can use every core.
const isSharded = process.argv.some(arg => arg.startsWith('--shard'));

/**
 * Vitest shards by path hash, which leaves one shard ~1.7x slower than another.
 * Greedily balance by file size instead.
 */
class FileSizeShardSequencer extends BaseSequencer {
  override async shard(
    files: TestSpecification[],
  ): Promise<TestSpecification[]> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { count, index } = this.ctx.config.shard!;
    const loads = Array.from({ length: count }, () => 0);

    const sized = await Promise.all(
      files.map(async spec => ({
        size: (await fs.promises.stat(spec.moduleId)).size,
        spec,
      })),
    );

    return sized
      .sort(
        (a, b) =>
          b.size - a.size || a.spec.moduleId.localeCompare(b.spec.moduleId),
      )
      .filter(({ size }) => {
        const lightest = loads.indexOf(Math.min(...loads));
        loads[lightest] += size;
        return lightest === index - 1;
      })
      .map(({ spec }) => spec);
  }
}

const vitestConfig: ViteUserConfig = mergeConfig(
  vitestBaseConfig,

  // `defineConfig` rather than `defineProject`: `sequence.sequencer` is a root-only option.
  defineConfig({
    root: import.meta.dirname,

    test: {
      dir: path.join(import.meta.dirname, 'tests'),

      exclude: [
        ...configDefaults.exclude,

        // Skip rules tests on Windows CI since they aren't affected by OS.
        ...(isWindowsCI() ? ['./rules/**/*', './eslint-rules/**/*'] : []),

        ...(isOldTypeScript ? oldTypeScriptSkippedTests : []),
      ],

      maxWorkers: isSharded ? '100%' : undefined,
      name: packageJson.name.replace('@typescript-eslint/', ''),
      root: import.meta.dirname,

      sequence: { sequencer: FileSizeShardSequencer },

      // To support `require` calls of the rules lazy loading.
      setupFiles: ['tsx/cjs'],
    },
  }),
);

if (isOldTypeScript) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  vitestConfig.test!.include = ['./rules/**/*.test.ts'];
}

export default vitestConfig;

function isWindowsCI() {
  return process.platform === 'win32' && Boolean(process.env.CI);
}
