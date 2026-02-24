import * as path from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from './vitest.config.base.mjs';

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineConfig({
    root: import.meta.dirname,

    test: {
      coverage: {
        exclude: [
          'packages/website/src',
          'packages/website-eslint/src',
          'packages/rule-schema-to-typescript-types/src',
          'packages/types/src',
          'packages/ast-spec/src/**/fixtures',
        ],

        include: ['packages/*/src'],
      },

      dir: path.join(import.meta.dirname, 'packages'),
      name: 'root',

      projects: [
        'packages/*/vitest.config.mts',
        '!packages/website/vitest.config.mts',
        '!packages/website-eslint/vitest.config.mts',
        '!packages/rule-schema-to-typescript-types/vitest.config.mts',
        '!packages/types/vitest.config.mts',
      ],

      root: import.meta.dirname,
    },
  }),
);

export default vitestConfig;
