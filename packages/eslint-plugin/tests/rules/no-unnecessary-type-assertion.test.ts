import path from 'path';
import rule from '../../src/rules/no-unnecessary-type-assertion';
import { RuleTester } from '../RuleTester';

const rootDir = path.resolve(__dirname, '../fixtures/');
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-unnecessary-type-assertion', rule, {
  valid: [
    'const foo = 3 as number;',
    'const foo = <number> 3;',
    'const foo = <3>3;',
    'const foo = 3 as 3;',
    `
type Tuple = [3, "hi", "bye"];
const foo = ([3, "hi", "bye"]) as Tuple;`,
    `
type PossibleTuple = {};
const foo = ({}) as PossibleTuple;`,
    `
type PossibleTuple = { hello: "hello" };
const foo = ({ hello: "hello" }) as PossibleTuple;`,
    `
type PossibleTuple = { 0: "hello", 5: "hello" };
const foo = ({ 0: "hello", 5: "hello" }) as PossibleTuple;`,
    {
      code: `
type Foo = number;
const foo = (3 + 5) as Foo;`,
      options: [{ typesToIgnore: ['Foo'] }],
    },
    {
      code: `const foo = (3 + 5) as any;`,
      options: [{ typesToIgnore: ['any'] }],
    },
    {
      code: `((Syntax as any).ArrayExpression = 'foo')`,
      options: [{ typesToIgnore: ['any'] }],
    },
    {
      code: `const foo = (3 + 5) as string;`,
      options: [{ typesToIgnore: ['string'] }],
    },
    {
      code: `
type Foo = number;
const foo = <Foo>(3 + 5);`,
      options: [{ typesToIgnore: ['Foo'] }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/453
    // the ol' use-before-assign-is-okay-trust-me assertion
    `
let bar: number
bar! + 1
    `,
    `
let bar: undefined | number
bar! + 1
    `,
    `
let bar: number, baz: number
bar! + 1
    `,
    `
function foo<T extends string | undefined>(bar: T) {
  return bar!
}
    `,
    `
declare function nonNull(s: string);
let s: string | null = null;
nonNull(s!);
    `,
    `
const x: number | null = null;
const y: number = x!;
    `,
    `
const x: number | null = null;
class Foo {
  prop: number = x!;
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/529
    `
declare function foo(str?: string): void;
declare const str: string | null;

foo(str!);
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/532
    `
declare function a(a: string): any;
declare const b: string | null;
class Mx {
  @a(b!)
  private prop = 1;
}
    `,
  ],

  invalid: [
    {
      code: `
const foo = 3;
const bar = foo!;`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
const foo = (3 + 5) as number;`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: `
const foo = <number>(3 + 5);`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: `
type Foo = number;
const foo = (3 + 5) as Foo;`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
type Foo = number;
const foo = <Foo>(3 + 5);`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
          column: 13,
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/453
    {
      code: `
let bar: number = 1
bar! + 1
      `,
      output: `
let bar: number = 1
bar + 1
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
      ],
    },
    {
      // definite declaration operator
      code: `
let bar!: number
bar! + 1
      `,
      output: `
let bar!: number
bar + 1
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
      ],
    },
    {
      code: `
let bar: number | undefined
bar = 1;
bar! + 1
      `,
      output: `
let bar: number | undefined
bar = 1;
bar + 1
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 4,
        },
      ],
    },
    {
      code: `
function foo<T extends string>(bar: T) {
  return bar!
}
      `,
      output: `
function foo<T extends string>(bar: T) {
  return bar
}
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
      ],
    },
    {
      code: `
declare function nonNull(s: string | null);
let s: string | null = null;
nonNull(s!);
      `,
      output: `
declare function nonNull(s: string | null);
let s: string | null = null;
nonNull(s);
      `,
      errors: [
        {
          messageId: 'contextuallyUnnecessary',
          line: 4,
        },
      ],
    },
    {
      code: `
const x: number | null = null;
const y: number | null = x!;
      `,
      output: `
const x: number | null = null;
const y: number | null = x;
      `,
      errors: [
        {
          messageId: 'contextuallyUnnecessary',
          line: 3,
        },
      ],
    },
    {
      code: `
const x: number | null = null;
class Foo {
  prop: number | null = x!;
}
      `,
      output: `
const x: number | null = null;
class Foo {
  prop: number | null = x;
}
      `,
      errors: [
        {
          messageId: 'contextuallyUnnecessary',
          line: 4,
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/532
    {
      code: `
declare function a(a: string): any;
const b = 'asdf';
class Mx {
  @a(b!)
  private prop = 1;
}
      `,
      output: `
declare function a(a: string): any;
const b = 'asdf';
class Mx {
  @a(b)
  private prop = 1;
}
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 5,
        },
      ],
    },
  ],
});
