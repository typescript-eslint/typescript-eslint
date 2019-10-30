import {
  TestCaseError,
  InvalidTestCase,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import rule, {
  Options,
  MessageId,
} from '../../src/rules/no-unnecessary-condition';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

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
const t1 = (b1 && b2) ? 'yes' : 'no'
for(;;) {}`,
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

    /**
     * Predicate functions
     **/
    // valid, with the flag off
    `
[1,3,5].filter(() => true);
[1,2,3].find(() => false);
function truthy() {
  return [];
}
function falsy() {}
[1,3,5].filter(truthy);
[1,2,3].find(falsy);
`,
    {
      options: [{ checkArrayPredicates: true }],
      code: `
// with literal arrow function
[0,1,2].filter(x => x);

// filter with named function
function length(x: string) {
  return x.length;
}
["a", "b", ""].filter(length);

// with non-literal array
function nonEmptyStrings(x: string[]) {
  return x.filter(length);
}
`,
    },
    // Ignores non-array methods of the same name
    {
      options: [{ checkArrayPredicates: true }],
      code: `
const notArray = {
  filter: (func: () => boolean) => func(),
  find: (func: () => boolean) => func(),
};
notArray.filter(() => true);
notArray.find(() => true);
`,
    },

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
    // Doesn't check the right-hand side of a logical expression
    //  in a non-conditional context
    {
      code: `
declare const b1: boolean;
declare const b2: true;
const x = b1 && b2;`,
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
if(b2 && b1) {}
while(b1 && b2) {}
while(b2 && b1) {}
for (let i = 0; (b1 && b2); i++) { break; }
const t1 = (b1 && b2) ? 'yes' : 'no';
const t1 = (b2 && b1) ? 'yes' : 'no'`,
      errors: [
        ruleError(4, 12, 'alwaysTruthy'),
        ruleError(5, 12, 'alwaysTruthy'),
        ruleError(6, 4, 'alwaysTruthy'),
        ruleError(7, 10, 'alwaysTruthy'),
        ruleError(8, 7, 'alwaysTruthy'),
        ruleError(9, 13, 'alwaysTruthy'),
        ruleError(10, 18, 'alwaysTruthy'),
        ruleError(11, 13, 'alwaysTruthy'),
        ruleError(12, 19, 'alwaysTruthy'),
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

    // More complex logical expressions
    {
      code: `
declare const b1: boolean;
declare const b2: boolean;
if(true && b1 && b2) {}
if(b1 && false && b2) {}
if(b1 || b2 || true) {}
`,
      errors: [
        ruleError(4, 4, 'alwaysTruthy'),
        ruleError(5, 10, 'alwaysFalsy'),
        ruleError(6, 16, 'alwaysTruthy'),
      ],
    },

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

    // Predicate functions
    {
      options: [{ checkArrayPredicates: true }],
      code: `
[1,3,5].filter(() => true);
[1,2,3].find(() => { return false; });

// with non-literal array
function nothing(x: string[]) {
  return x.filter(() => false);
}
// with readonly array
function nothing2(x: readonly string[]) {
  return x.filter(() => false);
}
// with tuple
function nothing3(x: [string, string]) {
  return x.filter(() => false);
}
`,
      errors: [
        ruleError(2, 22, 'alwaysTruthy'),
        ruleError(3, 29, 'alwaysFalsy'),
        ruleError(7, 25, 'alwaysFalsy'),
        ruleError(11, 25, 'alwaysFalsy'),
        ruleError(15, 25, 'alwaysFalsy'),
      ],
    },
    {
      options: [{ checkArrayPredicates: true }],
      code: `
function truthy() {
  return [];
}
function falsy() {}
[1,3,5].filter(truthy);
[1,2,3].find(falsy);
`,
      errors: [
        ruleError(6, 16, 'alwaysTruthyFunc'),
        ruleError(7, 14, 'alwaysFalsyFunc'),
      ],
    },
    // Supports generics
    // TODO: fix this
    //     {
    //       options: [{ checkArrayPredicates: true }],
    //       code: `
    // const isTruthy = <T>(t: T) => T;
    // // Valid: numbers can be truthy or falsy (0).
    // [0,1,2,3].filter(isTruthy);
    // // Invalid: arrays are always falsy.
    // [[1,2], [3,4]].filter(isTruthy);
    // `,
    //       errors: [ruleError(6, 23, 'alwaysTruthyFunc')],
    //     },
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
