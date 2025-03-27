import { defineConfig, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineConfig({
    root: import.meta.dirname,

    test: {
      name: packageJson.name.replace('@typescript-eslint/', ''),
      root: import.meta.dirname,
      passWithNoTests: true,
    },
  }),
);

export default vitestConfig;
