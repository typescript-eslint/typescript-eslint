import * as path from 'node:path';
import { defineProject, mergeConfig, configDefaults } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineProject({
    root: import.meta.dirname,

    test: {
      dir: path.join(import.meta.dirname, 'tests'),
      name: packageJson.name.replace('@typescript-eslint/', ''),
      root: import.meta.dirname,

      // Skip rules tests on Windows CI since they aren't affected by OS.
      exclude: isWindowsCI()
        ? [...configDefaults.exclude, './rules/**/*', './eslint-rules/**/*']
        : undefined,

      // The Node 18 CI tier has no module compile cache, so type-aware rule
      // tests pay a TS program initialization cost that can push individual
      // tests past the shared 10s default.
      testTimeout:
        process.env.TSESLINT_CI_NODE_VARIANT === '18' ? 30_000 : undefined,
    },
  }),
);

export default vitestConfig;

function isWindowsCI() {
  return process.platform === 'win32' && Boolean(process.env.CI);
}
