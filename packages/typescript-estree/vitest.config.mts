import * as fs from 'node:fs';
import * as path from 'node:path';
import { defaultExclude, defineProject, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const name = packageJson.name.replace('@typescript-eslint/', '');
const testsDir = path.join(import.meta.dirname, 'tests', 'lib');

const testFiles = fs
  .readdirSync(testsDir, { encoding: 'utf8', recursive: true })
  .filter(file => file.endsWith('.test.ts'))
  .map(file => file.replaceAll(path.sep, '/'));

const isMockingModules = (file: string): boolean => {
  const content = fs.readFileSync(path.join(testsDir, file), 'utf8');

  return /\bvi\.(?:doMock|mock|resetModules)\(/.test(content);
};

const isolatedTests = testFiles.filter(isMockingModules);
const sharedTests = testFiles.filter(file => !isolatedTests.includes(file));

const vitestConfig = mergeConfig(
  vitestBaseConfig,

  defineProject({
    root: import.meta.dirname,

    test: {
      dir: testsDir,

      exclude: [
        ...defaultExclude,
        ...(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE
          ? ['parse.project-true.test.ts']
          : []),
        ...(process.features.require_module ? [] : ['native-*.test.ts']),
      ],

      name,
      root: import.meta.dirname,
      setupFiles: [
        './tests/test-utils/custom-matchers/custom-matchers.ts',
        './tests/test-utils/tsgo-backend.mts',
        './tests/test-utils/unstub.ts',
      ],
      testTimeout: 15_000,
      unstubEnvs: true,
      unstubGlobals: true,
    },
  }),
);

export default mergeConfig(vitestConfig, {
  test: {
    projects: [
      {
        extends: true,
        test: {
          exclude: isolatedTests,
          isolate: false,
          name,
        },
      },
      {
        extends: true,
        test: {
          exclude: sharedTests,
          isolate: true,
          name: `${name} (isolated)`,
        },
      },
    ],
  },
});
