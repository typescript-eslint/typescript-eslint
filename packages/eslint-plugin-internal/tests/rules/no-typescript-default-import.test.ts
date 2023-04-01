import rule from '../../src/rules/no-typescript-default-import';
import { RuleTester } from '@typescript-eslint/rule-tester';

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
  invalid: [
    {
      code: "import ts from 'typescript';",
      output: `import * as ts from 'typescript';`,
      errors: [{ messageId: 'noTSDefaultImport' }],
    },
    {
      code: "import ts, { SyntaxKind } from 'typescript';",
      output: null,
      errors: [{ messageId: 'noTSDefaultImport' }],
    },
    {
      code: "import ts = require('typescript');",
      output: `import * as ts from 'typescript';`,
      errors: [{ messageId: 'noTSDefaultImport' }],
    },
  ],
});
