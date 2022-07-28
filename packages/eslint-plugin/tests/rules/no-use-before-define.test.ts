import rule from '../../src/rules/no-use-before-define';
import { RuleTester } from '../RuleTester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const parserOptions = { ecmaVersion: 6 as const };

ruleTester.run('no-use-before-define', rule, {
  valid: [
    `
type foo = 1;
const x: foo = 1;
    `,
    `
type foo = 1;
type bar = foo;
    `,
    `
interface Foo {}
const x: Foo = {};
    `,
    `
var a = 10;
alert(a);
    `,
    `
function b(a) {
  alert(a);
}
    `,
    'Object.hasOwnProperty.call(a);',
    `
function a() {
  alert(arguments);
}
    `,
    'declare function a();',
    `
declare class a {
  foo();
}
    `,
    'const updatedAt = data?.updatedAt;',
    `
function f() {
  return function t() {};
}
f()?.();
    `,
    `
var a = { b: 5 };
alert(a?.b);
    `,
    {
      code: `
a();
function a() {
  alert(arguments);
}
      `,
      options: ['nofunc'],
    },
    {
      code: `
(() => {
  var a = 42;
  alert(a);
})();
      `,
      parserOptions,
    },
    `
a();
try {
  throw new Error();
} catch (a) {}
    `,
    {
      code: `
class A {}
new A();
      `,
      parserOptions,
    },
    `
var a = 0,
  b = a;
    `,
    { code: 'var { a = 0, b = a } = {};', parserOptions },
    { code: 'var [a = 0, b = a] = {};', parserOptions },
    `
function foo() {
  foo();
}
    `,
    `
var foo = function () {
  foo();
};
    `,
    `
var a;
for (a in a) {
}
    `,
    {
      code: `
var a;
for (a of a) {
}
      `,
      parserOptions,
    },

    // Block-level bindings
    {
      code: `
'use strict';
a();
{
  function a() {}
}
      `,
      parserOptions,
    },
    {
      code: `
'use strict';
{
  a();
  function a() {}
}
      `,
      options: ['nofunc'],
      parserOptions,
    },
    {
      code: `
switch (foo) {
  case 1: {
    a();
  }
  default: {
    let a;
  }
}
      `,
      parserOptions,
    },
    {
      code: `
a();
{
  let a = function () {};
}
      `,
      parserOptions,
    },

    // object style options
    {
      code: `
a();
function a() {
  alert(arguments);
}
      `,
      options: [{ functions: false }],
    },
    {
      code: `
'use strict';
{
  a();
  function a() {}
}
      `,
      options: [{ functions: false }],
      parserOptions,
    },
    {
      code: `
function foo() {
  new A();
}
class A {}
      `,
      options: [{ classes: false }],
      parserOptions,
    },

    // "variables" option
    {
      code: `
function foo() {
  bar;
}
var bar;
      `,
      options: [{ variables: false }],
    },
    {
      code: `
var foo = () => bar;
var bar;
      `,
      options: [{ variables: false }],
      parserOptions,
    },

    // "typedefs" option
    {
      code: `
var x: Foo = 2;
type Foo = string | number;
      `,
      options: [{ typedefs: false }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2572
    {
      code: `
interface Bar {
  type: typeof Foo;
}

const Foo = 2;
      `,
      options: [{ ignoreTypeReferences: true }],
    },
    {
      code: `
interface Bar {
  type: typeof Foo.FOO;
}

class Foo {
  public static readonly FOO = '';
}
      `,
      options: [{ ignoreTypeReferences: true }],
    },
    {
      code: `
interface Bar {
  type: typeof Foo.Bar.Baz;
}

const Foo = {
  Bar: {
    Baz: 1,
  },
};
      `,
      options: [{ ignoreTypeReferences: true }],
    },
    // https://github.com/bradzacher/eslint-plugin-typescript/issues/141
    {
      code: `
interface ITest {
  first: boolean;
  second: string;
  third: boolean;
}

let first = () => console.log('first');

export let second = () => console.log('second');

export namespace Third {
  export let third = () => console.log('third');
}
      `,
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    // https://github.com/eslint/typescript-eslint-parser/issues/550
    `
function test(file: Blob) {
  const slice: typeof file.slice =
    file.slice || (file as any).webkitSlice || (file as any).mozSlice;
  return slice;
}
    `,
    // https://github.com/eslint/typescript-eslint-parser/issues/435
    `
interface Foo {
  bar: string;
}
const bar = 'blah';
    `,
    {
      code: `
function foo(): Foo {
  return Foo.FOO;
}

enum Foo {
  FOO,
}
      `,
      options: [{ enums: false }],
    },
    {
      code: `
let foo: Foo;

enum Foo {
  FOO,
}
      `,
      options: [{ enums: false }],
    },
    {
      code: `
class Test {
  foo(args: Foo): Foo {
    return Foo.FOO;
  }
}

enum Foo {
  FOO,
}
      `,
      options: [{ enums: false }],
    },

    // "allowNamedExports" option
    {
      code: `
export { a };
const a = 1;
      `,
      options: [{ allowNamedExports: true }],
      parserOptions,
    },
    {
      code: `
export { a as b };
const a = 1;
      `,
      options: [{ allowNamedExports: true }],
      parserOptions,
    },
    {
      code: `
export { a, b };
let a, b;
      `,
      options: [{ allowNamedExports: true }],
      parserOptions,
    },
    {
      code: `
export { a };
var a;
      `,
      options: [{ allowNamedExports: true }],
      parserOptions,
    },
    {
      code: `
export { f };
function f() {}
      `,
      options: [{ allowNamedExports: true }],
      parserOptions,
    },
    {
      code: `
export { C };
class C {}
      `,
      options: [{ allowNamedExports: true }],
      parserOptions,
    },
    {
      code: `
export { Foo };

enum Foo {
  BAR,
}
      `,
      options: [{ allowNamedExports: true }],
      parserOptions,
    },
    {
      code: `
export { Foo };

namespace Foo {
  export let bar = () => console.log('bar');
}
      `,
      options: [{ allowNamedExports: true }],
      parserOptions,
    },
    {
      code: `
export { Foo, baz };

enum Foo {
  BAR,
}

let baz: Enum;
enum Enum {}
      `,
      options: [{ ignoreTypeReferences: true, allowNamedExports: true }],
      parserOptions,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2502
    {
      code: `
import * as React from 'react';

<div />;
      `,
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `
import React from 'react';

<div />;
      `,
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `
import { h } from 'preact';

<div />;
      `,
      parserOptions: {
        sourceType: 'module',
        jsxPragma: 'h',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `
const React = require('react');

<div />;
      `,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2527
    `
type T = (value: unknown) => value is Id;
    `,
    `
global.foo = true;

declare global {
  namespace NodeJS {
    interface Global {
      foo?: boolean;
    }
  }
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2824
    `
@Directive({
  selector: '[rcCidrIpPattern]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: CidrIpPatternDirective,
      multi: true,
    },
  ],
})
export class CidrIpPatternDirective implements Validator {}
    `,
    {
      code: `
@Directive({
  selector: '[rcCidrIpPattern]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: CidrIpPatternDirective,
      multi: true,
    },
  ],
})
export class CidrIpPatternDirective implements Validator {}
      `,
      options: [
        {
          classes: false,
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2941
    `
class A {
  constructor(printName) {
    this.printName = printName;
  }

  openPort(printerName = this.printerName) {
    this.tscOcx.ActiveXopenport(printerName);

    return this;
  }
}
    `,
  ],
  invalid: [
    {
      code: `
a++;
var a = 19;
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
a++;
var a = 19;
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
a++;
var a = 19;
      `,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
a();
var a = function () {};
      `,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
alert(a[1]);
var a = [1, 3];
      `,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
a();
function a() {
  alert(b);
  var b = 10;
  a();
}
      `,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'b' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
a();
var a = function () {};
      `,
      options: ['nofunc'],
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(() => {
  alert(a);
  var a = 42;
})();
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(() => a())();
function a() {}
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
'use strict';
a();
{
  function a() {}
}
      `,
      parser: require.resolve('espree'),
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
a();
try {
  throw new Error();
} catch (foo) {
  var a;
}
      `,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var f = () => a;
var a;
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
new A();
class A {}
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'A' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  new A();
}
class A {}
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'A' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
new A();
var A = class {};
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'A' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  new A();
}
var A = class {};
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'A' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },

    // Block-level bindings
    {
      code: `
a++;
{
  var a;
}
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
'use strict';
{
  a();
  function a() {}
}
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  a;
  let a = 1;
}
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
switch (foo) {
  case 1:
    a();
  default:
    let a;
}
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
if (true) {
  function foo() {
    a;
  }
  let a;
}
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },

    // object style options
    {
      code: `
a();
var a = function () {};
      `,
      options: [{ functions: false, classes: false }],
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
new A();
var A = class {};
      `,
      options: [{ classes: false }],
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'A' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  new A();
}
var A = class {};
      `,
      options: [{ classes: false }],
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'A' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },

    // invalid initializers
    {
      code: 'var a = a;',
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'let a = a + b;',
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'const a = foo(a);',
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'function foo(a = a) {}',
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var { a = a } = [];',
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var [a = a] = [];',
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var { b = a, a } = {};',
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var [b = a, a] = {};',
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var { a = 0 } = a;',
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var [a = 0] = a;',
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
for (var a in a) {
}
      `,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
for (var a of a) {
}
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },

    // "ignoreTypeReferences" option
    {
      code: `
interface Bar {
  type: typeof Foo;
}

const Foo = 2;
      `,
      options: [{ ignoreTypeReferences: false }],
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'Foo' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
interface Bar {
  type: typeof Foo.FOO;
}

class Foo {
  public static readonly FOO = '';
}
      `,
      options: [{ ignoreTypeReferences: false }],
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'Foo' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
interface Bar {
  type: typeof Foo.Bar.Baz;
}

const Foo = {
  Bar: {
    Baz: 1,
  },
};
      `,
      options: [{ ignoreTypeReferences: false }],
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'Foo' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },

    // "variables" option
    {
      code: `
function foo() {
  bar;
  var bar = 1;
}
var bar;
      `,
      parserOptions,
      options: [{ variables: false }],
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'bar' },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
class Test {
  foo(args: Foo): Foo {
    return Foo.FOO;
  }
}

enum Foo {
  FOO,
}
      `,
      options: [{ enums: true }],
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'Foo' },
          line: 4,
        },
      ],
    },
    {
      code: `
function foo(): Foo {
  return Foo.FOO;
}

enum Foo {
  FOO,
}
      `,
      options: [{ enums: true }],
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'Foo' },
          line: 3,
        },
      ],
    },
    {
      code: `
const foo = Foo.Foo;

enum Foo {
  FOO,
}
      `,
      options: [{ enums: true }],
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'Foo' },
          line: 2,
        },
      ],
    },
    // "allowNamedExports"
    {
      code: `
export { a };
const a = 1;
      `,
      parserOptions,

      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
        },
      ],
    },
    {
      code: `
export { a };
const a = 1;
      `,
      options: [{}],
      parserOptions,

      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
        },
      ],
    },
    {
      code: `
export { a };
const a = 1;
      `,
      options: [{ allowNamedExports: false }],
      parserOptions,

      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
        },
      ],
    },
    {
      code: `
export { a };
const a = 1;
      `,
      options: ['nofunc'],
      parserOptions,

      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
        },
      ],
    },
    {
      code: `
export { a as b };
const a = 1;
      `,
      parserOptions,

      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
        },
      ],
    },
    {
      code: `
export { a, b };
let a, b;
      `,
      parserOptions,

      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
        },
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'b' },
        },
      ],
    },
    {
      code: `
export { a };
var a;
      `,
      parserOptions,

      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
        },
      ],
    },
    {
      code: `
export { f };
function f() {}
      `,
      parserOptions,

      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'f' },
        },
      ],
    },
    {
      code: `
export { C };
class C {}
      `,
      parserOptions,

      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'C' },
        },
      ],
    },
    {
      code: `
export const foo = a;
const a = 1;
      `,
      options: [{ allowNamedExports: true }],
      parserOptions,

      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
        },
      ],
    },
    {
      code: `
export function foo() {
  return a;
}
const a = 1;
      `,
      options: [{ allowNamedExports: true }],
      parserOptions,

      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
        },
      ],
    },
    {
      code: `
export class C {
  foo() {
    return a;
  }
}
const a = 1;
      `,
      options: [{ allowNamedExports: true }],
      parserOptions,

      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
        },
      ],
    },
    {
      code: `
export { Foo };

enum Foo {
  BAR,
}
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'Foo' },
        },
      ],
    },
    {
      code: `
export { Foo };

namespace Foo {
  export let bar = () => console.log('bar');
}
      `,
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'Foo' },
        },
      ],
    },
    {
      code: `
export { Foo, baz };

enum Foo {
  BAR,
}

let baz: Enum;
enum Enum {}
      `,
      options: [{ ignoreTypeReferences: true, allowNamedExports: false }],
      parserOptions,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'Foo' },
        },
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'baz' },
        },
      ],
    },
    {
      code: `
f();
function f() {}
      `,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'f' },
        },
      ],
    },
    {
      code: `
alert(a);
var a = 10;
      `,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
        },
      ],
    },
    {
      code: `
f()?.();
function f() {
  return function t() {};
}
      `,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'f' },
        },
      ],
    },
    {
      code: `
alert(a?.b);
var a = { b: 5 };
      `,
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
        },
      ],
    },
  ],
});
