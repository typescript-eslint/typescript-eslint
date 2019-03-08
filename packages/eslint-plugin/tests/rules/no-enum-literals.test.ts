import rule from '../../src/rules/no-enum-literals';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
});

ruleTester.run('no-enum-literals', rule, {
  valid: [
    // Make sure non-enum BinaryExpressions are still valid
    '0 === 0',
    'var a = 1',
    'var b = "str"',
    `
var a = 1;
(a === 0)`,
    `
var a = 1;
(0 === a)`,
    `
var a = 1;
(a === a)`,
    `
var a = "str";
(a === "other")`,

    // Make sure non-enum VariableDeclaration are still valid
    'var a: number = 1',
    'var a: string = "str"',

    // Enum cases
    `
enum Foo { ONE, TWO };
let f: Foo;
(f === Foo.ONE);`,
    `
enum Foo { ONE, TWO };
let f: Foo;
(Foo.ONE === f);`,
    `
enum Foo { ONE, TWO };
let f = Foo.ONE;`,
    `
enum Foo { ONE, TWO };
let f: Foo;
f = Foo.ONE;`,
    `
enum Foo { ONE, TWO };
function foo(f: Foo) {};
foo(Foo.ONE);`,
    `
enum Foo { ONE = 1, TWO = 2 };
let f: Foo;
(f === Foo.ONE);`,
    `
enum Foo { ONE = 1, TWO = 2 };
let f: Foo;
(Foo.ONE === f);`,
    `
enum Foo { ONE = 1, TWO = 2 };
let f: Foo;
f = Foo.ONE;`,
    `
enum Foo { ONE = 1, TWO = 2 };
let f: Foo;
f = Foo.ONE;`,
    `
enum Foo { ONE = 1, TWO = 2 };
function foo(f: Foo) {};
foo(Foo.ONE);`,
    `
enum Foo { ONE = "ONE", TWO = "TWO" };
let f: Foo;
(f === Foo.ONE);`,
    `
enum Foo { ONE = "ONE", TWO = "TWO" };
let f: Foo;
(Foo.ONE === f);`,
    `
enum Foo { ONE = "ONE", TWO = "TWO" };
let f: Foo;
f = Foo.ONE;`,
    `
enum Foo { ONE = "ONE", TWO = "TWO" };
let f: Foo = Foo.ONE;`,
    `
enum Foo { ONE = "ONE", TWO = "TWO" };
function foo(f: Foo) {};
foo(Foo.ONE);`,
  ],

  invalid: [
    {
      code: `
enum Foo { ONE, TWO };
let f: Foo;
(f === 0);`,
      errors: [
        {
          messageId: 'noLiterals',
          line: 4,
          column: 8,
        },
      ],
    },
    {
      code: `
enum Foo { ONE, TWO };
let f: Foo;
(0 === f);`,
      errors: [
        {
          messageId: 'noLiterals',
          line: 4,
          column: 2,
        },
      ],
    },
    {
      code: `
enum Foo { ONE, TWO };
let f: Foo;
f = 0;`,
      errors: [
        {
          messageId: 'noLiterals',
          line: 4,
          column: 5,
        },
      ],
    },

    {
      code: `
enum Foo { ONE, TWO };
let f: Foo = 0;`,
      errors: [
        {
          messageId: 'noLiterals',
          line: 3,
          column: 14,
        },
      ],
    },
    {
      code: `
enum Foo { ONE = 1, TWO = 2 };
let f: Foo;
(f === 0);`,
      errors: [
        {
          messageId: 'noLiterals',
          line: 4,
          column: 8,
        },
      ],
    },
    {
      code: `
enum Foo { ONE = 1, TWO = 2 };
let f: Foo;
(0 === f);`,
      errors: [
        {
          messageId: 'noLiterals',
          line: 4,
          column: 2,
        },
      ],
    },
    {
      code: `
enum Foo { ONE = 1, TWO = 2 };
let f: Foo;
f = 0;`,
      errors: [
        {
          messageId: 'noLiterals',
          line: 4,
          column: 5,
        },
      ],
    },
    {
      code: `
enum Foo { ONE = 1, TWO = 2 };
let f: Foo = 0;`,
      errors: [
        {
          messageId: 'noLiterals',
          line: 3,
          column: 14,
        },
      ],
    },
    {
      code: `
enum Foo { ONE = "ONE", TWO = "TWO" };
let f: Foo;
(f === "ONE");`,
      errors: [
        {
          messageId: 'noLiterals',
          line: 4,
          column: 8,
        },
      ],
    },
    {
      code: `
enum Foo { ONE = "ONE", TWO = "TWO" };
let f: Foo;
("ONE" === f);`,
      errors: [
        {
          messageId: 'noLiterals',
          line: 4,
          column: 2,
        },
      ],
    },
  ],
});
