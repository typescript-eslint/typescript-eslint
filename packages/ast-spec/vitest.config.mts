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
      name: packageJson.name.replace('@typescript-eslint/', ''),
      root: import.meta.dirname,
      setupFiles: ['./tests/util/setupVitest.mts'],

      typecheck: {
        enabled: true,
        tsconfig: path.join(import.meta.dirname, 'tsconfig.spec.json'),
      },
    },
  }),
);

export default vitestConfig;
