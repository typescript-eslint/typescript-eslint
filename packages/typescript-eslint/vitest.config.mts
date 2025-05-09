import * as path from 'node:path';
import { defineProject, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineProject({
    root: import.meta.dirname,

    test: {
      dir: path.join(import.meta.dirname, 'tests'),
      name: packageJson.name,
      root: import.meta.dirname,

      typecheck: {
        enabled: true,
        tsconfig: path.join(import.meta.dirname, 'tsconfig.spec.json'),
      },
    },
  }),
);

export default vitestConfig;
