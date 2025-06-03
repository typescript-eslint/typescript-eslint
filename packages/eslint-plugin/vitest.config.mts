import * as path from 'node:path';
import { defineProject, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

export default mergeConfig(
  vitestBaseConfig,

  defineProject({
    root: import.meta.dirname,

    test: {
      include: [
        path.join(import.meta.dirname, 'tests/rules/no-base-to-string.test.ts'),
      ],
      // dir: path.join(import.meta.dirname, 'tests'),
      name: packageJson.name.replace('@typescript-eslint/', ''),
      root: import.meta.dirname,
    },
  }),
);
