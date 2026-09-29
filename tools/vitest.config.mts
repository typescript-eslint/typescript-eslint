import * as path from 'node:path';
import { defineProject, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../vitest.config.base.mjs';

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineProject({
    root: import.meta.dirname,

    test: {
      dir: path.join(import.meta.dirname, 'scripts'),
      name: 'tools',
      root: import.meta.dirname,
    },
  }),
);

export default vitestConfig;
