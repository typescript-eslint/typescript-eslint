import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/consistent-type-definitions';

const ruleTester = new RuleTester();

ruleTester.run('consistent-type-definitions', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    {
      code: 'var foo = {};',
      options: ['interface'],
    },
    {
      code: 'interface A {}',
      options: ['interface'],
    },
    {
      code: `
interface A extends B {
  x: number;
}
      `,
      options: ['interface'],
    },
    {
      code: 'type U = string;',
      options: ['interface'],
    },
    {
      code: 'type V = { x: number } | { y: string };',
      options: ['interface'],
    },
    {
      code: `
type Record<T, U> = {
  [K in T]: U;
};
      `,
      options: ['interface'],
    },
    {
      code: 'type T = { x: number };',
      options: ['type'],
    },
    {
      code: 'type A = { x: number } & B & C;',
      options: ['type'],
    },
    {
      code: 'type A = { x: number } & B<T1> & C<T2>;',
      options: ['type'],
    },
    {
      code: `
export type W<T> = {
  x: T;
};
      `,
      options: ['type'],
    },
  ],
  invalid: [
    {
      code: noFormat`type T = { x: number; };`,
      errors: [
        {
          column: 6,
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'interfaceOverType',
        },
      ],
      options: ['interface'],
      output: `interface T { x: number; }`,
    },
    {
      code: noFormat`type T={ x: number; };`,
      errors: [
        {
          column: 6,
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'interfaceOverType',
        },
      ],
      options: ['interface'],
      output: `interface T { x: number; }`,
    },
    {
      code: noFormat`type T=                         { x: number; };`,
      errors: [
        {
          column: 6,
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'interfaceOverType',
        },
      ],
      options: ['interface'],
      output: `interface T { x: number; }`,
    },
    {
      code: noFormat`type T /* comment */={ x: number; };`,
      errors: [
        {
          column: 6,
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'interfaceOverType',
        },
      ],
      options: ['interface'],
      output: `interface T /* comment */ { x: number; }`,
    },
    {
      code: `
export type W<T> = {
  x: T;
};
      `,
      errors: [
        {
          column: 13,
          endColumn: 14,
          endLine: 2,
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      options: ['interface'],
      output: `
export interface W<T> {
  x: T;
}
      `,
    },
    {
      code: noFormat`interface T { x: number; }`,
      errors: [
        {
          column: 11,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `type T = { x: number; }`,
    },
    {
      code: noFormat`interface T{ x: number; }`,
      errors: [
        {
          column: 11,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `type T = { x: number; }`,
    },
    {
      code: noFormat`interface T                          { x: number; }`,
      errors: [
        {
          column: 11,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `type T = { x: number; }`,
    },
    {
      code: noFormat`interface A extends B, C { x: number; };`,
      errors: [
        {
          column: 11,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `type A = { x: number; } & B & C;`,
    },
    {
      code: noFormat`interface A extends B<T1>, C<T2> { x: number; };`,
      errors: [
        {
          column: 11,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `type A = { x: number; } & B<T1> & C<T2>;`,
    },
    {
      code: `
export interface W<T> {
  x: T;
}
      `,
      errors: [
        {
          column: 18,
          endColumn: 19,
          endLine: 2,
          line: 2,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
export type W<T> = {
  x: T;
}
      `,
    },
    {
      code: `
namespace JSX {
  interface Array<T> {
    foo(x: (x: number) => T): T[];
  }
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
namespace JSX {
  type Array<T> = {
    foo(x: (x: number) => T): T[];
  }
}
      `,
    },
    {
      code: `
global {
  interface Array<T> {
    foo(x: (x: number) => T): T[];
  }
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
global {
  type Array<T> = {
    foo(x: (x: number) => T): T[];
  }
}
      `,
            },
          ],
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
declare module 'foo' {
  global {
    interface Window {
      foo: string;
    }
  }
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 21,
          endLine: 4,
          line: 4,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
declare module 'foo' {
  global {
    type Window = {
      foo: string;
    }
  }
}
      `,
            },
          ],
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
declare global {
  interface Array<T> {
    foo(x: (x: number) => T): T[];
  }
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
declare global {
  type Array<T> = {
    foo(x: (x: number) => T): T[];
  }
}
      `,
            },
          ],
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
declare global {
  namespace Foo {
    interface Bar {}
  }
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
declare global {
  namespace Foo {
    type Bar = {}
  }
}
      `,
            },
          ],
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
export {};
declare global {
  interface Window {
    foo: string;
  }
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 19,
          endLine: 4,
          line: 4,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
export {};
declare global {
  type Window = {
    foo: string;
  }
}
      `,
            },
          ],
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
declare module 'foo' {
  interface Foo {
    bar: string;
  }
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
declare module 'foo' {
  type Foo = {
    bar: string;
  }
}
      `,
            },
          ],
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
declare module 'foo' {
  export interface Foo extends Bar {
    baz: string;
  }
}
      `,
      errors: [
        {
          column: 20,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
declare module 'foo' {
  export type Foo = {
    baz: string;
  } & Bar
}
      `,
            },
          ],
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
declare module 'foo' {
  export default interface Foo {
    bar: string;
  }
}
      `,
      errors: [
        {
          column: 28,
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
declare module 'foo' {
  type Foo = {
    bar: string;
  }
export default Foo
}
      `,
            },
          ],
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
declare namespace Space {
  interface Foo {
    bar: string;
  }
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
declare namespace Space {
  type Foo = {
    bar: string;
  }
}
      `,
            },
          ],
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
namespace Space {
  export interface Foo {
    bar: string;
  }
}
      `,
      errors: [
        {
          column: 20,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
namespace Space {
  export type Foo = {
    bar: string;
  }
}
      `,
            },
          ],
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
namespace Outer.Inner {
  export interface Foo {
    bar: string;
  }
}
      `,
      errors: [
        {
          column: 20,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
namespace Outer.Inner {
  export type Foo = {
    bar: string;
  }
}
      `,
            },
          ],
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
interface Foo {
  bar: string;
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 2,
          line: 2,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
type Foo = {
  bar: string;
}
      `,
            },
          ],
        },
      ],
      filename: 'test.d.ts',
      options: ['type'],
      output: null,
    },
    {
      code: `
export interface Foo {
  bar: string;
}
      `,
      errors: [
        {
          column: 18,
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
export type Foo = {
  bar: string;
}
      `,
            },
          ],
        },
      ],
      filename: 'test.d.ts',
      options: ['type'],
      output: null,
    },
    /* eslint-disable @typescript-eslint/internal/no-multiple-lines-of-errors -- each merged interface is reported */
    {
      code: `
interface Foo {
  bar: string;
}
interface Foo {
  baz: number;
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 2,
          line: 2,
          messageId: 'typeOverInterface',
        },
        {
          column: 11,
          endColumn: 14,
          endLine: 5,
          line: 5,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
export {};
declare global {
  interface Foo {
    bar: string;
  }
  interface Foo {
    baz: number;
  }
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'typeOverInterface',
        },
        {
          column: 13,
          endColumn: 16,
          endLine: 7,
          line: 7,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: null,
    },
    /* eslint-enable @typescript-eslint/internal/no-multiple-lines-of-errors */
    {
      code: `
interface Foo<T> {
  bar: T;
}
class Foo<T> {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 2,
          line: 2,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
declare class Foo {}
export interface Foo {
  bar: string;
}
      `,
      errors: [
        {
          column: 18,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
namespace Foo {
  export const value = 1;
}
interface Foo {
  bar: string;
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 5,
          line: 5,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
namespace Foo {
  export const value = 1;
}
type Foo = {
  bar: string;
}
      `,
    },
    {
      code: `
function Foo() {}
interface Foo {
  bar: string;
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
function Foo() {}
type Foo = {
  bar: string;
}
      `,
    },
    {
      code: `
class Foo {}
function f() {
  interface Foo {
    bar: string;
  }
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
class Foo {}
function f() {
  type Foo = {
    bar: string;
  }
}
      `,
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/3894
      code: `
export default interface Test {
  bar(): string;
  foo(): number;
}
      `,
      errors: [
        {
          column: 26,
          endColumn: 30,
          endLine: 2,
          line: 2,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
type Test = {
  bar(): string;
  foo(): number;
}
export default Test
      `,
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/4333
      code: `
export declare type Test = {
  foo: string;
  bar: string;
};
      `,
      errors: [
        {
          column: 21,
          endColumn: 25,
          endLine: 2,
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      options: ['interface'],
      output: `
export declare interface Test {
  foo: string;
  bar: string;
}
      `,
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/4333
      code: `
export declare interface Test {
  foo: string;
  bar: string;
}
      `,
      errors: [
        {
          column: 26,
          endColumn: 30,
          endLine: 2,
          line: 2,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
export declare type Test = {
  foo: string;
  bar: string;
}
      `,
    },
    {
      code: noFormat`
type Foo = ({
  a: string;
});
      `,
      errors: [
        {
          column: 6,
          endColumn: 9,
          endLine: 2,
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      output: `
interface Foo {
  a: string;
}
      `,
    },
    {
      code: noFormat`
type Foo = ((((((((({
  a: string;
})))))))));
      `,
      errors: [
        {
          column: 6,
          endColumn: 9,
          endLine: 2,
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      output: `
interface Foo {
  a: string;
}
      `,
    },
    {
      // no closing semicolon
      code: noFormat`
type Foo = {
  a: string;
}
      `,
      errors: [
        {
          column: 6,
          endColumn: 9,
          endLine: 2,
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      output: `
interface Foo {
  a: string;
}
      `,
    },
    {
      // no closing semicolon; ensure we don't erase subsequent code.
      code: noFormat`
type Foo = {
  a: string;
}
type Bar = string;
      `,
      errors: [
        {
          column: 6,
          endColumn: 9,
          endLine: 2,
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      output: `
interface Foo {
  a: string;
}
type Bar = string;
      `,
    },
    {
      // no closing semicolon; ensure we don't erase subsequent code.
      code: noFormat`
type Foo = ((({
  a: string;
})))

const bar = 1;
      `,
      errors: [
        {
          column: 6,
          endColumn: 9,
          endLine: 2,
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      output: `
interface Foo {
  a: string;
}

const bar = 1;
      `,
    },
    // In a file without imports or exports, a top-level interface named after
    // a lib type augments that global type, which a type alias can't do.
    {
      code: `
interface Array<T> {
  bar: T;
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 16,
          endLine: 2,
          line: 2,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
type Array<T> = {
  bar: T;
}
      `,
            },
          ],
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
interface Window {
  foo: string;
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 17,
          endLine: 2,
          line: 2,
          messageId: 'typeOverInterface',
          suggestions: [
            {
              messageId: 'replaceWithType',
              output: `
type Window = {
  foo: string;
}
      `,
            },
          ],
        },
      ],
      languageOptions: { parserOptions: { lib: ['esnext', 'dom'] } },
      options: ['type'],
      output: null,
    },
    {
      // in a module, the interface is local and doesn't merge with the global
      code: `
export {};
interface Array<T> {
  bar: T;
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
export {};
type Array<T> = {
  bar: T;
}
      `,
    },
    {
      // only a top-level interface is global
      code: `
namespace Foo {
  interface Array<T> {
    bar: T;
  }
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
namespace Foo {
  type Array<T> = {
    bar: T;
  }
}
      `,
    },
  ],
});
