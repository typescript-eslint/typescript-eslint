import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-type-assertion';
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
          column: 11,
          data: {
            type: 'string | number',
          },
          endColumn: 22,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 11,
          data: {
            type: 'unknown',
          },
          endColumn: 33,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 11,
          data: {
            type: 'string | undefined',
          },
          endColumn: 32,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 11,
          data: {
            type: 'string | boolean',
          },
          endColumn: 43,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 11,
          data: {
            type: '"foo"',
          },
          endColumn: 30,
          line: 3,
          messageId: 'unsafeTypeAssertion',
        },
        {
          column: 11,
          data: {
            type: 'string',
          },
          endColumn: 21,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 10,
          data: {
            type: 'string | number',
          },
          endColumn: 31,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 10,
          data: {
            type: 'string | number',
          },
          endColumn: 31,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 10,
          data: {
            type: 'string | number',
          },
          endColumn: 30,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 11,
          data: {
            type: '() => string | boolean',
          },
          endColumn: 37,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 11,
          data: {
            type: '{}',
          },
          endColumn: 20,
          line: 7,
          messageId: 'unsafeTypeAssertion',
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
          column: 20,
          data: {
            type: '{ bar: number; bazz: number; }',
          },
          endColumn: 46,
          line: 7,
          messageId: 'unsafeTypeAssertion',
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
          column: 13,
          data: {
            type: 'string | boolean',
          },
          endColumn: 53,
          line: 3,
          messageId: 'unsafeTypeAssertion',
        },
        {
          column: 13,
          data: {
            type: 'string | number',
          },
          endColumn: 36,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 2,
          data: {
            type: '{ bazz: string; } | undefined',
          },
          endColumn: 39,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 13,
          data: {
            type: '"hello" | "world"',
          },
          endColumn: 27,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 13,
          data: {
            type: 'Bazz',
          },
          endColumn: 23,
          line: 13,
          messageId: 'unsafeTypeAssertion',
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
          column: 13,
          data: {
            type: '{}',
          },
          endColumn: 23,
          line: 5,
          messageId: 'unsafeTypeAssertion',
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
          column: 13,
          data: {
            type: 'readonly number[]',
          },
          endColumn: 28,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 13,
          data: {
            type: '{ hello: string; } & { world: string; }',
          },
          endColumn: 53,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 11,
          data: {
            type: 'string | number',
          },
          endColumn: 20,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 11,
          data: {
            type: 'unknown',
          },
          endColumn: 31,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 11,
          data: {
            type: 'string | undefined',
          },
          endColumn: 30,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 11,
          data: {
            type: 'string | boolean',
          },
          endColumn: 41,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 11,
          data: {
            type: '"foo"',
          },
          endColumn: 28,
          line: 3,
          messageId: 'unsafeTypeAssertion',
        },
        {
          column: 19,
          data: {
            type: 'string',
          },
          endColumn: 27,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 10,
          data: {
            type: 'string | number',
          },
          endColumn: 29,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 10,
          data: {
            type: 'string | number',
          },
          endColumn: 29,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 10,
          data: {
            type: 'string | number',
          },
          endColumn: 28,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 11,
          data: {
            type: '() => string | boolean',
          },
          endColumn: 35,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 11,
          data: {
            type: '{}',
          },
          endColumn: 18,
          line: 7,
          messageId: 'unsafeTypeAssertion',
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
          column: 20,
          data: {
            type: '{ bar: number; bazz: number; }',
          },
          endColumn: 44,
          line: 7,
          messageId: 'unsafeTypeAssertion',
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
          column: 13,
          data: {
            type: 'string | boolean',
          },
          endColumn: 51,
          line: 3,
          messageId: 'unsafeTypeAssertion',
        },
        {
          column: 29,
          data: {
            type: 'string | number',
          },
          endColumn: 50,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 2,
          data: {
            type: '{ bazz: string; } | undefined',
          },
          endColumn: 37,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 13,
          data: {
            type: '"hello" | "world"',
          },
          endColumn: 25,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 13,
          data: {
            type: 'Bazz',
          },
          endColumn: 21,
          line: 13,
          messageId: 'unsafeTypeAssertion',
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
          column: 13,
          data: {
            type: '{}',
          },
          endColumn: 21,
          line: 5,
          messageId: 'unsafeTypeAssertion',
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
          column: 13,
          data: {
            type: 'readonly number[]',
          },
          endColumn: 26,
          line: 3,
          messageId: 'unsafeTypeAssertion',
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
          column: 13,
          data: {
            type: '{ hello: string; } & { world: string; }',
          },
          endColumn: 51,
          line: 3,
          messageId: 'unsafeTypeAssertion',
        },
      ],
    },
  ],
});
