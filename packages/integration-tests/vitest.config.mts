import * as os from 'node:os';
import * as path from 'node:path';
import { defineProject, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineProject({
    test: {
      dir: path.join(import.meta.dirname, 'tests'),
      globalSetup: ['./tools/pack-packages.ts'],
      name: packageJson.name.split('/').pop(),

      poolOptions: {
        forks: {
          singleFork: os.platform() === 'win32',
        },
      },

      root: import.meta.dirname,
    },
  }),
);

export default vitestConfig;
