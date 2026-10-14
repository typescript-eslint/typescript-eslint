import { typescriptVersionIsAtLeast } from '@typescript-eslint/type-utils';
import * as path from 'node:path';
import { defineProject, mergeConfig, configDefaults } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const oldTypeScriptSkippedTests = [
  // We're already testing this with latest supported TS version.
  './docs.test.mts',

  // TODO: these rules have known failures on TS < 4.9
  // See https://github.com/typescript-eslint/typescript-eslint/pull/13024#issuecomment-6161399272
  './rules/dot-notation.test.ts',
  './rules/no-deprecated.test.ts',
  './rules/no-unnecessary-condition.test.ts',
  './rules/no-unnecessary-type-parameters.test.ts',
  './rules/no-unsafe-enum-assignment.test.ts',
  './rules/no-unsafe-return.test.ts',
  './rules/no-unsafe-type-assertion.test.ts',
  './rules/require-array-sort-compare.test.ts',
];

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineProject({
    root: import.meta.dirname,

    test: {
      dir: path.join(import.meta.dirname, 'tests'),

      exclude: [
        ...configDefaults.exclude,

        // Skip rules tests on Windows CI since they aren't affected by OS.
        ...(isWindowsCI() ? ['./rules/**/*', './eslint-rules/**/*'] : []),

        ...(typescriptVersionIsAtLeast['4.9'] ? [] : oldTypeScriptSkippedTests),
      ],

      name: packageJson.name.replace('@typescript-eslint/', ''),
      root: import.meta.dirname,
    },
  }),
);

export default vitestConfig;

function isWindowsCI() {
  return process.platform === 'win32' && Boolean(process.env.CI);
}
