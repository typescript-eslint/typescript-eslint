import path from 'path';
import rule from '../../src/rules/strict-type-predicates';
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

ruleTester.run('strict-type-predicates', rule, {
  valid: [
    `
declare function get<T>(): T;

// typeof undefined
typeof get<boolean | undefined>() === "undefined";
typeof get<any>() === "undefined";

// typeof boolean
typeof get<boolean | undefined>() === "boolean";
typeof get<{}>() === "boolean";

// typeof string
typeof get<"abc" | undefined>() === "string";

// typeof symbol
typeof get<symbol | string>() === "symbol";

// typeof function
{
  typeof get<number | (() => void)>() === "function";

  // Works with union
  class Foo { }
  typeof get<typeof Foo | object>() === "function";
}

// typeof object
typeof get<{}>() === "object";

// === null / undefined
// get<number | null>() === null;
// get<number | undefined>() === undefined;
// get<string | null | undefined>() == null;
// get<string | null | undefined>() != undefined;

// negation
get<number | null>() !== null;
get<number | undefined>() !== undefined;
get<unknown>() !== null;
get<unknown>() !== undefined;

// type parameters
{
  function f<T>(t: T) {
    typeof t === "boolean";
  }

  // TODO: Would be nice to catch this.
  function g<T extends string>(t: T) {
    typeof t === "boolean";
  }

  function f<T>(t: T) {
    typeof t === "boolean";
  }
}

// Detects bad typeof
{
  typeof get<string | number>() === \`string\`;
  let a: string, b: string;
  typeof a === typeof b;
  typeof a === b;
  a === typeof b;
}

// unknown
typeof get<unknown>() === "undefined";
typeof get<unknown>() === "boolean";
typeof get<unknown>() === "number";
typeof get<unknown>() === "string";
typeof get<unknown>() === "symbol";
typeof get<unknown>() === "function";
typeof get<unknown>() === "object";
"string" === typeof get<unknown>();
undefined === get<unknown>();

// other
{
  const body: unknown = 'test';
  if (typeof body === 'object')
    console.log('a');

  let test: unknown = undefined;
  if (test !== undefined)
    console.log('b');
}
    `,
  ],

  invalid: [
    // typeof undefined
    {
      code: `
declare function get<T>(): T;
typeof get<boolean>() === "undefined";`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
typeof get<void>() === "undefined";`,
      errors: [
        {
          messageId: 'expressionAlwaysTrue',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
// 'undefined' is not assignable to '{}'
typeof get<{}>() === "undefined";`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 4,
          column: 1,
        },
      ],
    },

    // typeof boolean
    {
      code: `
declare function get<T>(): T;
typeof get<boolean>() === "boolean";`,
      errors: [
        {
          messageId: 'expressionAlwaysTrue',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
typeof get<Boolean>() === "boolean";`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },

    // typeof number
    {
      code: `
declare function get<T>(): T;
enum E {}
typeof get<E>() === "number";`,
      errors: [
        {
          messageId: 'expressionAlwaysTrue',
          line: 4,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
typeof get<Number>() === "number";`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },

    // typeof string
    {
      code: `
declare function get<T>(): T;
typeof get<"abc" | "def">() === "string";`,
      errors: [
        {
          messageId: 'expressionAlwaysTrue',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
typeof get<String>() === "string";`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },

    // typeof symbol
    {
      code: `
declare function get<T>(): T;
typeof get<symbol>() === "symbol";`,
      errors: [
        {
          messageId: 'expressionAlwaysTrue',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
typeof get<string>() === "symbol";`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },

    // typeof function
    {
      code: `
declare function get<T>(): T;
typeof get<() => void>() === "function";`,
      errors: [
        {
          messageId: 'expressionAlwaysTrue',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
typeof get<Function>() === "function";`,
      errors: [
        {
          messageId: 'expressionAlwaysTrue',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
typeof get<number>() === "function";`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
class X {}
typeof X === "function";`,
      errors: [
        {
          messageId: 'expressionAlwaysTrue',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
class X {}
typeof X === "object";`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },

    // typeof object
    {
      code: `
declare function get<T>(): T;
typeof get<boolean | number | string | symbol | (() => void) | Function>() === "object";`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },

    // === null / undefined
    {
      code: `
declare function get<T>(): T;
get<number | undefined>() === null;`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
get<number | null>() === undefined;`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },

    // 'null' and 'undefined' are not assignable to '{}'
    {
      code: `
declare function get<T>(): T;
get<{}>() === null;`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
get<{}>() === undefined;`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
get<string | undefined>() == null;`,
      errors: [
        {
          messageId: 'useStrictlyUndefined',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
get<string | null>() == undefined;`,
      errors: [
        {
          messageId: 'useStrictlyNull',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
get<string | null>() == null;`,
      errors: [
        {
          messageId: 'useStrictlyNull',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
get<string | undefined>() == undefined;`,
      errors: [
        {
          messageId: 'useStrictlyUndefined',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
get<string | undefined>() != null;`,
      errors: [
        {
          messageId: 'useStrictlyNotUndefined',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
get<{}>() == null;`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
get<null|undefined>() == null;`,
      errors: [
        {
          messageId: 'expressionAlwaysTrue',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
get<null|undefined>() != undefined;`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },

    // negation
    {
      code: `
declare function get<T>(): T;
get<number | undefined>() !== null;`,
      errors: [
        {
          messageId: 'expressionAlwaysTrue',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
get<number | null>() !== undefined;`,
      errors: [
        {
          messageId: 'expressionAlwaysTrue',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
typeof get<string>() !== "string";`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },

    // reverse left/right
    {
      code: `
declare function get<T>(): T;
"string" === typeof get<number>();`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
undefined === get<void>();`,
      errors: [
        {
          messageId: 'expressionAlwaysTrue',
          line: 3,
          column: 1,
        },
      ],
    },

    // Detects bad typeof
    {
      code: `
declare function get<T>(): T;
typeof get<boolean>() === true;`,
      errors: [
        {
          messageId: 'badTypeof',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
typeof get<any>() === "orbject";`,
      errors: [
        {
          messageId: 'badTypeof',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
typeof get<string | number>() === \`stirng\`;`,
      errors: [
        {
          messageId: 'badTypeof',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
typeof get<any>() === "unknown";`,
      errors: [
        {
          messageId: 'badTypeof',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
typeof a === undefined;`,
      errors: [
        {
          messageId: 'expressionAlwaysFalse',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
undefined === typeof a;`,
      errors: [
        {
          messageId: 'badTypeof',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function get<T>(): T;
null === typeof b;`,
      errors: [
        {
          messageId: 'badTypeof',
          line: 3,
          column: 1,
        },
      ],
    },
  ],
});
