import * as fs from 'node:fs';
import * as path from 'node:path';
import { defaultExclude, defineProject, mergeConfig } from 'vitest/config';

import { vitestBaseConfig } from '../../vitest.config.base.mjs';
import packageJson from './package.json' with { type: 'json' };

const name = packageJson.name.replace('@typescript-eslint/', '');
const testsDir = path.join(import.meta.dirname, 'tests', 'lib');

// Files that mock modules need a fresh module graph. Everything else shares
// one, so that each file doesn't re-import TypeScript and the parser.
const testFiles = fs
  .readdirSync(testsDir, { encoding: 'utf8', recursive: true })
  .filter(file => file.endsWith('.test.ts'))
  .map(file => file.replaceAll(path.sep, '/'));
const mocksModules = (file: string): boolean =>
  /\bvi\.(?:doMock|mock|resetModules)\(/.test(
    fs.readFileSync(path.join(testsDir, file), 'utf8'),
  );
const isolatedTests = testFiles.filter(mocksModules);
const sharedTests = testFiles.filter(file => !mocksModules(file));

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
          exclude: isolatedTests.map(file => `**/${file}`),
          isolate: false,
          name,
        },
      },
      {
        extends: true,
        test: {
          exclude: sharedTests.map(file => `**/${file}`),
          isolate: true,
          name: `${name} (isolated)`,
        },
      },
    ],
  },
});
