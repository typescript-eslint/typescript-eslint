import path from 'path';
import rule from '../../src/rules/strict-comparisons';
import { RuleTester } from '../RuleTester';

const rootPath = path.join(process.cwd(), 'tests/fixtures/');

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('strict-comparisons', rule, {
  valid: [
    `
if (2) {
}
    `,
    `
if (2 > 1) {
}
    `,
    `
if (2 < 1) {
}
    `,
    `
if (2 >= 1) {
}
    `,
    `
if (2 <= 1) {
}
    `,
    `
if (2 == 1) {
}
    `,
    `
if (2 === 1) {
}
    `,
    `
if (2 != 1) {
}
    `,
    `
if (2 !== 1) {
}
    `,
    `
if (true) {
}
    `,
    `
if (true == false) {
}
    `,
    `
if (true === false) {
}
    `,
    `
if (true != false) {
}
    `,
    `
if (true !== false) {
}
    `,
    `
if ('') {
}
    `,
    `
if ('' == '') {
}
    `,
    `
if ('' === '') {
}
    `,
    `
if ('' != '') {
}
    `,
    `
if ('' !== '') {
}
    `,
    `
if ({}) {
}
    `,
    `
if (3 > 2 || (2 > 1 && true === true)) {
}
    `,
    `
function sameObject<T>(a: any, b: any): boolean {
  return a === b;
}
    `,
    `
function sameObject<T>(a: any, b: number): boolean {
  return a === b;
}
    `,
    `
function sameObject<T>(a: number, b: any): boolean {
  return a === b;
}
    `,
    `
type myNumber = number;
const a1: myNumber = 1;
const a2: myNumber = 2;
if (a1 < a2) {
}
if (a2 < a1) {
}
    `,
    `
type myString = string;
const b1: myString = '';
const b2: myString = '';
if (b1 === b2) {
}
if (b2 === b1) {
}
    `,
    `
const d1: any = 'string';
const d2: any = 2;
if (d1 === d2) {
}
if (d2 === d1) {
}
    `,
    `
enum TestNumericEnum {
  One = 1,
  Two = 2,
}
const e1: TestNumericEnum = TestNumericEnum.One;
if (e1 === TestNumericEnum.Two) {
}
if (TestNumericEnum.Two === e1) {
}
if (e1 > TestNumericEnum.Two) {
}
if (TestNumericEnum.Two > e1) {
}
    `,
    `
const f1: TestNumericEnum | undefined;
const f2: TestNumericEnum | undefined;
if (f1 === f2) {
}
if (f2 === f1) {
}
    `,
    `
enum TestStringEnum {
  One = 'one',
  Two = 'two',
}
const g1: TestStringEnum = TestStringEnum.One;
if (g1 === TestStringEnum.Two) {
}
if (TestStringEnum.Two === g1) {
}
    `,
    `
const h1: string | number = Math.random() > 0.5 ? 'text' : 5;
const h2: string | number = Math.random() > 0.5 ? 'test' : 2;
if (h1 === h2) {
}
if (h2 === h1) {
}
    `,
    `
const a: any = 5 as any;
const b: number = 2;
if (a < a) {
}
if (b > b) {
}
if (a <= a) {
}
if (b >= b) {
}
if (a == a) {
}
if (b != b) {
}
if (a === a) {
}
if (b !== b) {
}
    `,
    `
const b: any = 5 as any;
const a: number = 2;
if (a < a) {
}
if (b > b) {
}
if (a <= a) {
}
if (b >= b) {
}
if (a == a) {
}
if (b != b) {
}
if (a === a) {
}
if (b !== b) {
}
    `,
    {
      code: `
if ('' > '') {
}
      `,
      options: [
        { allowObjectEqualComparison: false, allowStringOrderComparison: true },
      ],
    },
    {
      code: `
if ('' < '') {
}
      `,
      options: [
        { allowObjectEqualComparison: false, allowStringOrderComparison: true },
      ],
    },
    {
      code: `
if ('' >= '') {
}
      `,
      options: [
        { allowObjectEqualComparison: false, allowStringOrderComparison: true },
      ],
    },
    {
      code: `
if ('' <= '') {
}
      `,
      options: [
        { allowObjectEqualComparison: false, allowStringOrderComparison: true },
      ],
    },
    {
      code: `
type myString = string;
const b1: myString = '';
const b2: myString = '';
if (b1 === b2) {
}
if (b2 === b1) {
}
      `,
      options: [
        { allowObjectEqualComparison: false, allowStringOrderComparison: true },
      ],
    },
    {
      code: `
enum TestStringEnum {
  One = 'one',
  Two = 'two',
}
const g1: TestStringEnum = TestStringEnum.One;
if (g1 === TestStringEnum.Two) {
}
if (TestStringEnum.Two === g1) {
}
if (g1 > TestStringEnum.Two) {
}
if (TestStringEnum.Two > g1) {
}
      `,
      options: [
        { allowObjectEqualComparison: false, allowStringOrderComparison: true },
      ],
    },
    {
      code: `
const h1: string | number = Math.random() > 0.5 ? 'text' : 5;
const h2: string | number = Math.random() > 0.5 ? 'test' : 2;
if (h1 > h2) {
}
if (h2 > h1) {
}
if (h1 === h2) {
}
if (h2 === h1) {
}
      `,
      options: [
        { allowObjectEqualComparison: false, allowStringOrderComparison: true },
      ],
    },
    {
      code: `
const a = {};
const b = {};
if (a == a) {
}
if (b != b) {
}
if (a === a) {
}
if (b !== b) {
}
      `,
      options: [
        { allowObjectEqualComparison: true, allowStringOrderComparison: false },
      ],
    },
  ],
  invalid: [
    {
      code: `
if (2 > undefined) {
}
      `,
      errors: [
        {
          messageId: 'nonComparableTypes',
          data: {
            typesLeft: 'number',
            typesRight: 'undefined',
          },
        },
      ],
    },
    {
      code: `
if (undefined > 2) {
}
      `,
      errors: [
        {
          messageId: 'nonComparableTypes',
          data: {
            typesLeft: 'undefined',
            typesRight: 'number',
          },
        },
      ],
    },
    {
      code: `
if (2 === undefined) {
}
      `,
      errors: [
        {
          messageId: 'nonComparableTypes',
          data: {
            typesLeft: 'number',
            typesRight: 'undefined',
          },
        },
      ],
    },
    {
      code: `
if (undefined === 2) {
}
      `,
      errors: [
        {
          messageId: 'nonComparableTypes',
          data: {
            typesLeft: 'undefined',
            typesRight: 'number',
          },
        },
      ],
    },
    {
      code: `
if (true > false) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '>',
            type: 'boolean',
          },
        },
      ],
    },
    {
      code: `
if (true < false) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '<',
            type: 'boolean',
          },
        },
      ],
    },
    {
      code: `
if (true >= false) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '>=',
            type: 'boolean',
          },
        },
      ],
    },
    {
      code: `
if (true <= false) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '<=',
            type: 'boolean',
          },
        },
      ],
    },
    {
      code: `
if ('' > '') {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '>',
            type: 'string',
          },
        },
      ],
    },
    {
      code: `
if ('' < '') {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '<',
            type: 'string',
          },
        },
      ],
    },
    {
      code: `
if ('' >= '') {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '>=',
            type: 'string',
          },
        },
      ],
    },
    {
      code: `
if ('' <= '') {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '<=',
            type: 'string',
          },
        },
      ],
    },
    {
      code: `
if ({} > {}) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '>',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
if ({} >= {}) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '>=',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
if ({} <= {}) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '<=',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
if ({} == {}) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '==',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
if ({} === {}) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '===',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
if ({} != {}) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '!=',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
if ({} !== {}) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '!==',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
if ([] === []) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '===',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
if ('' > '' || 2 > 1 || {} > {}) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '>',
            type: 'string',
          },
        },
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '>',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
if ('' > '' && 2 > 1 && {} > {}) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '>',
            type: 'string',
          },
        },
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '>',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
if ({} === null) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '===',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
if (null === {}) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '===',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
if ({} === undefined) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '===',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
if (undefined === {}) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '===',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
function sameObject<T>(a: T, b: T): boolean {
  return a === b;
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '===',
            type: 'object',
          },
        },
      ],
    },
    {
      code: `
type myObject = Object;
const c1: myObject = {};
const c2: myObject = {};
if (c1 === c2) {
}
if (c2 === c1) {
}
      `,
      errors: [
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '===',
            type: 'object',
          },
        },
        {
          messageId: 'invalidTypeForOperator',
          data: {
            comparator: '===',
            type: 'object',
          },
        },
      ],
    },
  ],
});
