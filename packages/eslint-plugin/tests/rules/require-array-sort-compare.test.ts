import path from 'path';
import rule from '../../src/rules/require-array-sort-compare';
import { RuleTester } from '../RuleTester';

const rootPath = path.join(process.cwd(), 'tests/fixtures/');

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('require-array-sort-compare', rule, {
  valid: [
    `
      function f(a: any[]) {
        a.sort(undefined)
      }
    `,
    `
      function f(a: any[]) {
        a.sort((a, b) => a - b)
      }
    `,
    `
      function f(a: Array<string>) {
        a.sort(undefined)
      }
    `,
    `
      function f(a: Array<number>) {
        a.sort((a, b) => a - b)
      }
    `,
    `
      function f(a: { sort(): void }) {
        a.sort()
      }
    `,
    `
      class A { sort(): void {} }
      function f(a: A) {
        a.sort()
      }
    `,
    `
      interface A { sort(): void }
      function f(a: A) {
        a.sort()
      }
    `,
    `
      interface A { sort(): void }
      function f<T extends A>(a: T) {
        a.sort()
      }
    `,
    `
      function f(a: any) {
        a.sort()
      }
    `,
    `
      namespace UserDefined {
        interface Array {
          sort(): void
        }
        function f(a: Array) {
          a.sort()
        }
      }
    `,
  ],
  invalid: [
    {
      code: `
        function f(a: Array<any>) {
          a.sort()
        }
      `,
      errors: [{ messageId: 'requireCompare' }],
    },
    {
      code: `
        function f(a: string[]) {
          a.sort()
        }
      `,
      errors: [{ messageId: 'requireCompare' }],
    },
    {
      code: `
        function f(a: string | string[]) {
          if (Array.isArray(a))
            a.sort()
        }
      `,
      errors: [{ messageId: 'requireCompare' }],
    },
    {
      code: `
        function f(a: number[] | string[]) {
          a.sort()
        }
      `,
      errors: [{ messageId: 'requireCompare' }],
    },
    {
      code: `
        function f<T extends number[]>(a: T) {
          a.sort()
        }
      `,
      errors: [{ messageId: 'requireCompare' }],
    },
    {
      code: `
        function f<T, U extends T[]>(a: U) {
          a.sort()
        }
      `,
      errors: [{ messageId: 'requireCompare' }],
    },
  ],
});
