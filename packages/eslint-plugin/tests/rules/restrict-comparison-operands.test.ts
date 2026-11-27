import rule from '../../src/rules/restrict-comparison-operands';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('restrict-comparison-operands', rule, {
  valid: [
    '1 < 2;',
    '1 <= 2;',
    '2 > 1;',
    '2 >= 1;',
    '1n < 2n;',
    "'a' < 'b';",
    'false < true;',
    '`a${1}` < `b${2}`;',
    `
enum Priority {
  Low,
  High,
}
declare const a: Priority;
declare const b: Priority;
a < b;
    `,
    `
enum Direction {
  Up = 'UP',
  Down = 'DOWN',
}
declare const a: Direction;
declare const b: Direction;
a > b;
    `,
    `
declare const a: Date;
declare const b: Date;
a < b;
a <= b;
a > b;
a >= b;
    `,
    `
class CustomDate extends Date {}
declare const a: CustomDate;
declare const b: CustomDate;
a < b;
    `,
    `
declare const a: Number;
declare const b: Number;
a < b;
    `,
    `
declare const a: BigInt;
declare const b: BigInt;
a < b;
    `,
    `
declare const a: String;
declare const b: String;
a < b;
    `,
    `
declare const a: Boolean;
declare const b: Boolean;
a < b;
    `,
    `
class Score {
  constructor(private readonly points: number) {}
  valueOf(): number {
    return this.points;
  }
}
new Score(1) < new Score(2);
    `,
    `
interface BigCounter {
  valueOf(): bigint;
}
declare const a: BigCounter;
declare const b: BigCounter;
a <= b;
    `,
    `
type StringValue = {
  valueOf: () => string;
};
declare const a: StringValue;
declare const b: StringValue;
a >= b;
    `,
    `
interface VariadicValueOf {
  valueOf(...args: unknown[]): number;
}
declare const a: VariadicValueOf;
declare const b: VariadicValueOf;
a < b;
    `,
    `
interface AnyValueOf {
  id: string;
  valueOf: any;
}
declare const a: AnyValueOf;
declare const b: AnyValueOf;
a < b;
    `,
    `
type GenericBrand<T> = T & { readonly __brand: unique symbol };
function compareBrandedGeneric<T extends number | string>(
  a: GenericBrand<T>,
  b: GenericBrand<T>,
) {
  return a < b;
}
    `,
    `
interface AnyReturnValueOf {
  valueOf(): any;
}
declare const a: AnyReturnValueOf;
declare const b: AnyReturnValueOf;
a < b;
    `,
    `
type BrandedNumber = number & { readonly __brand: unique symbol };
interface BrandedBox {
  valueOf(): BrandedNumber;
}
declare const a: BrandedBox;
declare const b: BrandedBox;
a < b;
    `,
    `
interface UnionValueOf {
  valueOf: (() => number) | (() => bigint);
}
declare const a: UnionValueOf;
declare const b: UnionValueOf;
a < b;
    `,
    `
class ZeroArgToPrimitive {
  [Symbol.toPrimitive](): number {
    return 1;
  }
}
new ZeroArgToPrimitive() < new ZeroArgToPrimitive();
    `,
    `
interface StringHintToPrimitive {
  [Symbol.toPrimitive](hint: string): number;
}
declare const a: StringHintToPrimitive;
declare const b: StringHintToPrimitive;
a < b;
    `,
    `
interface OverloadedToPrimitive {
  [Symbol.toPrimitive](hint: 'string'): symbol;
  [Symbol.toPrimitive](hint: 'number'): number;
}
declare const a: OverloadedToPrimitive;
declare const b: OverloadedToPrimitive;
a < b;
    `,
    `
interface OptionalToPrimitiveWithValueOf {
  [Symbol.toPrimitive]?: (hint: string) => number;
  valueOf(): number;
}
declare const a: OptionalToPrimitiveWithValueOf;
declare const b: OptionalToPrimitiveWithValueOf;
a < b;
    `,
    `
interface UndefinedToPrimitiveWithValueOf {
  [Symbol.toPrimitive]?: undefined;
  valueOf(): number;
}
declare const a: UndefinedToPrimitiveWithValueOf;
declare const b: UndefinedToPrimitiveWithValueOf;
a < b;
    `,
    `
function compareEmpty(a: {}, b: {}) {
  return a < b;
}
    `,
    `
function compareObjectUpper(a: Object, b: Object) {
  return a < b;
}
    `,
    `
interface EmptyInterface {}
function compareEmptyInterface(a: EmptyInterface, b: EmptyInterface) {
  return a < b;
}
    `,
    `
function compareToStringable(
  a: { toString(): string },
  b: { toString(): string },
) {
  return a < b;
}
    `,
    `
function compareUnconstrained<T>(a: T, b: T) {
  return a < b;
}
    `,
    `
function compareConstrainedValid<T extends number | Date>(a: T, b: T) {
  return a < b;
}
    `,
    `
type BrandedId = number & { readonly __brand: 'id' };
declare const a: BrandedId;
declare const b: BrandedId;
a < b;
    `,
    `
declare const a: {} & { toString(): string };
declare const b: {} & { toString(): string };
a < b;
    `,
    `
declare const a: { label: string } & { valueOf(): number };
declare const b: { label: string } & { valueOf(): number };
a < b;
    `,
    `
declare const a: { id: string; valueOf(): unknown } & { valueOf(): number };
declare const b: { id: string; valueOf(): unknown } & { valueOf(): number };
a < b;
    `,
    `
declare const a: Date & { readonly tag: string };
declare const b: Date & { readonly tag: string };
a < b;
    `,
    `
declare const a: number | Date;
declare const b: number | Date;
a < b;
    `,
    `
declare const a: Date | null | undefined;
declare const b: Date | null | undefined;
a! < b!;
    `,
    `
declare const a: any;
declare const b: unknown;
declare const c: never;
a < (b as any);
c < c;
    `,
    `
const left = { a: 1 };
const right = { a: 2 };
left === right;
left !== right;
left == right;
left != right;
'a' in left;
    `,
    `
class Box {}
const box = new Box();
box instanceof Box;
    `,
  ],
  invalid: [
    {
      code: `
if ({ a: 0 } < { a: 1 }) {
}
      `,
      errors: [
        {
          column: 5,
          data: { operator: '<', type: '{ a: number; }' },
          endColumn: 13,
          endLine: 2,
          line: 2,
          messageId: 'invalidOperand',
        },
        {
          column: 16,
          data: { operator: '<', type: '{ a: number; }' },
          endColumn: 24,
          endLine: 2,
          line: 2,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
if ({} < {}) {
}
      `,
      errors: [
        {
          column: 5,
          data: { operator: '<', type: '{}' },
          endColumn: 7,
          endLine: 2,
          line: 2,
          messageId: 'invalidOperand',
        },
        {
          column: 10,
          data: { operator: '<', type: '{}' },
          endColumn: 12,
          endLine: 2,
          line: 2,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
interface CustomerId {
  value: string;
}
declare const a: CustomerId;
declare const b: CustomerId;
a <= b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<=', type: 'CustomerId' },
          endColumn: 2,
          endLine: 7,
          line: 7,
          messageId: 'invalidOperand',
        },
        {
          column: 6,
          data: { operator: '<=', type: 'CustomerId' },
          endColumn: 7,
          endLine: 7,
          line: 7,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
declare const a: object;
declare const b: object;
a > b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '>', type: 'object' },
          endColumn: 2,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '>', type: 'object' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: '[1, 2] >= [3, 4];',
      errors: [
        {
          column: 1,
          data: { operator: '>=', type: 'number[]' },
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'invalidOperand',
        },
        {
          column: 11,
          data: { operator: '>=', type: 'number[]' },
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
declare const a: readonly string[];
declare const b: [string, number];
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'readonly string[]' },
          endColumn: 2,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: '[string, number]' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: '(() => 1) < (() => 2);',
      errors: [
        {
          column: 2,
          data: { operator: '<', type: '() => number' },
          endColumn: 9,
          endLine: 1,
          line: 1,
          messageId: 'invalidOperand',
        },
        {
          column: 14,
          data: { operator: '<', type: '() => number' },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
declare const a: any;
declare const b: Set<number>;
a < b;
      `,
      errors: [
        {
          column: 5,
          data: { operator: '<', type: 'Set<number>' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
declare const a: Map<string, number>;
declare const b: any;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'Map<string, number>' },
          endColumn: 2,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
declare const a: Promise<number>;
declare const b: RegExp;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'Promise<number>' },
          endColumn: 2,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'RegExp' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
interface CustomTypedArray extends Uint8Array {}
declare const a: Error;
declare const b: CustomTypedArray;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'Error' },
          endColumn: 2,
          endLine: 5,
          line: 5,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'CustomTypedArray' },
          endColumn: 6,
          endLine: 5,
          line: 5,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
declare const a: Symbol;
declare const b: Symbol;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'Symbol' },
          endColumn: 2,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'Symbol' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
class EmptyClass {}
declare const a: EmptyClass;
declare const b: EmptyClass;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'EmptyClass' },
          endColumn: 2,
          endLine: 5,
          line: 5,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'EmptyClass' },
          endColumn: 6,
          endLine: 5,
          line: 5,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
class GenericEmpty<T> {
  value?: T;
}
declare const a: GenericEmpty<number>;
declare const b: GenericEmpty<number>;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'GenericEmpty<number>' },
          endColumn: 2,
          endLine: 7,
          line: 7,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'GenericEmpty<number>' },
          endColumn: 6,
          endLine: 7,
          line: 7,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
class BaseEmpty {}
interface SubEmpty extends BaseEmpty {}
declare const a: SubEmpty;
declare const b: SubEmpty;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'SubEmpty' },
          endColumn: 2,
          endLine: 6,
          line: 6,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'SubEmpty' },
          endColumn: 6,
          endLine: 6,
          line: 6,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
interface TemporalLike {
  valueOf(): never;
}
declare const a: TemporalLike;
declare const b: TemporalLike;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'TemporalLike' },
          endColumn: 2,
          endLine: 7,
          line: 7,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'TemporalLike' },
          endColumn: 6,
          endLine: 7,
          line: 7,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
interface OptionalValueOf {
  id: number;
  valueOf?: () => number;
}
declare const a: OptionalValueOf;
declare const b: OptionalValueOf;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'OptionalValueOf' },
          endColumn: 2,
          endLine: 8,
          line: 8,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'OptionalValueOf' },
          endColumn: 6,
          endLine: 8,
          line: 8,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
interface NonCallableValueOf {
  valueOf: number;
}
declare const a: NonCallableValueOf;
declare const b: NonCallableValueOf;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'NonCallableValueOf' },
          endColumn: 2,
          endLine: 7,
          line: 7,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'NonCallableValueOf' },
          endColumn: 6,
          endLine: 7,
          line: 7,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
class ObjectToPrimitiveWithValueOf {
  [Symbol.toPrimitive](): { a: number } {
    return { a: 1 };
  }
  valueOf(): number {
    return 1;
  }
}
declare const a: ObjectToPrimitiveWithValueOf;
declare const b: ObjectToPrimitiveWithValueOf;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'ObjectToPrimitiveWithValueOf' },
          endColumn: 2,
          endLine: 12,
          line: 12,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'ObjectToPrimitiveWithValueOf' },
          endColumn: 6,
          endLine: 12,
          line: 12,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
interface StringOnlyToPrimitive {
  [Symbol.toPrimitive](hint: 'string'): number;
}
declare const a: StringOnlyToPrimitive;
declare const b: StringOnlyToPrimitive;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'StringOnlyToPrimitive' },
          endColumn: 2,
          endLine: 7,
          line: 7,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'StringOnlyToPrimitive' },
          endColumn: 6,
          endLine: 7,
          line: 7,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
interface UndefinedToPrimitiveOnly {
  [Symbol.toPrimitive]?: undefined;
}
declare const a: UndefinedToPrimitiveOnly;
declare const b: UndefinedToPrimitiveOnly;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'UndefinedToPrimitiveOnly' },
          endColumn: 2,
          endLine: 7,
          line: 7,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'UndefinedToPrimitiveOnly' },
          endColumn: 6,
          endLine: 7,
          line: 7,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
interface OptionalToPrimitiveWithoutValueOf {
  id: number;
  [Symbol.toPrimitive]?: (hint: string) => number;
}
declare const a: OptionalToPrimitiveWithoutValueOf;
declare const b: OptionalToPrimitiveWithoutValueOf;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'OptionalToPrimitiveWithoutValueOf' },
          endColumn: 2,
          endLine: 8,
          line: 8,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'OptionalToPrimitiveWithoutValueOf' },
          endColumn: 6,
          endLine: 8,
          line: 8,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
const FakeSymbol = { toPrimitive: Symbol('toPrimitive') };
class FakeToPrimitive {
  [FakeSymbol.toPrimitive](): number {
    return 1;
  }
}
declare const a: FakeToPrimitive;
declare const b: FakeToPrimitive;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'FakeToPrimitive' },
          endColumn: 2,
          endLine: 10,
          line: 10,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'FakeToPrimitive' },
          endColumn: 6,
          endLine: 10,
          line: 10,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
declare const a: number | { a: number };
declare const b: Date | { a: number };
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'number | { a: number; }' },
          endColumn: 2,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'Date | { a: number; }' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
declare const a: { a: number } | { b: string };
declare const b: { a: number } & { b: string };
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: '{ a: number; } | { b: string; }' },
          endColumn: 2,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: '{ a: number; } & { b: string; }' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
function compareBox<T extends { a: number }>(a: T, b: T) {
  return a < b;
}
      `,
      errors: [
        {
          column: 10,
          data: { operator: '<', type: '{ a: number; }' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'invalidOperand',
        },
        {
          column: 14,
          data: { operator: '<', type: '{ a: number; }' },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
function compareUnionWithTypeParam<T extends { a: number }>(
  a: number | T,
  b: any,
) {
  return a < b;
}
      `,
      errors: [
        {
          column: 10,
          data: { operator: '<', type: 'number | { a: number; }' },
          endColumn: 11,
          endLine: 6,
          line: 6,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
declare const a: { length: number };
declare const b: Iterable<string>;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: '{ length: number; }' },
          endColumn: 2,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
        {
          column: 5,
          data: { operator: '<', type: 'Iterable<string>' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'invalidOperand',
        },
      ],
    },
    {
      code: `
interface UnknownValueOf {
  id: string;
  valueOf(): unknown;
}
interface ObjectValueOf {
  valueOf(): object;
}
declare const a: UnknownValueOf & ObjectValueOf;
declare const b: number;
a < b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: '<', type: 'UnknownValueOf & ObjectValueOf' },
          endColumn: 2,
          endLine: 11,
          line: 11,
          messageId: 'invalidOperand',
        },
      ],
    },
  ],
});
