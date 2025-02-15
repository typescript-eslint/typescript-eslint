import { defaultExclude, defineConfig, mergeConfig } from 'vitest/config';
import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineConfig({
    test: {
      dir: `${import.meta.dirname}/tests/lib`,
      name: packageJson.name,
      root: import.meta.dirname,

      unstubEnvs: true,
      unstubGlobals: true,

      exclude: process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE
        ? [...defaultExclude, '/node_modules/', 'parse.project-true.test.ts']
        : [...defaultExclude],
    },
  }),
);

export default vitestConfig;
