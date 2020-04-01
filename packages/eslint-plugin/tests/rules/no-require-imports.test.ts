import rule from '../../src/rules/no-require-imports';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-require-imports', rule, {
  valid: [
    "import { l } from 'lib';",
    "var lib3 = load('not_an_import');",
    'var lib4 = lib2.subImport;',
    'var lib7 = 700;',
    'import lib9 = lib2.anotherSubImport;',
    "import lib10 from 'lib10';",
    "var lib3 = load?.('not_an_import');",
  ],
  invalid: [
    {
      code: "var lib = require('lib');",
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "let lib2 = require('lib2');",
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: `
var lib5 = require('lib5'),
  lib6 = require('lib6');
      `,
      errors: [
        {
          messageId: 'noRequireImports',
          line: 2,
          column: 12,
        },
        {
          messageId: 'noRequireImports',
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: "import lib8 = require('lib8');",
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: "var lib = require?.('lib');",
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "let lib2 = require?.('lib2');",
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: `
var lib5 = require?.('lib5'),
  lib6 = require?.('lib6');
      `,
      errors: [
        {
          messageId: 'noRequireImports',
          line: 2,
          column: 12,
        },
        {
          messageId: 'noRequireImports',
          line: 3,
          column: 10,
        },
      ],
    },
  ],
});
