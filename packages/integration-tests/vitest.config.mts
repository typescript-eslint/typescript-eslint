import * as os from 'node:os';
import { defineConfig, mergeConfig } from 'vitest/config';
import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineConfig({
    test: {
      dir: `${import.meta.dirname}/tests`,
      name: packageJson.name,
      root: import.meta.dirname,

      fileParallelism: os.platform() !== 'win32',

      globalSetup: ['./tools/pack-packages.ts'],
    },
  }),
);

export default vitestConfig;
