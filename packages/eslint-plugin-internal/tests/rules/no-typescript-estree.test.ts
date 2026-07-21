import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-typescript-estree-import.js';

const ruleTester = new RuleTester();

ruleTester.run('no-typescript-estree-import', rule, {
  invalid: [
    {
      code: "import { foo } from '@typescript-eslint/typescript-estree';",
      errors: [
        {
          column: 1,
          endColumn: 60,
          endLine: 1,
          line: 1,
          messageId: 'dontImportPackage',
        },
      ],
      output: "import { foo } from '@typescript-eslint/utils';",
    },
    {
      code: "import foo from '@typescript-eslint/typescript-estree';",
      errors: [
        {
          column: 1,
          endColumn: 56,
          endLine: 1,
          line: 1,
          messageId: 'dontImportPackage',
        },
      ],
      output: "import foo from '@typescript-eslint/utils';",
    },
    {
      code: "import * as foo from '@typescript-eslint/typescript-estree';",
      errors: [
        {
          column: 1,
          endColumn: 61,
          endLine: 1,
          line: 1,
          messageId: 'dontImportPackage',
        },
      ],
      output: "import * as foo from '@typescript-eslint/utils';",
    },
    {
      code: "import { foo } from '@typescript-eslint/types';",
      errors: [
        {
          column: 1,
          endColumn: 48,
          endLine: 1,
          line: 1,
          messageId: 'dontImportPackage',
        },
      ],
      output: "import { foo } from '@typescript-eslint/utils';",
    },
    {
      code: "import foo from '@typescript-eslint/types';",
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'dontImportPackage',
        },
      ],
      output: "import foo from '@typescript-eslint/utils';",
    },
    {
      code: "import * as foo from '@typescript-eslint/types';",
      errors: [
        {
          column: 1,
          endColumn: 49,
          endLine: 1,
          line: 1,
          messageId: 'dontImportPackage',
        },
      ],
      output: "import * as foo from '@typescript-eslint/utils';",
    },
  ],
  valid: [
    "import { foo } from '@typescript-eslint/utils';",
    "import foo from '@typescript-eslint/utils';",
    "import * as foo from '@typescript-eslint/utils';",
  ],
});
