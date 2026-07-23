import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-use-before-define';

const ruleTester = new RuleTester();

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
      languageOptions: { parserOptions },
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
      languageOptions: { parserOptions },
    },
    `
var a = 0,
  b = a;
    `,
    { code: 'var { a = 0, b = a } = {};', languageOptions: { parserOptions } },
    { code: 'var [a = 0, b = a] = {};', languageOptions: { parserOptions } },
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
      languageOptions: { parserOptions },
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
      languageOptions: { parserOptions },
    },
    {
      code: `
'use strict';
{
  a();
  function a() {}
}
      `,
      languageOptions: { parserOptions },
      options: ['nofunc'],
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
      languageOptions: { parserOptions },
    },
    {
      code: `
a();
{
  let a = function () {};
}
      `,
      languageOptions: { parserOptions },
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
      languageOptions: { parserOptions },
      options: [{ functions: false }],
    },
    {
      code: `
function foo() {
  new A();
}
class A {}
      `,
      languageOptions: { parserOptions },
      options: [{ classes: false }],
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
      languageOptions: { parserOptions },
      options: [{ variables: false }],
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
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
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
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: true }],
    },
    {
      code: `
export { a as b };
const a = 1;
      `,
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: true }],
    },
    {
      code: `
export { a, b };
let a, b;
      `,
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: true }],
    },
    {
      code: `
export { a };
var a;
      `,
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: true }],
    },
    {
      code: `
export { f };
function f() {}
      `,
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: true }],
    },
    {
      code: `
export { C };
class C {}
      `,
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: true }],
    },
    {
      code: `
export { Foo };

enum Foo {
  BAR,
}
      `,
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: true }],
    },
    {
      code: `
export { Foo };

namespace Foo {
  export let bar = () => console.log('bar');
}
      `,
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: true }],
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
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2502
    {
      code: `
import * as React from 'react';

<div />;
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          sourceType: 'module',
        },
      },
    },
    {
      code: `
import React from 'react';

<div />;
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          sourceType: 'module',
        },
      },
    },
    {
      code: `
import { h } from 'preact';

<div />;
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          jsxPragma: 'h',
          sourceType: 'module',
        },
      },
    },
    {
      code: `
const React = require('react');

<div />;
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
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
    {
      code: `
const obj = {
  foo: 'foo-value',
  bar: 'bar-value',
} satisfies {
  [key in 'foo' | 'bar']: \`\${key}-value\`;
};
      `,
      options: [{ ignoreTypeReferences: false }],
    },
    {
      code: `
const obj = {
  foo: 'foo-value',
  bar: 'bar-value',
} as {
  [key in 'foo' | 'bar']: \`\${key}-value\`;
};
      `,
      options: [{ ignoreTypeReferences: false }],
    },
    {
      code: `
const obj = {
  foo: {
    foo: 'foo',
  } as {
    [key in 'foo' | 'bar']: key;
  },
};
      `,
      options: [{ ignoreTypeReferences: false }],
    },
    {
      code: `
const foo = {
  bar: 'bar',
} satisfies {
  bar: typeof baz;
};

const baz = '';
      `,
      options: [{ ignoreTypeReferences: true }],
    },
    `
namespace A.X.Y {}

import Z = A.X.Y;

const X = 23;
    `,
  ],
  invalid: [
    {
      code: `
a++;
var a = 19;
      `,
      errors: [
        {
          column: 1,
          data: { name: 'a' },
          endColumn: 2,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: {
        parserOptions: { sourceType: 'module' },
      },
    },
    {
      code: `
a++;
var a = 19;
      `,
      errors: [
        {
          column: 1,
          data: { name: 'a' },
          endColumn: 2,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
a++;
var a = 19;
      `,
      errors: [
        {
          column: 1,
          data: { name: 'a' },
          endColumn: 2,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
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
          column: 1,
          data: { name: 'a' },
          endColumn: 2,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
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
          column: 7,
          data: { name: 'a' },
          endColumn: 8,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
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
          column: 1,
          data: { name: 'a' },
          endColumn: 2,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
        {
          column: 9,
          data: { name: 'b' },
          endColumn: 10,
          endLine: 4,
          line: 4,
          messageId: 'noUseBeforeDefine',
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
          column: 1,
          data: { name: 'a' },
          endColumn: 2,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      options: ['nofunc'],
    },
    {
      code: `
(() => {
  alert(a);
  var a = 42;
})();
      `,
      errors: [
        {
          column: 9,
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
(() => a())();
function a() {}
      `,
      errors: [
        {
          column: 8,
          data: { name: 'a' },
          endColumn: 9,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
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
          column: 1,
          data: { name: 'a' },
          endColumn: 2,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
    },
    {
      code: `
var f = () => a;
var a;
      `,
      errors: [
        {
          column: 15,
          data: { name: 'a' },
          endColumn: 16,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
new A();
class A {}
      `,
      errors: [
        {
          column: 5,
          data: { name: 'A' },
          endColumn: 6,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
function foo() {
  new A();
}
class A {}
      `,
      errors: [
        {
          column: 7,
          data: { name: 'A' },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
new A();
var A = class {};
      `,
      errors: [
        {
          column: 5,
          data: { name: 'A' },
          endColumn: 6,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
function foo() {
  new A();
}
var A = class {};
      `,
      errors: [
        {
          column: 7,
          data: { name: 'A' },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },

    // Block-level bindings
    {
      code: `
a++;
{
  var a;
}
      `,
      errors: [
        {
          column: 1,
          data: { name: 'a' },
          endColumn: 2,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
'use strict';
{
  a();
  function a() {}
}
      `,
      errors: [
        {
          column: 3,
          data: { name: 'a' },
          endColumn: 4,
          endLine: 4,
          line: 4,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
{
  a;
  let a = 1;
}
      `,
      errors: [
        {
          column: 3,
          data: { name: 'a' },
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
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
      errors: [
        {
          column: 5,
          data: { name: 'a' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
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
      errors: [
        {
          column: 5,
          data: { name: 'a' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },

    // object style options
    {
      code: `
a();
var a = function () {};
      `,
      errors: [
        {
          column: 1,
          data: { name: 'a' },
          endColumn: 2,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      options: [{ classes: false, functions: false }],
    },
    {
      code: `
new A();
var A = class {};
      `,
      errors: [
        {
          column: 5,
          data: { name: 'A' },
          endColumn: 6,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
      options: [{ classes: false }],
    },
    {
      code: `
function foo() {
  new A();
}
var A = class {};
      `,
      errors: [
        {
          column: 7,
          data: { name: 'A' },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
      options: [{ classes: false }],
    },

    // invalid initializers
    {
      code: 'var a = a;',
      errors: [
        {
          column: 9,
          data: { name: 'a' },
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'noUseBeforeDefine',
        },
      ],
    },
    {
      code: 'let a = a + b;',
      errors: [
        {
          column: 9,
          data: { name: 'a' },
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: 'const a = foo(a);',
      errors: [
        {
          column: 15,
          data: { name: 'a' },
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: 'function foo(a = a) {}',
      errors: [
        {
          column: 18,
          data: { name: 'a' },
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: 'var { a = a } = [];',
      errors: [
        {
          column: 11,
          data: { name: 'a' },
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: 'var [a = a] = [];',
      errors: [
        {
          column: 10,
          data: { name: 'a' },
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: 'var { b = a, a } = {};',
      errors: [
        {
          column: 11,
          data: { name: 'a' },
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: 'var [b = a, a] = {};',
      errors: [
        {
          column: 10,
          data: { name: 'a' },
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: 'var { a = 0 } = a;',
      errors: [
        {
          column: 17,
          data: { name: 'a' },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: 'var [a = 0] = a;',
      errors: [
        {
          column: 15,
          data: { name: 'a' },
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
for (var a in a) {
}
      `,
      errors: [
        {
          column: 15,
          data: { name: 'a' },
          endColumn: 16,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
    },
    {
      code: `
for (var a of a) {
}
      `,
      errors: [
        {
          column: 15,
          data: { name: 'a' },
          endColumn: 16,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },

    // "ignoreTypeReferences" option
    {
      code: `
interface Bar {
  type: typeof Foo;
}

const Foo = 2;
      `,
      errors: [
        {
          column: 16,
          data: { name: 'Foo' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'noUseBeforeDefine',
        },
      ],
      options: [{ ignoreTypeReferences: false }],
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
      errors: [
        {
          column: 16,
          data: { name: 'Foo' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'noUseBeforeDefine',
        },
      ],
      options: [{ ignoreTypeReferences: false }],
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
      errors: [
        {
          column: 16,
          data: { name: 'Foo' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'noUseBeforeDefine',
        },
      ],
      options: [{ ignoreTypeReferences: false }],
    },
    {
      code: `
const foo = {
  bar: 'bar',
} satisfies {
  bar: typeof baz;
};

const baz = '';
      `,
      errors: [
        {
          column: 15,
          data: { name: 'baz' },
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'noUseBeforeDefine',
        },
      ],
      options: [{ ignoreTypeReferences: false }],
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
      errors: [
        {
          column: 3,
          data: { name: 'bar' },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
      options: [{ variables: false }],
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
      errors: [
        {
          column: 12,
          data: { name: 'Foo' },
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'noUseBeforeDefine',
        },
      ],
      options: [{ enums: true }],
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
      errors: [
        {
          column: 10,
          data: { name: 'Foo' },
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'noUseBeforeDefine',
        },
      ],
      options: [{ enums: true }],
    },
    {
      code: `
const foo = Foo.Foo;

enum Foo {
  FOO,
}
      `,
      errors: [
        {
          column: 13,
          data: { name: 'Foo' },
          endColumn: 16,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      options: [{ enums: true }],
    },
    // "allowNamedExports" option
    {
      code: `
export { a };
const a = 1;
      `,
      errors: [
        {
          column: 10,
          data: { name: 'a' },
          endColumn: 11,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
export { a };
const a = 1;
      `,
      errors: [
        {
          column: 10,
          data: { name: 'a' },
          endColumn: 11,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
      options: [{}],
    },
    {
      code: `
export { a };
const a = 1;
      `,
      errors: [
        {
          column: 10,
          data: { name: 'a' },
          endColumn: 11,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: false }],
    },
    {
      code: `
export { a };
const a = 1;
      `,
      errors: [
        {
          column: 10,
          data: { name: 'a' },
          endColumn: 11,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
      options: ['nofunc'],
    },
    {
      code: `
export { a as b };
const a = 1;
      `,
      errors: [
        {
          column: 10,
          data: { name: 'a' },
          endColumn: 11,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
export { a, b };
let a, b;
      `,
      errors: [
        {
          column: 10,
          data: { name: 'a' },
          endColumn: 11,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
        {
          column: 13,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
export { a };
var a;
      `,
      errors: [
        {
          column: 10,
          data: { name: 'a' },
          endColumn: 11,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
export { f };
function f() {}
      `,
      errors: [
        {
          column: 10,
          data: { name: 'f' },
          endColumn: 11,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
export { C };
class C {}
      `,
      errors: [
        {
          column: 10,
          data: { name: 'C' },
          endColumn: 11,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
export const foo = a;
const a = 1;
      `,
      errors: [
        {
          column: 20,
          data: { name: 'a' },
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: true }],
    },
    {
      code: `
export function foo() {
  return a;
}
const a = 1;
      `,
      errors: [
        {
          column: 10,
          data: { name: 'a' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: true }],
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
      errors: [
        {
          column: 12,
          data: { name: 'a' },
          endColumn: 13,
          endLine: 4,
          line: 4,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: true }],
    },
    {
      code: `
export { Foo };

enum Foo {
  BAR,
}
      `,
      errors: [
        {
          column: 10,
          data: { name: 'Foo' },
          endColumn: 13,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
    },
    {
      code: `
export { Foo };

namespace Foo {
  export let bar = () => console.log('bar');
}
      `,
      errors: [
        {
          column: 10,
          data: { name: 'Foo' },
          endColumn: 13,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
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
      errors: [
        {
          column: 10,
          data: { name: 'Foo' },
          endColumn: 13,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
        {
          column: 15,
          data: { name: 'baz' },
          endColumn: 18,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
      languageOptions: { parserOptions },
      options: [{ allowNamedExports: false, ignoreTypeReferences: true }],
    },
    {
      code: `
f();
function f() {}
      `,
      errors: [
        {
          column: 1,
          data: { name: 'f' },
          endColumn: 2,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
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
          column: 7,
          data: { name: 'a' },
          endColumn: 8,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
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
          column: 1,
          data: { name: 'f' },
          endColumn: 2,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
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
          column: 7,
          data: { name: 'a' },
          endColumn: 8,
          endLine: 2,
          line: 2,
          messageId: 'noUseBeforeDefine',
        },
      ],
    },
  ],
});
