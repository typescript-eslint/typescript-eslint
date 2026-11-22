import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/consistent-indexed-object-style';

const ruleTester = new RuleTester();

ruleTester.run('consistent-indexed-object-style', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    // 'record' (default)
    // Record
    'type Foo = Record<string, any>;',

    // Interface
    'interface Foo {}',
    `
interface Foo {
  bar: string;
}
    `,
    `
interface Foo {
  bar: string;
  [key: string]: any;
}
    `,
    `
interface Foo {
  [key: string]: any;
  bar: string;
}
    `,
    // circular
    'type Foo = { [key: string]: string | Foo };',
    'type Foo = { [key: string]: Foo };',
    'type Foo = { [key: string]: Foo } | Foo;',
    'type Foo = { [key in string]: Foo };',
    `
interface Foo {
  [key: string]: Foo;
}
    `,
    `
interface Foo<T> {
  [key: string]: Foo<T>;
}
    `,
    `
interface Foo<T> {
  [key: string]: Foo<T> | string;
}
    `,
    `
interface Foo {
  [s: string]: Foo & {};
}
    `,
    `
interface Foo {
  [s: string]: Foo | string;
}
    `,
    `
interface Foo<T> {
  [s: string]: Foo extends T ? string : number;
}
    `,
    `
interface Foo<T> {
  [s: string]: T extends Foo ? string : number;
}
    `,
    `
interface Foo<T> {
  [s: string]: T extends true ? Foo : number;
}
    `,
    `
interface Foo<T> {
  [s: string]: T extends true ? string : Foo;
}
    `,
    `
interface Foo {
  [s: string]: Foo[number];
}
    `,
    `
interface Foo {
  [s: string]: {}[Foo];
}
    `,

    // circular (indirect)
    `
interface Foo1 {
  [key: string]: Foo2;
}

interface Foo2 {
  [key: string]: Foo1;
}
    `,
    `
interface Foo1 {
  [key: string]: Foo2;
}

interface Foo2 {
  [key: string]: Foo3;
}

interface Foo3 {
  [key: string]: Foo1;
}
    `,
    `
interface Foo1 {
  [key: string]: Foo2;
}

interface Foo2 {
  [key: string]: Foo3;
}

interface Foo3 {
  [key: string]: Record<string, Foo1>;
}
    `,
    `
type Foo1 = {
  [key: string]: Foo2;
};

type Foo2 = {
  [key: string]: Foo3;
};

type Foo3 = {
  [key: string]: Foo1;
};
    `,
    `
interface Foo1 {
  [key: string]: Foo2;
}

type Foo2 = {
  [key: string]: Foo3;
};

interface Foo3 {
  [key: string]: Foo1;
}
    `,
    `
type Foo1 = {
  [key: string]: Foo2;
};

interface Foo2 {
  [key: string]: Foo3;
}

interface Foo3 {
  [key: string]: Foo1;
}
    `,
    `
type ExampleUnion = boolean | number;

type ExampleRoot = ExampleUnion | ExampleObject;

interface ExampleObject {
  [key: string]: ExampleRoot;
}
    `,
    `
type Bar<K extends string = never> = {
  [k in K]: Bar;
};
    `,
    `
type Bar<K extends string = never> = {
  [k in K]: Foo;
};

type Foo = Bar;
    `,

    // Type literal
    'type Foo = {};',
    `
type Foo = {
  bar: string;
  [key: string]: any;
};
    `,
    `
type Foo = {
  bar: string;
};
    `,
    `
type Foo = {
  [key: string]: any;
  bar: string;
};
    `,

    // Generic
    `
type Foo = Generic<{
  [key: string]: any;
  bar: string;
}>;
    `,

    // Function types
    'function foo(arg: { [key: string]: any; bar: string }) {}',
    'function foo(): { [key: string]: any; bar: string } {}',

    // Invalid syntax allowed by the parser
    'type Foo = { [key: string] };',
    'type Foo = { [] };',
    `
interface Foo {
  [key: string];
}
    `,
    `
interface Foo {
  [];
}
    `,

    // 'index-signature'
    // Unhandled type
    {
      code: 'type Foo = Misc<string, unknown>;',
      options: ['index-signature'],
    },

    // Invalid record
    {
      code: 'type Foo = Record;',
      options: ['index-signature'],
    },
    {
      code: 'type Foo = Record<string>;',
      options: ['index-signature'],
    },
    {
      code: 'type Foo = Record<string, number, unknown>;',
      options: ['index-signature'],
    },

    // Type literal
    {
      code: 'type Foo = { [key: string]: any };',
      options: ['index-signature'],
    },

    // Generic
    {
      code: 'type Foo = Generic<{ [key: string]: any }>;',
      options: ['index-signature'],
    },

    // Function types
    {
      code: 'function foo(arg: { [key: string]: any }) {}',
      options: ['index-signature'],
    },
    {
      code: 'function foo(): { [key: string]: any } {}',
      options: ['index-signature'],
    },

    // Namespace
    {
      code: 'type T = A.B;',
      options: ['index-signature'],
    },
    {
      code: `
import { Record } from 'immutable';
type Foo = Record<string, number>;
      `,
      options: ['index-signature'],
    },
    {
      code: `
type Record<K, V> = Map<K, V>;
type Foo = Record<string, number>;
      `,
      options: ['index-signature'],
    },
    {
      code: `
export {};
type Record<K, V> = Map<K, V>;
namespace N {
  namespace Record {}
  type Foo = Record<string, number>;
}
      `,
      options: ['index-signature'],
    },
    {
      code: `
class Record<K, V> {}
type Foo = Record<string, number>;
      `,
      options: ['index-signature'],
    },
    {
      code: `
interface Record<K, V> {
  key: K;
  value: V;
}
type Foo = Record<string, number>;
      `,
      options: ['index-signature'],
    },
    {
      // the module may be a type (`export =`), so a namespace import hides
      // the global
      code: `
import * as Record from './foo';
type Foo = Record<string, number>;
      `,
      options: ['index-signature'],
    },
    {
      code: `
import type * as Record from './foo';
type Foo = Record<string, number>;
      `,
      options: ['index-signature'],
    },
    "type Foo = { [K in 'a' | 'b' as 'c']: number };",
    // an `infer` type parameter hides the global in the true branch
    {
      code: 'type Foo<T> = T extends [infer Record] ? Record<string, number> : 1;',
      options: ['index-signature'],
    },
    {
      code: `
type Foo<T> = T extends [infer Record]
  ? T extends 1
    ? 1
    : Record<string, number>
  : 1;
      `,
      options: ['index-signature'],
    },
    // an `infer` type parameter hides the global in its own constraint
    {
      code: 'type T<U> = U extends [infer Record extends Record<string, 1>] ? 1 : 0;',
      options: ['index-signature'],
    },

    {
      // mapped type that uses the key cannot be converted to record
      code: 'type T = { [key in Foo]: key | number };',
    },
    {
      code: `
function foo(e: { readonly [key in PropertyKey]-?: key }) {}
      `,
    },

    {
      // `in keyof` mapped types are not convertible to Record.
      code: `
function f(): {
  // intentionally not using a Record to preserve optionals
  [k in keyof ParseResult]: unknown;
} {
  return {};
}
      `,
    },
  ],
  invalid: [
    // Interface
    {
      code: `
interface Foo {
  [key: string]: any;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo = Record<string, any>;
      `,
    },

    // Readonly interface
    {
      code: `
interface Foo {
  readonly [key: string]: any;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo = Readonly<Record<string, any>>;
      `,
    },

    // Interface with generic parameter
    {
      code: `
interface Foo<A> {
  [key: string]: A;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo<A> = Record<string, A>;
      `,
    },

    // Interface with generic parameter and default value
    {
      code: `
interface Foo<A = any> {
  [key: string]: A;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo<A = any> = Record<string, A>;
      `,
    },

    // Interface with extends
    {
      code: `
interface B extends A {
  [index: number]: unknown;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },

    // export default interface - no fixer since `export default type` is invalid
    {
      code: `
export default interface Foo {
  [key: string]: unknown;
}
      `,
      errors: [
        {
          column: 16,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
interface Foo {
  [key: string]: unknown;
}
interface Foo {
  bar: string;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
interface Foo<Foo> {
  [key: string]: number;
}
interface Foo<Foo> {
  bar: number;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
interface Foo {
  [key: string]: number;
}
const Foo = 1;
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo = Record<string, number>;
const Foo = 1;
      `,
    },
    {
      code: `
function Foo() {}
interface Foo {
  [key: string]: number;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: `
function Foo() {}
type Foo = Record<string, number>;
      `,
    },
    {
      code: `
namespace Foo {
  export const value = 1;
}
interface Foo {
  [key: string]: number;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 7,
          line: 5,
          messageId: 'preferRecord',
        },
      ],
      output: `
namespace Foo {
  export const value = 1;
}
type Foo = Record<string, number>;
      `,
    },
    {
      code: `
interface Foo {
  [key: string]: number;
}
declare class Foo {}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
declare global {
  interface Foo {
    [key: string]: unknown;
  }
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 4,
          endLine: 5,
          line: 3,
          messageId: 'preferRecord',
          suggestions: [
            {
              messageId: 'preferRecordSuggestion',
              output: `
declare global {
  type Foo = Record<string, unknown>;
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare global {
  namespace NodeJS {
    interface Dict {
      [key: string]: unknown;
    }
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 6,
          endLine: 6,
          line: 4,
          messageId: 'preferRecord',
          suggestions: [
            {
              messageId: 'preferRecordSuggestion',
              output: `
declare global {
  namespace NodeJS {
    type Dict = Record<string, unknown>;
  }
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare module 'foo' {
  interface Foo {
    [key: string]: unknown;
  }
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 4,
          endLine: 5,
          line: 3,
          messageId: 'preferRecord',
          suggestions: [
            {
              messageId: 'preferRecordSuggestion',
              output: `
declare module 'foo' {
  type Foo = Record<string, unknown>;
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare module 'foo' {
  export interface Foo {
    [key: string]: unknown;
  }
}
      `,
      errors: [
        {
          column: 10,
          endColumn: 4,
          endLine: 5,
          line: 3,
          messageId: 'preferRecord',
          suggestions: [
            {
              messageId: 'preferRecordSuggestion',
              output: `
declare module 'foo' {
  export type Foo = Record<string, unknown>;
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare namespace Bar {
  interface Foo {
    [key: string]: unknown;
  }
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 4,
          endLine: 5,
          line: 3,
          messageId: 'preferRecord',
          suggestions: [
            {
              messageId: 'preferRecordSuggestion',
              output: `
declare namespace Bar {
  type Foo = Record<string, unknown>;
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
namespace Bar {
  export interface Foo {
    [key: string]: unknown;
  }
}
namespace Bar {
  export interface Foo {
    other: unknown;
  }
}
      `,
      errors: [
        {
          column: 10,
          endColumn: 4,
          endLine: 5,
          line: 3,
          messageId: 'preferRecord',
          suggestions: [
            {
              messageId: 'preferRecordSuggestion',
              output: `
namespace Bar {
  export type Foo = Record<string, unknown>;
}
namespace Bar {
  export interface Foo {
    other: unknown;
  }
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
namespace Bar {
  interface Foo {
    [key: string]: unknown;
  }
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 4,
          endLine: 5,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: `
namespace Bar {
  type Foo = Record<string, unknown>;
}
      `,
    },
    {
      code: `
interface Foo {
  [key: string]: unknown;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
          suggestions: [
            {
              messageId: 'preferRecordSuggestion',
              output: `
type Foo = Record<string, unknown>;
      `,
            },
          ],
        },
      ],
      filename: 'test.d.ts',
      output: null,
    },
    // Readonly interface with generic parameter
    {
      code: `
interface Foo<A> {
  readonly [key: string]: A;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo<A> = Readonly<Record<string, A>>;
      `,
    },

    // Interface with multiple generic parameters
    {
      code: `
interface Foo<A, B> {
  [key: A]: B;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo<A, B> = Record<A, B>;
      `,
    },

    // Readonly interface with multiple generic parameters
    {
      code: `
interface Foo<A, B> {
  readonly [key: A]: B;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo<A, B> = Readonly<Record<A, B>>;
      `,
    },

    // Type literal
    {
      code: 'type Foo = { [key: string]: any };',
      errors: [
        {
          column: 12,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: 'type Foo = Record<string, any>;',
    },

    // Readonly type literal
    {
      code: 'type Foo = { readonly [key: string]: any };',
      errors: [
        {
          column: 12,
          endColumn: 43,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: 'type Foo = Readonly<Record<string, any>>;',
    },

    // Generic
    {
      code: 'type Foo = Generic<{ [key: string]: any }>;',
      errors: [
        {
          column: 20,
          endColumn: 42,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: 'type Foo = Generic<Record<string, any>>;',
    },

    // Readonly Generic
    {
      code: 'type Foo = Generic<{ readonly [key: string]: any }>;',
      errors: [
        {
          column: 20,
          endColumn: 51,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: 'type Foo = Generic<Readonly<Record<string, any>>>;',
    },

    // Function types
    {
      code: 'function foo(arg: { [key: string]: any }) {}',
      errors: [
        {
          column: 19,
          endColumn: 41,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: 'function foo(arg: Record<string, any>) {}',
    },
    {
      code: 'function foo(): { [key: string]: any } {}',
      errors: [
        {
          column: 17,
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: 'function foo(): Record<string, any> {}',
    },

    // Readonly function types
    {
      code: 'function foo(arg: { readonly [key: string]: any }) {}',
      errors: [
        {
          column: 19,
          endColumn: 50,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: 'function foo(arg: Readonly<Record<string, any>>) {}',
    },
    {
      code: 'function foo(): { readonly [key: string]: any } {}',
      errors: [
        {
          column: 17,
          endColumn: 48,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: 'function foo(): Readonly<Record<string, any>> {}',
    },

    // Never
    // Type literal
    {
      code: 'type Foo = Record<string, any>;',
      errors: [
        {
          column: 12,
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'preferIndexSignature',
        },
      ],
      options: ['index-signature'],
      output: 'type Foo = { [key: string]: any };',
    },
    {
      code: `
const Record = 1;
type Foo = Record<string, any>;
      `,
      errors: [
        {
          column: 12,
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'preferIndexSignature',
        },
      ],
      options: ['index-signature'],
      output: `
const Record = 1;
type Foo = { [key: string]: any };
      `,
    },
    {
      code: `
namespace Record {
  export const value = 1;
}
type Foo = Record<string, any>;
      `,
      errors: [
        {
          column: 12,
          endColumn: 31,
          endLine: 5,
          line: 5,
          messageId: 'preferIndexSignature',
        },
      ],
      options: ['index-signature'],
      output: `
namespace Record {
  export const value = 1;
}
type Foo = { [key: string]: any };
      `,
    },
    {
      code: `
const Record = 1;
type Foo = Record<string, any>;
      `,
      errors: [
        {
          column: 12,
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'preferIndexSignature',
        },
      ],
      languageOptions: { parserOptions: { sourceType: 'script' } },
      options: ['index-signature'],
      output: `
const Record = 1;
type Foo = { [key: string]: any };
      `,
    },

    // Type literal with generic parameter
    {
      code: 'type Foo<T> = Record<string, T>;',
      errors: [
        {
          column: 15,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'preferIndexSignature',
        },
      ],
      options: ['index-signature'],
      output: 'type Foo<T> = { [key: string]: T };',
    },

    // Circular
    {
      code: 'type Foo = { [k: string]: A.Foo };',
      errors: [
        {
          column: 12,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: 'type Foo = Record<string, A.Foo>;',
    },
    {
      code: 'type Foo = { [key: string]: AnotherFoo };',
      errors: [
        {
          column: 12,
          endColumn: 41,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: 'type Foo = Record<string, AnotherFoo>;',
    },
    {
      code: 'type Foo = { [key: string]: { [key: string]: Foo } };',
      errors: [
        {
          column: 29,
          endColumn: 51,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: 'type Foo = { [key: string]: Record<string, Foo> };',
    },
    {
      code: 'type Foo = { [key: string]: string } | Foo;',
      errors: [
        {
          column: 12,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: 'type Foo = Record<string, string> | Foo;',
    },
    {
      code: `
interface Foo<T> {
  [k: string]: T;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo<T> = Record<string, T>;
      `,
    },
    {
      code: `
interface Foo {
  [k: string]: A.Foo;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo = Record<string, A.Foo>;
      `,
    },
    {
      code: `
interface Foo {
  [k: string]: { [key: string]: Foo };
}
      `,
      errors: [
        {
          column: 16,
          endColumn: 38,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: `
interface Foo {
  [k: string]: Record<string, Foo>;
}
      `,
    },
    {
      code: `
interface Foo {
  [key: string]: { foo: Foo };
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo = Record<string, { foo: Foo }>;
      `,
    },
    {
      code: `
interface Foo {
  [key: string]: Foo[];
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo = Record<string, Foo[]>;
      `,
    },
    {
      code: `
interface Foo {
  [key: string]: () => Foo;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo = Record<string, () => Foo>;
      `,
    },
    {
      code: `
interface Foo {
  [s: string]: [Foo];
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo = Record<string, [Foo]>;
      `,
    },

    // Circular (indirect)
    {
      code: `
interface Foo1 {
  [key: string]: Foo2;
}

interface Foo2 {
  [key: string]: Foo3;
}

interface Foo3 {
  [key: string]: Foo2;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo1 = Record<string, Foo2>;

interface Foo2 {
  [key: string]: Foo3;
}

interface Foo3 {
  [key: string]: Foo2;
}
      `,
    },
    {
      code: `
interface Foo1 {
  [key: string]: Record<string, Foo2>;
}

interface Foo2 {
  [key: string]: Foo3;
}

interface Foo3 {
  [key: string]: Foo2;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo1 = Record<string, Record<string, Foo2>>;

interface Foo2 {
  [key: string]: Foo3;
}

interface Foo3 {
  [key: string]: Foo2;
}
      `,
    },
    {
      code: `
type Foo1 = {
  [key: string]: { foo2: Foo2 };
};

type Foo2 = Record<string, Foo3>;

type Foo3 = Record<string, Record<string, Foo1>>;
      `,
      errors: [
        {
          column: 13,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo1 = Record<string, { foo2: Foo2 }>;

type Foo2 = Record<string, Foo3>;

type Foo3 = Record<string, Record<string, Foo1>>;
      `,
    },
    {
      code: `
type Foo1 = Record<string, { foo2: Foo2 }>;

type Foo2 = {
  [key: string]: Foo3;
};

type Foo3 = Record<string, Record<string, Foo1>>;
      `,
      errors: [
        {
          column: 13,
          endColumn: 2,
          endLine: 6,
          line: 4,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo1 = Record<string, { foo2: Foo2 }>;

type Foo2 = Record<string, Foo3>;

type Foo3 = Record<string, Record<string, Foo1>>;
      `,
    },
    {
      code: `
type Foo1 = Record<string, { foo2: Foo2 }>;

type Foo2 = Record<string, Foo3>;

type Foo3 = {
  [key: string]: Record<string, Foo1>;
};
      `,
      errors: [
        {
          column: 13,
          endColumn: 2,
          endLine: 8,
          line: 6,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo1 = Record<string, { foo2: Foo2 }>;

type Foo2 = Record<string, Foo3>;

type Foo3 = Record<string, Record<string, Foo1>>;
      `,
    },
    {
      code: `
type Foos<K extends string = never> = {
  [k in K]: { foo: Foo };
};

type Foo = Foos;
      `,
      errors: [
        {
          column: 39,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foos<K extends string = never> = Record<K, { foo: Foo }>;

type Foo = Foos;
      `,
    },
    {
      code: `
type Foos<K extends string = never> = {
  [k in K]: Foo[];
};

type Foo = Foos;
      `,
      errors: [
        {
          column: 39,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foos<K extends string = never> = Record<K, Foo[]>;

type Foo = Foos;
      `,
    },

    // Generic
    {
      code: 'type Foo = Generic<Record<string, any>>;',
      errors: [
        {
          column: 20,
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'preferIndexSignature',
        },
      ],
      options: ['index-signature'],
      output: 'type Foo = Generic<{ [key: string]: any }>;',
    },

    // Record with an index node that may potentially break index-signature style
    {
      code: 'type Foo = Record<string | number, any>;',
      errors: [
        {
          column: 12,
          endColumn: 40,
          endLine: 1,
          line: 1,
          messageId: 'preferIndexSignature',
          suggestions: [
            {
              messageId: 'preferIndexSignatureSuggestion',
              output: 'type Foo = { [key: string | number]: any };',
            },
          ],
        },
      ],
      options: ['index-signature'],
    },
    {
      code: "type Foo = Record<Exclude<'a' | 'b' | 'c', 'a'>, any>;",
      errors: [
        {
          column: 12,
          endColumn: 54,
          endLine: 1,
          line: 1,
          messageId: 'preferIndexSignature',
          suggestions: [
            {
              messageId: 'preferIndexSignatureSuggestion',
              output:
                "type Foo = { [key: Exclude<'a' | 'b' | 'c', 'a'>]: any };",
            },
          ],
        },
      ],
      options: ['index-signature'],
    },

    // Record with valid index node should use an auto-fix
    {
      code: 'type Foo = Record<number, any>;',
      errors: [
        {
          column: 12,
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'preferIndexSignature',
        },
      ],
      options: ['index-signature'],
      output: 'type Foo = { [key: number]: any };',
    },
    {
      code: 'type Foo = Record<symbol, any>;',
      errors: [
        {
          column: 12,
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'preferIndexSignature',
        },
      ],
      options: ['index-signature'],
      output: 'type Foo = { [key: symbol]: any };',
    },

    // Function types
    {
      code: 'function foo(arg: Record<string, any>) {}',
      errors: [
        {
          column: 19,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferIndexSignature',
        },
      ],
      options: ['index-signature'],
      output: 'function foo(arg: { [key: string]: any }) {}',
    },
    {
      code: 'function foo(): Record<string, any> {}',
      errors: [
        {
          column: 17,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'preferIndexSignature',
        },
      ],
      options: ['index-signature'],
      output: 'function foo(): { [key: string]: any } {}',
    },
    {
      code: 'type T = { readonly [key in string]: number };',
      errors: [
        {
          column: 10,
          endColumn: 46,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: `type T = Readonly<Record<string, number>>;`,
    },
    {
      code: 'type T = { +readonly [key in string]: number };',
      errors: [
        {
          column: 10,
          endColumn: 47,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: `type T = Readonly<Record<string, number>>;`,
    },
    {
      // There is no fix, since there isn't a builtin Mutable<T> :(
      code: 'type T = { -readonly [key in string]: number };',
      errors: [
        {
          column: 10,
          endColumn: 47,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
    },
    {
      code: 'type T = { [key in string]: number };',
      errors: [
        {
          column: 10,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: `type T = Record<string, number>;`,
    },
    {
      code: `
function foo(e: { [key in PropertyKey]?: string }) {}
      `,
      errors: [
        {
          column: 17,
          endColumn: 50,
          endLine: 2,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
function foo(e: Partial<Record<PropertyKey, string>>) {}
      `,
    },
    {
      code: `
function foo(e: { [key in PropertyKey]+?: string }) {}
      `,
      errors: [
        {
          column: 17,
          endColumn: 51,
          endLine: 2,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
function foo(e: Partial<Record<PropertyKey, string>>) {}
      `,
    },
    {
      code: `
function foo(e: { [key in PropertyKey]-?: string }) {}
      `,
      errors: [
        {
          column: 17,
          endColumn: 51,
          endLine: 2,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
function foo(e: Required<Record<PropertyKey, string>>) {}
      `,
    },
    {
      code: `
function foo(e: { readonly [key in PropertyKey]-?: string }) {}
      `,
      errors: [
        {
          column: 17,
          endColumn: 60,
          endLine: 2,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
function foo(e: Readonly<Required<Record<PropertyKey, string>>>) {}
      `,
    },
    {
      code: `
type Options = [
  { [Type in (typeof optionTesters)[number]['option']]?: boolean } & {
    allow?: TypeOrValueSpecifier[];
  },
];
      `,
      errors: [
        {
          column: 3,
          endColumn: 67,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Options = [
  Partial<Record<(typeof optionTesters)[number]['option'], boolean>> & {
    allow?: TypeOrValueSpecifier[];
  },
];
      `,
    },
    {
      code: `
export type MakeRequired<Base, Key extends keyof Base> = {
  [K in Key]-?: NonNullable<Base[Key]>;
} & Omit<Base, Key>;
      `,
      errors: [
        {
          column: 58,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
export type MakeRequired<Base, Key extends keyof Base> = Required<Record<Key, NonNullable<Base[Key]>>> & Omit<Base, Key>;
      `,
    },
    {
      // in parenthesized expression is convertible to Record
      code: noFormat`
function f(): {
  [k in (keyof ParseResult)]: unknown;
} {
  return {};
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
function f(): Record<keyof ParseResult, unknown> {
  return {};
}
      `,
    },

    // missing index signature type annotation while checking for a recursive type
    {
      code: `
interface Foo {
  [key: string]: Bar;
}

interface Bar {
  [key: string];
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo = Record<string, Bar>;

interface Bar {
  [key: string];
}
      `,
    },

    {
      code: `
type Foo = {
  [k in string];
};
      `,
      errors: [
        {
          column: 12,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo = Record<string, any>;
      `,
    },

    // A comment outside the sub-nodes the fixer keeps would be dropped, so the
    // reshape is offered as an opt-in suggestion rather than an autofix.
    {
      code: 'type Foo = { [key: string]: /* preserve me */ number };',
      errors: [
        {
          column: 12,
          endColumn: 55,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
          suggestions: [
            {
              messageId: 'preferRecordSuggestion',
              output: 'type Foo = Record<string, number>;',
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
interface Foo {
  // preserve me
  [key: string]: number;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 2,
          messageId: 'preferRecord',
          suggestions: [
            {
              messageId: 'preferRecordSuggestion',
              output: `
type Foo = Record<string, number>;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
type Foo = {
  // preserve me
  [Key in 'a' | 'b']: number;
};
      `,
      errors: [
        {
          column: 12,
          endColumn: 2,
          endLine: 5,
          line: 2,
          messageId: 'preferRecord',
          suggestions: [
            {
              messageId: 'preferRecordSuggestion',
              output: `
type Foo = Record<'a' | 'b', number>;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      // reproduction of https://github.com/typescript-eslint/typescript-eslint/issues/10577
      code: noFormat`
type Test = {
  // 1
  [Key in // 2
    | 'a' // 3
    | 'b' // 4
    | 'c' // 5
    | 'd' // 6
  ]: string; // 7
  // 8
};
      `,
      errors: [
        {
          column: 13,
          endColumn: 2,
          endLine: 11,
          line: 2,
          messageId: 'preferRecord',
          suggestions: [
            {
              messageId: 'preferRecordSuggestion',
              output: `
type Test = Record<| 'a' // 3
    | 'b' // 4
    | 'c' // 5
    | 'd', string>;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      // index-signature mode: a dropped comment makes the reshape a suggestion.
      code: 'type Foo = Record<string, /* preserve me */ number>;',
      errors: [
        {
          column: 12,
          endColumn: 52,
          endLine: 1,
          line: 1,
          messageId: 'preferIndexSignature',
          suggestions: [
            {
              messageId: 'preferIndexSignatureSuggestion',
              output: 'type Foo = { [key: string]: number };',
            },
          ],
        },
      ],
      options: ['index-signature'],
    },

    // record mode: the fix writes `Record<…>`, so it's only offered where
    // `Record` is the global type.
    {
      code: `
type Record<K, V> = Map<K, V>;
interface Foo {
  [key: string]: number;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
type Record<K, V> = Map<K, V>;
type Foo = { [key: string]: number };
      `,
      errors: [
        {
          column: 12,
          endColumn: 37,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
import { Record } from 'immutable';
type Foo = { [key: string]: number };
      `,
      errors: [
        {
          column: 12,
          endColumn: 37,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
interface Foo<Record> {
  [key: string]: Record;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: 'function foo<Record>(arg: { [key: string]: Record }) {}',
      errors: [
        {
          column: 27,
          endColumn: 52,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
interface Record {
  [key: string]: number;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: 'type Record = { [key: string]: number };',
      errors: [
        {
          column: 15,
          endColumn: 40,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
type Record<K, V> = Map<K, V>;
type Foo = { [K in string]: number };
      `,
      errors: [
        {
          column: 12,
          endColumn: 37,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: 'type Foo<Record> = { [K in string]: Record };',
      errors: [
        {
          column: 20,
          endColumn: 45,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      // the mapped type's key is out of scope where the Record is written
      code: 'type Foo = { [Record in string]: number };',
      errors: [
        {
          column: 12,
          endColumn: 42,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: 'type Foo = Record<string, number>;',
    },
    {
      code: `
const Record = 1;
type Foo = { [key: string]: number };
      `,
      errors: [
        {
          column: 12,
          endColumn: 37,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: `
const Record = 1;
type Foo = Record<string, number>;
      `,
    },
    {
      // the module may be a type (`export =`), so a namespace import hides
      // the global
      code: `
import * as Record from './foo';
interface Foo {
  [key: string]: number;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
import type * as Record from './foo';
type Foo = { [key: string]: number };
      `,
      errors: [
        {
          column: 12,
          endColumn: 37,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },

    // record mode: the fix also writes `Readonly<…>`, `Partial<…>` and
    // `Required<…>`, which must be the global types as well.
    {
      code: `
type Readonly<T> = { value: T };
interface Foo {
  readonly [key: string]: number;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
type Readonly<T> = { value: T };
type Foo = { readonly [key: string]: number };
      `,
      errors: [
        {
          column: 12,
          endColumn: 46,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      // a non-readonly index signature doesn't need `Readonly`
      code: `
type Readonly<T> = { value: T };
type Foo = { [key: string]: number };
      `,
      errors: [
        {
          column: 12,
          endColumn: 37,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Readonly<T> = { value: T };
type Foo = Record<string, number>;
      `,
    },
    {
      code: `
type Readonly<T> = { value: T };
type Foo = { readonly [K in string]: number };
      `,
      errors: [
        {
          column: 12,
          endColumn: 46,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
import * as Readonly from './foo';
type Foo = { +readonly [K in string]: number };
      `,
      errors: [
        {
          column: 12,
          endColumn: 47,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
type Partial<T> = { value: T };
type Foo = { [K in string]?: number };
      `,
      errors: [
        {
          column: 12,
          endColumn: 38,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: 'function foo<Partial>(arg: { [K in string]+?: number }) {}',
      errors: [
        {
          column: 28,
          endColumn: 55,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: 'function foo<Required>(arg: { [K in string]-?: number }) {}',
      errors: [
        {
          column: 29,
          endColumn: 56,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      // only the utility types the fix writes need to be the global ones
      code: `
type Partial<T> = { value: T };
type Foo = { [K in string]-?: number };
      `,
      errors: [
        {
          column: 12,
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Partial<T> = { value: T };
type Foo = Required<Record<string, number>>;
      `,
    },
    {
      // a value or a namespace doesn't hide a global type
      code: `
const Partial = 1;
namespace Readonly {}
type Foo = { readonly [K in string]?: number };
      `,
      errors: [
        {
          column: 12,
          endColumn: 47,
          endLine: 4,
          line: 4,
          messageId: 'preferRecord',
        },
      ],
      output: `
const Partial = 1;
namespace Readonly {}
type Foo = Readonly<Partial<Record<string, number>>>;
      `,
    },
    // an `infer` type parameter is only visible in the true branch
    {
      code: 'type Foo<T> = T extends [infer Partial] ? Partial : { [K in string]?: number };',
      errors: [
        {
          column: 53,
          endColumn: 79,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output:
        'type Foo<T> = T extends [infer Partial] ? Partial : Partial<Record<string, number>>;',
    },
    {
      code: `
type Foo<T> = T extends [infer Partial]
  ? 1
  : T extends [infer Readonly]
    ? Readonly
    : { readonly [K in string]?: number };
      `,
      errors: [
        {
          column: 7,
          endColumn: 42,
          endLine: 6,
          line: 6,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Foo<T> = T extends [infer Partial]
  ? 1
  : T extends [infer Readonly]
    ? Readonly
    : Readonly<Partial<Record<string, number>>>;
      `,
    },
    {
      code: 'type Foo<T> = T extends [infer Record] ? 1 : { [k: string]: number };',
      errors: [
        {
          column: 46,
          endColumn: 69,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output:
        'type Foo<T> = T extends [infer Record] ? 1 : Record<string, number>;',
    },
    {
      code: 'type Foo<T> = T extends [infer Partial] ? { [K in string]?: number } : 1;',
      errors: [
        {
          column: 43,
          endColumn: 69,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
type Foo<T> = T extends [infer Record]
  ? T extends 1
    ? 1
    : { [k: string]: number }
  : 1;
      `,
      errors: [
        {
          column: 7,
          endColumn: 30,
          endLine: 5,
          line: 5,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: 'type Foo<T> = T extends [infer Record] ? 1 : Record<string, number>;',
      errors: [
        {
          column: 46,
          endColumn: 68,
          endLine: 1,
          line: 1,
          messageId: 'preferIndexSignature',
        },
      ],
      options: ['index-signature'],
      output:
        'type Foo<T> = T extends [infer Record] ? 1 : { [key: string]: number };',
    },
    {
      code: 'type Foo<T> = T extends [infer Record, Record<string, number>] ? 1 : 0;',
      errors: [
        {
          column: 40,
          endColumn: 62,
          endLine: 1,
          line: 1,
          messageId: 'preferIndexSignature',
        },
      ],
      options: ['index-signature'],
      output:
        'type Foo<T> = T extends [infer Record, { [key: string]: number }] ? 1 : 0;',
    },
    // an `infer` type parameter hides the global in its own constraint
    {
      code: 'type T<U> = U extends [infer Record extends { [k: string]: 1 }] ? 1 : 0;',
      errors: [
        {
          column: 45,
          endColumn: 63,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: 'type T<U> = U extends [infer Record extends { [K in string]: 1 }] ? 1 : 0;',
      errors: [
        {
          column: 45,
          endColumn: 65,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: 'type T<U> = U extends [infer Partial extends { [K in string]?: 1 }] ? 1 : 0;',
      errors: [
        {
          column: 46,
          endColumn: 67,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    {
      code: `
type T<U> = U extends [infer Readonly extends { readonly [K in string]: 1 }]
  ? 1
  : 0;
      `,
      errors: [
        {
          column: 47,
          endColumn: 76,
          endLine: 2,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: null,
    },
    // but not in the constraint of another `infer` type parameter
    {
      code: 'type T = 1 extends [infer V extends { [k: string]: 1 }, infer Record] ? 1 : 0;',
      errors: [
        {
          column: 37,
          endColumn: 55,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output:
        'type T = 1 extends [infer V extends Record<string, 1>, infer Record] ? 1 : 0;',
    },
    {
      code: 'type T = 1 extends [infer Record, infer V extends { [K in string]: 1 }] ? 1 : 0;',
      errors: [
        {
          column: 51,
          endColumn: 71,
          endLine: 1,
          line: 1,
          messageId: 'preferRecord',
        },
      ],
      output:
        'type T = 1 extends [infer Record, infer V extends Record<string, 1>] ? 1 : 0;',
    },
    {
      code: 'type T = 1 extends [infer V extends Record<string, 1>, infer Record] ? 1 : 0;',
      errors: [
        {
          column: 37,
          endColumn: 54,
          endLine: 1,
          line: 1,
          messageId: 'preferIndexSignature',
        },
      ],
      options: ['index-signature'],
      output:
        'type T = 1 extends [infer V extends { [key: string]: 1 }, infer Record] ? 1 : 0;',
    },
  ],
});
