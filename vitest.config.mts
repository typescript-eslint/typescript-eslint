import * as path from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from './vitest.config.base.mjs';

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineConfig({
    test: {
      coverage: {
        exclude: [
          'packages/{website?(-eslint),?(rule-schema-to-typescript-)types}/src',
          'packages/ast-spec/src/**/fixtures',
        ],

        include: ['packages/*/src'],
      },

      dir: path.join(import.meta.dirname, 'packages'),

      name: 'root',

      root: import.meta.dirname,

      workspace: [
        'packages/*/vitest.config.mts',
        '!packages/{website?(-eslint),?(rule-schema-to-typescript-)types}/vitest.config.mts',
      ],
    },
  }),
);

export default vitestConfig;
