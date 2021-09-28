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
    {
      code: `export type { BlockScope } from '@typescript-eslint/scope-manager';`,
      output: `export { BlockScope } from '@typescript-eslint/scope-manager';`,
      errors: [
        {
          messageId: 'valueOverType',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `export { AnalyzeOptions, BlockScope } from '@typescript-eslint/scope-manager';`,
      output:
        `export type { AnalyzeOptions } from '@typescript-eslint/scope-manager';\n` +
        `export { BlockScope } from '@typescript-eslint/scope-manager';`,
      errors: [
        {
          messageId: 'singleExportIsType',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `export { AnalyzeOptions, BlockScope, CatchScope } from '@typescript-eslint/scope-manager';`,
      output:
        `export type { AnalyzeOptions } from '@typescript-eslint/scope-manager';\n` +
        `export { BlockScope, CatchScope } from '@typescript-eslint/scope-manager';`,
      errors: [
        {
          messageId: 'singleExportIsType',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `export { AnalyzeOptions, BlockScope, Definition, CatchScope } from '@typescript-eslint/scope-manager';`,
      output:
        `export type { AnalyzeOptions, Definition } from '@typescript-eslint/scope-manager';\n` +
        `export { BlockScope, CatchScope } from '@typescript-eslint/scope-manager';`,
      errors: [
        {
          messageId: 'multipleExportsAreTypes',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `export type { AnalyzeOptions, BlockScope } from '@typescript-eslint/scope-manager';`,
      output:
        `export { BlockScope } from '@typescript-eslint/scope-manager';\n` +
        `export type { AnalyzeOptions } from '@typescript-eslint/scope-manager';`,
      errors: [
        {
          messageId: 'singleExportIsValue',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `export type { AnalyzeOptions, BlockScope, Definition } from '@typescript-eslint/scope-manager';`,
      output:
        `export { BlockScope } from '@typescript-eslint/scope-manager';\n` +
        `export type { AnalyzeOptions, Definition } from '@typescript-eslint/scope-manager';`,
      errors: [
        {
          messageId: 'singleExportIsValue',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `export type { AnalyzeOptions, BlockScope, Definition, CatchScope } from '@typescript-eslint/scope-manager';`,
      output:
        `export { BlockScope, CatchScope } from '@typescript-eslint/scope-manager';\n` +
        `export type { AnalyzeOptions, Definition } from '@typescript-eslint/scope-manager';`,
      errors: [
        {
          messageId: 'multipleExportsAreValues',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `export { Definition as Foo } from '@typescript-eslint/scope-manager';`,
      output: `export type { Definition as Foo } from '@typescript-eslint/scope-manager';`,
      errors: [
        {
          messageId: 'typeOverValue',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `export { Definition as Foo, BlockScope } from '@typescript-eslint/scope-manager';`,
      output:
        `export type { Definition as Foo } from '@typescript-eslint/scope-manager';\n` +
        `export { BlockScope } from '@typescript-eslint/scope-manager';`,
      errors: [
        {
          messageId: 'singleExportIsType',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
});
