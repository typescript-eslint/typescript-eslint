import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../../src/rules/no-shadow';
import { RuleTester } from '../../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-shadow TS tests', rule, {
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
      options: [{ ignoreTypeValueShadow: true }],
      globals: {
        Foo: 'writable',
      },
    },
    {
      code: `
type Foo = 1;
      `,
      options: [
        {
          ignoreTypeValueShadow: false,
          builtinGlobals: false,
        },
      ],
      globals: {
        Foo: 'writable',
      },
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
      options: [
        {
          ignoreFunctionTypeParameterNameValueShadow: true,
          builtinGlobals: false,
        },
      ],
      globals: {
        Foo: 'writable',
      },
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
      options: [{ ignoreOnInitialization: true }],
      parserOptions: { ecmaVersion: 2021 },
    },
    {
      code: `
const person = {
  firstName: people
    .filter(person => person.firstName.startsWith('s'))
    .map(person => person.firstName)[0],
};
      `,
      options: [{ ignoreOnInitialization: true }],
      parserOptions: { ecmaVersion: 2021 },
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
  ],
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
          messageId: 'noShadow',
          data: {
            name: 'T',
            shadowedLine: 2,
            shadowedColumn: 6,
          },
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
          messageId: 'noShadow',
          data: {
            name: 'T',
            shadowedLine: 2,
            shadowedColumn: 6,
          },
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
          messageId: 'noShadow',
          data: {
            name: 'T',
            shadowedLine: 2,
            shadowedColumn: 14,
          },
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
          messageId: 'noShadow',
          data: {
            name: 'T',
            shadowedLine: 2,
            shadowedColumn: 6,
          },
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
      options: [{ ignoreTypeValueShadow: false }],
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'x',
            shadowedLine: 2,
            shadowedColumn: 7,
          },
        },
      ],
    },
    {
      code: `
type Foo = 1;
      `,
      options: [
        {
          ignoreTypeValueShadow: false,
          builtinGlobals: true,
        },
      ],
      globals: {
        Foo: 'writable',
      },
      errors: [
        {
          messageId: 'noShadowGlobal',
          data: {
            name: 'Foo',
          },
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2447
    {
      code: `
const test = 1;
type Fn = (test: string) => typeof test;
      `,
      options: [{ ignoreFunctionTypeParameterNameValueShadow: false }],
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'test',
            shadowedLine: 2,
            shadowedColumn: 7,
          },
        },
      ],
    },
    {
      code: `
type Fn = (Foo: string) => typeof Foo;
      `,
      options: [
        {
          ignoreFunctionTypeParameterNameValueShadow: false,
          builtinGlobals: true,
        },
      ],
      globals: {
        Foo: 'writable',
      },
      errors: [
        {
          messageId: 'noShadowGlobal',
          data: {
            name: 'Foo',
          },
        },
      ],
    },
    {
      code: `
import type { foo } from './foo';
function doThing(foo: number) {}
      `,
      options: [{ ignoreTypeValueShadow: false }],
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'foo',
            shadowedLine: 2,
            shadowedColumn: 15,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
import { type foo } from './foo';
function doThing(foo: number) {}
      `,
      options: [{ ignoreTypeValueShadow: false }],
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'foo',
            shadowedLine: 2,
            shadowedColumn: 15,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
import { foo } from './foo';
function doThing(foo: number, bar: number) {}
      `,
      options: [{ ignoreTypeValueShadow: true }],
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'foo',
            shadowedLine: 2,
            shadowedColumn: 10,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
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
          messageId: 'noShadow',
          data: {
            name: 'Foo',
            shadowedLine: 2,
            shadowedColumn: 11,
          },
          type: AST_NODE_TYPES.Identifier,
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
          messageId: 'noShadow',
          data: {
            name: 'Foo',
            shadowedLine: 2,
            shadowedColumn: 15,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
import type { Foo } from 'bar';

declare module 'bar' {
  export type Foo = string;
}
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'Foo',
            shadowedLine: 2,
            shadowedColumn: 15,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
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
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'Foo',
            shadowedLine: 2,
            shadowedColumn: 15,
          },
          type: AST_NODE_TYPES.Identifier,
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
          messageId: 'noShadow',
          data: {
            name: 'Foo',
            shadowedLine: 2,
            shadowedColumn: 15,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
import { type Foo } from 'bar';

declare module 'bar' {
  export type Foo = string;
}
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'Foo',
            shadowedLine: 2,
            shadowedColumn: 15,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
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
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'Foo',
            shadowedLine: 2,
            shadowedColumn: 15,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
let x = foo((x, y) => {});
let y;
      `,
      parserOptions: { ecmaVersion: 6 },
      options: [{ hoist: 'all' }],
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'x',
            shadowedLine: 2,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
        {
          messageId: 'noShadow',
          data: {
            name: 'y',
            shadowedLine: 3,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo<T extends (...args: any[]) => any>(fn: T, args: any[]) {}
      `,
      options: [
        {
          ignoreTypeValueShadow: false,
          builtinGlobals: true,
        },
      ],
      globals: {
        args: 'writable',
      },
      errors: [
        {
          messageId: 'noShadowGlobal',
          data: {
            name: 'args',
            shadowedLine: 2,
            shadowedColumn: 5,
          },
        },
      ],
    },
  ],
});
