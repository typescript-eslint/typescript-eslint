import {
  coverageConfigDefaults,
  defineConfig,
  mergeConfig,
} from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineConfig({
    test: {
      coverage: {
        exclude: [...coverageConfigDefaults.exclude, './**/fixtures/'],
      },

      dir: `${import.meta.dirname}/tests`,
      name: packageJson.name,

      root: import.meta.dirname,

      setupFiles: ['./tests/util/setupVitest.mts'],

      typecheck: {
        enabled: true,
        tsconfig: `${import.meta.dirname}/tsconfig.json`,
      },
    },
  }),
);

export default vitestConfig;
