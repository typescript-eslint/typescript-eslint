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
    `
// Naked type param
function test<T>(t: T) {
  return t ? 'yes' : 'no'
}`,
    `
// Naked type param in union
function test<T>(t: T | []) {
  return t ? 'yes' : 'no'
}`,

    // Boolean expressions
    `
function test(a: string) {
  return a === "a"
}`,
    // Nullish coalescing operator
    `
function test(a: string | null) {
  return a ?? "default";
}`,
    `
function test(a: string | undefined) {
  return a ?? "default";
}`,
    `
function test(a: string | null | undefined) {
  return a ?? "default";
}`,
    `
function test(a: unknown) {
  return a ?? "default";
}`,
    // Supports ignoring the RHS
    {
      code: `
declare const b1: boolean;
declare const b2: true;
if(b1 && b2) {}`,
      options: [{ ignoreRhs: true }],
    },
    {
      code: `
while(true) {}
for (;true;) {}
do {} while(true)
      `,
      options: [{ allowConstantLoopConditions: true }],
    },
    `
let foo: undefined | { bar: true };
foo?.bar;
`,
    `
let foo: null | { bar: true };
foo?.bar;
`,
    `
let foo: undefined;
foo?.bar;
`,
    `
let foo: undefined;
foo?.bar.baz;
`,
    `
let foo: null;
foo?.bar;
`,
    `
let anyValue: any;
anyValue?.foo;
`,
    `
let unknownValue: unknown;
unknownValue?.foo;
`,
    `
let foo: undefined | (() => {});
foo?.();
`,
    `
let foo: null | (() => {});
foo?.();
`,
    `
let foo: undefined;
foo?.();
`,
    `
let foo: undefined;
foo?.().bar;
`,
    `
let foo: null;
foo?.();
`,
    `
let anyValue: any;
anyValue?.();
`,
    `
let unknownValue: unknown;
unknownValue?.();
`,
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
    // Nullish coalescing operator
    {
      code: `
function test(a: string) {
  return a ?? 'default';
}`,
      errors: [ruleError(3, 10, 'neverNullish')],
    },
    {
      code: `
function test(a: string | false) {
  return a ?? 'default';
}`,
      errors: [ruleError(3, 10, 'neverNullish')],
    },
    {
      code: `
function test(a: null) {
  return a ?? 'default';
}`,
      errors: [ruleError(3, 10, 'alwaysNullish')],
    },
    {
      code: `
function test(a: never) {
  return a ?? 'default';
}`,
      errors: [ruleError(3, 10, 'never')],
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
    {
      code: `
while(true) {}
for (;true;) {}
do {} while(true)
      `,
      options: [{ allowConstantLoopConditions: false }],
      errors: [
        ruleError(2, 7, 'alwaysTruthy'),
        ruleError(3, 7, 'alwaysTruthy'),
        ruleError(4, 13, 'alwaysTruthy'),
      ],
    },
    {
      code: `
let foo = { bar: true };
foo?.bar;
foo ?. bar;
foo ?.
  bar;
foo
  ?. bar;
`,
      output: `
let foo = { bar: true };
foo.bar;
foo . bar;
foo .
  bar;
foo
  . bar;
`,
      errors: [
        {
          messageId: 'neverOptionalChain',
          line: 3,
          column: 4,
          endLine: 3,
          endColumn: 6,
        },
        {
          messageId: 'neverOptionalChain',
          line: 4,
          column: 5,
          endLine: 4,
          endColumn: 7,
        },
        {
          messageId: 'neverOptionalChain',
          line: 5,
          column: 5,
          endLine: 5,
          endColumn: 7,
        },
        {
          messageId: 'neverOptionalChain',
          line: 8,
          column: 3,
          endLine: 8,
          endColumn: 5,
        },
      ],
    },
    {
      code: `
let foo = () => {};
foo?.();
foo ?. ();
foo ?.
  ();
foo
  ?. ();
`,
      output: `
let foo = () => {};
foo();
foo  ();
foo${' '}
  ();
foo
   ();
`,
      errors: [
        {
          messageId: 'neverOptionalChain',
          line: 3,
          column: 4,
          endLine: 3,
          endColumn: 6,
        },
        {
          messageId: 'neverOptionalChain',
          line: 4,
          column: 5,
          endLine: 4,
          endColumn: 7,
        },
        {
          messageId: 'neverOptionalChain',
          line: 5,
          column: 5,
          endLine: 5,
          endColumn: 7,
        },
        {
          messageId: 'neverOptionalChain',
          line: 8,
          column: 3,
          endLine: 8,
          endColumn: 5,
        },
      ],
    },
    {
      code: `
let foo = () => {};
foo?.(bar);
foo ?. (bar);
foo ?.
  (bar);
foo
  ?. (bar);
`,
      output: `
let foo = () => {};
foo(bar);
foo  (bar);
foo${' '}
  (bar);
foo
   (bar);
`,
      errors: [
        {
          messageId: 'neverOptionalChain',
          line: 3,
          column: 4,
          endLine: 3,
          endColumn: 6,
        },
        {
          messageId: 'neverOptionalChain',
          line: 4,
          column: 5,
          endLine: 4,
          endColumn: 7,
        },
        {
          messageId: 'neverOptionalChain',
          line: 5,
          column: 5,
          endLine: 5,
          endColumn: 7,
        },
        {
          messageId: 'neverOptionalChain',
          line: 8,
          column: 3,
          endLine: 8,
          endColumn: 5,
        },
      ],
    },
  ],
});
