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
    `
function f<T>(t: T) {
  return t;
}
    `,
    `
function f<T>(t: T) {
  return null as { t: T };
}
    `,
    `
function f<T>(t: T) {
  return null as T | null;
}
    `,
    `
function f<T>(t: T) {
  return null as (t: T) => void;
}
    `,
    `
function f<T>(t: T) {
  return (t: any): t is T => {
    return true;
  };
}
    `,
    `
function f<T>(t: T) {
  return (t: any): t is () => T => {
    return true;
  };
}
    `,
    `
function f<T, P>(t: T) {
  return null as { [k in keyof T]: string };
}
    `,
    `
function f<T, P>() {
  return null as T[P];
}
    `,
    `
// not supported
function f<A, B, C, D>() {
  return null as A extends B ? 1 : 2;
}
    `,
    `
function f<A, B>() {
  return null as A extends B ? string : number;
}
`,
    `
function f<A, B>() {
  return null as [A, B];
}
`,
    `
function f<A>() {
  return [] as A[];
}
`,
    `
function f<T>(t: T) {
  return null as Record<keyof T, any>;
}
    `,
    `
function f1<T extends { new (): any }>(a: T) {
  return class Foo extends a {
    f = 1;
  };
}
    `,
    `
function f1<T extends { new (...args: any[]): any }>(a: T) {
  return class Foo extends a {
    f = 1;
  };
}
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
    {
      code: `
function f<T>(t: T) {}
      `,
      errors: [
        {
          messageId: 'failureString',
          line: 2,
          column: 18,
        },
      ],
    },
  ],
});
