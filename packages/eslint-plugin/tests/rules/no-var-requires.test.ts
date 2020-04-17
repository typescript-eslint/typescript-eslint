import rule from '../../src/rules/no-var-requires';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-var-requires', rule, {
  valid: [
    "import foo = require('foo');",
    "require('foo');",
    "require?.('foo');",
    'require();',
    {
      code: "const pkg = require('package.json');",
      options: [{ allowPackageDotJson: true }],
    },
    {
      code: "const pkg = require('../package.json');",
      options: [{ allowPackageDotJson: true }],
    },
    {
      code: "const pkg = require('../packages/package.json');",
      options: [{ allowPackageDotJson: true }],
    },
  ],
  invalid: [
    {
      code: "var foo = require('foo');",
      errors: [
        {
          messageId: 'noVarReqs',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "const foo = require('foo');",
      errors: [
        {
          messageId: 'noVarReqs',
          line: 1,
          column: 13,
        },
      ],
    },
    {
      code: "let foo = require('foo');",
      errors: [
        {
          messageId: 'noVarReqs',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "let foo = trick(require('foo'));",
      errors: [
        {
          messageId: 'noVarReqs',
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: "var foo = require?.('foo');",
      errors: [
        {
          messageId: 'noVarReqs',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "const foo = require?.('foo');",
      errors: [
        {
          messageId: 'noVarReqs',
          line: 1,
          column: 13,
        },
      ],
    },
    {
      code: "let foo = require?.('foo');",
      errors: [
        {
          messageId: 'noVarReqs',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "let foo = trick(require?.('foo'));",
      errors: [
        {
          messageId: 'noVarReqs',
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: "let foo = trick?.(require('foo'));",
      errors: [
        {
          messageId: 'noVarReqs',
          line: 1,
          column: 19,
        },
      ],
    },
    {
      code: "const pkg = require('package.json');",
      errors: [
        {
          line: 1,
          column: 13,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: 'const pkg = require();',
      errors: [
        {
          line: 1,
          column: 13,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: 'const pkg = require();',
      options: [{ allowPackageDotJson: true }],
      errors: [
        {
          line: 1,
          column: 13,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: "const pkg = require('package.jsons');",
      options: [{ allowPackageDotJson: true }],
      errors: [
        {
          line: 1,
          column: 13,
          messageId: 'noVarReqs',
        },
      ],
    },
  ],
});
