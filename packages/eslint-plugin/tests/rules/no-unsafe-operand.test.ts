import rule from '../../src/rules/no-unsafe-operand';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-unsafe-operand', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    `
declare let a: number;
declare const b: number;
a * b;
a < b;
a -= b;
-a;
a++;
    `,
    `
declare let a: bigint;
declare const b: bigint;
a * b;
a -= b;
-a;
a++;
    `,
    `
declare const a: string;
declare const b: string;
a < b;
    `,
    `
declare const a: 1 | 2;
a * 2;
    `,
    `
declare const a: never;
a * 2;
    `,
    `
enum Fruit {
  Apple,
  Banana,
}
declare const fruit: Fruit;
fruit * 2;
    `,
    `
function double<T extends number>(value: T) {
  return value * 2;
}
    `,
    `
declare const a: any;
Number(a) * 2;
    `,
    `
declare const a: any;
+a * 2;
    `,
    `
declare const a: any;
typeof a === 'number' ? a * 2 : 0;
    `,
    `
declare let a: any;
if (typeof a === 'number') {
  a *= 2;
  a++;
}
    `,
    `
let a;
a = 1;
a *= 2;
    `,
    `
declare let a: any;
a + 1;
a += 1;
    `,
    `
declare const a: any;
+a;
!a;
typeof a;
    `,
    `
declare const a: any;
a === 1;
a != 1;
a && 1;
a ?? 1;
'b' in a;
a instanceof Object;
    `,
    `
declare let a: any;
a = 1;
a ||= 1;
a ??= 1;
    `,
  ],
  invalid: [
    {
      code: `
declare const a: any;
a * 2;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '*' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: any;
2 - a;
      `,
      errors: [
        {
          column: 5,
          data: { operator: '-' },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: any;
declare const b: any;
a * b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '*' },
          endColumn: 2,
          endLine: 4,
          line: 4,
          messageId: 'unsafeOperand',
        },
        {
          column: 5,
          data: { operator: '*' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: any;
a ** 2;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '**' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: any;
a << 1;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<<' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: any;
const doubled: number = a * 2;
      `,
      errors: [
        {
          column: 25,
          data: { operator: '*' },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
function double<T extends Record<string, any>>(record: T, key: keyof T) {
  return record[key] * 2;
}
      `,
      errors: [
        {
          column: 10,
          data: { operator: '*' },
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: any;
a & 1;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '&' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: any;
a >>> 1;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '>>>' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: any;
a < 1;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: any;
'b' >= a;
      `,
      errors: [
        {
          column: 8,
          data: { operator: '>=' },
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare let a: any;
a *= 2;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '*=' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare let total: number;
declare const a: any;
total -= a;
      `,
      errors: [
        {
          column: 10,
          data: { operator: '-=' },
          endColumn: 11,
          endLine: 4,
          line: 4,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: any;
-a;
      `,
      errors: [
        {
          column: 2,
          data: { operator: '-' },
          endColumn: 3,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: any;
~a;
      `,
      errors: [
        {
          column: 2,
          data: { operator: '~' },
          endColumn: 3,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare let a: any;
a++;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '++' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare let a: any;
--a;
      `,
      errors: [
        {
          column: 3,
          data: { operator: '--' },
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/13101
    {
      code: `
declare const input: unknown;
if (Array.isArray(input)) {
  const result = input.map(item => item * 2);
}
      `,
      errors: [
        {
          column: 36,
          data: { operator: '*' },
          endColumn: 40,
          endLine: 4,
          line: 4,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: { value: any };
a.value * 2;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '*' },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: { value: any } | undefined;
a?.value * 2;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '*' },
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
JSON.parse('1') * 2;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '*' },
          endColumn: 16,
          endLine: 2,
          line: 2,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: number;
(a as any) * 2;
      `,
      errors: [
        {
          column: 2,
          data: { operator: '*' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
declare const a: any;
typeof a === 'number' ? a * 2 : a * 2;
      `,
      errors: [
        {
          column: 33,
          data: { operator: '*' },
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'unsafeOperand',
        },
      ],
    },
    {
      code: `
let a: NotKnown;
a * 2;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '*' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'errorOperand',
        },
      ],
    },
  ],
});
