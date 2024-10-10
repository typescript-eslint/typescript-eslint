import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-type-assertion';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: rootPath,
      project: './tsconfig.json',
    },
  },
});

ruleTester.run('no-unsafe-type-assertion', rule, {
  valid: [
    `
declare const a: string;
const b = a as string | number;
    `,
    `
declare const a: string;
const b = a as unknown;
    `,
    `
declare const a: string;
const b = a as any;
    `,
    `
declare const a: string;
const b = a as string | number as string | number | boolean;
    `,
    `
declare const a: string;
const b = a as any as number;
    `,
    `
declare const a: () => boolean;
const b = a() as boolean | number;
    `,
    `
declare const a: () => boolean;
const b = a() as boolean | number as boolean | number | string;
    `,
    `
declare const a: string;
const b = a as string;
    `,
    `
declare const a: () => string;
const b = a() as string;
    `,
    `
declare const a: () => string;
const b = a as (() => string) | (() => number);
    `,
    `
declare const a: () => string;
const b = a as (() => string) | ((x: number) => string);
    `,
    `
declare const a: () => string;
const b = a as () => string | number;
    `,
    `
declare const a: { hello: 'world' };
const b = a as { hello: string };
    `,
    `
declare const foo = 'hello' as const;
foo() as string;
    `,
    `
declare const foo: () => string | undefined;
foo()!;
    `,
    `
declare const foo: { bar?: { bazz: string } };
(foo.bar as { bazz: string | boolean } | undefined)?.bazz;
    `,
    `
function foo(a: string) {
  return a as string | number;
}
    `,
    `
function foo<T extends boolean>(a: T) {
  return a as boolean | number;
}
    `,
    `
function foo<T extends boolean>(a: T) {
  return a as T | number;
}
    `,
    `
declare const a: { hello: string } & { world: string };
const b = a as { hello: string };
    `,
    `
declare const a: string;
const b = <string | number>a;
    `,
    `
declare const a: string;
const b = <unknown>a;
    `,
    `
declare const a: string;
const b = <any>a;
    `,
    `
declare const a: string;
const b = <string | number | boolean>(<string | number>a);
    `,
    `
declare const a: string;
const b = <number>(<any>a);
    `,
    `
declare const a: () => boolean;
const b = <boolean | number>a();
    `,
    `
declare const a: () => boolean;
const b = boolean | number | string(<boolean | number>a());
    `,
    `
declare const a: string;
const b = <string>a;
    `,
    `
declare const a: () => string;
const b = <string>a();
    `,
    `
declare const a: () => string;
const b = <(() => string) | (() => number)>a;
    `,
    `
declare const a: () => string;
const b = <(() => string) | ((x: number) => string)>a;
    `,
    `
declare const a: () => string;
const b = <() => string | number>a;
    `,
    `
declare const a: { hello: 'world' };
const b = <{ hello: string }>a;
    `,
    `
declare const foo = <const>'hello';
<string>foo();
    `,
    `
declare const foo: { bar?: { bazz: string } };
(<{ bazz: string | boolean } | undefined>foo.bar)?.bazz;
    `,
    `
function foo(a: string) {
  return <string | number>a;
}
    `,
    `
function foo<T extends boolean>(a: T) {
  return <boolean | number>a;
}
    `,
    `
function foo<T extends boolean>(a: T) {
  return <T | number>a;
}
    `,
    `
declare const a: { hello: string } & { world: string };
const b = <{ hello: string }>a;
    `,
  ],
  invalid: [
    {
      code: `
declare const a: string | number;
const b = a as string;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 22,
          data: {
            type: 'string | number',
            asserted: 'string',
          },
        },
      ],
    },
    {
      code: `
declare const a: string;
const b = a as unknown as number;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 33,
          data: {
            type: 'unknown',
            asserted: 'number',
          },
        },
      ],
    },
    {
      code: `
declare const a: string | undefined;
const b = a as string | boolean;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 32,
          data: {
            type: 'string | undefined',
            asserted: 'string | boolean',
          },
        },
      ],
    },
    {
      code: `
declare const a: string;
const b = a as string | boolean as boolean;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 43,
          data: {
            type: 'string | boolean',
            asserted: 'boolean',
          },
        },
      ],
    },
    {
      code: `
declare const a: string;
const b = a as 'foo' as 'bar';
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 30,
          data: {
            type: '"foo"',
            asserted: '"bar"',
          },
        },
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 21,
          data: {
            type: 'string',
            asserted: '"foo"',
          },
        },
      ],
    },
    {
      code: `
function f(t: number | string) {
  return t as number | boolean;
}
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 10,
          endColumn: 31,
          data: {
            type: 'string | number',
            asserted: 'number | boolean',
          },
        },
      ],
    },
    {
      code: `
function f<T extends number | string>(t: T) {
  return t as number | boolean;
}
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 10,
          endColumn: 31,
          data: {
            type: 'string | number',
            asserted: 'number | boolean',
          },
        },
      ],
    },
    {
      code: `
function f<T extends number | string>(t: T) {
  return t as Omit<T, number>;
}
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 10,
          endColumn: 30,
          data: {
            type: 'string | number',
            asserted: 'Omit<T, number>',
          },
        },
      ],
    },
    {
      code: `
declare const a: () => string | boolean;
const b = a as () => string | number;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 37,
          data: {
            type: '() => string | boolean',
            asserted: '() => string | number',
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  bar: number;
  bas: string;
}

var foo = {} as Foo;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 7,
          column: 11,
          endColumn: 20,
          data: {
            type: '{}',
            asserted: 'Foo',
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  bar: number;
}

// no additional properties are allowed
export const foo = { bar: 1, bazz: 1 } as Foo;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 7,
          column: 20,
          endColumn: 46,
          data: {
            type: '{ bar: number; bazz: number; }',
            asserted: 'Foo',
          },
        },
      ],
    },
    {
      code: `
declare const foo: string | number;
const bar = foo as string | boolean as string | null;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 13,
          endColumn: 53,
          data: {
            type: 'string | boolean',
            asserted: 'string | null',
          },
        },
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 13,
          endColumn: 36,
          data: {
            type: 'string | number',
            asserted: 'string | boolean',
          },
        },
      ],
    },
    {
      code: `
declare const foo: { bar?: { bazz: string } };
(foo.bar as { bazz: string | boolean }).bazz;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 2,
          endColumn: 39,
          data: {
            type: '{ bazz: string; } | undefined',
            asserted: '{ bazz: string | boolean; }',
          },
        },
      ],
    },
    {
      code: `
declare const foo: 'hello' | 'world';
const bar = foo as 'hello';
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 13,
          endColumn: 27,
          data: {
            type: '"hello" | "world"',
            asserted: '"hello"',
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  type: 'foo';
}

interface Bar {
  type: 'bar';
}

type Bazz = Foo | Bar;

declare const foo: Bazz;
const bar = foo as Foo;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 13,
          column: 13,
          endColumn: 23,
          data: {
            type: 'Bazz',
            asserted: 'Foo',
          },
        },
      ],
    },
    {
      code: `
type Foo = Readonly<Required<{ hello?: string }>>;

declare const foo: {};
const bar = foo as Foo;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 5,
          column: 13,
          endColumn: 23,
          data: {
            type: '{}',
            asserted: 'Readonly<Required<{ hello?: string | undefined; }>>',
          },
        },
      ],
    },
    {
      code: `
declare const foo: readonly number[];
const bar = foo as number[];
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 13,
          endColumn: 28,
          data: {
            type: 'readonly number[]',
            asserted: 'number[]',
          },
        },
      ],
    },
    {
      code: `
declare const foo: { hello: string } & { world: string };
const bar = foo as { hello: string; world: 'world' };
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 13,
          endColumn: 53,
          data: {
            type: '{ hello: string; } & { world: string; }',
            asserted: '{ hello: string; world: "world"; }',
          },
        },
      ],
    },
    {
      code: `
declare const a: string | number;
const b = <string>a;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 20,
          data: {
            type: 'string | number',
            asserted: 'string',
          },
        },
      ],
    },
    {
      code: `
declare const a: string;
const b = <number>(<unknown>a);
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 31,
          data: {
            type: 'unknown',
            asserted: 'number',
          },
        },
      ],
    },
    {
      code: `
declare const a: string | undefined;
const b = <string | boolean>a;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 30,
          data: {
            type: 'string | undefined',
            asserted: 'string | boolean',
          },
        },
      ],
    },
    {
      code: `
declare const a: string;
const b = <boolean>(<string | boolean>a);
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 41,
          data: {
            type: 'string | boolean',
            asserted: 'boolean',
          },
        },
      ],
    },
    {
      code: `
declare const a: string;
const b = <'bar'>(<'foo'>a);
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 28,
          data: {
            type: '"foo"',
            asserted: '"bar"',
          },
        },
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 19,
          endColumn: 27,
          data: {
            type: 'string',
            asserted: '"foo"',
          },
        },
      ],
    },
    {
      code: `
function f(t: number | string) {
  return <number | boolean>t;
}
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 10,
          endColumn: 29,
          data: {
            type: 'string | number',
            asserted: 'number | boolean',
          },
        },
      ],
    },
    {
      code: `
function f<T extends number | string>(t: T) {
  return <number | boolean>t;
}
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 10,
          endColumn: 29,
          data: {
            type: 'string | number',
            asserted: 'number | boolean',
          },
        },
      ],
    },
    {
      code: `
function f<T extends number | string>(t: T) {
  return <Omit<T, number>>t;
}
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 10,
          endColumn: 28,
          data: {
            type: 'string | number',
            asserted: 'Omit<T, number>',
          },
        },
      ],
    },
    {
      code: `
declare const a: () => string | boolean;
const b = <() => string | number>a;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 35,
          data: {
            type: '() => string | boolean',
            asserted: '() => string | number',
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  bar: number;
  bas: string;
}

var foo = <Foo>{};
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 7,
          column: 11,
          endColumn: 18,
          data: {
            type: '{}',
            asserted: 'Foo',
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  bar: number;
}

// no additional properties are allowed
export const foo = <Foo>{ bar: 1, bazz: 1 };
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 7,
          column: 20,
          endColumn: 44,
          data: {
            type: '{ bar: number; bazz: number; }',
            asserted: 'Foo',
          },
        },
      ],
    },
    {
      code: `
declare const foo: string | number;
const bar = <string | null>(<string | boolean>foo);
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 13,
          endColumn: 51,
          data: {
            type: 'string | boolean',
            asserted: 'string | null',
          },
        },
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 29,
          endColumn: 50,
          data: {
            type: 'string | number',
            asserted: 'string | boolean',
          },
        },
      ],
    },
    {
      code: `
declare const foo: { bar?: { bazz: string } };
(<{ bazz: string | boolean }>foo.bar).bazz;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 2,
          endColumn: 37,
          data: {
            type: '{ bazz: string; } | undefined',
            asserted: '{ bazz: string | boolean; }',
          },
        },
      ],
    },
    {
      code: `
declare const foo: 'hello' | 'world';
const bar = <'hello'>foo;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 13,
          endColumn: 25,
          data: {
            type: '"hello" | "world"',
            asserted: '"hello"',
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  type: 'foo';
}

interface Bar {
  type: 'bar';
}

type Bazz = Foo | Bar;

declare const foo: Bazz;
const bar = <Foo>foo;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 13,
          column: 13,
          endColumn: 21,
          data: {
            type: 'Bazz',
            asserted: 'Foo',
          },
        },
      ],
    },
    {
      code: `
type Foo = Readonly<Required<{ hello?: string }>>;

declare const foo: {};
const bar = <Foo>foo;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 5,
          column: 13,
          endColumn: 21,
          data: {
            type: '{}',
            asserted: 'Readonly<Required<{ hello?: string | undefined; }>>',
          },
        },
      ],
    },
    {
      code: `
declare const foo: readonly number[];
const bar = <number[]>foo;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 13,
          endColumn: 26,
          data: {
            type: 'readonly number[]',
            asserted: 'number[]',
          },
        },
      ],
    },
    {
      code: `
declare const foo: { hello: string } & { world: string };
const bar = <{ hello: string; world: 'world' }>foo;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 13,
          endColumn: 51,
          data: {
            type: '{ hello: string; } & { world: string; }',
            asserted: '{ hello: string; world: "world"; }',
          },
        },
      ],
    },
  ],
});
