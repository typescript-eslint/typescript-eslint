import path from 'path';
import rule, {
  Options,
  MessageId,
} from '../../src/rules/no-unnecessary-condition';
import { RuleTester } from '../RuleTester';
import {
  TestCaseError,
  InvalidTestCase,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';

const rootPath = path.join(process.cwd(), 'tests/fixtures/');

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

const ruleError = (
  line: number,
  column: number,
  messageId: MessageId,
): TestCaseError<MessageId> => ({
  messageId,
  line,
  column,
});

const necessaryConditionTest = (condition: string): string => `
declare const b1: ${condition};
declare const b2: boolean;
const t1 = b1 && b2;
`;

const unnecessaryConditionTest = (
  condition: string,
  messageId: MessageId,
): InvalidTestCase<MessageId, Options> => ({
  code: necessaryConditionTest(condition),
  errors: [ruleError(4, 12, messageId)],
});

ruleTester.run('no-unnecessary-conditionals', rule, {
  valid: [
    `
declare const b1: boolean;
declare const b2: boolean;
const t1 = b1 && b2;
const t2 = b1 || b2;
if(b1 && b2) {}
while(b1 && b2) {}
for (let i = 0; (b1 && b2); i++) { break; }
const t1 = (b1 && b2) ? 'yes' : 'no'`,
    necessaryConditionTest('false | 5'), // Truthy literal and falsy literal
    necessaryConditionTest('boolean | "foo"'), // boolean and truthy literal
    necessaryConditionTest('0 | boolean'), // boolean and falsy literal
    necessaryConditionTest('boolean | object'), // boolean and always-truthy type
    necessaryConditionTest('false | object'), // always truthy type and falsy literal
    // always falsy type and always truthy type
    necessaryConditionTest('null | object'),
    necessaryConditionTest('undefined | true'),
    necessaryConditionTest('void | true'),

    necessaryConditionTest('any'), // any
    necessaryConditionTest('unknown'), // unknown

    // Generic type params
    `
function test<T extends string>(t: T) {
  return t ? 'yes' : 'no'
}`,

    // Boolean expressions
    `
function test(a: string) {
  return a === "a"
}`,

    // Supports ignoring the RHS
    {
      code: `
declare const b1: boolean;
declare const b2: true;
if(b1 && b2) {}`,
      options: [{ ignoreRhs: true }],
    },
  ],
  invalid: [
    // Ensure that it's checking in all the right places
    {
      code: `
const b1 = true;
declare const b2: boolean;
const t1 = b1 && b2;
const t2 = b1 || b2;
if(b1 && b2) {}
while(b1 && b2) {}
for (let i = 0; (b1 && b2); i++) { break; }
const t1 = (b1 && b2) ? 'yes' : 'no'`,
      errors: [
        ruleError(4, 12, 'alwaysTruthy'),
        ruleError(5, 12, 'alwaysTruthy'),
        ruleError(6, 4, 'alwaysTruthy'),
        ruleError(7, 7, 'alwaysTruthy'),
        ruleError(8, 18, 'alwaysTruthy'),
        ruleError(9, 13, 'alwaysTruthy'),
      ],
    },
    // Ensure that it's complaining about the right things
    unnecessaryConditionTest('object', 'alwaysTruthy'),
    unnecessaryConditionTest('object | true', 'alwaysTruthy'),
    unnecessaryConditionTest('"" | false', 'alwaysFalsy'), // Two falsy literals
    unnecessaryConditionTest('"always truthy"', 'alwaysTruthy'),
    unnecessaryConditionTest(`undefined`, 'alwaysFalsy'),
    unnecessaryConditionTest('null', 'alwaysFalsy'),
    unnecessaryConditionTest('void', 'alwaysFalsy'),
    unnecessaryConditionTest('never', 'never'),

    // Generic type params
    {
      code: `
function test<T extends object>(t: T) {
  return t ? 'yes' : 'no'
}`,
      errors: [ruleError(3, 10, 'alwaysTruthy')],
    },
    {
      code: `
function test<T extends false>(t: T) {
  return t ? 'yes' : 'no'
}`,
      errors: [ruleError(3, 10, 'alwaysFalsy')],
    },
    {
      code: `
function test<T extends 'a' | 'b'>(t: T) {
  return t ? 'yes' : 'no'
}`,
      errors: [ruleError(3, 10, 'alwaysTruthy')],
    },

    // Boolean expressions
    {
      code: `
function test(a: "a") {
  return a === "a"
}`,
      errors: [ruleError(3, 10, 'literalBooleanExpression')],
    },
    {
      code: `
const y = 1;
if (y === 0) {}
`,
      errors: [ruleError(3, 5, 'literalBooleanExpression')],
    },
    {
      code: `
enum Foo {
  a = 1,
  b = 2
}

const x = Foo.a;
if (x === Foo.a) {}
`,
      errors: [ruleError(8, 5, 'literalBooleanExpression')],
    },

    // Still errors on in the expected locations when ignoring RHS
    {
      options: [{ ignoreRhs: true }],
      code: `
const b1 = true;
const b2 = false;
const t1 = b1 && b2;
const t2 = b1 || b2;
if(b1 && b2) {}
while(b1 && b2) {}
for (let i = 0; (b1 && b2); i++) { break; }
const t1 = (b1 && b2) ? 'yes' : 'no'`,
      errors: [
        ruleError(4, 12, 'alwaysTruthy'),
        ruleError(5, 12, 'alwaysTruthy'),
        ruleError(6, 4, 'alwaysTruthy'),
        ruleError(7, 7, 'alwaysTruthy'),
        ruleError(8, 18, 'alwaysTruthy'),
        ruleError(9, 13, 'alwaysTruthy'),
      ],
    },
  ],
});
