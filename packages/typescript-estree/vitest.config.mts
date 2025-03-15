import * as path from 'node:path';
import { defaultExclude, defineProject, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineProject({
    root: import.meta.dirname,

    test: {
      dir: path.join(import.meta.dirname, 'tests', 'lib'),

      exclude: process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE
        ? [...defaultExclude, 'parse.project-true.test.ts']
        : [...defaultExclude],

      name: packageJson.name.replace('@typescript-eslint/', ''),
      root: import.meta.dirname,
      testTimeout: 10_000,
      unstubEnvs: true,
      unstubGlobals: true,
    },
  }),
);

export default vitestConfig;
