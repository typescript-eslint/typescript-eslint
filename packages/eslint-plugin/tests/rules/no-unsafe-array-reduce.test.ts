import path from 'path';
import rule from '../../src/rules/no-unsafe-array-reduce';
import { RuleTester } from '../RuleTester';

const rootDir = path.resolve(__dirname, '../fixtures/');
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-unsafe-array-reduce', rule, {
  valid: [
    {
      // Type parameter is fine
      code: `
type Dict = { [key in string]?: string }
[].reduce<Dict>((acc, _) => acc, {});`,
    },
    {
      // Typed accumulator is fine
      code: `
type Dict = { [key in string]?: string }
[].reduce((acc: Dict, _) => acc, {});`,
    },
    {
      // Typed init value is fine
      code: `
type Dict = { [key in string]?: string }
[].reduce((acc, _) => acc, {} as Dict);`,
    },
    {
      // Non-object init value is fine
      code: `
type Dict = { [key in string]?: string }
[].reduce((acc, _) => acc, []);`,
    },
    {
      // Non-reduce is fine
      code: `[].filter(() => true);`,
    },
    {
      // Non-array reduce is fine
      code: `reduce((acc, _) => acc, {});`,
    },
  ],

  invalid: [
    {
      code: `[].reduce((acc, cur) => acc, {});`,
      output: `[].reduce((acc, cur) => acc, {});`,
      errors: [{ messageId: 'unsafeArrayReduce' }],
    },
    {
      code: `
const arr = []
arr.reduce((acc, cur) => acc, {});`,
      output: `
const arr = []
arr.reduce((acc, cur) => acc, {});`,
      errors: [{ messageId: 'unsafeArrayReduce' }],
    },
  ],
});
