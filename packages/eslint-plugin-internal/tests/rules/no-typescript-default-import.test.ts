import rule from '../../src/rules/no-typescript-default-import';
import { RuleTester, batchedSingleLineTests } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
});

ruleTester.run('no-typescript-default-import', rule, {
  valid: [
    "import { foo } from 'typescript';",
    "import ts from 'nottypescript';",
    "import * as foo from 'typescript';",
    'import ts = foo;',
    "import ts = require('nottypescript');",
  ],
  invalid: batchedSingleLineTests({
    code: `
import ts from 'typescript';
import ts, { SyntaxKind } from 'typescript';
import ts = require('typescript');
    `,
    output: `
import * as ts from 'typescript';
import ts, { SyntaxKind } from 'typescript';
import * as ts from 'typescript';
    `,
    errors: [
      {
        messageId: 'noTSDefaultImport',
        line: 2,
      },
      {
        messageId: 'noTSDefaultImport',
        line: 3,
      },
      {
        messageId: 'noTSDefaultImport',
        line: 4,
      },
    ],
  }),
});
