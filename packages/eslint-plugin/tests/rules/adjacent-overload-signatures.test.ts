import rule from '../../src/rules/adjacent-overload-signatures';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('adjacent-overload-signatures', rule, {
  valid: [
    {
      code: `
function error(a: string);
function error(b: number);
function error(ab: string | number) {}
export { error };
      `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: `
import { connect } from 'react-redux';
export interface ErrorMessageModel {
  message: string;
}
function mapStateToProps() {}
function mapDispatchToProps() {}
export default connect(mapStateToProps, mapDispatchToProps)(ErrorMessage);
      `,
      parserOptions: { sourceType: 'module' },
    },
    `
export const foo = 'a',
  bar = 'b';
export interface Foo {}
export class Foo {}
    `,
    `
export interface Foo {}
export const foo = 'a',
  bar = 'b';
export class Foo {}
    `,
    `
const foo = 'a',
  bar = 'b';
interface Foo {}
class Foo {}
    `,
    `
interface Foo {}
const foo = 'a',
  bar = 'b';
class Foo {}
    `,
    `
export class Foo {}
export class Bar {}
export type FooBar = Foo | Bar;
    `,
    `
export interface Foo {}
export class Foo {}
export class Bar {}
export type FooBar = Foo | Bar;
    `,
    `
export function foo(s: string);
export function foo(n: number);
export function foo(sn: string | number) {}
export function bar(): void {}
export function baz(): void {}
    `,
    `
function foo(s: string);
function foo(n: number);
function foo(sn: string | number) {}
function bar(): void {}
function baz(): void {}
    `,
    `
declare function foo(s: string);
declare function foo(n: number);
declare function foo(sn: string | number);
declare function bar(): void;
declare function baz(): void;
    `,
    `
declare module 'Foo' {
  export function foo(s: string): void;
  export function foo(n: number): void;
  export function foo(sn: string | number): void;
  export function bar(): void;
  export function baz(): void;
}
    `,
    `
declare namespace Foo {
  export function foo(s: string): void;
  export function foo(n: number): void;
  export function foo(sn: string | number): void;
  export function bar(): void;
  export function baz(): void;
}
    `,
    `
type Foo = {
  foo(s: string): void;
  foo(n: number): void;
  foo(sn: string | number): void;
  bar(): void;
  baz(): void;
};
    `,
    `
type Foo = {
  foo(s: string): void;
  ['foo'](n: number): void;
  foo(sn: string | number): void;
  bar(): void;
  baz(): void;
};
    `,
    `
interface Foo {
  (s: string): void;
  (n: number): void;
  (sn: string | number): void;
  foo(n: number): void;
  bar(): void;
  baz(): void;
}
    `,
    `
interface Foo {
  (s: string): void;
  (n: number): void;
  (sn: string | number): void;
  foo(n: number): void;
  bar(): void;
  baz(): void;
  call(): void;
}
    `,
    `
interface Foo {
  foo(s: string): void;
  foo(n: number): void;
  foo(sn: string | number): void;
  bar(): void;
  baz(): void;
}
    `,
    `
interface Foo {
  foo(s: string): void;
  ['foo'](n: number): void;
  foo(sn: string | number): void;
  bar(): void;
  baz(): void;
}
    `,
    `
interface Foo {
  foo(): void;
  bar: {
    baz(s: string): void;
    baz(n: number): void;
    baz(sn: string | number): void;
  };
}
    `,
    `
interface Foo {
  new (s: string);
  new (n: number);
  new (sn: string | number);
  foo(): void;
}
    `,
    `
class Foo {
  constructor(s: string);
  constructor(n: number);
  constructor(sn: string | number) {}
  bar(): void {}
  baz(): void {}
}
    `,
    `
class Foo {
  foo(s: string): void;
  foo(n: number): void;
  foo(sn: string | number): void {}
  bar(): void {}
  baz(): void {}
}
    `,
    `
class Foo {
  foo(s: string): void;
  ['foo'](n: number): void;
  foo(sn: string | number): void {}
  bar(): void {}
  baz(): void {}
}
    `,
    `
class Foo {
  name: string;
  foo(s: string): void;
  foo(n: number): void;
  foo(sn: string | number): void {}
  bar(): void {}
  baz(): void {}
}
    `,
    `
class Foo {
  name: string;
  static foo(s: string): void;
  static foo(n: number): void;
  static foo(sn: string | number): void {}
  bar(): void {}
  baz(): void {}
}
    `,
    `
class Test {
  static test() {}
  untest() {}
  test() {}
}
    `,
    // examples from https://github.com/nzakas/eslint-plugin-typescript/issues/138
    'export default function <T>(foo: T) {}',
    'export default function named<T>(foo: T) {}',
    `
interface Foo {
  [Symbol.toStringTag](): void;
  [Symbol.iterator](): void;
}
    `,
  ],
  invalid: [
    {
      code: `
export function foo(s: string);
export function foo(n: number);
export function bar(): void {}
export function baz(): void {}
export function foo(sn: string | number) {}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 6,
          column: 1,
        },
      ],
    },
    {
      code: `
export function foo(s: string);
export function foo(n: number);
export type bar = number;
export type baz = number | string;
export function foo(sn: string | number) {}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 6,
          column: 1,
        },
      ],
    },
    {
      code: `
function foo(s: string);
function foo(n: number);
function bar(): void {}
function baz(): void {}
function foo(sn: string | number) {}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 6,
          column: 1,
        },
      ],
    },
    {
      code: `
function foo(s: string);
function foo(n: number);
type bar = number;
type baz = number | string;
function foo(sn: string | number) {}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 6,
          column: 1,
        },
      ],
    },
    {
      code: `
function foo(s: string) {}
function foo(n: number) {}
const a = '';
const b = '';
function foo(sn: string | number) {}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 6,
          column: 1,
        },
      ],
    },
    {
      code: `
function foo(s: string) {}
function foo(n: number) {}
class Bar {}
function foo(sn: string | number) {}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 5,
          column: 1,
        },
      ],
    },
    {
      code: `
function foo(s: string) {}
function foo(n: number) {}
function foo(sn: string | number) {}
class Bar {
  foo(s: string);
  foo(n: number);
  name: string;
  foo(sn: string | number) {}
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 9,
          column: 3,
        },
      ],
    },
    {
      code: `
declare function foo(s: string);
declare function foo(n: number);
declare function bar(): void;
declare function baz(): void;
declare function foo(sn: string | number);
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 6,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function foo(s: string);
declare function foo(n: number);
const a = '';
const b = '';
declare function foo(sn: string | number);
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 6,
          column: 1,
        },
      ],
    },
    {
      code: `
declare module 'Foo' {
  export function foo(s: string): void;
  export function foo(n: number): void;
  export function bar(): void;
  export function baz(): void;
  export function foo(sn: string | number): void;
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: `
declare module 'Foo' {
  export function foo(s: string): void;
  export function foo(n: number): void;
  export function foo(sn: string | number): void;
  function baz(s: string): void;
  export function bar(): void;
  function baz(n: number): void;
  function baz(sn: string | number): void;
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'baz' },
          line: 8,
          column: 3,
        },
      ],
    },
    {
      code: `
declare namespace Foo {
  export function foo(s: string): void;
  export function foo(n: number): void;
  export function bar(): void;
  export function baz(): void;
  export function foo(sn: string | number): void;
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: `
declare namespace Foo {
  export function foo(s: string): void;
  export function foo(n: number): void;
  export function foo(sn: string | number): void;
  function baz(s: string): void;
  export function bar(): void;
  function baz(n: number): void;
  function baz(sn: string | number): void;
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'baz' },
          line: 8,
          column: 3,
        },
      ],
    },
    {
      code: `
type Foo = {
  foo(s: string): void;
  foo(n: number): void;
  bar(): void;
  baz(): void;
  foo(sn: string | number): void;
};
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: `
type Foo = {
  foo(s: string): void;
  ['foo'](n: number): void;
  bar(): void;
  baz(): void;
  foo(sn: string | number): void;
};
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: `
type Foo = {
  foo(s: string): void;
  name: string;
  foo(n: number): void;
  foo(sn: string | number): void;
  bar(): void;
  baz(): void;
};
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 5,
          column: 3,
        },
      ],
    },
    {
      code: `
interface Foo {
  (s: string): void;
  foo(n: number): void;
  (n: number): void;
  (sn: string | number): void;
  bar(): void;
  baz(): void;
  call(): void;
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'call' },
          line: 5,
          column: 3,
        },
      ],
    },
    {
      code: `
interface Foo {
  foo(s: string): void;
  foo(n: number): void;
  bar(): void;
  baz(): void;
  foo(sn: string | number): void;
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: `
interface Foo {
  foo(s: string): void;
  ['foo'](n: number): void;
  bar(): void;
  baz(): void;
  foo(sn: string | number): void;
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: `
interface Foo {
  foo(s: string): void;
  'foo'(n: number): void;
  bar(): void;
  baz(): void;
  foo(sn: string | number): void;
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: `
interface Foo {
  foo(s: string): void;
  name: string;
  foo(n: number): void;
  foo(sn: string | number): void;
  bar(): void;
  baz(): void;
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 5,
          column: 3,
        },
      ],
    },
    {
      code: `
interface Foo {
  foo(): void;
  bar: {
    baz(s: string): void;
    baz(n: number): void;
    foo(): void;
    baz(sn: string | number): void;
  };
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'baz' },
          line: 8,
          column: 5,
        },
      ],
    },
    {
      code: `
interface Foo {
  new (s: string);
  new (n: number);
  foo(): void;
  bar(): void;
  new (sn: string | number);
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'new' },
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: `
interface Foo {
  new (s: string);
  foo(): void;
  new (n: number);
  bar(): void;
  new (sn: string | number);
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'new' },
          line: 5,
          column: 3,
        },
        {
          messageId: 'adjacentSignature',
          data: { name: 'new' },
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(s: string);
  constructor(n: number);
  bar(): void {}
  baz(): void {}
  constructor(sn: string | number) {}
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'constructor' },
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: `
class Foo {
  foo(s: string): void;
  foo(n: number): void;
  bar(): void {}
  baz(): void {}
  foo(sn: string | number): void {}
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: `
class Foo {
  foo(s: string): void;
  ['foo'](n: number): void;
  bar(): void {}
  baz(): void {}
  foo(sn: string | number): void {}
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: `
class Foo {
  // prettier-ignore
  "foo"(s: string): void;
  foo(n: number): void;
  bar(): void {}
  baz(): void {}
  foo(sn: string | number): void {}
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 8,
          column: 3,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(s: string);
  name: string;
  constructor(n: number);
  constructor(sn: string | number) {}
  bar(): void {}
  baz(): void {}
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'constructor' },
          line: 5,
          column: 3,
        },
      ],
    },
    {
      code: `
class Foo {
  foo(s: string): void;
  name: string;
  foo(n: number): void;
  foo(sn: string | number): void {}
  bar(): void {}
  baz(): void {}
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'foo' },
          line: 5,
          column: 3,
        },
      ],
    },
    {
      code: `
class Foo {
  static foo(s: string): void;
  name: string;
  static foo(n: number): void;
  static foo(sn: string | number): void {}
  bar(): void {}
  baz(): void {}
}
      `,
      errors: [
        {
          messageId: 'adjacentSignature',
          data: { name: 'static foo' },
          line: 5,
          column: 3,
        },
      ],
    },
  ],
});
