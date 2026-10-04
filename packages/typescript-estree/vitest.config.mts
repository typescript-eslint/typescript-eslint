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

      exclude: [
        ...defaultExclude,
        ...(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE
          ? ['parse.project-true.test.ts']
          : []),
        ...(process.features.require_module ? [] : ['native-*.test.ts']),
      ],

      isolate: true,
      name: packageJson.name.replace('@typescript-eslint/', ''),
      root: import.meta.dirname,
      setupFiles: ['./tests/test-utils/custom-matchers/custom-matchers.ts'],
      testTimeout: 15_000,
      unstubEnvs: true,
      unstubGlobals: true,
    },
  }),
);

export default vitestConfig;
