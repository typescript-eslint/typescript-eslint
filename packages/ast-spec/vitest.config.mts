import * as path from 'node:path';
import { defineProject, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  mergeConfig(vitestBaseConfig, {
    test: {
      coverage: {
        // `ast-spec` tests are transitively testing the `typescript-estree`
        // package, so we include `typescript-estree` in the coverage report.
        //
        // Including `dist` because the tests are running against the compiled
        // output. Vitest will then use the sourcemaps to map the coverage back
        // to the source files.
        allowExternal: true,
        include: [
          path.join(import.meta.dirname, '../typescript-estree/dist/**/*.js'),
        ],
      },
    },
  }),

  defineProject({
    root: import.meta.dirname,

    test: {
      dir: path.join(import.meta.dirname, 'tests'),
      name: packageJson.name.replace('@typescript-eslint/', ''),
      root: import.meta.dirname,

      setupFiles: [
        './tests/util/setupVitest.mts',
        './tests/util/custom-matchers/custom-matchers.ts',
      ],

      typecheck: {
        enabled: true,
        tsconfig: path.join(import.meta.dirname, 'tsconfig.spec.json'),
      },
    },
  }),
);

export default vitestConfig;
