import rule from '../../src/rules/no-var-requires';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-var-requires', rule, {
  valid: ["import foo = require('foo')", "require('foo')"],
  invalid: [
    {
      code: "var foo = require('foo')",
      errors: [
        {
          messageId: 'noVarReqs',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "const foo = require('foo')",
      errors: [
        {
          messageId: 'noVarReqs',
          line: 1,
          column: 13,
        },
      ],
    },
    {
      code: "let foo = require('foo')",
      errors: [
        {
          messageId: 'noVarReqs',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "let foo = trick(require('foo'))",
      errors: [
        {
          messageId: 'noVarReqs',
          line: 1,
          column: 17,
        },
      ],
    },
  ],
});
