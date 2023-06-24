import rule from '../../src/rules/restrict-plus-operands';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
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
let foo: number = 0;
foo += 1;
      `,
      options: [
        {
          checkCompoundAssignments: false,
        },
      ],
    },
    {
      code: `
let foo: number = 0;
foo += 'string';
      `,
      options: [
        {
          checkCompoundAssignments: false,
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
  ],
  invalid: [
    {
      code: "let foo = '1' + 1;",
      errors: [
        {
          data: {
            left: 'string',
            right: 'number',
            stringLike: 'string',
          },
          messageId: 'mismatched',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: 'let foo = [] + {};',
      errors: [
        {
          data: {
            stringLike: 'string',
            type: 'never[]',
          },
          column: 11,
          endColumn: 13,
          line: 1,
          messageId: 'invalid',
        },
        {
          data: {
            stringLike: 'string',
            type: '{}',
          },
          column: 16,
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
          data: {
            left: 'number',
            right: 'string',
            stringLike: 'string',
          },
          messageId: 'mismatched',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: 'let foo = [] + 5;',
      errors: [
        {
          data: {
            stringLike: 'string',
            type: 'never[]',
          },
          messageId: 'invalid',
          line: 1,
          column: 11,
          endColumn: 13,
        },
      ],
    },
    {
      code: 'let foo = [] + [];',
      errors: [
        {
          data: {
            stringLike: 'string',
            type: 'never[]',
          },
          messageId: 'invalid',
          line: 1,
          endColumn: 13,
          column: 11,
        },
        {
          data: {
            stringLike: 'string',
            type: 'never[]',
          },
          messageId: 'invalid',
          line: 1,
          endColumn: 18,
          column: 16,
        },
      ],
    },
    {
      code: 'let foo = 5 + [3];',
      errors: [
        {
          data: {
            stringLike: 'string',
            type: 'number[]',
          },
          column: 15,
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
          data: {
            stringLike: 'string',
            type: '{}',
          },
          messageId: 'invalid',
          line: 1,
          endColumn: 19,
          column: 17,
        },
      ],
    },
    {
      code: "let foo = 5.5 + '5';",
      errors: [
        {
          data: {
            left: 'number',
            right: 'string',
            stringLike: 'string',
          },
          messageId: 'mismatched',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "let foo = '5.5' + 5;",
      errors: [
        {
          data: {
            left: 'string',
            right: 'number',
            stringLike: 'string',
          },
          messageId: 'mismatched',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `
let x = 5;
let y = '10';
let foo = x + y;
      `,
      errors: [
        {
          data: {
            left: 'number',
            right: 'string',
            stringLike: 'string',
          },
          messageId: 'mismatched',
          line: 4,
          column: 11,
        },
      ],
    },
    {
      code: `
let x = 5;
let y = '10';
let foo = y + x;
      `,
      errors: [
        {
          data: {
            right: 'number',
            left: 'string',
            stringLike: 'string',
          },
          messageId: 'mismatched',
          line: 4,
          column: 11,
        },
      ],
    },
    {
      code: `
let x = 5;
let foo = x + {};
      `,
      errors: [
        {
          data: {
            stringLike: 'string',
            type: '{}',
          },
          messageId: 'invalid',
          line: 3,
          column: 15,
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
          data: {
            stringLike: 'string',
            type: 'never[]',
          },
          messageId: 'invalid',
          line: 3,
          column: 11,
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
          data: {
            stringLike: 'string',
            type: '{ first: number; second: string; }',
          },
          column: 11,
          endColumn: 15,
          line: 3,
          messageId: 'invalid',
        },
        {
          data: {
            stringLike: 'string',
            type: '{ first: number; second: string; }',
          },
          column: 18,
          endColumn: 22,
          line: 3,
          messageId: 'invalid',
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
          data: {
            stringLike: 'string',
            type: 'Valued',
          },
          column: 16,
          endColumn: 21,
          line: 4,
          messageId: 'invalid',
        },
      ],
    },
    {
      code: 'let foo = 1n + 1;',
      errors: [
        {
          data: {
            left: 'bigint',
            right: 'number',
          },
          messageId: 'bigintAndNumber',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: 'let foo = 1 + 1n;',
      errors: [
        {
          data: {
            left: 'number',
            right: 'bigint',
          },
          messageId: 'bigintAndNumber',
          line: 1,
          column: 11,
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
          data: {
            left: 'bigint',
            right: 'number',
          },
          messageId: 'bigintAndNumber',
          line: 3,
          column: 9,
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
          data: {
            left: 'number',
            right: 'bigint',
          },
          messageId: 'bigintAndNumber',
          line: 3,
          column: 9,
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
          data: {
            left: 'string',
            right: 'number',
            stringLike: 'string',
          },
          messageId: 'mismatched',
          line: 3,
          column: 10,
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
          data: {
            left: 'string',
            right: 'number',
            stringLike: 'string',
          },
          messageId: 'mismatched',
          line: 3,
          column: 10,
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
          data: {
            left: 'number',
            right: 'string',
            stringLike: 'string',
          },
          messageId: 'mismatched',
          line: 3,
          column: 10,
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
          data: {
            left: 'number',
            right: 'string',
            stringLike: 'string',
          },
          messageId: 'mismatched',
          line: 3,
          column: 10,
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
          data: {
            left: 'string',
            right: 'number',
            stringLike: 'string',
          },
          messageId: 'mismatched',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'never',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'never',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'never',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'any',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: '{ a: 1; } & { b: 2; }',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'A',
          },
          messageId: 'invalid',
          line: 7,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'A2',
          },
          messageId: 'invalid',
          line: 10,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'A',
          },
          messageId: 'invalid',
          line: 5,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: '{ a: 1; } & { b: 2; }',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'never',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'any',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: '{ a: 1; } & { b: 2; }',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'RegExp',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'RegExp',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'Symbol',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'symbol',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'unique symbol',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
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
          data: {
            stringLike: 'string',
            type: 'unique symbol',
          },
          messageId: 'invalid',
          line: 4,
          column: 19,
        },
      ],
    },
    {
      code: `
let foo: string | undefined;
foo += 'some data';
      `,
      options: [
        {
          checkCompoundAssignments: true,
        },
      ],
      errors: [
        {
          data: {
            stringLike: 'string',
            type: 'string | undefined',
          },
          messageId: 'invalid',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
let foo: string | null;
foo += 'some data';
      `,
      options: [
        {
          checkCompoundAssignments: true,
        },
      ],
      errors: [
        {
          data: {
            stringLike: 'string',
            type: 'string | null',
          },
          messageId: 'invalid',
          line: 3,
          column: 1,
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
          checkCompoundAssignments: true,
        },
      ],
      errors: [
        {
          data: {
            left: 'string',
            right: 'number',
            stringLike: 'string',
          },
          messageId: 'mismatched',
          line: 3,
          column: 1,
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
        },
      ],
      errors: [
        {
          messageId: 'invalid',
          line: 2,
          column: 39,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: []) => a + b;
      `,
      options: [
        {
          allowAny: true,
        },
      ],
      errors: [
        {
          data: {
            stringLike: 'string, allowing a string + `any`',
            type: '[]',
          },
          messageId: 'invalid',
          line: 2,
          column: 34,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: boolean) => a + b;
      `,
      options: [
        {
          allowBoolean: true,
        },
      ],
      errors: [
        {
          data: {
            stringLike: 'string, allowing a string + `boolean`',
            type: 'any',
          },
          messageId: 'invalid',
          line: 2,
          column: 35,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: any) => a + b;
      `,
      options: [
        {
          allowAny: false,
        },
      ],
      errors: [
        {
          messageId: 'invalid',
          line: 2,
          column: 31,
        },
        {
          messageId: 'invalid',
          line: 2,
          column: 35,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: string) => a + b;
      `,
      options: [
        {
          allowAny: false,
        },
      ],
      errors: [
        {
          messageId: 'invalid',
          line: 2,
          column: 34,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: bigint) => a + b;
      `,
      options: [
        {
          allowAny: false,
        },
      ],
      errors: [
        {
          messageId: 'invalid',
          line: 2,
          column: 34,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: number) => a + b;
      `,
      options: [
        {
          allowAny: false,
        },
      ],
      errors: [
        {
          messageId: 'invalid',
          line: 2,
          column: 34,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: boolean) => a + b;
      `,
      errors: [
        {
          messageId: 'invalid',
          line: 2,
          column: 35,
        },
        {
          messageId: 'invalid',
          line: 2,
          column: 39,
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
const f = (a: number, b: RegExp) => a + b;
      `,
      errors: [
        {
          messageId: 'invalid',
          line: 2,
          column: 41,
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
          data: {
            stringLike:
              'string, allowing a string + any of: `null`, `undefined`',
            type: 'string | boolean',
          },
          messageId: 'invalid',
          line: 3,
          column: 7,
        },
      ],
      options: [
        {
          allowNullish: true,
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
          data: {
            stringLike:
              'string, allowing a string + any of: `null`, `undefined`',
            type: 'boolean',
          },
          messageId: 'invalid',
          line: 3,
          column: 7,
        },
      ],
      options: [
        {
          allowNullish: true,
        },
      ],
    },
    {
      code: `
const f = (a: any, b: unknown) => a + b;
      `,
      options: [
        {
          allowAny: true,
          allowBoolean: true,
          allowNullish: true,
          allowRegExp: true,
        },
      ],
      errors: [
        {
          data: {
            stringLike:
              'string, allowing a string + any of: `any`, `boolean`, `null`, `RegExp`, `undefined`',
            type: 'unknown',
          },
          messageId: 'invalid',
          line: 2,
          column: 39,
        },
      ],
    },
  ],
});
