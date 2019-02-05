/**
 * @fileoverview Disallows non-null assertions using the `!` postfix operator.
 * @author Macklin Underdown
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule from '../../src/rules/no-non-null-assertion';
import RuleTester from '../RuleTester';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser'
});

ruleTester.run('no-non-null-assertion', rule, {
  valid: ['const x = { y: 1 }; x.y;'],
  invalid: [
    {
      code: 'const x = null; x!.y;',
      errors: [
        {
          messageId: 'noNonNull',
          line: 1,
          column: 17
        }
      ]
    }
  ]
});
