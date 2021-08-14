import rule from '../../src/rules/no-unnecessary-generics';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-unnecessary-generics', rule, {
  valid: [
    `
// Uses type parameter twice
function foo<T>(m: Map<T, T>): void {}
    `,
    `
// 'T appears in a constraint, so it appears twice.
function f<T, U extends T>(t: T, u: U): U;
    `,
  ],

  invalid: [
    {
      code: `
interface I {
  <T>(value: T): void;
  m<T>(x: T): void;
}
      `,
      errors: [
        {
          messageId: 'failureString',
          line: 3,
          column: 14,
        },
        {
          messageId: 'failureString',
          line: 4,
          column: 11,
        },
      ],
    },
    {
      code: `
class C {
  constructor<T>(x: T) {}
}
      `,
      errors: [
        {
          messageId: 'failureString',
          line: 3,
          column: 21,
        },
      ],
    },
    {
      code: `
type Fn = <T>() => T;
      `,
      errors: [
        {
          messageId: 'failureString',
          line: 2,
          column: 20,
        },
      ],
    },
    {
      code: `
type Ctr = new <T>() => T;
      `,
      errors: [
        {
          messageId: 'failureString',
          line: 2,
          column: 25,
        },
      ],
    },
    {
      code: `
function f<T>(): T {}
      `,
      errors: [
        {
          messageId: 'failureString',
          line: 2,
          column: 18,
        },
      ],
    },
    {
      code: `
const f2 = <T>(): T => {};
      `,
      errors: [
        {
          messageId: 'failureString',
          line: 2,
          column: 19,
        },
      ],
    },
    {
      code: `
function f<T>(x: { T: number }): void;
      `,
      errors: [
        {
          messageId: 'failureString',
          line: 2,
          column: 12,
        },
      ],
    },
    {
      code: `
function f<T, U extends T>(u: U): U;
      `,
      errors: [
        {
          messageId: 'failureString',
          line: 2,
          column: 25,
        },
      ],
    },
  ],
});
