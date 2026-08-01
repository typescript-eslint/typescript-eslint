import * as path from 'node:path';
import { defineProject, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineProject({
    root: import.meta.dirname,

    test: {
      diff: {
        maxDepth: 1,
      },

      dir: path.join(import.meta.dirname, 'tests'),
      include: getTestFiles(),
      name: packageJson.name.replace('@typescript-eslint/', ''),
      root: import.meta.dirname,
      setupFiles: ['./tests/test-utils/custom-matchers/custom-matchers.ts'],
      testTimeout: 10_000,
    },
  }),
);

function getTestFiles() {
  const isWindowsCI = process.platform === 'win32' && Boolean(process.env.CI);

  if (isWindowsCI) {
    // Test(s) that could be affected by OS.
    return ['./tests/TypeOrValueSpecifier.test.ts'];
  }

  return undefined;
}

export default vitestConfig;
