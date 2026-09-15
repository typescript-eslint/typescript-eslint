import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-typescript-default-import.js';

const ruleTester = new RuleTester();

ruleTester.run('no-typescript-default-import', rule, {
  invalid: [
    {
      code: "import ts from 'typescript';",
      errors: [
        {
          column: 8,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'noTSDefaultImport',
        },
      ],
      output: `import * as ts from 'typescript';`,
    },
    {
      code: "import ts, { SyntaxKind } from 'typescript';",
      errors: [
        {
          column: 8,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'noTSDefaultImport',
        },
      ],
      output: null,
    },
    {
      code: "import ts = require('typescript');",
      errors: [
        {
          column: 13,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'noTSDefaultImport',
        },
      ],
      output: `import * as ts from 'typescript';`,
    },
  ],
  valid: [
    "import { foo } from 'typescript';",
    "import ts from 'nottypescript';",
    "import * as foo from 'typescript';",
    'import ts = foo;',
    "import ts = require('nottypescript');",
  ],
});
