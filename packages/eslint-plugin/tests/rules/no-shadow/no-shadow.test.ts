import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/no-shadow';

const ruleTester = new RuleTester();

ruleTester.run('no-shadow TS tests', rule, {
  invalid: [
    {
      code: `
type T = 1;
{
  type T = 2;
}
      `,
      errors: [
        {
          data: {
            name: 'T',
            shadowedColumn: 6,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
type T = 1;
function foo<T>(arg: T) {}
      `,
      errors: [
        {
          data: {
            name: 'T',
            shadowedColumn: 6,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
function foo<T>() {
  return function <T>() {};
}
      `,
      errors: [
        {
          data: {
            name: 'T',
            shadowedColumn: 14,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
type T = string;
function foo<T extends (arg: any) => void>(arg: T) {}
      `,
      errors: [
        {
          data: {
            name: 'T',
            shadowedColumn: 6,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
const x = 1;
{
  type x = string;
}
      `,
      errors: [
        {
          data: {
            name: 'x',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreTypeValueShadow: false }],
    },
    {
      code: `
type Foo = 1;
      `,
      errors: [
        {
          data: {
            name: 'Foo',
          },
          messageId: 'noShadowGlobal',
        },
      ],
      languageOptions: {
        globals: {
          Foo: 'writable',
        },
      },
      options: [
        {
          builtinGlobals: true,
          ignoreTypeValueShadow: false,
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2447
    {
      code: `
const test = 1;
type Fn = (test: string) => typeof test;
      `,
      errors: [
        {
          data: {
            name: 'test',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreFunctionTypeParameterNameValueShadow: false }],
    },
    {
      code: `
type Fn = (Foo: string) => typeof Foo;
      `,
      errors: [
        {
          data: {
            name: 'Foo',
          },
          messageId: 'noShadowGlobal',
        },
      ],
      languageOptions: {
        globals: {
          Foo: 'writable',
        },
      },
      options: [
        {
          builtinGlobals: true,
          ignoreFunctionTypeParameterNameValueShadow: false,
        },
      ],
    },

    // https://github.com/typescript-eslint/typescript-eslint/issues/6098
    {
      code: `
const arg = 0;

interface Test {
  (arg: string): typeof arg;
}
      `,
      errors: [
        {
          data: {
            name: 'arg',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreFunctionTypeParameterNameValueShadow: false }],
    },
    {
      code: `
const arg = 0;

interface Test {
  p1(arg: string): typeof arg;
}
      `,
      errors: [
        {
          data: {
            name: 'arg',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreFunctionTypeParameterNameValueShadow: false }],
    },
    {
      code: `
const arg = 0;

declare function test(arg: string): typeof arg;
      `,
      errors: [
        {
          data: {
            name: 'arg',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreFunctionTypeParameterNameValueShadow: false }],
    },
    {
      code: `
const arg = 0;

declare const test: (arg: string) => typeof arg;
      `,
      errors: [
        {
          data: {
            name: 'arg',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreFunctionTypeParameterNameValueShadow: false }],
    },
    {
      code: `
const arg = 0;

declare class Test {
  p1(arg: string): typeof arg;
}
      `,
      errors: [
        {
          data: {
            name: 'arg',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreFunctionTypeParameterNameValueShadow: false }],
    },
    {
      code: `
const arg = 0;

declare const Test: {
  new (arg: string): typeof arg;
};
      `,
      errors: [
        {
          data: {
            name: 'arg',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreFunctionTypeParameterNameValueShadow: false }],
    },
    {
      code: `
const arg = 0;

type Bar = new (arg: number) => typeof arg;
      `,
      errors: [
        {
          data: {
            name: 'arg',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreFunctionTypeParameterNameValueShadow: false }],
    },
    {
      code: `
const arg = 0;

declare namespace Lib {
  function test(arg: string): typeof arg;
}
      `,
      errors: [
        {
          data: {
            name: 'arg',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreFunctionTypeParameterNameValueShadow: false }],
    },
    {
      code: `
import type { foo } from './foo';
function doThing(foo: number) {}
      `,
      errors: [
        {
          data: {
            name: 'foo',
            shadowedColumn: 15,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreTypeValueShadow: false }],
    },
    {
      code: `
import { type foo } from './foo';
function doThing(foo: number) {}
      `,
      errors: [
        {
          data: {
            name: 'foo',
            shadowedColumn: 15,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreTypeValueShadow: false }],
    },
    {
      code: `
import { foo } from './foo';
function doThing(foo: number, bar: number) {}
      `,
      errors: [
        {
          data: {
            name: 'foo',
            shadowedColumn: 10,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreTypeValueShadow: true }],
    },
    {
      code: `
interface Foo {}

declare module 'bar' {
  export interface Foo {
    x: string;
  }
}
      `,
      errors: [
        {
          data: {
            name: 'Foo',
            shadowedColumn: 11,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
import type { Foo } from 'bar';

declare module 'baz' {
  export interface Foo {
    x: string;
  }
}
      `,
      errors: [
        {
          data: {
            name: 'Foo',
            shadowedColumn: 15,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
import { type Foo } from 'bar';

declare module 'baz' {
  export interface Foo {
    x: string;
  }
}
      `,
      errors: [
        {
          data: {
            name: 'Foo',
            shadowedColumn: 15,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
let x = foo((x, y) => {});
let y;
      `,
      errors: [
        {
          data: {
            name: 'x',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
        {
          data: {
            name: 'y',
            shadowedColumn: 5,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
let x = foo((x, y) => {});
let y;
      `,
      errors: [
        {
          data: {
            name: 'x',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'functions' }],
    },
    {
      code: `
type Foo<A> = 1;
type A = 1;
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 6,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'types' }],
    },
    {
      code: `
interface Foo<A> {}
type A = 1;
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 6,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'types' }],
    },
    {
      code: `
interface Foo<A> {}
interface A {}
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 11,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'types' }],
    },
    {
      code: `
type Foo<A> = 1;
interface A {}
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 11,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'types' }],
    },
    {
      code: `
{
  type A = 1;
}
type A = 1;
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 6,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'types' }],
    },
    {
      code: `
{
  interface A {}
}
type A = 1;
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 6,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'types' }],
    },

    {
      code: `
type Foo<A> = 1;
type A = 1;
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 6,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'all' }],
    },
    {
      code: `
interface Foo<A> {}
type A = 1;
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 6,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'all' }],
    },
    {
      code: `
interface Foo<A> {}
interface A {}
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 11,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'all' }],
    },
    {
      code: `
type Foo<A> = 1;
interface A {}
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 11,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'all' }],
    },
    {
      code: `
{
  type A = 1;
}
type A = 1;
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 6,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'all' }],
    },
    {
      code: `
{
  interface A {}
}
type A = 1;
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 6,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'all' }],
    },

    {
      code: `
type Foo<A> = 1;
type A = 1;
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 6,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'functions-and-types' }],
    },
    {
      code: `
interface Foo<A> {}
type A = 1;
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 6,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'functions-and-types' }],
    },
    {
      code: `
interface Foo<A> {}
interface A {}
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 11,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'functions-and-types' }],
    },
    {
      code: `
type Foo<A> = 1;
interface A {}
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 11,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'functions-and-types' }],
    },
    {
      code: `
{
  type A = 1;
}
type A = 1;
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 6,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'functions-and-types' }],
    },
    {
      code: `
{
  interface A {}
}
type A = 1;
      `,
      errors: [
        {
          data: {
            name: 'A',
            shadowedColumn: 6,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
        },
      ],
      options: [{ hoist: 'functions-and-types' }],
    },

    {
      code: `
function foo<T extends (...args: any[]) => any>(fn: T, args: any[]) {}
      `,
      errors: [
        {
          data: {
            name: 'args',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          messageId: 'noShadowGlobal',
        },
      ],
      languageOptions: {
        globals: {
          args: 'writable',
        },
      },
      options: [
        {
          builtinGlobals: true,
          ignoreTypeValueShadow: false,
        },
      ],
    },
    {
      code: `
declare const has = (environment: 'dev' | 'prod' | 'test') => boolean;
      `,
      errors: [
        {
          data: {
            name: 'has',
          },
          messageId: 'noShadowGlobal',
        },
      ],
      languageOptions: {
        globals: {
          has: false,
        },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
declare const has: (environment: 'dev' | 'prod' | 'test') => boolean;
const fn = (has: string) => {};
      `,
      errors: [
        {
          data: {
            name: 'has',
            shadowedColumn: 15,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
        },
      ],
      filename: 'foo.d.ts',
      languageOptions: {
        globals: {
          has: false,
        },
      },
      options: [{ builtinGlobals: true }],
    },
  ],
  valid: [
    'function foo<T = (arg: any) => any>(arg: T) {}',
    'function foo<T = ([arg]: [any]) => any>(arg: T) {}',
    'function foo<T = ({ args }: { args: any }) => any>(arg: T) {}',
    'function foo<T = (...args: any[]) => any>(fn: T, args: any[]) {}',
    'function foo<T extends (...args: any[]) => any>(fn: T, args: any[]) {}',
    'function foo<T extends (...args: any[]) => any>(fn: T, ...args: any[]) {}',
    'function foo<T extends ([args]: any[]) => any>(fn: T, args: any[]) {}',
    'function foo<T extends ([...args]: any[]) => any>(fn: T, args: any[]) {}',
    'function foo<T extends ({ args }: { args: any }) => any>(fn: T, args: any) {}',
    `
function foo<T extends (id: string, ...args: any[]) => any>(
  fn: T,
  ...args: any[]
) {}
    `,
    `
type Args = 1;
function foo<T extends (Args: any) => void>(arg: T) {}
    `,
    // nested conditional types
    `
export type ArrayInput<Func> = Func extends (arg0: Array<infer T>) => any
  ? T[]
  : Func extends (...args: infer T) => any
    ? T
    : never;
    `,
    `
function foo() {
  var Object = 0;
}
    `,
    // this params
    `
function test(this: Foo) {
  function test2(this: Bar) {}
}
    `,
    // declaration merging
    `
class Foo {
  prop = 1;
}
namespace Foo {
  export const v = 2;
}
    `,
    `
function Foo() {}
namespace Foo {
  export const v = 2;
}
    `,
    `
class Foo {
  prop = 1;
}
interface Foo {
  prop2: string;
}
    `,
    `
import type { Foo } from 'bar';

declare module 'bar' {
  export interface Foo {
    x: string;
  }
}
    `,
    // type value shadowing
    `
const x = 1;
type x = string;
    `,
    `
const x = 1;
{
  type x = string;
}
    `,
    {
      code: `
type Foo = 1;
      `,
      languageOptions: {
        globals: {
          Foo: 'writable',
        },
      },
      options: [{ ignoreTypeValueShadow: true }],
    },
    {
      code: `
type Foo = 1;
      `,
      languageOptions: {
        globals: {
          Foo: 'writable',
        },
      },
      options: [
        {
          builtinGlobals: false,
          ignoreTypeValueShadow: false,
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2360
    `
enum Direction {
  left = 'left',
  right = 'right',
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2447
    {
      code: `
const test = 1;
type Fn = (test: string) => typeof test;
      `,
      options: [{ ignoreFunctionTypeParameterNameValueShadow: true }],
    },
    {
      code: `
type Fn = (Foo: string) => typeof Foo;
      `,
      languageOptions: {
        globals: {
          Foo: 'writable',
        },
      },
      options: [
        {
          builtinGlobals: false,
          ignoreFunctionTypeParameterNameValueShadow: true,
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/6098
    {
      code: `
const arg = 0;

interface Test {
  (arg: string): typeof arg;
}
      `,
      options: [{ ignoreFunctionTypeParameterNameValueShadow: true }],
    },
    {
      code: `
const arg = 0;

interface Test {
  p1(arg: string): typeof arg;
}
      `,
      options: [{ ignoreFunctionTypeParameterNameValueShadow: true }],
    },
    {
      code: `
const arg = 0;

declare function test(arg: string): typeof arg;
      `,
      options: [{ ignoreFunctionTypeParameterNameValueShadow: true }],
    },
    {
      code: `
const arg = 0;

declare const test: (arg: string) => typeof arg;
      `,
      options: [{ ignoreFunctionTypeParameterNameValueShadow: true }],
    },
    {
      code: `
const arg = 0;

declare class Test {
  p1(arg: string): typeof arg;
}
      `,
      options: [{ ignoreFunctionTypeParameterNameValueShadow: true }],
    },
    {
      code: `
const arg = 0;

declare const Test: {
  new (arg: string): typeof arg;
};
      `,
      options: [{ ignoreFunctionTypeParameterNameValueShadow: true }],
    },
    {
      code: `
const arg = 0;

type Bar = new (arg: number) => typeof arg;
      `,
      options: [{ ignoreFunctionTypeParameterNameValueShadow: true }],
    },
    {
      code: `
const arg = 0;

declare namespace Lib {
  function test(arg: string): typeof arg;
}
      `,
      options: [{ ignoreFunctionTypeParameterNameValueShadow: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2724
    {
      code: `
        declare global {
          interface ArrayConstructor {}
        }
        export {};
      `,
      options: [{ builtinGlobals: true }],
    },
    `
      declare global {
        const a: string;

        namespace Foo {
          const a: number;
        }
      }
      export {};
    `,
    {
      code: `
        declare global {
          type A = 'foo';

          namespace Foo {
            type A = 'bar';
          }
        }
        export {};
      `,
      options: [{ ignoreTypeValueShadow: false }],
    },
    {
      code: `
        declare global {
          const foo: string;
          type Fn = (foo: number) => void;
        }
        export {};
      `,
      options: [{ ignoreFunctionTypeParameterNameValueShadow: false }],
    },
    `
export class Wrapper<Wrapped> {
  private constructor(private readonly wrapped: Wrapped) {}

  unwrap(): Wrapped {
    return this.wrapped;
  }

  static create<Wrapped>(wrapped: Wrapped) {
    return new Wrapper<Wrapped>(wrapped);
  }
}
    `,
    `
function makeA() {
  return class A<T> {
    constructor(public value: T) {}

    static make<T>(value: T) {
      return new A<T>(value);
    }
  };
}
    `,
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/3862
      code: `
import type { foo } from './foo';
type bar = number;

// 'foo' is already declared in the upper scope
// 'bar' is fine
function doThing(foo: number, bar: number) {}
      `,
      options: [{ ignoreTypeValueShadow: true }],
    },
    {
      code: `
import { type foo } from './foo';

// 'foo' is already declared in the upper scope
function doThing(foo: number) {}
      `,
      options: [{ ignoreTypeValueShadow: true }],
    },
    {
      code: 'const a = [].find(a => a);',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: `
const a = [].find(function (a) {
  return a;
});
      `,
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'const [a = [].find(a => true)] = dummy;',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'const { a = [].find(a => true) } = dummy;',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'function func(a = [].find(a => true)) {}',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: `
for (const a in [].find(a => true)) {
}
      `,
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: `
for (const a of [].find(a => true)) {
}
      `,
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: "const a = [].map(a => true).filter(a => a === 'b');",
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: `
const a = []
  .map(a => true)
  .filter(a => a === 'b')
  .find(a => a === 'c');
      `,
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'const { a } = (({ a }) => ({ a }))();',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: `
const person = people.find(item => {
  const person = item.name;
  return person === 'foo';
});
      `,
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'var y = bar || foo(y => y);',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'var y = bar && foo(y => y);',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'var z = bar(foo(z => z));',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'var z = boo(bar(foo(z => z)));',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: `
var match = function (person) {
  return person.name === 'foo';
};
const person = [].find(match);
      `,
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'const a = foo(x || (a => {}));',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'const { a = 1 } = foo(a => {});',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: "const person = { ...people.find(person => person.firstName.startsWith('s')) };",
      languageOptions: { parserOptions: { ecmaVersion: 2021 } },
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: `
const person = {
  firstName: people
    .filter(person => person.firstName.startsWith('s'))
    .map(person => person.firstName)[0],
};
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2021 } },
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: `
() => {
  const y = foo(y => y);
};
      `,
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'const x = (x => x)();',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'var y = bar || (y => y)();',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'var y = bar && (y => y)();',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'var x = (x => x)((y => y)());',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: 'const { a = 1 } = (a => {})();',
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: `
() => {
  const y = (y => y)();
};
      `,
      options: [{ ignoreOnInitialization: true }],
    },
    { code: 'const [x = y => y] = [].map(y => y);' },

    {
      code: `
type Foo<A> = 1;
type A = 1;
      `,
      options: [{ hoist: 'never' }],
    },
    {
      code: `
interface Foo<A> {}
type A = 1;
      `,
      options: [{ hoist: 'never' }],
    },
    {
      code: `
interface Foo<A> {}
interface A {}
      `,
      options: [{ hoist: 'never' }],
    },
    {
      code: `
type Foo<A> = 1;
interface A {}
      `,
      options: [{ hoist: 'never' }],
    },
    {
      code: `
{
  type A = 1;
}
type A = 1;
      `,
      options: [{ hoist: 'never' }],
    },
    {
      code: `
{
  interface Foo<A> {}
}
type A = 1;
      `,
      options: [{ hoist: 'never' }],
    },

    {
      code: `
type Foo<A> = 1;
type A = 1;
      `,
      options: [{ hoist: 'functions' }],
    },
    {
      code: `
interface Foo<A> {}
type A = 1;
      `,
      options: [{ hoist: 'functions' }],
    },
    {
      code: `
interface Foo<A> {}
interface A {}
      `,
      options: [{ hoist: 'functions' }],
    },
    {
      code: `
type Foo<A> = 1;
interface A {}
      `,
      options: [{ hoist: 'functions' }],
    },
    {
      code: `
{
  type A = 1;
}
type A = 1;
      `,
      options: [{ hoist: 'functions' }],
    },
    {
      code: `
{
  interface Foo<A> {}
}
type A = 1;
      `,
      options: [{ hoist: 'functions' }],
    },
    {
      code: `
import type { Foo } from 'bar';

declare module 'bar' {
  export type Foo = string;
}
      `,
    },
    {
      code: `
import type { Foo } from 'bar';

declare module 'bar' {
  interface Foo {
    x: string;
  }
}
      `,
    },
    {
      code: `
import { type Foo } from 'bar';

declare module 'bar' {
  export type Foo = string;
}
      `,
    },
    {
      code: `
import { type Foo } from 'bar';

declare module 'bar' {
  export interface Foo {
    x: string;
  }
}
      `,
    },
    {
      code: `
import { type Foo } from 'bar';

declare module 'bar' {
  type Foo = string;
}
      `,
    },
    {
      code: `
import { type Foo } from 'bar';

declare module 'bar' {
  interface Foo {
    x: string;
  }
}
      `,
    },
    {
      code: `
declare const foo1: boolean;
      `,
      filename: 'baz.d.ts',
      languageOptions: {
        globals: {
          foo1: false,
        },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
declare let foo2: boolean;
      `,
      filename: 'baz.d.ts',
      languageOptions: {
        globals: {
          foo2: false,
        },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
declare var foo3: boolean;
      `,
      filename: 'baz.d.ts',
      languageOptions: {
        globals: {
          foo3: false,
        },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
function foo4(name: string): void;
      `,
      filename: 'baz.d.ts',
      languageOptions: {
        globals: {
          foo4: false,
        },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
declare class Foopy1 {
  name: string;
}
      `,
      filename: 'baz.d.ts',
      languageOptions: {
        globals: {
          Foopy1: false,
        },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
declare interface Foopy2 {
  name: string;
}
      `,
      filename: 'baz.d.ts',
      languageOptions: {
        globals: {
          Foopy2: false,
        },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
declare type Foopy3 = {
  x: number;
};
      `,
      filename: 'baz.d.ts',
      languageOptions: {
        globals: {
          Foopy3: false,
        },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
declare enum Foopy4 {
  x,
}
      `,
      filename: 'baz.d.ts',
      languageOptions: {
        globals: {
          Foopy4: false,
        },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
declare namespace Foopy5 {}
      `,
      filename: 'baz.d.ts',
      languageOptions: {
        globals: {
          Foopy5: false,
        },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
declare;
foo5: boolean;
      `,
      filename: 'baz.d.ts',
      languageOptions: {
        globals: {
          foo5: false,
        },
      },
      options: [{ builtinGlobals: true }],
    },
  ],
});
