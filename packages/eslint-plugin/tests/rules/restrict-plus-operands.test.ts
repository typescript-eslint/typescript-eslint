import rule from '../../src/rules/restrict-plus-operands';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

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
    'var x = 5;',
    "var y = '10';",
    'var z = 8.2;',
    "var w = '6.5';",
    'var foo = 5 + 10;',
    "var foo = '5.5' + '10';",
    "var foo = parseInt('5.5', 10) + 10;",
    "var foo = parseFloat('5.5', 10) + 10;",
    'var foo = 1n + 1n;',
    'var foo = BigInt(1) + 1n;',
    `
      var foo = 1n;
      foo + 2n;
    `,
    `
function test(s: string, n: number): number {
  return 2;
}
var foo = test('5.5', 10) + 10;
    `,
    `
var x = 5;
var z = 8.2;
var foo = x + z;
    `,
    `
var w = '6.5';
var y = '10';
var foo = y + w;
    `,
    'var foo = 1 + 1;',
    "var foo = '1' + '1';",
    `
var pair: { first: number; second: string } = { first: 5, second: '10' };
var foo = pair.first + 10;
    `,
    `
var pair: { first: number; second: string } = { first: 5, second: '10' };
var foo = pair.first + (10 as number);
    `,
    `
var pair: { first: number; second: string } = { first: 5, second: '10' };
var foo = '5.5' + pair.second;
    `,
    `
var pair: { first: number; second: string } = { first: 5, second: '10' };
var foo = ('5.5' as string) + pair.second;
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
  ],
  invalid: [
    {
      code: "var foo = '1' + 1;",
      errors: [
        {
          messageId: 'notStrings',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: 'var foo = [] + {};',
      errors: [
        {
          messageId: 'notNumbers',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "var foo = 5 + '10';",
      errors: [
        {
          messageId: 'notStrings',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: 'var foo = [] + 5;',
      errors: [
        {
          messageId: 'notNumbers',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: 'var foo = [] + [];',
      errors: [
        {
          messageId: 'notNumbers',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: 'var foo = 5 + [];',
      errors: [
        {
          messageId: 'notNumbers',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "var foo = '5' + {};",
      errors: [
        {
          messageId: 'notStrings',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "var foo = 5.5 + '5';",
      errors: [
        {
          messageId: 'notStrings',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "var foo = '5.5' + 5;",
      errors: [
        {
          messageId: 'notStrings',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `
var x = 5;
var y = '10';
var foo = x + y;
      `,
      errors: [
        {
          messageId: 'notStrings',
          line: 4,
          column: 11,
        },
      ],
    },
    {
      code: `
var x = 5;
var y = '10';
var foo = y + x;
      `,
      errors: [
        {
          messageId: 'notStrings',
          line: 4,
          column: 11,
        },
      ],
    },
    {
      code: `
var x = 5;
var foo = x + {};
      `,
      errors: [
        {
          messageId: 'notNumbers',
          line: 3,
          column: 11,
        },
      ],
    },
    {
      code: `
var y = '10';
var foo = [] + y;
      `,
      errors: [
        {
          messageId: 'notStrings',
          line: 3,
          column: 11,
        },
      ],
    },
    {
      code: `
var pair: { first: number; second: string } = { first: 5, second: '10' };
var foo = pair.first + '10';
      `,
      errors: [
        {
          messageId: 'notStrings',
          line: 3,
          column: 11,
        },
      ],
    },
    {
      code: `
var pair: { first: number; second: string } = { first: 5, second: '10' };
var foo = 5 + pair.second;
      `,
      errors: [
        {
          messageId: 'notStrings',
          line: 3,
          column: 11,
        },
      ],
    },
    {
      code: "var foo = parseInt('5.5', 10) + '10';",
      errors: [
        {
          messageId: 'notStrings',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `
var pair = { first: 5, second: '10' };
var foo = pair + pair;
      `,
      errors: [
        {
          messageId: 'notNumbers',
          line: 3,
          column: 11,
        },
      ],
    },
    {
      code: 'var foo = 1n + 1;',
      errors: [
        {
          messageId: 'notBigInts',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: 'var foo = 1 + 1n;',
      errors: [
        {
          messageId: 'notBigInts',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `
        var foo = 1n;
        foo + 1;
      `,
      errors: [
        {
          messageId: 'notBigInts',
          line: 3,
          column: 9,
        },
      ],
    },
    {
      code: `
        var foo = 1;
        foo + 1n;
      `,
      errors: [
        {
          messageId: 'notBigInts',
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
          messageId: 'notStrings',
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
          messageId: 'notStrings',
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
          messageId: 'notStrings',
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
          messageId: 'notStrings',
          line: 3,
          column: 10,
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
          messageId: 'notStrings',
          line: 4,
          column: 19,
        },
      ],
    },
    {
      code: `
        declare const a: number & string;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          messageId: 'notStrings',
          line: 4,
          column: 19,
        },
      ],
    },
    {
      code: `
        declare const a: symbol & string;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          messageId: 'notStrings',
          line: 4,
          column: 19,
        },
      ],
    },
    {
      code: `
        declare const a: object & string;
        declare const b: string;
        const x = a + b;
      `,
      errors: [
        {
          messageId: 'notStrings',
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
          messageId: 'notStrings',
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
          messageId: 'notStrings',
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
          messageId: 'notStrings',
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
          messageId: 'notStrings',
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
          messageId: 'notStrings',
          line: 3,
          column: 1,
        },
      ],
    },
  ],
});
