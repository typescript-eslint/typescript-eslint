import rule from '../../src/rules/no-array-delete';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-array-delete', rule, {
  valid: [
    `
declare const obj: Record<PropertyKey, any>;
declare const key: PropertyKey;

delete obj[key];
    `,
    `
declare const arr: any[];

delete arr.myprop;
    `,
    `
declare const arr: any[];
declare const i: string;

delete arr[i];
    `,
  ],
  invalid: [
    {
      code: `
declare const arr: any[];
declare const i: number;

delete arr[i];
      `,
      output: `
declare const arr: any[];
declare const i: number;

arr.splice(i, 1);
      `,
      errors: [{ messageId: 'arrayDeleteViolation' }],
    },
  ],
});
