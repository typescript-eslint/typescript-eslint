/**
 * @fileoverview Disallows invocation of `require()`.
 * @author Kanitkorn Sujautra
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-require-imports'),
  RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module'
  },
  parser: '@typescript-eslint/parser'
});

ruleTester.run('no-require-imports', rule, {
  valid: [
    "import {l} from 'lib'",
    "var lib3 = load('not_an_import')",
    'var lib4 = lib2.subImport',
    'var lib7 = 700',
    'import lib9 = lib2.anotherSubImport',
    "import lib10 from 'lib10'"
  ],
  invalid: [
    {
      code: "var lib = require('lib')",
      errors: [
        {
          message: 'A `require()` style import is forbidden.',
          line: 1,
          column: 11
        }
      ]
    },
    {
      code: "let lib2 = require('lib2')",
      errors: [
        {
          message: 'A `require()` style import is forbidden.',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: "var lib5 = require('lib5'), lib6 = require('lib6')",
      errors: [
        {
          message: 'A `require()` style import is forbidden.',
          line: 1,
          column: 12
        },
        {
          message: 'A `require()` style import is forbidden.',
          line: 1,
          column: 36
        }
      ]
    },
    {
      code: "import lib8 = require('lib8')",
      errors: [
        {
          message: 'A `require()` style import is forbidden.',
          line: 1,
          column: 15
        }
      ]
    }
  ]
});
