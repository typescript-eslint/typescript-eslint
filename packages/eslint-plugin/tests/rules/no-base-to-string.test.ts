import rule from '../../src/rules/no-base-to-string';
import { createRuleTesterWithTypes, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = createRuleTesterWithTypes();

/**
 * ref: https://github.com/typescript-eslint/typescript-eslint/issues/11043
 * Be careful with dynamic test case generation.
 * Iterate based on the following cases:
 * 1. literalListBasic
 * ```
[
  "''",
  "'text'",
  'true',
  'false',
  '1',
  '1n',
  '[]',
  '/regex/',
];
 * ```
 * 2. literalListNeedParen
 * ```
[
  "__dirname === 'foobar'",
  '{}.constructor()',
  '() => {}',
  'function() {}',
];
 * ```
 */
ruleTester.run('no-base-to-string', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    // template
    "`${''}`;",
    "`${'text'}`;",
    '`${true}`;',
    '`${false}`;',
    '`${1}`;',
    '`${1n}`;',
    '`${[]}`;',
    '`${/regex/}`;',
    "`${__dirname === 'foobar'}`;",
    '`${{}.constructor()}`;',
    '`${() => {}}`;',
    '`${function () {}}`;',

    // operator + +=
    "'' + 'text';",
    "'' + true;",
    "'' + false;",
    "'' + 1;",
    "'' + 1n;",
    "'' + [];",
    "'' + /regex/;",
    "'' + (__dirname === 'foobar');",
    "'' + {}.constructor();",
    "'' + (() => {});",
    "'' + function () {};",
    "'text' + true;",
    "'text' + false;",
    "'text' + 1;",
    "'text' + 1n;",
    "'text' + [];",
    "'text' + /regex/;",
    "'text' + (__dirname === 'foobar');",
    "'text' + {}.constructor();",
    "'text' + (() => {});",
    "'text' + function () {};",
    'true + false;',
    'true + 1;',
    'true + 1n;',
    'true + [];',
    'true + /regex/;',
    "true + (__dirname === 'foobar');",
    'true + {}.constructor();',
    'true + (() => {});',
    'true + function () {};',
    'false + 1;',
    'false + 1n;',
    'false + [];',
    'false + /regex/;',
    "false + (__dirname === 'foobar');",
    'false + {}.constructor();',
    'false + (() => {});',
    'false + function () {};',
    '1 + 1n;',
    '1 + [];',
    '1 + /regex/;',
    "1 + (__dirname === 'foobar');",
    '1 + {}.constructor();',
    '1 + (() => {});',
    '1 + function () {};',
    '1n + [];',
    '1n + /regex/;',
    "1n + (__dirname === 'foobar');",
    '1n + {}.constructor();',
    '1n + (() => {});',
    '1n + function () {};',
    '[] + /regex/;',
    "[] + (__dirname === 'foobar');",
    '[] + {}.constructor();',
    '[] + (() => {});',
    '[] + function () {};',
    "/regex/ + (__dirname === 'foobar');",
    '/regex/ + {}.constructor();',
    '/regex/ + (() => {});',
    '/regex/ + function () {};',
    "(__dirname === 'foobar') + {}.constructor();",
    "(__dirname === 'foobar') + (() => {});",
    "(__dirname === 'foobar') + function () {};",
    '({}).constructor() + (() => {});',
    '({}).constructor() + function () {};',
    '(() => {}) + function () {};',

    // toString()
    "''.toString();",
    "'text'.toString();",
    'true.toString();',
    'false.toString();',
    '(1).toString();',
    '1n.toString();',
    '[].toString();',
    '/regex/.toString();',
    "(__dirname === 'foobar').toString();",
    '({}).constructor().toString();',
    '(() => {}).toString();',
    '(function () {}).toString();',

    `
declare const a: {
  [Symbol.toPrimitive](): string;
};

\`\${a}\`;
    `,
    `
declare const a: {
  valueOf(): string;
};

\`\${a}\`;
    `,

    // variable toString() and template
    `
let value = '';
value.toString();
let text = \`\${value}\`;
    `,
    `
let value = 'text';
value.toString();
let text = \`\${value}\`;
    `,
    `
let value = true;
value.toString();
let text = \`\${value}\`;
    `,
    `
let value = false;
value.toString();
let text = \`\${value}\`;
    `,
    `
let value = 1;
value.toString();
let text = \`\${value}\`;
    `,
    `
let value = 1n;
value.toString();
let text = \`\${value}\`;
    `,
    `
let value = [];
value.toString();
let text = \`\${value}\`;
    `,
    `
let value = /regex/;
value.toString();
let text = \`\${value}\`;
    `,
    `
let value = __dirname === 'foobar';
value.toString();
let text = \`\${value}\`;
    `,
    `
let value = {}.constructor();
value.toString();
let text = \`\${value}\`;
    `,
    `
let value = () => {};
value.toString();
let text = \`\${value}\`;
    `,
    `
let value = function () {};
value.toString();
let text = \`\${value}\`;
    `,

    // String()
    "String('');",
    "String('text');",
    'String(true);',
    'String(false);',
    'String(1);',
    'String(1n);',
    'String([]);',
    'String(/regex/);',
    "String(__dirname === 'foobar');",
    'String({}.constructor());',
    'String(() => {});',
    'String(function () {});',
    `
const String = (value: unknown) => 'safe';
String({});
    `,
    `
const String = (value: unknown) => 'safe';
function f() {
  String({});
}
    `,
    `
function String(value: unknown) {
  return 'safe';
}
function f() {
  String({});
}
    `,
    `
function someFunction() {}
someFunction.toString();
let text = \`\${someFunction}\`;
    `,
    `
function someFunction() {}
someFunction.toLocaleString();
let text = \`\${someFunction}\`;
    `,
    'unknownObject.toString();',
    'unknownObject.toLocaleString();',
    'unknownObject.someOtherMethod();',
    `
class CustomToString {
  toString() {
    return 'Hello, world!';
  }
}
'' + new CustomToString();
    `,
    `
const literalWithToString = {
  toString: () => 'Hello, world!',
};
'' + literalWithToString;
    `,
    `
const printer = (inVar: string | number | boolean) => {
  inVar.toString();
};
printer('');
printer(1);
printer(true);
    `,
    `
const printer = (inVar: string | number | boolean) => {
  inVar.toLocaleString();
};
printer('');
printer(1);
printer(true);
    `,
    'let _ = {} * {};',
    'let _ = {} / {};',
    'let _ = ({} *= {});',
    'let _ = ({} /= {});',
    'let _ = ({} = {});',
    'let _ = {} == {};',
    'let _ = {} === {};',
    'let _ = {} in {};',
    'let _ = {} & {};',
    'let _ = {} ^ {};',
    'let _ = {} << {};',
    'let _ = {} >> {};',
    `
function tag() {}
tag\`\${{}}\`;
    `,
    `
interface Brand {}
function test(v: string & Brand): string {
  return \`\${v}\`;
}
    `,
    "'' += new Error();",
    "'' += new URL();",
    "'' += new URLSearchParams();",
    `
Number(1);
    `,
    {
      code: 'String(/regex/);',
      options: [{ ignoredTypeNames: ['RegExp'] }],
    },
    {
      code: `
type Foo = { a: string } | { b: string };
declare const foo: Foo;
String(foo);
      `,
      options: [{ ignoredTypeNames: ['Foo'] }],
    },
    {
      code: `
interface MyError<T> {}
declare const error: MyError<number>;
error.toString();
      `,
      options: [{ ignoredTypeNames: ['MyError'] }],
    },
    {
      code: `
type MyError<T> = {};
declare const error: MyError<number>;
error.toString();
      `,
      options: [{ ignoredTypeNames: ['MyError'] }],
    },
    {
      code: `
class MyError<T> {}
declare const error: MyError<number>;
error.toString();
      `,
      options: [{ ignoredTypeNames: ['MyError'] }],
    },
    {
      code: `
interface Animal {}
interface Serializable {}
interface Cat extends Animal, Serializable {}

declare const whiskers: Cat;
whiskers.toString();
      `,
      options: [{ ignoredTypeNames: ['Animal'] }],
    },
    {
      code: `
interface MyError extends Error {}

declare const error: MyError;
error.toString();
      `,
    },
    {
      code: `
class BaseError extends Error {
  code?: string;
}

class Boom<T> extends BaseError {
  details: T;
}

function bar<T>(error: Boom<T>) {
  console.log(error.toString());
}
      `,
    },
    {
      code: `
class UnknownBase {}
class CustomError extends UnknownBase {}

declare const err: CustomError;
err.toString();
      `,
      options: [{ ignoredTypeNames: ['UnknownBase'] }],
    },
    {
      code: `
interface Animal {}
interface Dog extends Animal {}
interface Cat extends Animal {}

declare const dog: Dog;
declare const cat: Cat;
cat.toString();
      `,
      options: [{ ignoredTypeNames: ['Animal'] }],
    },
    `
function String(value) {
  return value;
}
declare const myValue: object;
String(myValue);
    `,
    `
import { String } from 'foo';
String({});
    `,
    `
class Foo {
  toString(): string;
  toString(options: { verbose: boolean }): string;
  toString(options?: { verbose: boolean }) {
    return 'Hello, world!';
  }
}
'' + new Foo();
    `,
    `
class Foo {
  toString(prefix?: string): string {
    return (prefix ?? '') + 'Hello, world!';
  }
}
'' + new Foo();
    `,
    `
declare module 'guid' {
  export function toString(id: number): string;
  export function toString(id: number, format: string): string;
}
import * as GUID from 'guid';
GUID.toString(123);
    `,
    `
['foo', 'bar'].join('');
    `,

    `
([{ foo: 'foo' }, 'bar'] as string[]).join('');
    `,
    `
function foo<T extends string>(array: T[]) {
  return array.join();
}
    `,
    `
class Foo {
  toString() {
    return '';
  }
}
[new Foo()].join();
    `,
    `
class Foo {
  join() {}
}
const foo = new Foo();
foo.join();
    `,
    `
declare const array: string[];
array.join('');
    `,
    `
class Foo {
  foo: string;
}
declare const array: (string & Foo)[];
array.join('');
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] | (string & Bar)[];
array.join('');
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] & (string & Bar)[];
array.join('');
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const tuple: [string & Foo, string & Bar];
tuple.join('');
    `,
    `
class Foo {
  foo: string;
}
declare const tuple: [string] & [Foo];
tuple.join('');
    `,

    `
String(['foo', 'bar']);
    `,

    `
String([{ foo: 'foo' }, 'bar'] as string[]);
    `,
    `
function foo<T extends string>(array: T[]) {
  return String(array);
}
    `,
    `
class Foo {
  toString() {
    return '';
  }
}
String([new Foo()]);
    `,
    `
declare const array: string[];
String(array);
    `,
    `
class Foo {
  foo: string;
}
declare const array: (string & Foo)[];
String(array);
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] | (string & Bar)[];
String(array);
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] & (string & Bar)[];
String(array);
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const tuple: [string & Foo, string & Bar];
String(tuple);
    `,
    `
class Foo {
  foo: string;
}
declare const tuple: [string] & [Foo];
String(tuple);
    `,

    `
['foo', 'bar'].toString();
    `,

    `
([{ foo: 'foo' }, 'bar'] as string[]).toString();
    `,
    `
function foo<T extends string>(array: T[]) {
  return array.toString();
}
    `,
    `
class Foo {
  toString() {
    return '';
  }
}
[new Foo()].toString();
    `,
    `
declare const array: string[];
array.toString();
    `,
    `
class Foo {
  foo: string;
}
declare const array: (string & Foo)[];
array.toString();
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] | (string & Bar)[];
array.toString();
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] & (string & Bar)[];
array.toString();
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const tuple: [string & Foo, string & Bar];
tuple.toString();
    `,
    `
class Foo {
  foo: string;
}
declare const tuple: [string] & [Foo];
tuple.toString();
    `,

    `
\`\${['foo', 'bar']}\`;
    `,

    `
\`\${[{ foo: 'foo' }, 'bar'] as string[]}\`;
    `,
    `
function foo<T extends string>(array: T[]) {
  return \`\${array}\`;
}
    `,
    `
class Foo {
  toString() {
    return '';
  }
}
\`\${[new Foo()]}\`;
    `,
    `
declare const array: string[];
\`\${array}\`;
    `,
    `
class Foo {
  foo: string;
}
declare const array: (string & Foo)[];
\`\${array}\`;
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] | (string & Bar)[];
\`\${array}\`;
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] & (string & Bar)[];
\`\${array}\`;
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const tuple: [string & Foo, string & Bar];
\`\${tuple}\`;
    `,
    `
class Foo {
  foo: string;
}
declare const tuple: [string] & [Foo];
\`\${tuple}\`;
    `,

    // don't bother trying to interpret spread args.
    `
let objects = [{}, {}];
String(...objects);
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/8585
    `
type Constructable<Entity> = abstract new (...args: any[]) => Entity;

interface GuildChannel {
  toString(): \`<#\${string}>\`;
}

declare const foo: Constructable<GuildChannel & { bar: 1 }>;
class ExtendedGuildChannel extends foo {}
declare const bb: ExtendedGuildChannel;
bb.toString();
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/8585 with intersection order reversed.
    `
type Constructable<Entity> = abstract new (...args: any[]) => Entity;

interface GuildChannel {
  toString(): \`<#\${string}>\`;
}

declare const foo: Constructable<{ bar: 1 } & GuildChannel>;
class ExtendedGuildChannel extends foo {}
declare const bb: ExtendedGuildChannel;
bb.toString();
    `,
    `
type Value = string | Value[];
declare const v: Value;

String(v);
    `,
    `
type Value = (string | Value)[];
declare const v: Value;

String(v);
    `,
    `
type Value = Value[];
declare const v: Value;

String(v);
    `,
    `
type Value = [Value];
declare const v: Value;

String(v);
    `,
    `
declare const v: ('foo' | 'bar')[][];
String(v);
    `,
    `
declare const x: unknown;
\`\${x})\`;
    `,
    `
declare const x: unknown;
x.toString();
    `,
    `
declare const x: unknown;
x.toLocaleString();
    `,
    `
declare const x: unknown;
'' + x;
    `,
    `
declare const x: unknown;
String(x);
    `,
    `
declare const x: unknown;
'' += x;
    `,
    `
function foo<T>(x: T) {
  String(x);
}
    `,
    `
declare const x: any;
\`\${x})\`;
    `,
    `
declare const x: any;
x.toString();
    `,
    `
declare const x: any;
x.toLocaleString();
    `,
    `
declare const x: any;
'' + x;
    `,
    `
declare const x: any;
String(x);
    `,
    `
declare const x: any;
'' += x;
    `,
  ],
  invalid: [
    {
      code: `
declare const x: unknown;
\`\${x})\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'may', name: 'x' },
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
      options: [{ checkUnknown: true }],
    },
    {
      code: `
declare const x: unknown;
x.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'x' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
      options: [{ checkUnknown: true }],
    },
    {
      code: `
declare const x: unknown;
x.toLocaleString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'x' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
      options: [{ checkUnknown: true }],
    },
    {
      code: `
declare const x: unknown;
'' + x;
      `,
      errors: [
        {
          column: 6,
          data: { certainty: 'may', name: 'x' },
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
      options: [{ checkUnknown: true }],
    },
    {
      code: `
declare const x: unknown;
String(x);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'may', name: 'x' },
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
      options: [{ checkUnknown: true }],
    },
    {
      code: `
declare const x: unknown;
'' += x;
      `,
      errors: [
        {
          column: 7,
          data: { certainty: 'may', name: 'x' },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
      options: [{ checkUnknown: true }],
    },
    {
      code: `
function foo<T>(x: T) {
  String(x);
}
      `,
      errors: [
        {
          column: 10,
          data: { certainty: 'may', name: 'x' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
      options: [{ checkUnknown: true }],
    },
    {
      code: '`${{}})`;',
      errors: [
        {
          column: 4,
          data: { certainty: 'will', name: '{}' },
          endColumn: 6,
          endLine: 1,
          line: 1,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: '({}).toString();',
      errors: [
        {
          column: 2,
          data: { certainty: 'will', name: '{}' },
          endColumn: 4,
          endLine: 1,
          line: 1,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: '({}).toLocaleString();',
      errors: [
        {
          column: 2,
          data: { certainty: 'will', name: '{}' },
          endColumn: 4,
          endLine: 1,
          line: 1,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: "'' + {};",
      errors: [
        {
          column: 6,
          data: { certainty: 'will', name: '{}' },
          endColumn: 8,
          endLine: 1,
          line: 1,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: 'String({});',
      errors: [
        {
          column: 8,
          data: { certainty: 'will', name: '{}' },
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: "'' += {};",
      errors: [
        {
          column: 7,
          data: { certainty: 'will', name: '{}' },
          endColumn: 9,
          endLine: 1,
          line: 1,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
let someObjectOrString = Math.random() ? { a: true } : 'text';
someObjectOrString.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'someObjectOrString' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
let someObjectOrString = Math.random() ? { a: true } : 'text';
someObjectOrString.toLocaleString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'someObjectOrString' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
let someObjectOrString = Math.random() ? { a: true } : 'text';
someObjectOrString + '';
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'someObjectOrString' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
let someObjectOrObject = Math.random() ? { a: true, b: true } : { a: true };
someObjectOrObject.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'someObjectOrObject' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
let someObjectOrObject = Math.random() ? { a: true, b: true } : { a: true };
someObjectOrObject.toLocaleString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'someObjectOrObject' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
let someObjectOrObject = Math.random() ? { a: true, b: true } : { a: true };
someObjectOrObject + '';
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'someObjectOrObject' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
interface A {}
interface B {}
function test(intersection: A & B): string {
  return \`\${intersection}\`;
}
      `,
      errors: [
        {
          column: 13,
          data: { certainty: 'will', name: 'intersection' },
          endColumn: 25,
          endLine: 5,
          line: 5,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const foo: string | Foo;
\`\${foo}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'may', name: 'foo' },
          endColumn: 7,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const foo: Bar | Foo;
\`\${foo}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'will', name: 'foo' },
          endColumn: 7,
          endLine: 9,
          line: 9,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const foo: Bar & Foo;
\`\${foo}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'will', name: 'foo' },
          endColumn: 7,
          endLine: 9,
          line: 9,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
[{}, {}].join('');
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: '[{}, {}]' },
          endColumn: 9,
          endLine: 2,
          line: 2,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
const array = [{}, {}];
array.join('');
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'array' },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
class A {
  a: string;
}
[new A(), 'str'].join('');
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: "[new A(), 'str']" },
          endColumn: 17,
          endLine: 5,
          line: 5,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const array: (string | Foo)[];
array.join('');
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'array' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const array: (string & Foo) | (string | Foo)[];
array.join('');
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'array' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: Foo[] & Bar[];
array.join('');
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'array' },
          endColumn: 6,
          endLine: 9,
          line: 9,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const array: string[] | Foo[];
array.join('');
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'array' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [string, Foo];
tuple.join('');
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'tuple' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [Foo, Foo];
tuple.join('');
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'tuple' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [Foo | string, string];
tuple.join('');
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'tuple' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [string, string] | [Foo, Foo];
tuple.join('');
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'tuple' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [Foo, string] & [Foo, Foo];
tuple.join('');
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'tuple' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
const array = ['string', { foo: 'bar' }];
array.join('');
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'array' },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'baseArrayJoin',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
type Bar = Record<string, string>;
function foo<T extends string | Bar>(array: T[]) {
  return array.join();
}
      `,
      errors: [
        {
          column: 10,
          data: { certainty: 'may', name: 'array' },
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'baseArrayJoin',
        },
      ],
    },

    {
      code: `
String([{}, {}]);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'will', name: '[{}, {}]' },
          endColumn: 16,
          endLine: 2,
          line: 2,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
const array = [{}, {}];
String(array);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'will', name: 'array' },
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class A {
  a: string;
}
String([new A(), 'str']);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'may', name: "[new A(), 'str']" },
          endColumn: 24,
          endLine: 5,
          line: 5,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const array: (string | Foo)[];
String(array);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'may', name: 'array' },
          endColumn: 13,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const array: (string & Foo) | (string | Foo)[];
String(array);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'may', name: 'array' },
          endColumn: 13,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: Foo[] & Bar[];
String(array);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'will', name: 'array' },
          endColumn: 13,
          endLine: 9,
          line: 9,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const array: string[] | Foo[];
String(array);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'may', name: 'array' },
          endColumn: 13,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [string, Foo];
String(tuple);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'will', name: 'tuple' },
          endColumn: 13,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [Foo, Foo];
String(tuple);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'will', name: 'tuple' },
          endColumn: 13,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [Foo | string, string];
String(tuple);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'may', name: 'tuple' },
          endColumn: 13,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [string, string] | [Foo, Foo];
String(tuple);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'may', name: 'tuple' },
          endColumn: 13,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [Foo, string] & [Foo, Foo];
String(tuple);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'will', name: 'tuple' },
          endColumn: 13,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
const array = ['string', { foo: 'bar' }];
String(array);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'may', name: 'array' },
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
type Bar = Record<string, string>;
function foo<T extends string | Bar>(array: T[]) {
  return String(array);
}
      `,
      errors: [
        {
          column: 17,
          data: { certainty: 'may', name: 'array' },
          endColumn: 22,
          endLine: 4,
          line: 4,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
declare const a:
  | {
      [Symbol.toPrimitive](): string;
    }
  | {
      other: true;
    };

\`\${a}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'may', name: 'a' },
          endColumn: 5,
          endLine: 10,
          line: 10,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
declare const a:
  | {
      valueOf(): string;
    }
  | {
      other: true;
    };

\`\${a}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'may', name: 'a' },
          endColumn: 5,
          endLine: 10,
          line: 10,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
[{}, {}].toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: '[{}, {}]' },
          endColumn: 9,
          endLine: 2,
          line: 2,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
const array = [{}, {}];
array.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'array' },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class A {
  a: string;
}
[new A(), 'str'].toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: "[new A(), 'str']" },
          endColumn: 17,
          endLine: 5,
          line: 5,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const array: (string | Foo)[];
array.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'array' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const array: (string & Foo) | (string | Foo)[];
array.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'array' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: Foo[] & Bar[];
array.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'array' },
          endColumn: 6,
          endLine: 9,
          line: 9,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const array: string[] | Foo[];
array.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'array' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [string, Foo];
tuple.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'tuple' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [Foo, Foo];
tuple.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'tuple' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [Foo | string, string];
tuple.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'tuple' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [string, string] | [Foo, Foo];
tuple.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'tuple' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [Foo, string] & [Foo, Foo];
tuple.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'tuple' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
const array = ['string', { foo: 'bar' }];
array.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'array' },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
type Bar = Record<string, string>;
function foo<T extends string | Bar>(array: T[]) {
  return array.toString();
}
      `,
      errors: [
        {
          column: 10,
          data: { certainty: 'may', name: 'array' },
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'baseToString',
        },
      ],
    },

    {
      code: `
\`\${[{}, {}]}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'will', name: '[{}, {}]' },
          endColumn: 12,
          endLine: 2,
          line: 2,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
const array = [{}, {}];
\`\${array}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'will', name: 'array' },
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class A {
  a: string;
}
\`\${[new A(), 'str']}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'may', name: "[new A(), 'str']" },
          endColumn: 20,
          endLine: 5,
          line: 5,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const array: (string | Foo)[];
\`\${array}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'may', name: 'array' },
          endColumn: 9,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const array: (string & Foo) | (string | Foo)[];
\`\${array}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'may', name: 'array' },
          endColumn: 9,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: Foo[] & Bar[];
\`\${array}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'will', name: 'array' },
          endColumn: 9,
          endLine: 9,
          line: 9,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const array: string[] | Foo[];
\`\${array}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'may', name: 'array' },
          endColumn: 9,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [string, Foo];
\`\${tuple}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'will', name: 'tuple' },
          endColumn: 9,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [Foo, Foo];
\`\${tuple}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'will', name: 'tuple' },
          endColumn: 9,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [Foo | string, string];
\`\${tuple}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'may', name: 'tuple' },
          endColumn: 9,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [string, string] | [Foo, Foo];
\`\${tuple}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'may', name: 'tuple' },
          endColumn: 9,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const tuple: [Foo, string] & [Foo, Foo];
\`\${tuple}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'will', name: 'tuple' },
          endColumn: 9,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
const array = ['string', { foo: 'bar' }];
\`\${array}\`;
      `,
      errors: [
        {
          column: 4,
          data: { certainty: 'may', name: 'array' },
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'baseToString',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
type Bar = Record<string, string>;
function foo<T extends string | Bar>(array: T[]) {
  return \`\${array}\`;
}
      `,
      errors: [
        {
          column: 13,
          data: { certainty: 'may', name: 'array' },
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'baseToString',
        },
      ],
    },

    {
      code: `
type Bar = Record<string, string>;
function foo<T extends string | Bar>(array: T[]) {
  array[0].toString();
}
      `,
      errors: [
        {
          column: 3,
          data: { certainty: 'may', name: 'array[0]' },
          endColumn: 11,
          endLine: 4,
          line: 4,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
type Bar = Record<string, string>;
function foo<T extends string | Bar>(value: T) {
  value.toString();
}
      `,
      errors: [
        {
          column: 3,
          data: { certainty: 'may', name: 'value' },
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
type Bar = Record<string, string>;
declare const foo: Bar | string;
foo.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: 'foo' },
          endColumn: 4,
          endLine: 4,
          line: 4,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
type Bar = Record<string, string>;
function foo<T extends string | Bar>(array: T[]) {
  return array;
}
foo([{ foo: 'foo' }]).join();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: "foo([{ foo: 'foo' }])" },
          endColumn: 22,
          endLine: 6,
          line: 6,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
type Bar = Record<string, string>;
function foo<T extends string | Bar>(array: T[]) {
  return array;
}
foo([{ foo: 'foo' }, 'bar']).join();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'may', name: "foo([{ foo: 'foo' }, 'bar'])" },
          endColumn: 29,
          endLine: 6,
          line: 6,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
type Value = { foo: string } | Value[];
declare const v: Value;

String(v);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'may', name: 'v' },
          endColumn: 9,
          endLine: 5,
          line: 5,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
type Value = ({ foo: string } | Value)[];
declare const v: Value;

String(v);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'may', name: 'v' },
          endColumn: 9,
          endLine: 5,
          line: 5,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
type Value = [{ foo: string }, Value];
declare const v: Value;

String(v);
      `,
      errors: [
        {
          column: 8,
          data: { certainty: 'will', name: 'v' },
          endColumn: 9,
          endLine: 5,
          line: 5,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
declare const v: { foo: string }[][];
v.join();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'v' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
interface Dog extends Animal {}

declare const labrador: Dog;
labrador.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'labrador' },
          endColumn: 9,
          endLine: 5,
          line: 5,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
interface A extends B {}
interface B extends A {}

declare const a: A;
a.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'a' },
          endColumn: 2,
          endLine: 6,
          line: 6,
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
interface Base {}
interface Left extends Base {}
interface Right extends Base {}
interface Diamond extends Left, Right {}

declare const d: Diamond;
d.toString();
      `,
      errors: [
        {
          column: 1,
          data: { certainty: 'will', name: 'd' },
          endColumn: 2,
          endLine: 8,
          line: 8,
          messageId: 'baseToString',
        },
      ],
    },
    // Covers the `!declarations?.length` branch — mapped types have
    // no declarations for their synthesized properties.
    {
      code: `
type Mapped = { [K in 'toString']: () => string };
declare const x: Mapped;
'' + x;
      `,
      errors: [
        {
          column: 6,
          data: { certainty: 'will', name: 'x' },
          endColumn: 7,
          endLine: 4,
          line: 4,
          messageId: 'baseToString',
        },
      ],
    },
  ],
});
