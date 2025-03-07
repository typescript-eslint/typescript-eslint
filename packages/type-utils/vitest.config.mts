import * as path from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineConfig({
    test: {
      dir: path.join(import.meta.dirname, 'tests'),
      name: packageJson.name.split('/').pop(),
      root: import.meta.dirname,
    },
  }),
);

export default vitestConfig;
