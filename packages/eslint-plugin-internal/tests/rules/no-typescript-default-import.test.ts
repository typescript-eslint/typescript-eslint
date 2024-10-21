import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-typescript-default-import';

const ruleTester = new RuleTester();

ruleTester.run('no-typescript-default-import', rule, {
  invalid: [
    {
      code: "import ts from 'typescript';",
      errors: [{ messageId: 'noTSDefaultImport' }],
      output: `import * as ts from 'typescript';`,
    },
    {
      code: "import ts, { SyntaxKind } from 'typescript';",
      errors: [{ messageId: 'noTSDefaultImport' }],
      output: null,
    },
    {
      code: "import ts = require('typescript');",
      errors: [{ messageId: 'noTSDefaultImport' }],
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
