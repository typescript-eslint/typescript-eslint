import rule from '../../src/rules/no-shadow';
import { RuleTester } from '../RuleTester';
import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-shadow TS tests', rule, {
  valid: [
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
          },
          line: 4,
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
          },
          line: 3,
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
          },
          line: 4,
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
          messageId: 'noShadow',
          data: {
            name: 'Foo',
          },
          line: 2,
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
          },
          line: 3,
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
          messageId: 'noShadow',
          data: {
            name: 'Foo',
          },
          line: 2,
        },
      ],
    },
  ],
});

ruleTester.run('no-shadow base eslint tests', rule, {
  valid: [
    `
var a = 3;
function b(x) {
  a++;
  return x + a;
}
setTimeout(function () {
  b(a);
}, 0);
    `,
    `
(function () {
  var doSomething = function doSomething() {};
  doSomething();
})();
    `,
    `
var arguments;
function bar() {}
    `,
    {
      code: `
var a = 3;
var b = x => {
  a++;
  return x + a;
};
setTimeout(() => {
  b(a);
}, 0);
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'class A {}',
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
class A {
  constructor() {
    var a;
  }
}
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
(function () {
  var A = class A {};
})();
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
{
  var a;
}
var a;
      `,
      parserOptions: { ecmaVersion: 6 },
    }, // this case reports `no-redeclare`, not shadowing.
    {
      code: `
{
  let a;
}
let a;
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
{
  let a;
}
var a;
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
{
  let a;
}
function a() {}
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
{
  const a = 0;
}
const a = 1;
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
{
  const a = 0;
}
var a;
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
{
  const a = 0;
}
function a() {}
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  let a;
}
let a;
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  let a;
}
var a;
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  let a;
}
function a() {}
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  var a;
}
let a;
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  var a;
}
var a;
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  var a;
}
function a() {}
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo(a) {}
let a;
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo(a) {}
var a;
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo(a) {}
function a() {}
      `,
      options: [{ hoist: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
{
  let a;
}
let a;
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
{
  let a;
}
var a;
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
{
  const a = 0;
}
const a = 1;
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
{
  const a = 0;
}
var a;
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  let a;
}
let a;
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  let a;
}
var a;
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  var a;
}
let a;
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  var a;
}
var a;
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo(a) {}
let a;
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo(a) {}
var a;
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    `
function foo() {
  var Object = 0;
}
    `,
    {
      code: `
function foo() {
  var top = 0;
}
      `,
      env: { browser: true },
    },
    {
      code: `
function foo(cb) {
  (function (cb) {
    cb(42);
  })(cb);
}
      `,
      options: [{ allow: ['cb'] }],
    },
  ],
  invalid: [
    {
      code: `
function a(x) {
  var b = function c() {
    var x = 'foo';
  };
}
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'x' },
          type: AST_NODE_TYPES.Identifier,
          line: 4,
          column: 9,
        },
      ],
    },
    {
      code: `
var a = x => {
  var b = () => {
    var x = 'foo';
  };
};
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'x' },
          type: AST_NODE_TYPES.Identifier,
          line: 4,
          column: 9,
        },
      ],
    },
    {
      code: `
function a(x) {
  var b = function () {
    var x = 'foo';
  };
}
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'x' },
          type: AST_NODE_TYPES.Identifier,
          line: 4,
          column: 9,
        },
      ],
    },
    {
      code: `
var x = 1;
function a(x) {
  return ++x;
}
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'x' },
          type: AST_NODE_TYPES.Identifier,
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
var a = 3;
function b() {
  var a = 10;
}
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var a = 3;
function b() {
  var a = 10;
}
setTimeout(function () {
  b();
}, 0);
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var a = 3;
function b() {
  var a = 10;
  var b = 0;
}
setTimeout(function () {
  b();
}, 0);
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
        {
          messageId: 'noShadow',
          data: { name: 'b' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var x = 1;
{
  let x = 2;
}
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'x' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
let x = 1;
{
  const x = 2;
}
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'x' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  let a;
}
function a() {}
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  const a = 0;
}
function a() {}
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  let a;
}
function a() {}
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  var a;
}
function a() {}
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo(a) {}
function a() {}
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  let a;
}
let a;
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  let a;
}
var a;
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  let a;
}
function a() {}
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  const a = 0;
}
const a = 1;
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  const a = 0;
}
var a;
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  const a = 0;
}
function a() {}
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  let a;
}
let a;
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  let a;
}
var a;
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  let a;
}
function a() {}
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  var a;
}
let a;
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  var a;
}
var a;
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  var a;
}
function a() {}
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo(a) {}
let a;
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo(a) {}
var a;
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo(a) {}
function a() {}
      `,
      options: [{ hoist: 'all' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function a() {
  function a() {}
})();
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function a() {
  class a {}
})();
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function a() {
  (function a() {});
})();
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function a() {
  (class a {});
})();
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function () {
  var a = function (a) {};
})();
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function () {
  var a = function () {
    function a() {}
  };
})();
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function () {
  var a = function () {
    class a {}
  };
})();
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function () {
  var a = function () {
    (function a() {});
  };
})();
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function () {
  var a = function () {
    (class a {});
  };
})();
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function () {
  var a = class {
    constructor() {
      class a {}
    }
  };
})();
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
class A {
  constructor() {
    var A;
  }
}
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'A' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function a() {
  function a() {
    function a() {}
  }
})();
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
          line: 3,
          column: 12,
        },
        {
          messageId: 'noShadow',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
          line: 4,
          column: 14,
        },
      ],
    },
    {
      code: `
function foo() {
  var Object = 0;
}
      `,
      options: [{ builtinGlobals: true }],
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'Object' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  var top = 0;
}
      `,
      options: [{ builtinGlobals: true }],
      env: { browser: true },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'top' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var Object = 0;',
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'Object' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var top = 0;',
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      env: { browser: true },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'top' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var Object = 0;',
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaFeatures: { globalReturn: true } },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'Object' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var top = 0;',
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaFeatures: { globalReturn: true } },
      env: { browser: true },
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'top' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo(cb) {
  (function (cb) {
    cb(42);
  })(cb);
}
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: { name: 'cb' },
          type: AST_NODE_TYPES.Identifier,
          line: 3,
          column: 14,
        },
      ],
    },
  ],
});
