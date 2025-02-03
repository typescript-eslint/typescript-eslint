import { defaultExclude, defineConfig, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineConfig({
    plugins: [
      {
        load(id) {
          if (id === 'totally-real-dependency/package.json') {
            return JSON.stringify(
              {
                exports: {
                  './package.json': './package.json',
                },
                name: 'totally-real-dependency',
                version: '10.0.0',
              },
              null,
              2,
            );
          }

          if (id === 'totally-real-dependency-prerelease/package.json') {
            return JSON.stringify(
              {
                exports: {
                  './package.json': './package.json',
                },
                name: 'totally-real-dependency-prerelease',
                version: '10.0.0-rc.1',
              },
              null,
              2,
            );
          }

          return;
        },
        name: 'virtual-dependency-totally-real-dependency-package-json',

        resolveId(source) {
          if (
            source === 'totally-real-dependency/package.json' ||
            source === 'totally-real-dependency-prerelease/package.json'
          ) {
            return source;
          }

          return;
        },
      },
    ],

    test: {
      dir: `${import.meta.dirname}/tests`,
      exclude: [...defaultExclude, 'eslint-base/eslint-base.test.js'],
      name: packageJson.name,

      root: import.meta.dirname,
    },
  }),
);

export default vitestConfig;
