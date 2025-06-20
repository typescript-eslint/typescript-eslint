import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';

import rule from '../../src/rules/prefer-nullish-coalescing';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

ruleTester.run('prefer-nullish-coalescing', rule, {
  valid: [
    `
declare let x: string;
x || 'foo';
    `,
    `
declare let x: number;
x || 'foo';
    `,
    `
declare let x: boolean;
x || 'foo';
    `,
    `
declare let x: object;
x || 'foo';
    `,
    `
declare let x: string;
x ||= 'foo';
    `,
    `
declare let x: number;
x ||= 'foo';
    `,
    `
declare let x: boolean;
x ||= 'foo';
    `,
    `
declare let x: object;
x ||= 'foo';
    `,
    `
declare let x: string | null;
x ?? 'foo';
    `,
    `
declare let x: string | null;
x ??= 'foo';
    `,
    `
declare let x: number | null;
x ?? 'foo';
    `,
    `
declare let x: number | null;
x ??= 'foo';
    `,
    `
declare let x: boolean | null;
x ?? 'foo';
    `,
    `
declare let x: boolean | null;
x ??= 'foo';
    `,
    `
declare let x: object | null;
x ?? 'foo';
    `,
    `
declare let x: object | null;
x ??= 'foo';
    `,
    `
declare let x: string | undefined;
x ?? 'foo';
    `,
    `
declare let x: string | undefined;
x ??= 'foo';
    `,
    `
declare let x: number | undefined;
x ?? 'foo';
    `,
    `
declare let x: number | undefined;
x ??= 'foo';
    `,
    `
declare let x: boolean | undefined;
x ?? 'foo';
    `,
    `
declare let x: boolean | undefined;
x ??= 'foo';
    `,
    `
declare let x: object | undefined;
x ?? 'foo';
    `,
    `
declare let x: object | undefined;
x ??= 'foo';
    `,
    `
declare let x: string | null | undefined;
x ?? 'foo';
    `,
    `
declare let x: string | null | undefined;
x ??= 'foo';
    `,
    `
declare let x: number | null | undefined;
x ?? 'foo';
    `,
    `
declare let x: number | null | undefined;
x ??= 'foo';
    `,
    `
declare let x: boolean | null | undefined;
x ?? 'foo';
    `,
    `
declare let x: boolean | null | undefined;
x ??= 'foo';
    `,
    `
declare let x: object | null | undefined;
x ?? 'foo';
    `,
    `
declare let x: object | null | undefined;
x ??= 'foo';
    `,

    {
      code: 'x !== undefined && x !== null ? x : y;',
      options: [{ ignoreTernaryTests: true }],
    },

    {
      code: "x !== undefined && x !== null ? 'foo' : 'bar';",
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x !== null && x !== undefined && x !== 5 ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === null || x === undefined || x === 5 ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === undefined && x !== null ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === undefined && x === null ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x !== undefined && x === null ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === undefined || x !== null ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === undefined || x === null ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x !== undefined || x === null ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x !== undefined || x === null ? y : x;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === null || x === null ? y : x;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === undefined || x === undefined ? y : x;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x == null ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined == null ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined != z ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x == undefined ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x != null ? y : x;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x != undefined ? y : x;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null == x ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined == x ? x : y;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null != x ? y : x;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined != x ? y : x;',
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
x !== 15 && x !== undefined ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
x !== undefined && x !== 15 ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
15 !== x && undefined !== x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
undefined !== x && 15 !== x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
15 !== x && x !== undefined ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
undefined !== x && x !== 15 ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
x !== 'foo' && x !== undefined ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
function test(value: number | undefined): number {
  return value !== foo() && value !== undefined ? value : 1;
}
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
const test = (value: boolean | undefined): boolean =>
  value !== undefined && value !== false ? value : false;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string;
x === null ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
x === null ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | null;
x === undefined ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | undefined | null;
x !== undefined ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | undefined | null;
x !== null ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: any;
x === null ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: unknown;
x === null ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string;
x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string;
!x ? y : x;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | object;
x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | object;
!x ? y : x;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number;
x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number;
!x ? y : x;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: bigint;
x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: bigint;
!x ? y : x;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: boolean;
x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: boolean;
!x ? y : x;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: object;
x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: object;
!x ? y : x;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string[];
x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string[];
!x ? y : x;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: Function;
x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: Function;
!x ? y : x;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: () => string;
x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: () => string;
!x ? y : x;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: () => string | null;
x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: () => string | null;
!x ? y : x;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: () => string | undefined;
x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: () => string | undefined;
!x ? y : x;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: () => string | null | undefined;
x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: () => string | null | undefined;
!x ? y : x;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: () => string | null;
x() ? x() : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: () => string | null;
!x() ? y : x();
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
const a = 'foo';
declare let x: (a: string | null) => string | null;
x(a) ? x(a) : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
const a = 'foo';
declare let x: (a: string | null) => string | null;
!x(a) ? y : x(a);
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string };
x.n ? x.n : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string };
!x.n ? y : x.n;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string | object };
x.n ? x.n : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string | object };
!x.n ? y : x.n;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: number };
x.n ? x.n : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: number };
!x.n ? y : x.n;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: bigint };
x.n ? x.n : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: bigint };
!x.n ? y : x.n;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: boolean };
x.n ? x.n : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: boolean };
!x.n ? y : x.n;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: object };
x ? x : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: object };
!x ? y : x;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string[] };
x.n ? x.n : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string[] };
!x.n ? y : x.n;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: Function };
x.n ? x.n : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: Function };
!x.n ? y : x.n;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: () => string };
x.n ? x.n : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: () => string };
!x.n ? y : x.n;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: () => string | null };
x.n ? x.n : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: () => string | null };
!x.n ? y : x.n;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: () => string | undefined };
x.n ? x.n : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: () => string | undefined };
!x.n ? y : x.n;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: () => string | null | undefined };
x.n ? x.n : y;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: () => string | null | undefined };
!x.n ? y : x.n;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let foo: string;
declare function makeFoo(): string;

function lazyInitialize() {
  if (!foo) {
    foo = makeFoo();
  }
}
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo) {
    foo = makeFoo();
  }
}
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo != null) {
    foo = makeFoo();
  }
}
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo == null) {
    foo = makeFoo();
    return foo;
  }
}
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo == null) {
    foo = makeFoo();
  } else {
    return 'bar';
  }
}
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo == null) {
    foo = makeFoo();
  } else if (foo.a) {
    return 'bar';
  }
}
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };
function shadowed() {
  if (foo == null) {
    const foo = makeFoo();
  }
}
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let foo: { foo: string } | null;
declare function makeFoo(): { foo: { foo: string } };
function weirdDestructuringAssignment() {
  if (foo == null) {
    ({ foo } = makeFoo());
  }
}
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare const nullOrObject: null | { a: string };

const test = nullOrObject !== undefined && null !== null ? nullOrObject : 42;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare const nullOrObject: null | { a: string };

const test = nullOrObject !== undefined && null != null ? nullOrObject : 42;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare const nullOrObject: null | { a: string };

const test =
  nullOrObject !== undefined && null != undefined ? nullOrObject : 42;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare const nullOrObject: null | { a: string };

const test = nullOrObject === undefined || null === null ? 42 : nullOrObject;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare const nullOrObject: null | { a: string };

const test = nullOrObject === undefined || null == null ? 42 : nullOrObject;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare const nullOrObject: null | { a: string };

const test =
  nullOrObject === undefined || null == undefined ? 42 : nullOrObject;
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
const a = 'b';
declare let x: { a: string; b: string } | null;

x?.a != null ? x[a] : 'foo';
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
const a = 'b';
declare let x: { a: string; b: string } | null;

x?.[a] != null ? x.a : 'foo';
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { a: string } | null;
declare let y: { a: string } | null;

x?.a ? y?.a : 'foo';
      `,
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (!foo) {
    foo = makeFoo();
  }
}
      `,
      options: [{ ignoreIfStatements: true }],
    },
    {
      code: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (!foo) foo = makeFoo();
}
      `,
      options: [{ ignoreIfStatements: true }],
    },

    // ignoreConditionalTests
    `
declare let x: string | null;
x || 'foo' ? null : null;
    `,
    `
declare let x: string | null;
(x ||= 'foo') ? null : null;
    `,
    `
declare let x: number | null;
x || 'foo' ? null : null;
    `,
    `
declare let x: number | null;
(x ||= 'foo') ? null : null;
    `,
    `
declare let x: boolean | null;
x || 'foo' ? null : null;
    `,
    `
declare let x: boolean | null;
(x ||= 'foo') ? null : null;
    `,
    `
declare let x: object | null;
x || 'foo' ? null : null;
    `,
    `
declare let x: object | null;
(x ||= 'foo') ? null : null;
    `,
    `
declare let x: string | undefined;
x || 'foo' ? null : null;
    `,
    `
declare let x: string | undefined;
(x ||= 'foo') ? null : null;
    `,
    `
declare let x: number | undefined;
x || 'foo' ? null : null;
    `,
    `
declare let x: number | undefined;
(x ||= 'foo') ? null : null;
    `,
    `
declare let x: boolean | undefined;
x || 'foo' ? null : null;
    `,
    `
declare let x: boolean | undefined;
(x ||= 'foo') ? null : null;
    `,
    `
declare let x: object | undefined;
x || 'foo' ? null : null;
    `,
    `
declare let x: object | undefined;
(x ||= 'foo') ? null : null;
    `,
    `
declare let x: string | null | undefined;
x || 'foo' ? null : null;
    `,
    `
declare let x: string | null | undefined;
(x ||= 'foo') ? null : null;
    `,
    `
declare let x: number | null | undefined;
x || 'foo' ? null : null;
    `,
    `
declare let x: number | null | undefined;
(x ||= 'foo') ? null : null;
    `,
    `
declare let x: boolean | null | undefined;
x || 'foo' ? null : null;
    `,
    `
declare let x: boolean | null | undefined;
(x ||= 'foo') ? null : null;
    `,
    `
declare let x: object | null | undefined;
x || 'foo' ? null : null;
    `,
    `
declare let x: object | null | undefined;
(x ||= 'foo') ? null : null;
    `,
    `
declare let x: string | null;
if (x || 'foo') {
}
    `,
    `
declare let x: string | null;
if ((x ||= 'foo')) {
}
    `,
    `
declare let x: number | null;
if (x || 'foo') {
}
    `,
    `
declare let x: number | null;
if ((x ||= 'foo')) {
}
    `,
    `
declare let x: boolean | null;
if (x || 'foo') {
}
    `,
    `
declare let x: boolean | null;
if ((x ||= 'foo')) {
}
    `,
    `
declare let x: object | null;
if (x || 'foo') {
}
    `,
    `
declare let x: object | null;
if ((x ||= 'foo')) {
}
    `,
    `
declare let x: string | undefined;
if (x || 'foo') {
}
    `,
    `
declare let x: string | undefined;
if ((x ||= 'foo')) {
}
    `,
    `
declare let x: number | undefined;
if (x || 'foo') {
}
    `,
    `
declare let x: number | undefined;
if ((x ||= 'foo')) {
}
    `,
    `
declare let x: boolean | undefined;
if (x || 'foo') {
}
    `,
    `
declare let x: boolean | undefined;
if ((x ||= 'foo')) {
}
    `,
    `
declare let x: object | undefined;
if (x || 'foo') {
}
    `,
    `
declare let x: object | undefined;
if ((x ||= 'foo')) {
}
    `,
    `
declare let x: string | null | undefined;
if (x || 'foo') {
}
    `,
    `
declare let x: string | null | undefined;
if ((x ||= 'foo')) {
}
    `,
    `
declare let x: number | null | undefined;
if (x || 'foo') {
}
    `,
    `
declare let x: number | null | undefined;
if ((x ||= 'foo')) {
}
    `,
    `
declare let x: boolean | null | undefined;
if (x || 'foo') {
}
    `,
    `
declare let x: boolean | null | undefined;
if ((x ||= 'foo')) {
}
    `,
    `
declare let x: object | null | undefined;
if (x || 'foo') {
}
    `,
    `
declare let x: object | null | undefined;
if ((x ||= 'foo')) {
}
    `,
    `
declare let x: string | null;
do {} while (x || 'foo');
    `,
    `
declare let x: string | null;
do {} while ((x ||= 'foo'));
    `,
    `
declare let x: number | null;
do {} while (x || 'foo');
    `,
    `
declare let x: number | null;
do {} while ((x ||= 'foo'));
    `,
    `
declare let x: boolean | null;
do {} while (x || 'foo');
    `,
    `
declare let x: boolean | null;
do {} while ((x ||= 'foo'));
    `,
    `
declare let x: object | null;
do {} while (x || 'foo');
    `,
    `
declare let x: object | null;
do {} while ((x ||= 'foo'));
    `,
    `
declare let x: string | undefined;
do {} while (x || 'foo');
    `,
    `
declare let x: string | undefined;
do {} while ((x ||= 'foo'));
    `,
    `
declare let x: number | undefined;
do {} while (x || 'foo');
    `,
    `
declare let x: number | undefined;
do {} while ((x ||= 'foo'));
    `,
    `
declare let x: boolean | undefined;
do {} while (x || 'foo');
    `,
    `
declare let x: boolean | undefined;
do {} while ((x ||= 'foo'));
    `,
    `
declare let x: object | undefined;
do {} while (x || 'foo');
    `,
    `
declare let x: object | undefined;
do {} while ((x ||= 'foo'));
    `,
    `
declare let x: string | null | undefined;
do {} while (x || 'foo');
    `,
    `
declare let x: string | null | undefined;
do {} while ((x ||= 'foo'));
    `,
    `
declare let x: number | null | undefined;
do {} while (x || 'foo');
    `,
    `
declare let x: number | null | undefined;
do {} while ((x ||= 'foo'));
    `,
    `
declare let x: boolean | null | undefined;
do {} while (x || 'foo');
    `,
    `
declare let x: boolean | null | undefined;
do {} while ((x ||= 'foo'));
    `,
    `
declare let x: object | null | undefined;
do {} while (x || 'foo');
    `,
    `
declare let x: object | null | undefined;
do {} while ((x ||= 'foo'));
    `,
    `
declare let x: string | null;
for (; x || 'foo'; ) {}
    `,
    `
declare let x: string | null;
for (; (x ||= 'foo'); ) {}
    `,
    `
declare let x: number | null;
for (; x || 'foo'; ) {}
    `,
    `
declare let x: number | null;
for (; (x ||= 'foo'); ) {}
    `,
    `
declare let x: boolean | null;
for (; x || 'foo'; ) {}
    `,
    `
declare let x: boolean | null;
for (; (x ||= 'foo'); ) {}
    `,
    `
declare let x: object | null;
for (; x || 'foo'; ) {}
    `,
    `
declare let x: object | null;
for (; (x ||= 'foo'); ) {}
    `,
    `
declare let x: string | undefined;
for (; x || 'foo'; ) {}
    `,
    `
declare let x: string | undefined;
for (; (x ||= 'foo'); ) {}
    `,
    `
declare let x: number | undefined;
for (; x || 'foo'; ) {}
    `,
    `
declare let x: number | undefined;
for (; (x ||= 'foo'); ) {}
    `,
    `
declare let x: boolean | undefined;
for (; x || 'foo'; ) {}
    `,
    `
declare let x: boolean | undefined;
for (; (x ||= 'foo'); ) {}
    `,
    `
declare let x: object | undefined;
for (; x || 'foo'; ) {}
    `,
    `
declare let x: object | undefined;
for (; (x ||= 'foo'); ) {}
    `,
    `
declare let x: string | null | undefined;
for (; x || 'foo'; ) {}
    `,
    `
declare let x: string | null | undefined;
for (; (x ||= 'foo'); ) {}
    `,
    `
declare let x: number | null | undefined;
for (; x || 'foo'; ) {}
    `,
    `
declare let x: number | null | undefined;
for (; (x ||= 'foo'); ) {}
    `,
    `
declare let x: boolean | null | undefined;
for (; x || 'foo'; ) {}
    `,
    `
declare let x: boolean | null | undefined;
for (; (x ||= 'foo'); ) {}
    `,
    `
declare let x: object | null | undefined;
for (; x || 'foo'; ) {}
    `,
    `
declare let x: object | null | undefined;
for (; (x ||= 'foo'); ) {}
    `,
    `
declare let x: string | null;
while (x || 'foo') {}
    `,
    `
declare let x: string | null;
while ((x ||= 'foo')) {}
    `,
    `
declare let x: number | null;
while (x || 'foo') {}
    `,
    `
declare let x: number | null;
while ((x ||= 'foo')) {}
    `,
    `
declare let x: boolean | null;
while (x || 'foo') {}
    `,
    `
declare let x: boolean | null;
while ((x ||= 'foo')) {}
    `,
    `
declare let x: object | null;
while (x || 'foo') {}
    `,
    `
declare let x: object | null;
while ((x ||= 'foo')) {}
    `,
    `
declare let x: string | undefined;
while (x || 'foo') {}
    `,
    `
declare let x: string | undefined;
while ((x ||= 'foo')) {}
    `,
    `
declare let x: number | undefined;
while (x || 'foo') {}
    `,
    `
declare let x: number | undefined;
while ((x ||= 'foo')) {}
    `,
    `
declare let x: boolean | undefined;
while (x || 'foo') {}
    `,
    `
declare let x: boolean | undefined;
while ((x ||= 'foo')) {}
    `,
    `
declare let x: object | undefined;
while (x || 'foo') {}
    `,
    `
declare let x: object | undefined;
while ((x ||= 'foo')) {}
    `,
    `
declare let x: string | null | undefined;
while (x || 'foo') {}
    `,
    `
declare let x: string | null | undefined;
while ((x ||= 'foo')) {}
    `,
    `
declare let x: number | null | undefined;
while (x || 'foo') {}
    `,
    `
declare let x: number | null | undefined;
while ((x ||= 'foo')) {}
    `,
    `
declare let x: boolean | null | undefined;
while (x || 'foo') {}
    `,
    `
declare let x: boolean | null | undefined;
while ((x ||= 'foo')) {}
    `,
    `
declare let x: object | null | undefined;
while (x || 'foo') {}
    `,
    `
declare let x: object | null | undefined;
while ((x ||= 'foo')) {}
    `,

    // ignoreMixedLogicalExpressions
    {
      code: `
declare let a: string | null;
declare let b: string | null;
declare let c: string | null;
a || (b && c);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: number | null;
declare let b: number | null;
declare let c: number | null;
a || (b && c);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: boolean | null;
declare let b: boolean | null;
declare let c: boolean | null;
a || (b && c);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: object | null;
declare let b: object | null;
declare let c: object | null;
a || (b && c);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: string | undefined;
declare let b: string | undefined;
declare let c: string | undefined;
a || (b && c);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: number | undefined;
declare let b: number | undefined;
declare let c: number | undefined;
a || (b && c);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: boolean | undefined;
declare let b: boolean | undefined;
declare let c: boolean | undefined;
a || (b && c);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: object | undefined;
declare let b: object | undefined;
declare let c: object | undefined;
a || (b && c);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: string | null | undefined;
declare let b: string | null | undefined;
declare let c: string | null | undefined;
a || (b && c);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: number | null | undefined;
declare let b: number | null | undefined;
declare let c: number | null | undefined;
a || (b && c);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: boolean | null | undefined;
declare let b: boolean | null | undefined;
declare let c: boolean | null | undefined;
a || (b && c);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: object | null | undefined;
declare let b: object | null | undefined;
declare let c: object | null | undefined;
a || (b && c);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: string | null;
declare let b: string | null;
declare let c: string | null;
declare let d: string | null;
a || b || (c && d);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: number | null;
declare let b: number | null;
declare let c: number | null;
declare let d: number | null;
a || b || (c && d);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: boolean | null;
declare let b: boolean | null;
declare let c: boolean | null;
declare let d: boolean | null;
a || b || (c && d);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: object | null;
declare let b: object | null;
declare let c: object | null;
declare let d: object | null;
a || b || (c && d);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: string | undefined;
declare let b: string | undefined;
declare let c: string | undefined;
declare let d: string | undefined;
a || b || (c && d);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: number | undefined;
declare let b: number | undefined;
declare let c: number | undefined;
declare let d: number | undefined;
a || b || (c && d);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: boolean | undefined;
declare let b: boolean | undefined;
declare let c: boolean | undefined;
declare let d: boolean | undefined;
a || b || (c && d);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: object | undefined;
declare let b: object | undefined;
declare let c: object | undefined;
declare let d: object | undefined;
a || b || (c && d);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: string | null | undefined;
declare let b: string | null | undefined;
declare let c: string | null | undefined;
declare let d: string | null | undefined;
a || b || (c && d);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: number | null | undefined;
declare let b: number | null | undefined;
declare let c: number | null | undefined;
declare let d: number | null | undefined;
a || b || (c && d);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: boolean | null | undefined;
declare let b: boolean | null | undefined;
declare let c: boolean | null | undefined;
declare let d: boolean | null | undefined;
a || b || (c && d);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: object | null | undefined;
declare let b: object | null | undefined;
declare let c: object | null | undefined;
declare let d: object | null | undefined;
a || b || (c && d);
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: string | null;
declare let b: string | null;
declare let c: string | null;
declare let d: string | null;
(a && b) || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: number | null;
declare let b: number | null;
declare let c: number | null;
declare let d: number | null;
(a && b) || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: boolean | null;
declare let b: boolean | null;
declare let c: boolean | null;
declare let d: boolean | null;
(a && b) || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: object | null;
declare let b: object | null;
declare let c: object | null;
declare let d: object | null;
(a && b) || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: string | undefined;
declare let b: string | undefined;
declare let c: string | undefined;
declare let d: string | undefined;
(a && b) || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: number | undefined;
declare let b: number | undefined;
declare let c: number | undefined;
declare let d: number | undefined;
(a && b) || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: boolean | undefined;
declare let b: boolean | undefined;
declare let c: boolean | undefined;
declare let d: boolean | undefined;
(a && b) || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: object | undefined;
declare let b: object | undefined;
declare let c: object | undefined;
declare let d: object | undefined;
(a && b) || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: string | null | undefined;
declare let b: string | null | undefined;
declare let c: string | null | undefined;
declare let d: string | null | undefined;
(a && b) || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: number | null | undefined;
declare let b: number | null | undefined;
declare let c: number | null | undefined;
declare let d: number | null | undefined;
(a && b) || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: boolean | null | undefined;
declare let b: boolean | null | undefined;
declare let c: boolean | null | undefined;
declare let d: boolean | null | undefined;
(a && b) || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let a: object | null | undefined;
declare let b: object | null | undefined;
declare let c: object | null | undefined;
declare let d: object | null | undefined;
(a && b) || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    },
    {
      code: `
declare let x: string | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { string: true } }],
    },
    {
      code: `
declare let x: number | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { number: true } }],
    },
    {
      code: `
declare let x: boolean | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { boolean: true } }],
    },
    {
      code: `
declare let x: bigint | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { bigint: true } }],
    },
    {
      code: `
declare let x: string | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: number | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: boolean | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: bigint | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: (string & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { string: true } }],
    },
    {
      code: `
declare let x: (number & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { number: true } }],
    },
    {
      code: `
declare let x: (boolean & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { boolean: true } }],
    },
    {
      code: `
declare let x: (bigint & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { bigint: true } }],
    },
    {
      code: `
declare let x: (string & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: (number & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: (boolean & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: (bigint & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: string | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: { string: true } }],
    },
    {
      code: `
declare let x: number | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: { number: true } }],
    },
    {
      code: `
declare let x: boolean | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: { boolean: true } }],
    },
    {
      code: `
declare let x: bigint | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: { bigint: true } }],
    },
    {
      code: `
declare let x: string | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: { string: true } }],
    },
    {
      code: `
declare let x: number | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: { number: true } }],
    },
    {
      code: `
declare let x: boolean | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: { boolean: true } }],
    },
    {
      code: `
declare let x: bigint | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: { bigint: true } }],
    },
    {
      code: `
declare let x: string | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: number | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: boolean | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: bigint | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: string | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: number | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: boolean | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: bigint | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: (string & { __brand?: any }) | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: { string: true } }],
    },
    {
      code: `
declare let x: (number & { __brand?: any }) | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: { number: true } }],
    },
    {
      code: `
declare let x: (boolean & { __brand?: any }) | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: { boolean: true } }],
    },
    {
      code: `
declare let x: (bigint & { __brand?: any }) | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: { bigint: true } }],
    },
    {
      code: `
declare let x: (string & { __brand?: any }) | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: { string: true } }],
    },
    {
      code: `
declare let x: (number & { __brand?: any }) | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: { number: true } }],
    },
    {
      code: `
declare let x: (boolean & { __brand?: any }) | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: { boolean: true } }],
    },
    {
      code: `
declare let x: (bigint & { __brand?: any }) | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: { bigint: true } }],
    },
    {
      code: `
declare let x: (string & { __brand?: any }) | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: (number & { __brand?: any }) | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: (boolean & { __brand?: any }) | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: (bigint & { __brand?: any }) | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: (string & { __brand?: any }) | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: (number & { __brand?: any }) | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: (boolean & { __brand?: any }) | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: true }],
    },
    {
      code: `
declare let x: (bigint & { __brand?: any }) | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: true }],
    },
    `
      declare let x: never;
      declare let y: number;
      x || y;
    `,
    `
      declare let x: never;
      declare let y: number;
      x ? x : y;
    `,
    `
      declare let x: never;
      declare let y: number;
      !x ? y : x;
    `,
    `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b !== null ? defaultBoxOptional.a?.b : getFallbackBox();
    `,
    `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | null } };

defaultBoxOptional.a?.b !== null ? defaultBoxOptional.a?.b : getFallbackBox();
    `,
    `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | null } };

defaultBoxOptional.a?.b !== undefined
  ? defaultBoxOptional.a?.b
  : getFallbackBox();
    `,
    `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | null } };

defaultBoxOptional.a?.b !== undefined
  ? defaultBoxOptional.a.b
  : getFallbackBox();
    `,
    {
      code: `
declare let x: 0 | 1 | 0n | 1n | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 1 | 0n | 1n | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 'foo' | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
            string: true,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 'foo' | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
            string: false,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum.A | Enum.B | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            string: true,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum.A | Enum.B | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            string: true,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 1 | 0n | 1n | undefined;
x ? x : y;
      `,
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 1 | 0n | 1n | undefined;
!x ? y : x;
      `,
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 1 | 0n | 1n | undefined;
x ? x : y;
      `,
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 1 | 0n | 1n | undefined;
!x ? y : x;
      `,
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 'foo' | undefined;
x ? x : y;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
            string: true,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 'foo' | undefined;
!x ? y : x;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
            string: true,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 'foo' | undefined;
x ? x : y;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
            string: false,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 'foo' | undefined;
!x ? y : x;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
            string: false,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum | undefined;
x ? x : y;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum | undefined;
!x ? y : x;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum.A | Enum.B | undefined;
x ? x : y;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum.A | Enum.B | undefined;
!x ? y : x;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum | undefined;
x ? x : y;
      `,
      options: [
        {
          ignorePrimitives: {
            string: true,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum | undefined;
!x ? y : x;
      `,
      options: [
        {
          ignorePrimitives: {
            string: true,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum.A | Enum.B | undefined;
x ? x : y;
      `,
      options: [
        {
          ignorePrimitives: {
            string: true,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum.A | Enum.B | undefined;
!x ? y : x;
      `,
      options: [
        {
          ignorePrimitives: {
            string: true,
          },
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(a || b);
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean(a || b || c);
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean(a || (b && c));
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean((a || b) ?? c);
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean(a ?? (b || c));
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean(a ? b || c : 'fail');
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean(a ? 'success' : b || c);
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean(((a = b), b || c));
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(a ? a : b);
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;

const test = Boolean(!a ? b : a);
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean((a ? a : b) || c);
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean(c || (!a ? b : a));
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if (a || b || c) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if (a || (b && c)) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if ((a || b) ?? c) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if (a ?? (b || c)) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if (a ? b || c : 'fail') {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if (a ? 'success' : b || c) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if (((a = b), b || c)) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | undefined;
let b: string | undefined;

if (!(a || b)) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | undefined;
let b: string | undefined;

if (!!(a || b)) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

if (a ? a : b) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;

if (!a ? b : a) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if ((a ? a : b) || c) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if (c || (!a ? b : a)) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },

    {
      code: `
declare const a: any;
declare const b: any;
a ? a : b;
      `,
      options: [
        {
          ignorePrimitives: true,
        },
      ],
    },

    {
      code: `
declare const a: any;
declare const b: any;
a ? a : b;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
          },
        },
      ],
    },

    {
      code: `
declare const a: unknown;
const b = a || 'bar';
      `,
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: false,
            string: false,
          },
        },
      ],
    },
  ],

  invalid: [
    {
      code: `
declare let x: string | null;
x || 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
x ?? 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | null;
x ||= 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
x ??= 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | null;
x || 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
x ?? 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | null;
x ||= 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
x ??= 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | null;
x || 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
x ?? 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | null;
x ||= 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
x ??= 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | null;
x || 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
x ?? 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | null;
x ||= 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
x ??= 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | undefined;
x || 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
x ?? 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | undefined;
x ||= 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
x ??= 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | undefined;
x || 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
x ?? 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | undefined;
x ||= 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
x ??= 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | undefined;
x || 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
x ?? 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | undefined;
x ||= 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
x ??= 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | undefined;
x || 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
x ?? 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | undefined;
x ||= 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
x ??= 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | null | undefined;
x || 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
x ?? 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | null | undefined;
x ||= 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
x ??= 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | null | undefined;
x || 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
x ?? 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | null | undefined;
x ||= 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
x ??= 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | null | undefined;
x || 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
x ?? 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | null | undefined;
x ||= 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
x ??= 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | null | undefined;
x || 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
x ?? 'foo';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | null | undefined;
x ||= 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
x ??= 'foo';
      `,
            },
          ],
        },
      ],
    },

    {
      code: 'x !== undefined && x !== null ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] !== undefined &&
x.z[1][this[this.o]]['3'][a.b.c] !== null
  ? x.z[1][this[this.o]]['3'][a.b.c]
  : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x !== undefined && x !== null ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x !== null && x !== undefined ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] !== null &&
x.z[1][this[this.o]]['3'][a.b.c] !== undefined
  ? x.z[1][this[this.o]]['3'][a.b.c]
  : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x !== null && x !== undefined ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === undefined || x === null ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] === undefined ||
x.z[1][this[this.o]]['3'][a.b.c] === null
  ? y
  : x.z[1][this[this.o]]['3'][a.b.c];
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === undefined || x === null ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === null || x === undefined ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] === null ||
x.z[1][this[this.o]]['3'][a.b.c] === undefined
  ? y
  : x.z[1][this[this.o]]['3'][a.b.c];
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === null || x === undefined ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined !== x && x !== null ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
undefined !== x.z[1][this[this.o]]['3'][a.b.c] &&
x.z[1][this[this.o]]['3'][a.b.c] !== null
  ? x.z[1][this[this.o]]['3'][a.b.c]
  : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined !== x && x !== null ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null !== x && x !== undefined ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
null !== x.z[1][this[this.o]]['3'][a.b.c] &&
x.z[1][this[this.o]]['3'][a.b.c] !== undefined
  ? x.z[1][this[this.o]]['3'][a.b.c]
  : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null !== x && x !== undefined ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined === x || x === null ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
undefined === x.z[1][this[this.o]]['3'][a.b.c] ||
x.z[1][this[this.o]]['3'][a.b.c] === null
  ? y
  : x.z[1][this[this.o]]['3'][a.b.c];
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined === x || x === null ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null === x || x === undefined ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
null === x.z[1][this[this.o]]['3'][a.b.c] ||
x.z[1][this[this.o]]['3'][a.b.c] === undefined
  ? y
  : x.z[1][this[this.o]]['3'][a.b.c];
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null === x || x === undefined ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x !== undefined && null !== x ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] !== undefined &&
null !== x.z[1][this[this.o]]['3'][a.b.c]
  ? x.z[1][this[this.o]]['3'][a.b.c]
  : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x !== undefined && null !== x ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x !== null && undefined !== x ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] !== null &&
undefined !== x.z[1][this[this.o]]['3'][a.b.c]
  ? x.z[1][this[this.o]]['3'][a.b.c]
  : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x !== null && undefined !== x ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === undefined || null === x ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] === undefined ||
null === x.z[1][this[this.o]]['3'][a.b.c]
  ? y
  : x.z[1][this[this.o]]['3'][a.b.c];
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === undefined || null === x ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === null || undefined === x ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] === null ||
undefined === x.z[1][this[this.o]]['3'][a.b.c]
  ? y
  : x.z[1][this[this.o]]['3'][a.b.c];
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x === null || undefined === x ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined !== x && null !== x ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
undefined !== x.z[1][this[this.o]]['3'][a.b.c] &&
null !== x.z[1][this[this.o]]['3'][a.b.c]
  ? x.z[1][this[this.o]]['3'][a.b.c]
  : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined !== x && null !== x ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null !== x && undefined !== x ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
null !== x.z[1][this[this.o]]['3'][a.b.c] &&
undefined !== x.z[1][this[this.o]]['3'][a.b.c]
  ? x.z[1][this[this.o]]['3'][a.b.c]
  : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null !== x && undefined !== x ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined === x || null === x ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
undefined === x.z[1][this[this.o]]['3'][a.b.c] ||
null === x.z[1][this[this.o]]['3'][a.b.c]
  ? y
  : x.z[1][this[this.o]]['3'][a.b.c];
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined === x || null === x ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null === x || undefined === x ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
null === x.z[1][this[this.o]]['3'][a.b.c] ||
undefined === x.z[1][this[this.o]]['3'][a.b.c]
  ? y
  : x.z[1][this[this.o]]['3'][a.b.c];
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null === x || undefined === x ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x != undefined && x != null ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] != undefined &&
x.z[1][this[this.o]]['3'][a.b.c] != null
  ? x.z[1][this[this.o]]['3'][a.b.c]
  : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x != undefined && x != null ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 42,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x == undefined || x == null ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] == undefined ||
x.z[1][this[this.o]]['3'][a.b.c] == null
  ? y
  : x.z[1][this[this.o]]['3'][a.b.c];
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x == undefined || x == null ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 42,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x != undefined && x !== null ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] != undefined &&
x.z[1][this[this.o]]['3'][a.b.c] !== null
  ? x.z[1][this[this.o]]['3'][a.b.c]
  : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x != undefined && x !== null ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 43,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x == undefined || x === null ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] == undefined ||
x.z[1][this[this.o]]['3'][a.b.c] === null
  ? y
  : x.z[1][this[this.o]]['3'][a.b.c];
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x == undefined || x === null ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 43,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x !== undefined && x != null ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] !== undefined &&
x.z[1][this[this.o]]['3'][a.b.c] != null
  ? x.z[1][this[this.o]]['3'][a.b.c]
  : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 5,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x !== undefined && x != null ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 43,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined != x ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
undefined != x.z[1][this[this.o]]['3'][a.b.c]
  ? x.z[1][this[this.o]]['3'][a.b.c]
  : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 4,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined != x ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null != x ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: "null != x.z[1][this[this.o]]['3'][a.b.c] ? x.z[1][this[this.o]]['3'][a.b.c] : y;",
      errors: [
        {
          column: 1,
          endColumn: 80,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: "x.z[1][this[this.o]]['3'][a.b.c] ?? y;",
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null != x ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined == x ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
undefined == x.z[1][this[this.o]]['3'][a.b.c]
  ? y
  : x.z[1][this[this.o]]['3'][a.b.c];
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 4,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'undefined == x ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null == x ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: "null == x.z[1][this[this.o]]['3'][a.b.c] ? y : x.z[1][this[this.o]]['3'][a.b.c];",
      errors: [
        {
          column: 1,
          endColumn: 80,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: "x.z[1][this[this.o]]['3'][a.b.c] ?? y;",
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'null == x ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x != undefined ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] != undefined
  ? x.z[1][this[this.o]]['3'][a.b.c]
  : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 4,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x != undefined ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x != null ? x : y;',
      errors: [
        {
          column: 1,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: "x.z[1][this[this.o]]['3'][a.b.c] != null ? x.z[1][this[this.o]]['3'][a.b.c] : y;",
      errors: [
        {
          column: 1,
          endColumn: 80,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: "x.z[1][this[this.o]]['3'][a.b.c] ?? y;",
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x != null ? x : (z = y);',
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x == undefined ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
x.z[1][this[this.o]]['3'][a.b.c] == undefined
  ? y
  : x.z[1][this[this.o]]['3'][a.b.c];
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 4,
          line: 2,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
x.z[1][this[this.o]]['3'][a.b.c] ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x == undefined ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x == null ? y : x;',
      errors: [
        {
          column: 1,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: "x.z[1][this[this.o]]['3'][a.b.c] == null ? y : x.z[1][this[this.o]]['3'][a.b.c];",
      errors: [
        {
          column: 1,
          endColumn: 80,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: "x.z[1][this[this.o]]['3'][a.b.c] ?? y;",
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: 'x == null ? (z = y) : x;',
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: 'x ?? (z = y);',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },

    {
      code: 'this != undefined ? this : y;',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary' as const,
          suggestions: [
            {
              messageId: 'suggestNullish' as const,
              output: 'this ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }] as const,
      output: null,
    },

    {
      code: `
declare let x: string | undefined;
x !== undefined ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
undefined !== x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
x === undefined ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
undefined === x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | null;
x !== null ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | null;
null !== x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | null;
x === null ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | null;
null === x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | null;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | null;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | null | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | null | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | object | null;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | object | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | object | null;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | object | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | object | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | object | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | object | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | object | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | object | null | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | object | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string | object | null | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | object | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number | null;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number | null;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number | null | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: number | null | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: bigint | null;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: bigint | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: bigint | null;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: bigint | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: bigint | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: bigint | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: bigint | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: bigint | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: bigint | null | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: bigint | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: bigint | null | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: bigint | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: boolean | null;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: boolean | null;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: boolean | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: boolean | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: boolean | null | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: boolean | null | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string[] | null;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string[] | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string[] | null;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string[] | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string[] | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string[] | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string[] | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string[] | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string[] | null | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string[] | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: string[] | null | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string[] | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: object | null;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: object | null;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: object | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: object | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: object | null | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: object | null | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: Function | null;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: Function | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: Function | null;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: Function | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: Function | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: Function | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: Function | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: Function | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: Function | null | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: Function | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: Function | null | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: Function | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: (() => string) | null;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: (() => string) | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: (() => string) | null;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: (() => string) | null;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: (() => string) | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: (() => string) | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: (() => string) | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: (() => string) | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: (() => string) | null | undefined;
x ? x : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: (() => string) | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: (() => string) | null | undefined;
!x ? y : x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: (() => string) | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },

    {
      code: `
declare let x: { n: string | null };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string | null };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string | null | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string | null | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string | object | null };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string | object | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string | object | null };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string | object | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string | object | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string | object | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string | object | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string | object | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string | object | null | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string | object | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string | object | null | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string | object | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: number | null };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: number | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: number | null };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: number | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: number | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: number | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: number | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: number | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: number | null | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: number | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: number | null | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: number | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: bigint | null };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: bigint | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: bigint | null };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: bigint | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: bigint | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: bigint | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: bigint | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: bigint | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: bigint | null | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: bigint | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: bigint | null | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: bigint | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: boolean | null };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: boolean | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: boolean | null };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: boolean | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: boolean | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: boolean | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: boolean | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: boolean | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: boolean | null | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: boolean | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: boolean | null | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: boolean | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string[] | null };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string[] | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string[] | null };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string[] | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string[] | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string[] | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string[] | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string[] | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string[] | null | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string[] | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: string[] | null | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: string[] | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: object | null };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: object | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: object | null };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: object | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: object | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: object | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: object | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: object | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: object | null | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: object | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: object | null | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: object | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: Function | null };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: Function | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: Function | null };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: Function | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: Function | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: Function | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: Function | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: Function | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: Function | null | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: Function | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: Function | null | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: Function | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: (() => string) | null };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: (() => string) | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: (() => string) | null };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: (() => string) | null };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: (() => string) | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: (() => string) | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: (() => string) | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: (() => string) | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: (() => string) | null | undefined };
x.n ? x.n : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: (() => string) | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n: (() => string) | null | undefined };
!x.n ? y : x.n;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: (() => string) | null | undefined };
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },

    {
      code: `
declare let x: { n?: { a?: string } };
x.n?.a ? x?.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x.n?.a ? x?.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x.n?.a ? x.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x.n?.a !== undefined ? x?.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x.n?.a !== undefined ? x?.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x.n?.a !== undefined ? x.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x.n?.a != undefined ? x?.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x.n?.a != undefined ? x?.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x.n?.a != undefined ? x.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x.n?.a != null ? x?.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x.n?.a != null ? x?.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x.n?.a != null ? x.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x.n?.a !== undefined && x.n.a !== null ? x?.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 53,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x.n?.a !== undefined && x.n.a !== null ? x.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 51,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a ? x?.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a ? x.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a ? x?.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a ? x.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a !== undefined ? x?.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 36,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a !== undefined ? x.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a !== undefined ? x?.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a !== undefined ? x.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a != undefined ? x?.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a != undefined ? x.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a != undefined ? x?.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a != undefined ? x.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a != null ? x?.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a != null ? x.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a != null ? x?.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string } };
x?.n?.a != null ? x.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x?.n?.a !== undefined && x.n.a !== null ? x?.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 54,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x?.n?.a !== undefined && x.n.a !== null ? x.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 53,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x?.n?.a !== undefined && x.n.a !== null ? x?.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 53,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x?.n?.a !== undefined && x.n.a !== null ? x.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 52,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x?.n?.a !== undefined && x.n.a !== null ? (x?.n).a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 55,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ? x?.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ? x.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ? x?.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ? x.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ? (x?.n).a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },

    {
      code: `
declare let x: { n?: { a?: string | null } };
x.n?.a ? x?.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x.n?.a ? x.n?.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x.n?.a ? x?.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x.n?.a ? x.n.a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },
    {
      code: `
declare let x: { n?: { a?: string | null } };
x.n?.a ? (x?.n).a : y;
      `,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n?: { a?: string | null } };
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
    },

    // noStrictNullCheck
    {
      code: `
declare let x: string[] | null;
if (x) {
}
      `,
      errors: [
        {
          column: 1,
          line: 0,
          messageId: 'noStrictNullCheck',
        },
      ],
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: path.join(rootPath, 'unstrict'),
        },
      },
      output: null,
    },

    // ignoreConditionalTests
    {
      code: `
declare let x: string | null;
x || 'foo' ? null : null;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
x ?? 'foo' ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null;
(x ||= 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
(x ??= 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null;
x || 'foo' ? null : null;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
x ?? 'foo' ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null;
(x ||= 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
(x ??= 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null;
x || 'foo' ? null : null;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
x ?? 'foo' ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null;
(x ||= 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
(x ??= 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null;
x || 'foo' ? null : null;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
x ?? 'foo' ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null;
(x ||= 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
(x ??= 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
x || 'foo' ? null : null;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
x ?? 'foo' ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
(x ||= 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
(x ??= 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
x || 'foo' ? null : null;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
x ?? 'foo' ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
(x ||= 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
(x ??= 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | undefined;
x || 'foo' ? null : null;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
x ?? 'foo' ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | undefined;
(x ||= 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
(x ??= 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | undefined;
x || 'foo' ? null : null;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
x ?? 'foo' ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | undefined;
(x ||= 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
(x ??= 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null | undefined;
x || 'foo' ? null : null;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
x ?? 'foo' ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null | undefined;
(x ||= 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
(x ??= 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null | undefined;
x || 'foo' ? null : null;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
x ?? 'foo' ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null | undefined;
(x ||= 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
(x ??= 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null | undefined;
x || 'foo' ? null : null;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
x ?? 'foo' ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null | undefined;
(x ||= 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
(x ??= 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null | undefined;
x || 'foo' ? null : null;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
x ?? 'foo' ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null | undefined;
(x ||= 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
(x ??= 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null;
if (x || 'foo') {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
if (x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null;
if ((x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
if ((x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null;
if (x || 'foo') {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
if (x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null;
if ((x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
if ((x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null;
if (x || 'foo') {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
if (x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null;
if ((x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
if ((x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null;
if (x || 'foo') {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
if (x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null;
if ((x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
if ((x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
if (x || 'foo') {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
if (x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
if ((x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
if ((x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
if (x || 'foo') {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
if (x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
if ((x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
if ((x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | undefined;
if (x || 'foo') {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
if (x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | undefined;
if ((x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
if ((x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | undefined;
if (x || 'foo') {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
if (x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | undefined;
if ((x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
if ((x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null | undefined;
if (x || 'foo') {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
if (x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null | undefined;
if ((x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
if ((x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null | undefined;
if (x || 'foo') {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
if (x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null | undefined;
if ((x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
if ((x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null | undefined;
if (x || 'foo') {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
if (x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null | undefined;
if ((x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
if ((x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null | undefined;
if (x || 'foo') {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
if (x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null | undefined;
if ((x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
if ((x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null;
do {} while (x || 'foo');
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
do {} while (x ?? 'foo');
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null;
do {} while ((x ||= 'foo'));
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
do {} while ((x ??= 'foo'));
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null;
do {} while (x || 'foo');
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
do {} while (x ?? 'foo');
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null;
do {} while ((x ||= 'foo'));
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
do {} while ((x ??= 'foo'));
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null;
do {} while (x || 'foo');
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
do {} while (x ?? 'foo');
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null;
do {} while ((x ||= 'foo'));
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
do {} while ((x ??= 'foo'));
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null;
do {} while (x || 'foo');
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
do {} while (x ?? 'foo');
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null;
do {} while ((x ||= 'foo'));
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
do {} while ((x ??= 'foo'));
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
do {} while (x || 'foo');
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
do {} while (x ?? 'foo');
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
do {} while ((x ||= 'foo'));
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
do {} while ((x ??= 'foo'));
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
do {} while (x || 'foo');
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
do {} while (x ?? 'foo');
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
do {} while ((x ||= 'foo'));
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
do {} while ((x ??= 'foo'));
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | undefined;
do {} while (x || 'foo');
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
do {} while (x ?? 'foo');
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | undefined;
do {} while ((x ||= 'foo'));
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
do {} while ((x ??= 'foo'));
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | undefined;
do {} while (x || 'foo');
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
do {} while (x ?? 'foo');
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | undefined;
do {} while ((x ||= 'foo'));
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
do {} while ((x ??= 'foo'));
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null | undefined;
do {} while (x || 'foo');
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
do {} while (x ?? 'foo');
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null | undefined;
do {} while ((x ||= 'foo'));
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
do {} while ((x ??= 'foo'));
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null | undefined;
do {} while (x || 'foo');
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
do {} while (x ?? 'foo');
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null | undefined;
do {} while ((x ||= 'foo'));
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
do {} while ((x ??= 'foo'));
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null | undefined;
do {} while (x || 'foo');
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
do {} while (x ?? 'foo');
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null | undefined;
do {} while ((x ||= 'foo'));
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
do {} while ((x ??= 'foo'));
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null | undefined;
do {} while (x || 'foo');
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
do {} while (x ?? 'foo');
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null | undefined;
do {} while ((x ||= 'foo'));
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
do {} while ((x ??= 'foo'));
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null;
for (; x || 'foo'; ) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
for (; x ?? 'foo'; ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null;
for (; (x ||= 'foo'); ) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
for (; (x ??= 'foo'); ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null;
for (; x || 'foo'; ) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
for (; x ?? 'foo'; ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null;
for (; (x ||= 'foo'); ) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
for (; (x ??= 'foo'); ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null;
for (; x || 'foo'; ) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
for (; x ?? 'foo'; ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null;
for (; (x ||= 'foo'); ) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
for (; (x ??= 'foo'); ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null;
for (; x || 'foo'; ) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
for (; x ?? 'foo'; ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null;
for (; (x ||= 'foo'); ) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
for (; (x ??= 'foo'); ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
for (; x || 'foo'; ) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
for (; x ?? 'foo'; ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
for (; (x ||= 'foo'); ) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
for (; (x ??= 'foo'); ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
for (; x || 'foo'; ) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
for (; x ?? 'foo'; ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
for (; (x ||= 'foo'); ) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
for (; (x ??= 'foo'); ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | undefined;
for (; x || 'foo'; ) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
for (; x ?? 'foo'; ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | undefined;
for (; (x ||= 'foo'); ) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
for (; (x ??= 'foo'); ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | undefined;
for (; x || 'foo'; ) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
for (; x ?? 'foo'; ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | undefined;
for (; (x ||= 'foo'); ) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
for (; (x ??= 'foo'); ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null | undefined;
for (; x || 'foo'; ) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
for (; x ?? 'foo'; ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null | undefined;
for (; (x ||= 'foo'); ) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
for (; (x ??= 'foo'); ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null | undefined;
for (; x || 'foo'; ) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
for (; x ?? 'foo'; ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null | undefined;
for (; (x ||= 'foo'); ) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
for (; (x ??= 'foo'); ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null | undefined;
for (; x || 'foo'; ) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
for (; x ?? 'foo'; ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null | undefined;
for (; (x ||= 'foo'); ) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
for (; (x ??= 'foo'); ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null | undefined;
for (; x || 'foo'; ) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
for (; x ?? 'foo'; ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null | undefined;
for (; (x ||= 'foo'); ) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
for (; (x ??= 'foo'); ) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null;
while (x || 'foo') {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
while (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null;
while ((x ||= 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
while ((x ??= 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null;
while (x || 'foo') {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
while (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null;
while ((x ||= 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
while ((x ??= 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null;
while (x || 'foo') {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
while (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null;
while ((x ||= 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
while ((x ??= 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null;
while (x || 'foo') {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
while (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null;
while ((x ||= 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
while ((x ??= 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
while (x || 'foo') {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
while (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | undefined;
while ((x ||= 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
while ((x ??= 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
while (x || 'foo') {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
while (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | undefined;
while ((x ||= 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
while ((x ??= 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | undefined;
while (x || 'foo') {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
while (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | undefined;
while ((x ||= 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
while ((x ??= 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | undefined;
while (x || 'foo') {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
while (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | undefined;
while ((x ||= 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
while ((x ??= 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null | undefined;
while (x || 'foo') {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
while (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: string | null | undefined;
while ((x ||= 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
while ((x ??= 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null | undefined;
while (x || 'foo') {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
while (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: number | null | undefined;
while ((x ||= 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
while ((x ??= 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null | undefined;
while (x || 'foo') {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
while (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: boolean | null | undefined;
while ((x ||= 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
while ((x ??= 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null | undefined;
while (x || 'foo') {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
while (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },
    {
      code: `
declare let x: object | null | undefined;
while ((x ||= 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
while ((x ??= 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
    },

    // ignoreMixedLogicalExpressions
    {
      code: `
declare let a: string | null;
declare let b: string | null;
declare let c: string | null;
a || (b && c);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | null;
declare let b: string | null;
declare let c: string | null;
a ?? (b && c);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: number | null;
declare let b: number | null;
declare let c: number | null;
a || (b && c);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | null;
declare let b: number | null;
declare let c: number | null;
a ?? (b && c);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: boolean | null;
declare let b: boolean | null;
declare let c: boolean | null;
a || (b && c);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | null;
declare let b: boolean | null;
declare let c: boolean | null;
a ?? (b && c);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: object | null;
declare let b: object | null;
declare let c: object | null;
a || (b && c);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | null;
declare let b: object | null;
declare let c: object | null;
a ?? (b && c);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: string | undefined;
declare let b: string | undefined;
declare let c: string | undefined;
a || (b && c);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | undefined;
declare let b: string | undefined;
declare let c: string | undefined;
a ?? (b && c);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: number | undefined;
declare let b: number | undefined;
declare let c: number | undefined;
a || (b && c);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | undefined;
declare let b: number | undefined;
declare let c: number | undefined;
a ?? (b && c);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: boolean | undefined;
declare let b: boolean | undefined;
declare let c: boolean | undefined;
a || (b && c);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | undefined;
declare let b: boolean | undefined;
declare let c: boolean | undefined;
a ?? (b && c);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: object | undefined;
declare let b: object | undefined;
declare let c: object | undefined;
a || (b && c);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | undefined;
declare let b: object | undefined;
declare let c: object | undefined;
a ?? (b && c);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: string | null | undefined;
declare let b: string | null | undefined;
declare let c: string | null | undefined;
a || (b && c);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | null | undefined;
declare let b: string | null | undefined;
declare let c: string | null | undefined;
a ?? (b && c);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: number | null | undefined;
declare let b: number | null | undefined;
declare let c: number | null | undefined;
a || (b && c);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | null | undefined;
declare let b: number | null | undefined;
declare let c: number | null | undefined;
a ?? (b && c);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: boolean | null | undefined;
declare let b: boolean | null | undefined;
declare let c: boolean | null | undefined;
a || (b && c);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | null | undefined;
declare let b: boolean | null | undefined;
declare let c: boolean | null | undefined;
a ?? (b && c);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: object | null | undefined;
declare let b: object | null | undefined;
declare let c: object | null | undefined;
a || (b && c);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | null | undefined;
declare let b: object | null | undefined;
declare let c: object | null | undefined;
a ?? (b && c);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: string | null;
declare let b: string | null;
declare let c: string | null;
declare let d: string | null;
a || b || (c && d);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | null;
declare let b: string | null;
declare let c: string | null;
declare let d: string | null;
(a ?? b) || (c && d);
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | null;
declare let b: string | null;
declare let c: string | null;
declare let d: string | null;
a || b ?? (c && d);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: number | null;
declare let b: number | null;
declare let c: number | null;
declare let d: number | null;
a || b || (c && d);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | null;
declare let b: number | null;
declare let c: number | null;
declare let d: number | null;
(a ?? b) || (c && d);
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | null;
declare let b: number | null;
declare let c: number | null;
declare let d: number | null;
a || b ?? (c && d);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: boolean | null;
declare let b: boolean | null;
declare let c: boolean | null;
declare let d: boolean | null;
a || b || (c && d);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | null;
declare let b: boolean | null;
declare let c: boolean | null;
declare let d: boolean | null;
(a ?? b) || (c && d);
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | null;
declare let b: boolean | null;
declare let c: boolean | null;
declare let d: boolean | null;
a || b ?? (c && d);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: object | null;
declare let b: object | null;
declare let c: object | null;
declare let d: object | null;
a || b || (c && d);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | null;
declare let b: object | null;
declare let c: object | null;
declare let d: object | null;
(a ?? b) || (c && d);
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | null;
declare let b: object | null;
declare let c: object | null;
declare let d: object | null;
a || b ?? (c && d);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: string | undefined;
declare let b: string | undefined;
declare let c: string | undefined;
declare let d: string | undefined;
a || b || (c && d);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | undefined;
declare let b: string | undefined;
declare let c: string | undefined;
declare let d: string | undefined;
(a ?? b) || (c && d);
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | undefined;
declare let b: string | undefined;
declare let c: string | undefined;
declare let d: string | undefined;
a || b ?? (c && d);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: number | undefined;
declare let b: number | undefined;
declare let c: number | undefined;
declare let d: number | undefined;
a || b || (c && d);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | undefined;
declare let b: number | undefined;
declare let c: number | undefined;
declare let d: number | undefined;
(a ?? b) || (c && d);
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | undefined;
declare let b: number | undefined;
declare let c: number | undefined;
declare let d: number | undefined;
a || b ?? (c && d);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: boolean | undefined;
declare let b: boolean | undefined;
declare let c: boolean | undefined;
declare let d: boolean | undefined;
a || b || (c && d);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | undefined;
declare let b: boolean | undefined;
declare let c: boolean | undefined;
declare let d: boolean | undefined;
(a ?? b) || (c && d);
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | undefined;
declare let b: boolean | undefined;
declare let c: boolean | undefined;
declare let d: boolean | undefined;
a || b ?? (c && d);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: object | undefined;
declare let b: object | undefined;
declare let c: object | undefined;
declare let d: object | undefined;
a || b || (c && d);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | undefined;
declare let b: object | undefined;
declare let c: object | undefined;
declare let d: object | undefined;
(a ?? b) || (c && d);
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | undefined;
declare let b: object | undefined;
declare let c: object | undefined;
declare let d: object | undefined;
a || b ?? (c && d);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: string | null | undefined;
declare let b: string | null | undefined;
declare let c: string | null | undefined;
declare let d: string | null | undefined;
a || b || (c && d);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | null | undefined;
declare let b: string | null | undefined;
declare let c: string | null | undefined;
declare let d: string | null | undefined;
(a ?? b) || (c && d);
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | null | undefined;
declare let b: string | null | undefined;
declare let c: string | null | undefined;
declare let d: string | null | undefined;
a || b ?? (c && d);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: number | null | undefined;
declare let b: number | null | undefined;
declare let c: number | null | undefined;
declare let d: number | null | undefined;
a || b || (c && d);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | null | undefined;
declare let b: number | null | undefined;
declare let c: number | null | undefined;
declare let d: number | null | undefined;
(a ?? b) || (c && d);
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | null | undefined;
declare let b: number | null | undefined;
declare let c: number | null | undefined;
declare let d: number | null | undefined;
a || b ?? (c && d);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: boolean | null | undefined;
declare let b: boolean | null | undefined;
declare let c: boolean | null | undefined;
declare let d: boolean | null | undefined;
a || b || (c && d);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | null | undefined;
declare let b: boolean | null | undefined;
declare let c: boolean | null | undefined;
declare let d: boolean | null | undefined;
(a ?? b) || (c && d);
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | null | undefined;
declare let b: boolean | null | undefined;
declare let c: boolean | null | undefined;
declare let d: boolean | null | undefined;
a || b ?? (c && d);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: object | null | undefined;
declare let b: object | null | undefined;
declare let c: object | null | undefined;
declare let d: object | null | undefined;
a || b || (c && d);
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | null | undefined;
declare let b: object | null | undefined;
declare let c: object | null | undefined;
declare let d: object | null | undefined;
(a ?? b) || (c && d);
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | null | undefined;
declare let b: object | null | undefined;
declare let c: object | null | undefined;
declare let d: object | null | undefined;
a || b ?? (c && d);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: string | null;
declare let b: string | null;
declare let c: string | null;
declare let d: string | null;
(a && b) || c || d;
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | null;
declare let b: string | null;
declare let c: string | null;
declare let d: string | null;
(a && (b) ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | null;
declare let b: string | null;
declare let c: string | null;
declare let d: string | null;
(a && b) || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: number | null;
declare let b: number | null;
declare let c: number | null;
declare let d: number | null;
(a && b) || c || d;
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | null;
declare let b: number | null;
declare let c: number | null;
declare let d: number | null;
(a && (b) ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | null;
declare let b: number | null;
declare let c: number | null;
declare let d: number | null;
(a && b) || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: boolean | null;
declare let b: boolean | null;
declare let c: boolean | null;
declare let d: boolean | null;
(a && b) || c || d;
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | null;
declare let b: boolean | null;
declare let c: boolean | null;
declare let d: boolean | null;
(a && (b) ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | null;
declare let b: boolean | null;
declare let c: boolean | null;
declare let d: boolean | null;
(a && b) || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: object | null;
declare let b: object | null;
declare let c: object | null;
declare let d: object | null;
(a && b) || c || d;
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | null;
declare let b: object | null;
declare let c: object | null;
declare let d: object | null;
(a && (b) ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | null;
declare let b: object | null;
declare let c: object | null;
declare let d: object | null;
(a && b) || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: string | undefined;
declare let b: string | undefined;
declare let c: string | undefined;
declare let d: string | undefined;
(a && b) || c || d;
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | undefined;
declare let b: string | undefined;
declare let c: string | undefined;
declare let d: string | undefined;
(a && (b) ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | undefined;
declare let b: string | undefined;
declare let c: string | undefined;
declare let d: string | undefined;
(a && b) || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: number | undefined;
declare let b: number | undefined;
declare let c: number | undefined;
declare let d: number | undefined;
(a && b) || c || d;
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | undefined;
declare let b: number | undefined;
declare let c: number | undefined;
declare let d: number | undefined;
(a && (b) ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | undefined;
declare let b: number | undefined;
declare let c: number | undefined;
declare let d: number | undefined;
(a && b) || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: boolean | undefined;
declare let b: boolean | undefined;
declare let c: boolean | undefined;
declare let d: boolean | undefined;
(a && b) || c || d;
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | undefined;
declare let b: boolean | undefined;
declare let c: boolean | undefined;
declare let d: boolean | undefined;
(a && (b) ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | undefined;
declare let b: boolean | undefined;
declare let c: boolean | undefined;
declare let d: boolean | undefined;
(a && b) || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: object | undefined;
declare let b: object | undefined;
declare let c: object | undefined;
declare let d: object | undefined;
(a && b) || c || d;
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | undefined;
declare let b: object | undefined;
declare let c: object | undefined;
declare let d: object | undefined;
(a && (b) ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | undefined;
declare let b: object | undefined;
declare let c: object | undefined;
declare let d: object | undefined;
(a && b) || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: string | null | undefined;
declare let b: string | null | undefined;
declare let c: string | null | undefined;
declare let d: string | null | undefined;
(a && b) || c || d;
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | null | undefined;
declare let b: string | null | undefined;
declare let c: string | null | undefined;
declare let d: string | null | undefined;
(a && (b) ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | null | undefined;
declare let b: string | null | undefined;
declare let c: string | null | undefined;
declare let d: string | null | undefined;
(a && b) || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: number | null | undefined;
declare let b: number | null | undefined;
declare let c: number | null | undefined;
declare let d: number | null | undefined;
(a && b) || c || d;
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | null | undefined;
declare let b: number | null | undefined;
declare let c: number | null | undefined;
declare let d: number | null | undefined;
(a && (b) ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | null | undefined;
declare let b: number | null | undefined;
declare let c: number | null | undefined;
declare let d: number | null | undefined;
(a && b) || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: boolean | null | undefined;
declare let b: boolean | null | undefined;
declare let c: boolean | null | undefined;
declare let d: boolean | null | undefined;
(a && b) || c || d;
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | null | undefined;
declare let b: boolean | null | undefined;
declare let c: boolean | null | undefined;
declare let d: boolean | null | undefined;
(a && (b) ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | null | undefined;
declare let b: boolean | null | undefined;
declare let c: boolean | null | undefined;
declare let d: boolean | null | undefined;
(a && b) || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },
    {
      code: `
declare let a: object | null | undefined;
declare let b: object | null | undefined;
declare let c: object | null | undefined;
declare let d: object | null | undefined;
(a && b) || c || d;
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | null | undefined;
declare let b: object | null | undefined;
declare let c: object | null | undefined;
declare let d: object | null | undefined;
(a && (b) ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | null | undefined;
declare let b: object | null | undefined;
declare let c: object | null | undefined;
declare let d: object | null | undefined;
(a && b) || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    },

    // should not false positive for functions inside conditional tests
    {
      code: `
declare let x: string | null;
if (() => x || 'foo') {
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
if (() => x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | null;
if (() => (x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
if (() => (x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | null;
if (() => x || 'foo') {
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
if (() => x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | null;
if (() => (x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
if (() => (x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | null;
if (() => x || 'foo') {
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
if (() => x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | null;
if (() => (x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
if (() => (x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | null;
if (() => x || 'foo') {
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
if (() => x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | null;
if (() => (x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
if (() => (x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | undefined;
if (() => x || 'foo') {
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
if (() => x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | undefined;
if (() => (x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
if (() => (x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | undefined;
if (() => x || 'foo') {
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
if (() => x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | undefined;
if (() => (x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
if (() => (x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | undefined;
if (() => x || 'foo') {
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
if (() => x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | undefined;
if (() => (x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
if (() => (x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | undefined;
if (() => x || 'foo') {
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
if (() => x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | undefined;
if (() => (x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
if (() => (x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | null | undefined;
if (() => x || 'foo') {
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
if (() => x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | null | undefined;
if (() => (x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
if (() => (x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | null | undefined;
if (() => x || 'foo') {
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
if (() => x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | null | undefined;
if (() => (x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
if (() => (x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | null | undefined;
if (() => x || 'foo') {
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
if (() => x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | null | undefined;
if (() => (x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
if (() => (x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | null | undefined;
if (() => x || 'foo') {
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
if (() => x ?? 'foo') {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | null | undefined;
if (() => (x ||= 'foo')) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
if (() => (x ??= 'foo')) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | null;
if (
  function weird() {
    return x || 'foo';
  }
) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
if (
  function weird() {
    return x ?? 'foo';
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | null;
if (
  function weird() {
    return (x ||= 'foo');
  }
) {
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null;
if (
  function weird() {
    return (x ??= 'foo');
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | null;
if (
  function weird() {
    return x || 'foo';
  }
) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
if (
  function weird() {
    return x ?? 'foo';
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | null;
if (
  function weird() {
    return (x ||= 'foo');
  }
) {
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null;
if (
  function weird() {
    return (x ??= 'foo');
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | null;
if (
  function weird() {
    return x || 'foo';
  }
) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
if (
  function weird() {
    return x ?? 'foo';
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | null;
if (
  function weird() {
    return (x ||= 'foo');
  }
) {
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null;
if (
  function weird() {
    return (x ??= 'foo');
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | null;
if (
  function weird() {
    return x || 'foo';
  }
) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
if (
  function weird() {
    return x ?? 'foo';
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | null;
if (
  function weird() {
    return (x ||= 'foo');
  }
) {
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null;
if (
  function weird() {
    return (x ??= 'foo');
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | undefined;
if (
  function weird() {
    return x || 'foo';
  }
) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
if (
  function weird() {
    return x ?? 'foo';
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | undefined;
if (
  function weird() {
    return (x ||= 'foo');
  }
) {
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
if (
  function weird() {
    return (x ??= 'foo');
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | undefined;
if (
  function weird() {
    return x || 'foo';
  }
) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
if (
  function weird() {
    return x ?? 'foo';
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | undefined;
if (
  function weird() {
    return (x ||= 'foo');
  }
) {
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
if (
  function weird() {
    return (x ??= 'foo');
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | undefined;
if (
  function weird() {
    return x || 'foo';
  }
) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
if (
  function weird() {
    return x ?? 'foo';
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | undefined;
if (
  function weird() {
    return (x ||= 'foo');
  }
) {
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
if (
  function weird() {
    return (x ??= 'foo');
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | undefined;
if (
  function weird() {
    return x || 'foo';
  }
) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
if (
  function weird() {
    return x ?? 'foo';
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | undefined;
if (
  function weird() {
    return (x ||= 'foo');
  }
) {
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | undefined;
if (
  function weird() {
    return (x ??= 'foo');
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | null | undefined;
if (
  function weird() {
    return x || 'foo';
  }
) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
if (
  function weird() {
    return x ?? 'foo';
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: string | null | undefined;
if (
  function weird() {
    return (x ||= 'foo');
  }
) {
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | null | undefined;
if (
  function weird() {
    return (x ??= 'foo');
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | null | undefined;
if (
  function weird() {
    return x || 'foo';
  }
) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
if (
  function weird() {
    return x ?? 'foo';
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: number | null | undefined;
if (
  function weird() {
    return (x ||= 'foo');
  }
) {
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | null | undefined;
if (
  function weird() {
    return (x ??= 'foo');
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | null | undefined;
if (
  function weird() {
    return x || 'foo';
  }
) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
if (
  function weird() {
    return x ?? 'foo';
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: boolean | null | undefined;
if (
  function weird() {
    return (x ||= 'foo');
  }
) {
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | null | undefined;
if (
  function weird() {
    return (x ??= 'foo');
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | null | undefined;
if (
  function weird() {
    return x || 'foo';
  }
) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
if (
  function weird() {
    return x ?? 'foo';
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: object | null | undefined;
if (
  function weird() {
    return (x ||= 'foo');
  }
) {
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: object | null | undefined;
if (
  function weird() {
    return (x ??= 'foo');
  }
) {
}
      `,
            },
          ],
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/1290
    {
      code: `
declare let a: string | null;
declare let b: string;
declare let c: string;
a || b || c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | null;
declare let b: string;
declare let c: string;
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let a: number | null;
declare let b: number;
declare let c: number;
a || b || c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | null;
declare let b: number;
declare let c: number;
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let a: boolean | null;
declare let b: boolean;
declare let c: boolean;
a || b || c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | null;
declare let b: boolean;
declare let c: boolean;
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let a: object | null;
declare let b: object;
declare let c: object;
a || b || c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | null;
declare let b: object;
declare let c: object;
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let a: string | undefined;
declare let b: string;
declare let c: string;
a || b || c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | undefined;
declare let b: string;
declare let c: string;
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let a: number | undefined;
declare let b: number;
declare let c: number;
a || b || c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | undefined;
declare let b: number;
declare let c: number;
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let a: boolean | undefined;
declare let b: boolean;
declare let c: boolean;
a || b || c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | undefined;
declare let b: boolean;
declare let c: boolean;
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let a: object | undefined;
declare let b: object;
declare let c: object;
a || b || c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | undefined;
declare let b: object;
declare let c: object;
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let a: string | null | undefined;
declare let b: string;
declare let c: string;
a || b || c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: string | null | undefined;
declare let b: string;
declare let c: string;
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let a: number | null | undefined;
declare let b: number;
declare let c: number;
a || b || c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: number | null | undefined;
declare let b: number;
declare let c: number;
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let a: boolean | null | undefined;
declare let b: boolean;
declare let c: boolean;
a || b || c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: boolean | null | undefined;
declare let b: boolean;
declare let c: boolean;
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let a: object | null | undefined;
declare let b: object;
declare let c: object;
a || b || c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: object | null | undefined;
declare let b: object;
declare let c: object;
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
    },
    // default for missing option
    {
      code: `
declare let x: string | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: { bigint: true, boolean: true, number: true },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: number | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: { bigint: true, boolean: true, string: true },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: boolean | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: { bigint: true, number: true, string: true },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: bigint | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: bigint | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: { boolean: true, number: true, string: true },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: string | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: { bigint: true, boolean: true, number: true },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: number | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: { bigint: true, boolean: true, string: true },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: boolean | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: { bigint: true, number: true, string: true },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: bigint | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: bigint | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: { boolean: true, number: true, string: true },
        },
      ],
      output: null,
    },
    // falsy
    {
      code: `
declare let x: '' | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: '' | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: \`\` | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: \`\` | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0 | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: false | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: false | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: '' | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: '' | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: \`\` | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: \`\` | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0 | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0n | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: false | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: false | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    // truthy
    {
      code: `
declare let x: 'a' | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 'a' | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: \`hello\${'string'}\` | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: \`hello\${'string'}\` | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1 | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: true | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: true | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 'a' | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 'a' | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 'a' | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 'a' | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: \`hello\${'string'}\` | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: \`hello\${'string'}\` | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: \`hello\${'string'}\` | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: \`hello\${'string'}\` | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1 | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1 | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1n | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1n | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: true | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: true | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: true | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: true | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    // Unions of same primitive
    {
      code: `
declare let x: 'a' | 'b' | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 'a' | 'b' | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 'a' | \`b\` | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 'a' | \`b\` | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0 | 1 | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0 | 1 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1 | 2 | 3 | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1 | 2 | 3 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0n | 1n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0n | 1n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1n | 2n | 3n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1n | 2n | 3n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: true | false | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: true | false | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 'a' | 'b' | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 'a' | 'b' | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 'a' | 'b' | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 'a' | 'b' | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 'a' | \`b\` | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 'a' | \`b\` | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 'a' | \`b\` | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 'a' | \`b\` | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0 | 1 | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0 | 1 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0 | 1 | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0 | 1 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1 | 2 | 3 | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1 | 2 | 3 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1 | 2 | 3 | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1 | 2 | 3 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0n | 1n | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0n | 1n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0n | 1n | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0n | 1n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1n | 2n | 3n | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1n | 2n | 3n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1n | 2n | 3n | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1n | 2n | 3n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: true | false | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: true | false | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: true | false | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: true | false | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    // Mixed unions
    {
      code: `
declare let x: 0 | 1 | 0n | 1n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0 | 1 | 0n | 1n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: true | false | null | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: true | false | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0 | 1 | 0n | 1n | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0 | 1 | 0n | 1n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0 | 1 | 0n | 1n | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0 | 1 | 0n | 1n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: true | false | null | undefined;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: true | false | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: true | false | null | undefined;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: true | false | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: null;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: null;
x ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
const x = undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
const x = undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
null || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
null ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
undefined || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
undefined ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum.A | Enum.B | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum.A | Enum.B | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum.A | Enum.B | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum.A | Enum.B | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;
let c: boolean | undefined;

const x = Boolean(a || b);
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;
let c: boolean | undefined;

const x = Boolean(a ?? b);
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreBooleanCoercion: false,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = String(a || b);
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = String(a ?? b);
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(() => a || b);
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(() => a ?? b);
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(function weird() {
  return a || b;
});
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(function weird() {
  return a ?? b;
});
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

declare function f(x: unknown): unknown;

const x = Boolean(f(a || b));
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;

declare function f(x: unknown): unknown;

const x = Boolean(f(a ?? b));
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(1 + (a || b));
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(1 + (a ?? b));
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

declare function f(x: unknown): unknown;

if (f(a || b)) {
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;

declare function f(x: unknown): unknown;

if (f(a ?? b)) {
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
declare const a: string | undefined;
declare const b: string;

if (+(a || b)) {
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const a: string | undefined;
declare const b: string;

if (+(a ?? b)) {
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBox: Box | undefined;

defaultBox || getFallbackBox();
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBox: Box | undefined;

defaultBox ?? getFallbackBox();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBox: Box | undefined;

defaultBox ? defaultBox : getFallbackBox();
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBox: Box | undefined;

defaultBox ?? getFallbackBox();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
      output: null,
    },
    {
      code: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b != null ? defaultBoxOptional.a?.b : getFallbackBox();
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b ?? getFallbackBox();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
      output: null,
    },
    {
      code: `
declare const x: any;
declare const y: any;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: any;
declare const y: any;
x ?? y;
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
declare const x: unknown;
declare const y: any;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: unknown;
declare const y: any;
x ?? y;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b != null ? defaultBoxOptional.a.b : getFallbackBox();
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b ?? getFallbackBox();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
      output: null,
    },
    {
      code: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b ? defaultBoxOptional.a?.b : getFallbackBox();
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b ?? getFallbackBox();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
      output: null,
    },
    {
      code: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b ? defaultBoxOptional.a.b : getFallbackBox();
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b ?? getFallbackBox();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
      output: null,
    },
    {
      code: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b !== undefined
  ? defaultBoxOptional.a?.b
  : getFallbackBox();
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b ?? getFallbackBox();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
      output: null,
    },
    {
      code: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b !== undefined
  ? defaultBoxOptional.a.b
  : getFallbackBox();
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b ?? getFallbackBox();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
      output: null,
    },
    {
      code: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b !== undefined && defaultBoxOptional.a?.b !== null
  ? defaultBoxOptional.a?.b
  : getFallbackBox();
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b ?? getFallbackBox();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
      output: null,
    },
    {
      code: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b !== undefined && defaultBoxOptional.a?.b !== null
  ? defaultBoxOptional.a.b
  : getFallbackBox();
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
interface Box {
  value: string;
}
declare function getFallbackBox(): Box;
declare const defaultBoxOptional: { a?: { b?: Box | undefined } };

defaultBoxOptional.a?.b ?? getFallbackBox();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }],
      output: null,
    },
    {
      code: `
declare let x: unknown;
declare let y: number;
!x ? y : x;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: unknown;
declare let y: number;
x ?? y;
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
declare let x: unknown;
declare let y: number;
x ? x : y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: unknown;
declare let y: number;
x ?? y;
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
declare let x: { n: unknown };
!x.n ? y : x.n;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { n: unknown };
x.n ?? y;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare let x: { a: string } | null;

x?.['a'] != null ? x['a'] : 'foo';
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { a: string } | null;

x?.['a'] ?? 'foo';
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: { a: string } | null;

x?.['a'] != null ? x.a : 'foo';
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { a: string } | null;

x?.['a'] ?? 'foo';
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: { a: string } | null;

x?.a != null ? x['a'] : 'foo';
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: { a: string } | null;

x?.a ?? 'foo';
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
const a = 'b';
declare let x: { a: string; b: string } | null;

x?.[a] != null ? x[a] : 'foo';
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
const a = 'b';
declare let x: { a: string; b: string } | null;

x?.[a] ?? 'foo';
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (!foo) {
    foo = makeFoo();
  }
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  foo ??= makeFoo();
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
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo == null) {
    foo = makeFoo();
  }
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  foo ??= makeFoo();
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
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo == null) {
    foo ??= makeFoo();
  }
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  foo ??= makeFoo();
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
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo == null) {
    foo ||= makeFoo();
  }
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  foo ??= makeFoo();
}
      `,
            },
          ],
        },
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo == null) {
    foo ??= makeFoo();
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
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo === null) {
    foo = makeFoo();
  }
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  foo ??= makeFoo();
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
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo == null) foo = makeFoo();
  const bar = 42;
  return bar;
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  foo ??= makeFoo();
  const bar = 42;
  return bar;
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
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo == null) foo ??= makeFoo();
  const bar = 42;
  return bar;
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  foo ??= makeFoo();
  const bar = 42;
  return bar;
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
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo == null) foo ||= makeFoo();
  const bar = 42;
  return bar;
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  foo ??= makeFoo();
  const bar = 42;
  return bar;
}
      `,
            },
          ],
        },
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo == null) foo ??= makeFoo();
  const bar = 42;
  return bar;
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
declare let foo: { a: string } | undefined;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo === undefined) {
    foo = makeFoo();
  }
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | undefined;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  foo ??= makeFoo();
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
declare let foo: { a: string } | null | undefined;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo === undefined || foo === null) {
    foo = makeFoo();
  }
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | null | undefined;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  foo ??= makeFoo();
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
declare let foo: { a: string } | null;
declare function makeFoo(): string;

function lazyInitialize() {
  if (foo.a == null) {
    foo.a = makeFoo();
  }
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | null;
declare function makeFoo(): string;

function lazyInitialize() {
  foo.a ??= makeFoo();
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
declare let foo: { a: string } | null;
declare function makeFoo(): string;

function lazyInitialize() {
  if (foo?.a == null) {
    foo.a = makeFoo();
  }
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string } | null;
declare function makeFoo(): string;

function lazyInitialize() {
  foo.a ??= makeFoo();
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
declare let foo: string | null;
declare function makeFoo(): string;

function lazyInitialize() {
  if (foo == null) {
    // comment
    foo = makeFoo();
  }
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: string | null;
declare function makeFoo(): string;

function lazyInitialize() {
  // comment
foo ??= makeFoo();
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
declare let foo: string | null;
declare function makeFoo(): string;

if (foo == null) {
  // comment before 1
  /* comment before 2 */
  /* comment before 3
    which is multiline
  */
  /**
   * comment before 4
   * which is also multiline
   */
  foo = makeFoo(); // comment inline
  // comment after 1
  /* comment after 2 */
  /* comment after 3
    which is multiline
  */
  /**
   * comment after 4
   * which is also multiline
   */
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: string | null;
declare function makeFoo(): string;

// comment before 1
/* comment before 2 */
/* comment before 3
    which is multiline
  */
/**
   * comment before 4
   * which is also multiline
   */
foo ??= makeFoo(); // comment inline
// comment after 1
/* comment after 2 */
/* comment after 3
    which is multiline
  */
/**
   * comment after 4
   * which is also multiline
   */
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare let foo: string | null;
declare function makeFoo(): string;

if (foo == null) /* comment before 1 */ /* comment before 2 */ foo = makeFoo(); // comment inline
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: string | null;
declare function makeFoo(): string;

/* comment before 1 */ /* comment before 2 */ foo ??= makeFoo(); // comment inline
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: noFormat`
declare let foo: { a: string | null };
declare function makeString(): string;

function weirdParens() {
  if (((((foo.a)) == null))) {
    ((((((((foo).a))))) = makeString()));
  }
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverAssignment',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let foo: { a: string | null };
declare function makeString(): string;

function weirdParens() {
  ((foo).a) ??= makeString();
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
let a: string | undefined;
let b: { message: string } | undefined;

const foo = a ? a : b ? 1 : 2;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | undefined;
let b: { message: string } | undefined;

const foo = a ?? (b ? 1 : 2);
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: noFormat`
let a: string | undefined;
let b: { message: string } | undefined;

const foo = a ? a : (b ? 1 : 2);
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | undefined;
let b: { message: string } | undefined;

const foo = a ?? (b ? 1 : 2);
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const c: string | null;
c !== null ? c : c ? 1 : 2;
      `,
      errors: [
        {
          messageId: 'preferNullishOverTernary',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const c: string | null;
c ?? (c ? 1 : 2);
      `,
            },
          ],
        },
      ],
      output: null,
    },
  ],
});
