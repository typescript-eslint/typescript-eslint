import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/restrict-plus-operands';
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

ruleTester.run('restrict-plus-operands', rule, {
  valid: [
    'let x = 5;',
    "let y = '10';",
    'let z = 8.2;',
    "let w = '6.5';",
    'let foo = 5 + 10;',
    "let foo = '5.5' + '10';",
    "let foo = parseInt('5.5', 10) + 10;",
    "let foo = parseFloat('5.5', 10) + 10;",
    'let foo = 1n + 1n;',
    'let foo = BigInt(1) + 1n;',
    `
      let foo = 1n;
      foo + 2n;
    `,
    `
function test(s: string, n: number): number {
  return 2;
}
let foo = test('5.5', 10) + 10;
    `,
    `
let x = 5;
let z = 8.2;
let foo = x + z;
    `,
    `
let w = '6.5';
let y = '10';
let foo = y + w;
    `,
    'let foo = 1 + 1;',
    "let foo = '1' + '1';",
    `
let pair: { first: number; second: string } = { first: 5, second: '10' };
let foo = pair.first + 10;
    `,
    `
let pair: { first: number; second: string } = { first: 5, second: '10' };
let foo = pair.first + (10 as number);
    `,
    `
let pair: { first: number; second: string } = { first: 5, second: '10' };
let foo = '5.5' + pair.second;
    `,
    `
let pair: { first: number; second: string } = { first: 5, second: '10' };
let foo = ('5.5' as string) + pair.second;
    `,
    `
      const foo =
        'hello' +
        (someBoolean ? 'a' : 'b') +
        (() => (someBoolean ? 'c' : 'd'))() +
        'e';
    `,
    'const balls = true;',
    'balls === true;',
    // https://github.com/typescript-eslint/typescript-eslint/issues/230
    `
function foo<T extends string>(a: T) {
  return a + '';
}
    `,
    `
function foo<T extends 'a' | 'b'>(a: T) {
  return a + '';
}
    `,
    `
function foo<T extends number>(a: T) {
  return a + 1;
}
    `,
    `
function foo<T extends 1>(a: T) {
  return a + 1;
}
    `,
    `
declare const a: {} & string;
declare const b: string;
const x = a + b;
    `,
    `
declare const a: unknown & string;
declare const b: string;
const x = a + b;
    `,
    `
declare const a: string & string;
declare const b: string;
const x = a + b;
    `,
    `
declare const a: 'string literal' & string;
declare const b: string;
const x = a + b;
    `,
    `
declare const a: {} & number;
declare const b: number;
const x = a + b;
    `,
    `
declare const a: unknown & number;
declare const b: number;
const x = a + b;
    `,
    `
declare const a: number & number;
declare const b: number;
const x = a + b;
    `,
    `
declare const a: 42 & number;
declare const b: number;
const x = a + b;
    `,
    `
declare const a: {} & bigint;
declare const b: bigint;
const x = a + b;
    `,
    `
declare const a: unknown & bigint;
declare const b: bigint;
const x = a + b;
    `,
    `
declare const a: bigint & bigint;
declare const b: bigint;
const x = a + b;
    `,
    `
declare const a: 42n & bigint;
declare const b: bigint;
const x = a + b;
    `,
    `
function A(s: string) {
  return \`a\${s}b\` as const;
}
const b = A('') + '!';
    `,
    `
declare const a: \`template\${string}\`;
declare const b: '';
const x = a + b;
    `,
    `
const a: \`template\${0}\`;
declare const b: '';
const x = a + b;
    `,
    {
      code: `
        declare const a: RegExp;
        declare const b: string;
        const x = a + b;
      `,
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: true,
        },
      ],
    },
    {
      code: `
        const a = /regexp/;
        declare const b: string;
        const x = a + b;
      `,
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: true,
        },
      ],
    },
    // TypeScript handles this case, so we don't have to
    {
      code: `
const f = (a: RegExp, b: RegExp) => a + b;
      `,
      options: [
        {
          allowRegExp: true,
        },
      ],
    },
    {
      code: `
let foo: string | undefined;
foo = foo + 'some data';
      `,
      options: [
        {
          allowNullish: true,
        },
      ],
    },
    {
      code: `
let foo: string | null;
foo = foo + 'some data';
      `,
      options: [
        {
          allowNullish: true,
        },
      ],
    },
    {
      code: `
let foo: string | null | undefined;
foo = foo + 'some data';
      `,
      options: [
        {
          allowNullish: true,
        },
      ],
    },
    {
      code: `
let foo = '';
foo += 0;
      `,
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
          skipCompoundAssignments: true,
        },
      ],
    },
    {
      code: `
let foo = 0;
foo += '';
      `,
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
          skipCompoundAssignments: true,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: any) => a + b;
      `,
      options: [
        {
          allowAny: true,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: string) => a + b;
      `,
      options: [
        {
          allowAny: true,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: bigint) => a + b;
      `,
      options: [
        {
          allowAny: true,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: number) => a + b;
      `,
      options: [
        {
          allowAny: true,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: boolean) => a + b;
      `,
      options: [
        {
          allowAny: true,
          allowBoolean: true,
        },
      ],
    },
    {
      code: `
const f = (a: string, b: string | number) => a + b;
      `,
      options: [
        {
          allowAny: true,
          allowBoolean: true,
          allowNullish: true,
          allowNumberAndString: true,
          allowRegExp: true,
        },
      ],
    },
    {
      code: `
const f = (a: string | number, b: number) => a + b;
      `,
      options: [
        {
          allowAny: true,
          allowBoolean: true,
          allowNullish: true,
          allowNumberAndString: true,
          allowRegExp: true,
        },
      ],
    },
    {
      code: `
const f = (a: string | number, b: string | number) => a + b;
      `,
      options: [
        {
          allowAny: true,
          allowBoolean: true,
          allowNullish: true,
          allowNumberAndString: true,
          allowRegExp: true,
        },
      ],
    },
    {
      code: "let foo = '1' + 1n;",
      options: [{ allowNumberAndString: true }],
    },
  ],
  invalid: [
    {
      code: "let foo = '1' + 1;",
      errors: [
        {
          column: 11,
          data: {
            left: 'string',
            right: 'number',
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
          },
          line: 1,
          messageId: 'mismatched',
        },
      ],
      options: [{ allowNumberAndString: false }],
    },
    {
      code: "let foo = '1' + 1;",
      errors: [
        {
          column: 11,
          data: {
            left: 'string',
            right: 'number',
            stringLike: 'string',
          },
          line: 1,
          messageId: 'mismatched',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: 'let foo = [] + {};',
      errors: [
        {
          column: 11,
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
            type: 'never[]',
          },
          endColumn: 13,
          line: 1,
          messageId: 'invalid',
        },
        {
          column: 16,
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
            type: '{}',
          },
          endColumn: 18,
          line: 1,
          messageId: 'invalid',
        },
      ],
    },
    {
      code: "let foo = 5 + '10';",
      errors: [
        {
          column: 11,
          data: {
            left: 'number',
            right: 'string',
            stringLike: 'string',
          },
          line: 1,
          messageId: 'mismatched',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: 'let foo = [] + 5;',
      errors: [
        {
          column: 11,
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
            type: 'never[]',
          },
          endColumn: 13,
          line: 1,
          messageId: 'invalid',
        },
      ],
    },
    {
      code: 'let foo = [] + [];',
      errors: [
        {
          column: 11,
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
            type: 'never[]',
          },
          endColumn: 13,
          line: 1,
          messageId: 'invalid',
        },
        {
          column: 16,
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
            type: 'never[]',
          },
          endColumn: 18,
          line: 1,
          messageId: 'invalid',
        },
      ],
    },
    {
      code: 'let foo = 5 + [3];',
      errors: [
        {
          column: 15,
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
            type: 'number[]',
          },
          endColumn: 18,
          line: 1,
          messageId: 'invalid',
        },
      ],
    },
    {
      code: "let foo = '5' + {};",
      errors: [
        {
          column: 17,
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
            type: '{}',
          },
          endColumn: 19,
          line: 1,
          messageId: 'invalid',
        },
      ],
    },
    {
      code: "let foo = 5.5 + '5';",
      errors: [
        {
          column: 11,
          data: {
            left: 'number',
            right: 'string',
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
          },
          line: 1,
          messageId: 'mismatched',
        },
      ],
      options: [{ allowNumberAndString: false }],
    },
    {
      code: "let foo = '5.5' + 5;",
      errors: [
        {
          column: 11,
          data: {
            left: 'string',
            right: 'number',
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
          },
          line: 1,
          messageId: 'mismatched',
        },
      ],
      options: [{ allowNumberAndString: false }],
    },
    {
      code: `
let x = 5;
let y = '10';
let foo = x + y;
      `,
      errors: [
        {
          column: 11,
          data: {
            left: 'number',
            right: 'string',
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
          },
          line: 4,
          messageId: 'mismatched',
        },
      ],
      options: [{ allowNumberAndString: false }],
    },
    {
      code: `
let x = 5;
let y = '10';
let foo = y + x;
      `,
      errors: [
        {
          column: 11,
          data: {
            left: 'string',
            right: 'number',
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
          },
          line: 4,
          messageId: 'mismatched',
        },
      ],
      options: [{ allowNumberAndString: false }],
    },
    {
      code: `
let x = 5;
let foo = x + {};
      `,
      errors: [
        {
          column: 15,
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
            type: '{}',
          },
          line: 3,
          messageId: 'invalid',
        },
      ],
    },
    {
      code: `
let y = '10';
let foo = [] + y;
      `,
      errors: [
        {
          column: 11,
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
            type: 'never[]',
          },
          line: 3,
          messageId: 'invalid',
        },
      ],
    },
    {
      code: `
let pair = { first: 5, second: '10' };
let foo = pair + pair;
      `,
      errors: [
        {
          column: 11,
          data: {
            stringLike: 'string',
            type: '{ first: number; second: string; }',
          },
          endColumn: 15,
          line: 3,
          messageId: 'invalid',
        },
        {
          column: 18,
          data: {
            stringLike: 'string',
            type: '{ first: number; second: string; }',
          },
          endColumn: 22,
          line: 3,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
type Valued = { value: number };
let value: Valued = { value: 0 };
let combined = value + 0;
      `,
      errors: [
        {
          column: 16,
          data: {
            stringLike: 'string',
            type: 'Valued',
          },
          endColumn: 21,
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: 'let foo = 1n + 1;',
      errors: [
        {
          column: 11,
          data: {
            left: 'bigint',
            right: 'number',
          },
          line: 1,
          messageId: 'bigintAndNumber',
        },
      ],
    },
    {
      code: 'let foo = 1 + 1n;',
      errors: [
        {
          column: 11,
          data: {
            left: 'number',
            right: 'bigint',
          },
          line: 1,
          messageId: 'bigintAndNumber',
        },
      ],
    },
    {
      code: `
        let foo = 1n;
        foo + 1;
      `,
      errors: [
        {
          column: 9,
          data: {
            left: 'bigint',
            right: 'number',
          },
          line: 3,
          messageId: 'bigintAndNumber',
        },
      ],
    },
    {
      code: `
        let foo = 1;
        foo + 1n;
      `,
      errors: [
        {
          column: 9,
          data: {
            left: 'number',
            right: 'bigint',
          },
          line: 3,
          messageId: 'bigintAndNumber',
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/230
    {
      code: `
function foo<T extends string>(a: T) {
  return a + 1;
}
      `,
      errors: [
        {
          column: 10,
          data: {
            left: 'string',
            right: 'number',
            stringLike: 'string',
          },
          line: 3,
          messageId: 'mismatched',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
function foo<T extends 'a' | 'b'>(a: T) {
  return a + 1;
}
      `,
      errors: [
        {
          column: 10,
          data: {
            left: 'string',
            right: 'number',
            stringLike: 'string',
          },
          line: 3,
          messageId: 'mismatched',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
function foo<T extends number>(a: T) {
  return a + '';
}
      `,
      errors: [
        {
          column: 10,
          data: {
            left: 'number',
            right: 'string',
            stringLike: 'string',
          },
          line: 3,
          messageId: 'mismatched',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
function foo<T extends 1>(a: T) {
  return a + '';
}
      `,
      errors: [
        {
          column: 10,
          data: {
            left: 'number',
            right: 'string',
            stringLike: 'string',
          },
          line: 3,
          messageId: 'mismatched',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: \`template\${number}\`;
        declare const b: number;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            left: 'string',
            right: 'number',
            stringLike: 'string',
          },
          line: 4,
          messageId: 'mismatched',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: never;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'never',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: never & string;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'never',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: boolean & string;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'never',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: any & string;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'any',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: { a: 1 } & { b: 2 };
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: '{ a: 1; } & { b: 2; }',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        interface A {
          a: 1;
        }
        declare const a: A;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'A',
          },
          line: 7,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        interface A {
          a: 1;
        }
        interface A2 extends A {
          b: 2;
        }
        declare const a: A2;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'A2',
          },
          line: 10,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        type A = { a: 1 } & { b: 2 };
        declare const a: A;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'A',
          },
          line: 5,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: { a: 1 } & { b: 2 };
        declare const b: number;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: '{ a: 1; } & { b: 2; }',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: never;
        declare const b: bigint;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'never',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: any;
        declare const b: bigint;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'any',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: { a: 1 } & { b: 2 };
        declare const b: bigint;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: '{ a: 1; } & { b: 2; }',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: RegExp;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'RegExp',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        const a = /regexp/;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'RegExp',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: Symbol;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'Symbol',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: symbol;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'symbol',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        declare const a: unique symbol;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'unique symbol',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
        const a = Symbol('');
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          column: 19,
          data: {
            stringLike: 'string',
            type: 'unique symbol',
          },
          line: 4,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
let foo: string | undefined;
foo += 'some data';
      `,
      errors: [
        {
          column: 1,
          data: {
            stringLike: 'string',
            type: 'string | undefined',
          },
          line: 3,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
          skipCompoundAssignments: false,
        },
      ],
    },
    {
      code: `
let foo: string | null;
foo += 'some data';
      `,
      errors: [
        {
          column: 1,
          data: {
            stringLike: 'string',
            type: 'string | null',
          },
          line: 3,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
let foo: string = '';
foo += 1;
      `,
      errors: [
        {
          column: 1,
          data: {
            left: 'string',
            right: 'number',
            stringLike: 'string',
          },
          line: 3,
          messageId: 'mismatched',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
let foo = 0;
foo += '';
      `,
      errors: [
        {
          column: 1,
          data: {
            left: 'number',
            right: 'string',
            stringLike: 'string',
          },
          line: 3,
          messageId: 'mismatched',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: boolean) => a + b;
      `,
      errors: [
        {
          column: 39,
          line: 2,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: true,
          allowBoolean: false,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: []) => a + b;
      `,
      errors: [
        {
          column: 34,
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
            type: '[]',
          },
          line: 2,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: true,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: boolean) => a + b;
      `,
      errors: [
        {
          column: 35,
          data: {
            stringLike:
              'string, allowing a string + any of: `boolean`, `null`, `RegExp`, `undefined`',
            type: 'any',
          },
          line: 2,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: true,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: any) => a + b;
      `,
      errors: [
        {
          column: 31,
          line: 2,
          messageId: 'invalid',
        },
        {
          column: 35,
          line: 2,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: string) => a + b;
      `,
      errors: [
        {
          column: 34,
          line: 2,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: bigint) => a + b;
      `,
      errors: [
        {
          column: 34,
          line: 2,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: number) => a + b;
      `,
      errors: [
        {
          column: 34,
          line: 2,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: boolean) => a + b;
      `,
      errors: [
        {
          column: 35,
          line: 2,
          messageId: 'invalid',
        },
        {
          column: 39,
          line: 2,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: false,
        },
      ],
    },
    {
      code: `
const f = (a: number, b: RegExp) => a + b;
      `,
      errors: [
        {
          column: 41,
          line: 2,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowRegExp: true,
        },
      ],
    },
    {
      code: `
let foo: string | boolean;
foo = foo + 'some data';
      `,
      errors: [
        {
          column: 7,
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `null`, `RegExp`, `undefined`',
            type: 'string | boolean',
          },
          line: 3,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowBoolean: false,
        },
      ],
    },
    {
      code: `
let foo: boolean;
foo = foo + 'some data';
      `,
      errors: [
        {
          column: 7,
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `null`, `RegExp`, `undefined`',
            type: 'boolean',
          },
          line: 3,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowBoolean: false,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: unknown) => a + b;
      `,
      errors: [
        {
          column: 39,
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
            type: 'unknown',
          },
          line: 2,
          messageId: 'invalid',
        },
      ],
      options: [
        {
          allowAny: true,
          allowBoolean: true,
          allowNullish: true,
          allowRegExp: true,
        },
      ],
    },
    {
      code: "let foo = '1' + 1n;",
      errors: [
        {
          column: 11,
          data: {
            left: 'string',
            right: 'bigint',
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
          },
          line: 1,
          messageId: 'mismatched',
        },
      ],
      options: [{ allowNumberAndString: false }],
    },
  ],
});
