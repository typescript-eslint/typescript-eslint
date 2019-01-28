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

const message =
  'This assertion is unnecessary since it does not change the type of the expression.';

ruleTester.run('no-unnecessary-type-assertion', rule, {
  valid: [
    'const foo = 3 as number;',
    'const foo = <number> 3;',
    'const foo = <3>3;',
    'const foo = 3 as 3;',
    {
      code: `
type Foo = number;
const foo = (3 + 5) as Foo;`,
      options: [['Foo']]
    },
    {
      code: `
type Foo = number;
const foo = <Foo>(3 + 5);`,
      options: [['Foo']]
    }
  ],

  invalid: [
    {
      code: `
const foo = 3;
const bar = foo!;`,
      errors: [
        {
          message,
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
          message,
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
          message,
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
          message,
          line: 3,
          column: 13
        }
      ]
    },
    {
      code: `
type Foo = number;
const foo= <Foo>(3 + 5);`,
      errors: [
        {
          message,
          line: 3,
          column: 12
        }
      ]
    }
  ]
});
