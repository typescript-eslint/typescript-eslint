/* eslint-disable @typescript-eslint/internal/plugin-test-formatting */
import rule from '../../src/rules/consistent-type-exports';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
});

ruleTester.run('consistent-type-exports', rule, {
  valid: [
    `export { Foo } from 'foo';`,
    "export type { AnalyzeOptions } from '@typescript-eslint/scope-manager';",
    "export { BlockScope } from '@typescript-eslint/experimental-utils';",
  ],
  invalid: [
    {
      code: `export { AnalyzeOptions } from '@typescript-eslint/scope-manager';`,
      output: `export type { AnalyzeOptions } from '@typescript-eslint/scope-manager';`,
      errors: [
        {
          messageId: 'typeOverValue',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
});
