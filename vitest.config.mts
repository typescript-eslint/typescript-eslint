import { defaultExclude, defineConfig, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from './vitest.config.base.mjs';

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineConfig({
    test: {
      exclude: [
        ...defaultExclude,
        'packages/rule-tester/tests/eslint-base/eslint-base.test.js',
      ],
      name: 'root',

      root: import.meta.dirname,
    },
  }),
);

export default vitestConfig;
