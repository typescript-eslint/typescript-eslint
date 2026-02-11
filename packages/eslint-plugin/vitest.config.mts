import * as path from 'node:path';
import { defineProject, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineProject({
    root: import.meta.dirname,

    test: {
      dir: path.join(import.meta.dirname, 'tests'),

      include: process.env.CI
        ? ['./*.test.?(m)ts', './{eslint-rules,rules,util}/**/*.test.ts']
        : undefined,

      isolate: false,
      name: packageJson.name.replace('@typescript-eslint/', ''),
      root: import.meta.dirname,

      // Skip rules tests on Windows CI since they aren't affected by OS.
      exclude: isWindowsCI()
        ? ['./rules/**/*', './eslint-rules/**/*']
        : undefined,
    },
  }),
);

export default vitestConfig;

function isWindowsCI() {
  return process.platform === 'win32' && Boolean(process.env.CI);
}
