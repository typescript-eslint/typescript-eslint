import * as path from 'node:path';
import { defineProject, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineProject({
    test: {
      dir: path.join(import.meta.dirname, 'tests', 'lib'),
      name: packageJson.name.replace('@typescript-eslint/', ''),
      root: import.meta.dirname,
    },
  }),
);

export default vitestConfig;
