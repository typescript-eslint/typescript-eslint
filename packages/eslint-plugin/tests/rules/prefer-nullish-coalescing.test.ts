import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';

import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';

import type {
  MessageIds,
  Options,
} from '../../src/rules/prefer-nullish-coalescing';

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

const types = ['string', 'number', 'boolean', 'object'];
const nullishTypes = ['null', 'undefined', 'null | undefined'];
const ignorablePrimitiveTypes = ['string', 'number', 'boolean', 'bigint'];

function typeValidTest(
  cb: (type: string, equals: '' | '=') => string | ValidTestCase<Options>,
): (string | ValidTestCase<Options>)[] {
  return [
    ...types.map(type => cb(type, '')),
    ...types.map(type => cb(type, '=')),
  ];
}

const nullishTypeTest = <
  T extends
    | string
    | InvalidTestCase<MessageIds, Options>
    | ValidTestCase<Options>,
>(
  cb: (nullish: string, type: string, equals: string) => T,
): T[] =>
  nullishTypes.flatMap(nullish =>
    types.flatMap(type =>
      ['', ...(cb.length === 3 ? ['='] : [])].map(equals =>
        cb(nullish, type, equals),
      ),
    ),
  );

ruleTester.run('prefer-nullish-coalescing', rule, {
  valid: [
    ...typeValidTest(
      (type, equals) => `
declare let x: ${type};
(x ||${equals} 'foo');
      `,
    ),
    ...nullishTypeTest(
      (nullish, type, equals) => `
declare let x: ${type} | ${nullish};
x ??${equals} 'foo';
      `,
    ),

    {
      code: 'x !== undefined && x !== null ? x : y;',
      options: [{ ignoreTernaryTests: true }],
    },

    ...[
      'x !== undefined && x !== null ? "foo" : "bar";',
      'x !== null && x !== undefined && x !== 5 ? x : y',
      'x === null || x === undefined || x === 5 ? x : y',
      'x === undefined && x !== null ? x : y;',
      'x === undefined && x === null ? x : y;',
      'x !== undefined && x === null ? x : y;',
      'x === undefined || x !== null ? x : y;',
      'x === undefined || x === null ? x : y;',
      'x !== undefined || x === null ? x : y;',
      'x !== undefined || x === null ? y : x;',
      'x === null || x === null ? y : x;',
      'x === undefined || x === undefined ? y : x;',
      'x == null ? x : y;',
      'undefined == null ? x : y;',
      'undefined != z ? x : y;',
      'x == undefined ? x : y;',
      'x != null ? y : x;',
      'x != undefined ? y : x;',
      'null == x ? x : y;',
      'undefined == x ? x : y;',
      'null != x ? y : x;',
      'undefined != x ? y : x;',
      `
declare let x: number | undefined;
x !== 15 && x !== undefined ? x : y;
      `,
      `
declare let x: number | undefined;
x !== undefined && x !== 15 ? x : y;
      `,
      `
declare let x: number | undefined;
15 !== x && undefined !== x ? x : y;
      `,
      `
declare let x: number | undefined;
undefined !== x && 15 !== x ? x : y;
      `,
      `
declare let x: number | undefined;
15 !== x && x !== undefined ? x : y;
      `,
      `
declare let x: number | undefined;
undefined !== x && x !== 15 ? x : y;
      `,
      `
declare let x: string | undefined;
x !== 'foo' && x !== undefined ? x : y;
      `,
      `
function test(value: number | undefined): number {
  return value !== foo() && value !== undefined ? value : 1;
}
      `,
      `
const test = (value: boolean | undefined): boolean => value !== undefined && value !== false ? value : false;
      `,
      `
declare let x: string;
x === null ? x : y;
      `,
      `
declare let x: string | undefined;
x === null ? x : y;
      `,
      `
declare let x: string | null;
x === undefined ? x : y;
      `,
      `
declare let x: string | undefined | null;
x !== undefined ? x : y;
      `,
      `
declare let x: string | undefined | null;
x !== null ? x : y;
      `,
      `
declare let x: any;
x === null ? x : y;
      `,
      `
declare let x: unknown;
x === null ? x : y;
      `,
      `
declare let x: string;
x ? x : y;
      `,
      `
declare let x: string;
!x ? y : x;
      `,
      `
declare let x: string | object;
x ? x : y;
      `,
      `
declare let x: string | object;
!x ? y : x;
      `,
      `
declare let x: number;
x ? x : y;
      `,
      `
declare let x: number;
!x ? y : x;
      `,
      `
declare let x: bigint;
x ? x : y;
      `,
      `
declare let x: bigint;
!x ? y : x;
      `,
      `
declare let x: boolean;
x ? x : y;
      `,
      `
declare let x: boolean;
!x ? y : x;
      `,
      `
declare let x: object;
x ? x : y;
      `,
      `
declare let x: object;
!x ? y : x;
      `,
      `
declare let x: string[];
x ? x : y;
      `,
      `
declare let x: string[];
!x ? y : x;
      `,
      `
declare let x: Function;
x ? x : y;
      `,
      `
declare let x: Function;
!x ? y : x;
      `,
      `
declare let x: () => string;
x ? x : y;
      `,
      `
declare let x: () => string;
!x ? y : x;
      `,
      `
declare let x: () => string | null;
x ? x : y;
      `,
      `
declare let x: () => string | null;
!x ? y : x;
      `,
      `
declare let x: () => string | undefined;
x ? x : y;
      `,
      `
declare let x: () => string | undefined;
!x ? y : x;
      `,
      `
declare let x: () => string | null | undefined;
x ? x : y;
      `,
      `
declare let x: () => string | null | undefined;
!x ? y : x;
      `,
      `
declare let x: () => string | null;
x() ? x() : y;
      `,
      `
declare let x: () => string | null;
!x() ? y : x();
      `,
      `
const a = 'foo';
declare let x: (a: string | null) => string | null;
x(a) ? x(a) : y;
      `,
      `
const a = 'foo';
declare let x: (a: string | null) => string | null;
!x(a) ? y : x(a);
      `,
      `
declare let x: { n: string };
x.n ? x.n : y;
      `,
      `
declare let x: { n: string };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: string | object };
x.n ? x.n : y;
      `,
      `
declare let x: { n: string | object };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: number };
x.n ? x.n : y;
      `,
      `
declare let x: { n: number };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: bigint };
x.n ? x.n : y;
      `,
      `
declare let x: { n: bigint };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: boolean };
x.n ? x.n : y;
      `,
      `
declare let x: { n: boolean };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: object };
x ? x : y;
      `,
      `
declare let x: { n: object };
!x ? y : x;
      `,
      `
declare let x: { n: string[] };
x.n ? x.n : y;
      `,
      `
declare let x: { n: string[] };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: Function };
x.n ? x.n : y;
      `,
      `
declare let x: { n: Function };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: () => string };
x.n ? x.n : y;
      `,
      `
declare let x: { n: () => string };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: () => string | null };
x.n ? x.n : y;
      `,
      `
declare let x: { n: () => string | null };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: () => string | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: () => string | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: () => string | null | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: () => string | null | undefined };
!x.n ? y : x.n;
      `,
      `
declare let foo: string;
declare function makeFoo(): string;

function lazyInitialize() {
  if (!foo) {
    foo = makeFoo();
  }
}
      `,
      `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo) {
    foo = makeFoo();
  }
}
      `,
      `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo != null) {
    foo = makeFoo();
  }
}
      `,
      `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo == null) {
    foo = makeFoo();
    return foo;
  }
}
      `,
      `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };

function lazyInitialize() {
  if (foo == null) {
    return foo;
  } else {
    return 'bar';
  }
}
      `,
      `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };
function shadowed() {
  if (foo == null) {
    const foo = makeFoo();
  }
}
declare let foo: { foo: string } | null;
declare function makeFoo(): { foo: { foo: string } };
function weirdDestructuringAssignment() {
  if (foo == null) {
    ({ foo } = makeFoo());
  }
}
      `,
      `
declare let foo: { a: string } | null;
declare function makeFoo(): { a: string };
function shadowed() {
  if (foo == null) {
    const foo = makeFoo();
  }
}
      `,
      `
declare let foo: { foo: string } | null;
declare function makeFoo(): { foo: { foo: string } };
function weirdDestructuringAssignment() {
  if (foo == null) {
    ({ foo } = makeFoo());
  }
}
      `,
      `
declare const nullOrObject: null | { a: string };

const test = nullOrObject !== undefined && null !== null
  ? nullOrObject
  : 42;
      `,
      `
declare const nullOrObject: null | { a: string };

const test = nullOrObject !== undefined && null != null
  ? nullOrObject
  : 42;
      `,
      `
declare const nullOrObject: null | { a: string };

const test = nullOrObject !== undefined && null != undefined
  ? nullOrObject
  : 42;
      `,
      `
declare const nullOrObject: null | { a: string };

const test = nullOrObject === undefined || null === null
  ? 42
  : nullOrObject;
      `,
      `
declare const nullOrObject: null | { a: string };

const test = nullOrObject === undefined || null == null
  ? 42
  : nullOrObject;
      `,
      `
declare const nullOrObject: null | { a: string };

const test = nullOrObject === undefined || null == undefined
  ? 42
  : nullOrObject;
      `,
      `
const a = 'b';
declare let x: { a: string, b: string } | null

x?.a != null ? x[a] : 'foo'
      `,
      `
const a = 'b';
declare let x: { a: string, b: string } | null

x?.[a] != null ? x.a : 'foo'
      `,
      `
declare let x: { a: string } | null
declare let y: { a: string } | null

x?.a ? y?.a : 'foo'
      `,
    ].map(code => ({
      code,
      options: [{ ignoreTernaryTests: false }] as const,
    })),

    // ignoreConditionalTests
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
(x ||${equals} 'foo') ? null : null;
      `,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
if ((x ||${equals} 'foo')) {}
      `,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
do {} while ((x ||${equals} 'foo'))
      `,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
for (;(x ||${equals} 'foo');) {}
      `,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
while ((x ||${equals} 'foo')) {}
      `,
    })),

    // ignoreMixedLogicalExpressions
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
a || b && c;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a || b || c && d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a && b || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: ${type} | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { [type]: true } }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: ${type} | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: (${type} & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { [type]: true } }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: (${type} & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: ${type} | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: { [type]: true } }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: ${type} | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: { [type]: true } }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: ${type} | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: true }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: ${type} | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: true }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: (${type} & { __brand?: any }) | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: { [type]: true } }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: (${type} & { __brand?: any }) | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: { [type]: true } }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: (${type} & { __brand?: any }) | undefined;
x ? x : y;
      `,
      options: [{ ignorePrimitives: true }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: (${type} & { __brand?: any }) | undefined;
!x ? y : x;
      `,
      options: [{ ignorePrimitives: true }],
    })),
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
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
(x ||${equals} 'foo');
      `,
      errors: [
        {
          column: 4,
          endColumn: 6 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
(x ??${equals} 'foo');
      `,
            },
          ],
        },
      ],
      output: null,
    })),

    ...[
      'x !== undefined && x !== null ? x : y;',
      'x !== null && x !== undefined ? x : y;',
      'x === undefined || x === null ? y : x;',
      'x === null || x === undefined ? y : x;',
      'undefined !== x && x !== null ? x : y;',
      'null !== x && x !== undefined ? x : y;',
      'undefined === x || x === null ? y : x;',
      'null === x || x === undefined ? y : x;',
      'x !== undefined && null !== x ? x : y;',
      'x !== null && undefined !== x ? x : y;',
      'x === undefined || null === x ? y : x;',
      'x === null || undefined === x ? y : x;',
      'undefined !== x && null !== x ? x : y;',
      'null !== x && undefined !== x ? x : y;',
      'undefined === x || null === x ? y : x;',
      'null === x || undefined === x ? y : x;',
      'x != undefined && x != null ? x : y;',
      'x == undefined || x == null ? y : x;',
      'x != undefined && x !== null ? x : y;',
      'x == undefined || x === null ? y : x;',
      'x !== undefined && x != null ? x : y;',
      'undefined != x ? x : y;',
      'null != x ? x : y;',
      'undefined == x ? y : x;',
      'null == x ? y : x;',
      'x != undefined ? x : y;',
      'x != null ? x : y;',
      'x == undefined  ? y : x;',
      'x == null ? y : x;',
    ].flatMap(code => [
      {
        code,
        errors: [
          {
            column: 1,
            endColumn: code.length,
            endLine: 1,
            line: 1,
            messageId: 'preferNullishOverTernary' as const,
            suggestions: [
              {
                messageId: 'suggestNullish' as const,
                output: 'x ?? y;',
              },
            ],
          },
        ],
        options: [{ ignoreTernaryTests: false }] as const,
        output: null,
      },
      {
        code: code.replaceAll('x', 'x.z[1][this[this.o]]["3"][a.b.c]'),
        errors: [
          {
            column: 1,
            endColumn: code.replaceAll('x', 'x.z[1][this[this.o]]["3"][a.b.c]')
              .length,
            endLine: 1,
            line: 1,
            messageId: 'preferNullishOverTernary' as const,
            suggestions: [
              {
                messageId: 'suggestNullish' as const,
                output: 'x.z[1][this[this.o]]["3"][a.b.c] ?? y;',
              },
            ],
          },
        ],
        options: [{ ignoreTernaryTests: false }] as const,
        output: null,
      },
      {
        code: code.replaceAll('y', '(z = y)'),
        errors: [
          {
            column: 1,
            endColumn: code.replaceAll('y', '(z = y)').length,
            endLine: 1,
            line: 1,
            messageId: 'preferNullishOverTernary' as const,
            suggestions: [
              {
                messageId: 'suggestNullish' as const,
                output: 'x ?? (z = y);',
              },
            ],
          },
        ],
        options: [{ ignoreTernaryTests: false }] as const,
        output: null,
      },
    ]),

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

    ...[
      `
declare let x: string | undefined;
x !== undefined ? x : y;
      `,
      `
declare let x: string | undefined;
undefined !== x ? x : y;
      `,
      `
declare let x: string | undefined;
x === undefined ? y : x;
      `,
      `
declare let x: string | undefined;
undefined === x ? y : x;
      `,
      `
declare let x: string | null;
x !== null ? x : y;
      `,
      `
declare let x: string | null;
null !== x ? x : y;
      `,
      `
declare let x: string | null;
x === null ? y : x;
      `,
      `
declare let x: string | null;
null === x ? y : x;
      `,
      `
declare let x: string | null;
x ? x : y;
      `,
      `
declare let x: string | null;
!x ? y : x;
      `,
      `
declare let x: string | undefined;
x ? x : y;
      `,
      `
declare let x: string | undefined;
!x ? y : x;
      `,
      `
declare let x: string | null | undefined;
x ? x : y;
      `,
      `
declare let x: string | null | undefined;
!x ? y : x;
      `,
      `
declare let x: string | object | null;
x ? x : y;
      `,
      `
declare let x: string | object | null;
!x ? y : x;
      `,
      `
declare let x: string | object | undefined;
x ? x : y;
      `,
      `
declare let x: string | object | undefined;
!x ? y : x;
      `,
      `
declare let x: string | object | null | undefined;
x ? x : y;
      `,
      `
declare let x: string | object | null | undefined;
!x ? y : x;
      `,
      `
declare let x: number | null;
x ? x : y;
      `,
      `
declare let x: number | null;
!x ? y : x;
      `,
      `
declare let x: number | undefined;
x ? x : y;
      `,
      `
declare let x: number | undefined;
!x ? y : x;
      `,
      `
declare let x: number | null | undefined;
x ? x : y;
      `,
      `
declare let x: number | null | undefined;
!x ? y : x;
      `,
      `
declare let x: bigint | null;
x ? x : y;
      `,
      `
declare let x: bigint | null;
!x ? y : x;
      `,
      `
declare let x: bigint | undefined;
x ? x : y;
      `,
      `
declare let x: bigint | undefined;
!x ? y : x;
      `,
      `
declare let x: bigint | null | undefined;
x ? x : y;
      `,
      `
declare let x: bigint | null | undefined;
!x ? y : x;
      `,
      `
declare let x: boolean | null;
x ? x : y;
      `,
      `
declare let x: boolean | null;
!x ? y : x;
      `,
      `
declare let x: boolean | undefined;
x ? x : y;
      `,
      `
declare let x: boolean | undefined;
!x ? y : x;
      `,
      `
declare let x: boolean | null | undefined;
x ? x : y;
      `,
      `
declare let x: boolean | null | undefined;
!x ? y : x;
      `,
      `
declare let x: string[] | null;
x ? x : y;
      `,
      `
declare let x: string[] | null;
!x ? y : x;
      `,
      `
declare let x: string[] | undefined;
x ? x : y;
      `,
      `
declare let x: string[] | undefined;
!x ? y : x;
      `,
      `
declare let x: string[] | null | undefined;
x ? x : y;
      `,
      `
declare let x: string[] | null | undefined;
!x ? y : x;
      `,
      `
declare let x: object | null;
x ? x : y;
      `,
      `
declare let x: object | null;
!x ? y : x;
      `,
      `
declare let x: object | undefined;
x ? x : y;
      `,
      `
declare let x: object | undefined;
!x ? y : x;
      `,
      `
declare let x: object | null | undefined;
x ? x : y;
      `,
      `
declare let x: object | null | undefined;
!x ? y : x;
      `,
      `
declare let x: Function | null;
x ? x : y;
      `,
      `
declare let x: Function | null;
!x ? y : x;
      `,
      `
declare let x: Function | undefined;
x ? x : y;
      `,
      `
declare let x: Function | undefined;
!x ? y : x;
      `,
      `
declare let x: Function | null | undefined;
x ? x : y;
      `,
      `
declare let x: Function | null | undefined;
!x ? y : x;
      `,
      `
declare let x: (() => string) | null;
x ? x : y;
      `,
      `
declare let x: (() => string) | null;
!x ? y : x;
      `,
      `
declare let x: (() => string) | undefined;
x ? x : y;
      `,
      `
declare let x: (() => string) | undefined;
!x ? y : x;
      `,
      `
declare let x: (() => string) | null | undefined;
x ? x : y;
      `,
      `
declare let x: (() => string) | null | undefined;
!x ? y : x;
      `,
    ].map(code => ({
      code,
      errors: [
        {
          column: 1,
          endColumn: code.split('\n')[2].length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary' as const,
          suggestions: [
            {
              messageId: 'suggestNullish' as const,
              output: `
${code.split('\n')[1]}
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }] as const,
      output: null,
    })),

    ...[
      `
declare let x: { n: string | null };
x.n ? x.n : y;
      `,
      `
declare let x: { n: string | null };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: string | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: string | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: string | null | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: string | null | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: string | object | null };
x.n ? x.n : y;
      `,
      `
declare let x: { n: string | object | null };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: string | object | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: string | object | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: string | object | null | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: string | object | null | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: number | null };
x.n ? x.n : y;
      `,
      `
declare let x: { n: number | null };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: number | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: number | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: number | null | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: number | null | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: bigint | null };
x.n ? x.n : y;
      `,
      `
declare let x: { n: bigint | null };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: bigint | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: bigint | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: bigint | null | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: bigint | null | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: boolean | null };
x.n ? x.n : y;
      `,
      `
declare let x: { n: boolean | null };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: boolean | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: boolean | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: boolean | null | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: boolean | null | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: string[] | null };
x.n ? x.n : y;
      `,
      `
declare let x: { n: string[] | null };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: string[] | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: string[] | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: string[] | null | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: string[] | null | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: object | null };
x.n ? x.n : y;
      `,
      `
declare let x: { n: object | null };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: object | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: object | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: object | null | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: object | null | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: Function | null };
x.n ? x.n : y;
      `,
      `
declare let x: { n: Function | null };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: Function | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: Function | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: Function | null | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: Function | null | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: (() => string) | null };
x.n ? x.n : y;
      `,
      `
declare let x: { n: (() => string) | null };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: (() => string) | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: (() => string) | undefined };
!x.n ? y : x.n;
      `,
      `
declare let x: { n: (() => string) | null | undefined };
x.n ? x.n : y;
      `,
      `
declare let x: { n: (() => string) | null | undefined };
!x.n ? y : x.n;
      `,
    ].map(code => ({
      code,
      errors: [
        {
          column: 1,
          endColumn: code.split('\n')[2].length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary' as const,
          suggestions: [
            {
              messageId: 'suggestNullish' as const,
              output: `
${code.split('\n')[1]}
x.n ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }] as const,
      output: null,
    })),

    ...[
      `
declare let x: { n?: { a?: string } };
x.n?.a ? x?.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x.n?.a ? x?.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x.n?.a ? x.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x.n?.a !== undefined ? x?.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x.n?.a !== undefined ? x?.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x.n?.a !== undefined ? x.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x.n?.a != undefined ? x?.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x.n?.a != undefined ? x?.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x.n?.a != undefined ? x.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x.n?.a != null ? x?.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x.n?.a != null ? x?.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x.n?.a != null ? x.n.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
x.n?.a !== undefined && x.n.a !== null ? x?.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
x.n?.a !== undefined && x.n.a !== null ? x.n.a : y;
      `,
    ].map(code => ({
      code,
      errors: [
        {
          column: 1,
          endColumn: code.split('\n')[2].length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary' as const,
          suggestions: [
            {
              messageId: 'suggestNullish' as const,
              output: `
${code.split('\n')[1]}
x.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }] as const,
      output: null,
    })),
    ...[
      `
declare let x: { n?: { a?: string } };
x?.n?.a ? x?.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a ? x.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a ? x?.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a ? x.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a !== undefined ? x?.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a !== undefined ? x.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a !== undefined ? x?.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a !== undefined ? x.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a != undefined ? x?.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a != undefined ? x.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a != undefined ? x?.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a != undefined ? x.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a != null ? x?.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a != null ? x.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a != null ? x?.n.a : y;
      `,
      `
declare let x: { n?: { a?: string } };
x?.n?.a != null ? x.n.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
x?.n?.a !== undefined && x.n.a !== null ? x?.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
x?.n?.a !== undefined && x.n.a !== null ? x.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
x?.n?.a !== undefined && x.n.a !== null ? x?.n.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
x?.n?.a !== undefined && x.n.a !== null ? x.n.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
x?.n?.a !== undefined && x.n.a !== null ? (x?.n)?.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
x?.n?.a !== undefined && x.n.a !== null ? (x.n)?.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
x?.n?.a !== undefined && x.n.a !== null ? (x?.n).a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
x?.n?.a !== undefined && x.n.a !== null ? (x.n).a : y;
      `,
    ].map(code => ({
      code,
      errors: [
        {
          column: 1,
          endColumn: code.split('\n')[2].length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary' as const,
          suggestions: [
            {
              messageId: 'suggestNullish' as const,
              output: `
${code.split('\n')[1]}
x?.n?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }] as const,
      output: null,
    })),
    ...[
      `
declare let x: { n?: { a?: string | null } };
(x?.n)?.a ? x?.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
(x?.n)?.a ? x.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
(x?.n)?.a ? x?.n.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
(x?.n)?.a ? x.n.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
(x?.n)?.a ? (x?.n)?.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
(x?.n)?.a ? (x.n)?.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
(x?.n)?.a ? (x?.n).a : y;
      `,
    ].map(code => ({
      code,
      errors: [
        {
          column: 1,
          endColumn: code.split('\n')[2].length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary' as const,
          suggestions: [
            {
              messageId: 'suggestNullish' as const,
              output: `
${code.split('\n')[1]}
(x?.n)?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }] as const,
      output: null,
    })),

    ...[
      `
declare let x: { n?: { a?: string | null } };
(x.n)?.a ? x?.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
(x.n)?.a ? x.n?.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
(x.n)?.a ? x?.n.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
(x.n)?.a ? x.n.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
(x.n)?.a ? (x?.n)?.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
(x.n)?.a ? (x.n)?.a : y;
      `,
      `
declare let x: { n?: { a?: string | null } };
(x.n)?.a ? (x?.n).a : y;
      `,
    ].map(code => ({
      code,
      errors: [
        {
          column: 1,
          endColumn: code.split('\n')[2].length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary' as const,
          suggestions: [
            {
              messageId: 'suggestNullish' as const,
              output: `
${code.split('\n')[1]}
(x.n)?.a ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }] as const,
      output: null,
    })),

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
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
(x ||${equals} 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 6 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
(x ??${equals} 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
if ((x ||${equals} 'foo')) {}
      `,
      errors: [
        {
          column: 8,
          endColumn: 10 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
if ((x ??${equals} 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
do {} while ((x ||${equals} 'foo'))
      `,
      errors: [
        {
          column: 17,
          endColumn: 19 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
do {} while ((x ??${equals} 'foo'))
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
for (;(x ||${equals} 'foo');) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
for (;(x ??${equals} 'foo');) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
while ((x ||${equals} 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 13 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
while ((x ??${equals} 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),

    // ignoreMixedLogicalExpressions
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
a || b && c;
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
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
a ?? b && c;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    })),
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a || b || c && d;
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
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
(a ?? b) || c && d;
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
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a || b ?? c && d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    })),
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a && b || c || d;
      `,
      errors: [
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
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a && (b ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 13,
          endColumn: 15,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a && b || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    })),

    // should not false positive for functions inside conditional tests
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
if (() => (x ||${equals} 'foo')) {}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
if (() => (x ??${equals} 'foo')) {}
      `,
            },
          ],
        },
      ],
      output: null,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
if (function weird() { return (x ||${equals} 'foo') }) {}
      `,
      errors: [
        {
          column: 34,
          endColumn: 36 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
if (function weird() { return (x ??${equals} 'foo') }) {}
      `,
            },
          ],
        },
      ],
      output: null,
    })),
    // https://github.com/typescript-eslint/typescript-eslint/issues/1290
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type};
declare let c: ${type};
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
declare let a: ${type} | ${nullish};
declare let b: ${type};
declare let c: ${type};
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
      output: null,
    })),
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
  ],
});
