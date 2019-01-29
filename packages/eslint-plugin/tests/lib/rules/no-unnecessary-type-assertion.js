/**
 * @fileoverview Warns if a type assertion does not change the type of an expression.
 * @author Benjamin Lichtman
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-unnecessary-type-assertion'),
  RuleTester = require('eslint').RuleTester,
  path = require('path');

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const rootDir = path.join(process.cwd(), 'tests/fixtures');
const parserOptions = {
  ecmaVersion: 2015,
  tsconfigRootDir: rootDir,
  project: './tsconfig.json'
};
const ruleTester = new RuleTester({
  parserOptions,
  parser: '@typescript-eslint/parser'
});

ruleTester.run('no-unnecessary-type-assertion', rule, {
  valid: [
    'const foo = 3 as number;',
    'const foo = <number> 3;',
    'const foo = <3>3;',
    'const foo = 3 as 3;',
    `
type Tuple = [3, "hi", "bye"];
const foo = ([3, "hi", "bye"]) as Tuple;`,
    `
type PossibleTuple = {};
const foo = ({}) as PossibleTuple;`,
    `
type PossibleTuple = { hello: "hello" };
const foo = ({ hello: "hello" }) as PossibleTuple;`,
    `
type PossibleTuple = { 0: "hello", 5: "hello" };
const foo = ({ 0: "hello", 5: "hello" }) as PossibleTuple;`,
    {
      code: `
type Foo = number;
const foo = (3 + 5) as Foo;`,
      options: [{ typesToIgnore: ['Foo'] }]
    },
    {
      code: `
type Foo = number;
const foo = <Foo>(3 + 5);`,
      options: [{ typesToIgnore: ['Foo'] }]
    }
  ],

  invalid: [
    {
      code: `
const foo = 3;
const bar = foo!;`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
          column: 13
        }
      ]
    },
    {
      code: `
const foo = (3 + 5) as number;`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13
        }
      ]
    },
    {
      code: `
const foo = <number>(3 + 5);`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13
        }
      ]
    },
    {
      code: `
type Foo = number;
const foo = (3 + 5) as Foo;`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
          column: 13
        }
      ]
    },
    {
      code: `
type Foo = number;
const foo = <Foo>(3 + 5);`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
          column: 13
        }
      ]
    }
  ]
});
