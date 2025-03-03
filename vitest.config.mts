import { defaultExclude, defineConfig, mergeConfig } from 'vitest/config';
import { vitestBaseConfig } from './vitest.config.base.mjs';

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineConfig({
    test: {
      name: 'root',
      root: import.meta.dirname,

      exclude: [
        ...defaultExclude,
        'packages/rule-tester/tests/eslint-base/eslint-base.test.js',
      ],
    },
  }),
);

export default vitestConfig;
