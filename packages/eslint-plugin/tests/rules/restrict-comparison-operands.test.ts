import rule from '../../src/rules/restrict-comparison-operands';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('restrict-comparison-operands', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    `
1 < 2;
    `,
    `
declare const a: bigint;
declare const b: number;
a >= b;
    `,
    `
'a' < 'b';
    `,
    `
declare const a: Date;
declare const b: Date;
a < b;
    `,
    `
declare const a: Date;
a <= Date.now();
    `,
    `
declare const a: Number;
a > 1;
    `,
    `
class Money {
  valueOf(): number {
    return 0;
  }
}
declare const a: Money;
declare const b: Money;
a < b;
    `,
    `
class Temperature {
  [Symbol.toPrimitive](): number {
    return 0;
  }
}
declare const a: Temperature;
a > 0;
    `,
    `
class LaterDate extends Date {}
declare const a: LaterDate;
a < new Date();
    `,
    `
function compare(a: {}, b: {}) {
  return a < b;
}
    `,
    `
function compare(a: Object, b: Object) {
  return a < b;
}
    `,
    `
function compare(a: object, b: object) {
  return a < b;
}
    `,
    `
function compare<T>(a: T, b: T) {
  return a < b;
}
    `,
    `
function compare<T extends number>(a: T, b: T) {
  return a < b;
}
    `,
    `
declare const a: number | { value: number };
a < 1;
    `,
    `
declare const a: string & { __brand: 'id' };
a < 'b';
    `,
    `
declare const a: any;
a < 1;
    `,
    `
declare const a: { value: number };
declare const b: { value: number };
a === b;
    `,
    `
enum Size {
  Small,
  Large,
}
Size.Small < Size.Large;
    `,
    `
declare const a: { value: number };
'value' in a;
    `,
  ],
  invalid: [
    {
      code: `
declare const a: { value: number };
a < 1;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: '{ value: number; }' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unorderedOperand',
        },
      ],
    },
    {
      code: `
declare const a: { value: number };
1 > a;
      `,
      errors: [
        {
          column: 5,
          data: { operator: '>', type: '{ value: number; }' },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'unorderedOperand',
        },
      ],
    },
    {
      code: `
declare const a: number[];
a <= 1;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<=', type: 'number[]' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unorderedOperand',
        },
      ],
    },
    {
      code: `
declare const a: Map<string, number>;
a >= 1;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '>=', type: 'Map<string, number>' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unorderedOperand',
        },
      ],
    },
    {
      code: `
declare const a: () => number;
a < 1;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: '() => number' },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unorderedOperand',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const a: Point;
a < 1;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'Point' },
          endColumn: 2,
          endLine: 9,
          line: 9,
          messageId: 'unorderedOperand',
        },
      ],
    },
    {
      code: `
class Version {
  toString() {
    return '1.0.0';
  }
}
declare const a: Version;
a < 1;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'Version' },
          endColumn: 2,
          endLine: 8,
          line: 8,
          messageId: 'unorderedOperand',
        },
      ],
    },
    {
      code: `
declare const a: { value: number } | null;
a! < 1;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: '{ value: number; }' },
          endColumn: 3,
          endLine: 3,
          line: 3,
          messageId: 'unorderedOperand',
        },
      ],
    },
    {
      code: `
declare const a: { value: number } | { label: string };
a < 1;
      `,
      errors: [
        {
          column: 1,
          data: {
            operator: '<',
            type: '{ value: number; } | { label: string; }',
          },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unorderedOperand',
        },
      ],
    },
    {
      code: `
declare const a: { value: number } & { label: string };
a < 1;
      `,
      errors: [
        {
          column: 1,
          data: {
            operator: '<',
            type: '{ value: number; } & { label: string; }',
          },
          endColumn: 2,
          endLine: 3,
          line: 3,
          messageId: 'unorderedOperand',
        },
      ],
    },
    {
      code: `
function compare<T extends { value: number }>(a: T) {
  return a < 1;
}
      `,
      errors: [
        {
          column: 10,
          data: { operator: '<', type: '{ value: number; }' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'unorderedOperand',
        },
      ],
    },
    {
      code: `
declare const a: { value: number };
declare const b: { value: number };
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: '{ value: number; }' },
          endColumn: 2,
          endLine: 4,
          line: 4,
          messageId: 'unorderedOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: '{ value: number; }' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'unorderedOperand',
        },
      ],
    },
  ],
});
