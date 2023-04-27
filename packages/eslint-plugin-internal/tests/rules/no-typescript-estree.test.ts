import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-typescript-estree-import';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
});

ruleTester.run('no-typescript-estree-import', rule, {
  valid: [
    "import { foo } from '@typescript-eslint/utils';",
    "import foo from '@typescript-eslint/utils';",
    "import * as foo from '@typescript-eslint/utils';",
  ],
  invalid: [
    {
      code: "import { foo } from '@typescript-eslint/typescript-estree';",
      output: "import { foo } from '@typescript-eslint/utils';",
      errors: [{ messageId: 'dontImportPackage' }],
    },
    {
      code: "import foo from '@typescript-eslint/typescript-estree';",
      output: "import foo from '@typescript-eslint/utils';",
      errors: [{ messageId: 'dontImportPackage' }],
    },
    {
      code: "import * as foo from '@typescript-eslint/typescript-estree';",
      output: "import * as foo from '@typescript-eslint/utils';",
      errors: [{ messageId: 'dontImportPackage' }],
    },
    {
      code: "import { foo } from '@typescript-eslint/types';",
      output: "import { foo } from '@typescript-eslint/utils';",
      errors: [{ messageId: 'dontImportPackage' }],
    },
    {
      code: "import foo from '@typescript-eslint/types';",
      output: "import foo from '@typescript-eslint/utils';",
      errors: [{ messageId: 'dontImportPackage' }],
    },
    {
      code: "import * as foo from '@typescript-eslint/types';",
      output: "import * as foo from '@typescript-eslint/utils';",
      errors: [{ messageId: 'dontImportPackage' }],
    },
  ],
});
