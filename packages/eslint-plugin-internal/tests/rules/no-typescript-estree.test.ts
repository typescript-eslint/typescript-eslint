import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-typescript-estree-import';

const ruleTester = new RuleTester();

ruleTester.run('no-typescript-estree-import', rule, {
  invalid: [
    {
      code: "import { foo } from '@typescript-eslint/typescript-estree';",
      errors: [{ messageId: 'dontImportPackage' }],
      output: "import { foo } from '@typescript-eslint/utils';",
    },
    {
      code: "import foo from '@typescript-eslint/typescript-estree';",
      errors: [{ messageId: 'dontImportPackage' }],
      output: "import foo from '@typescript-eslint/utils';",
    },
    {
      code: "import * as foo from '@typescript-eslint/typescript-estree';",
      errors: [{ messageId: 'dontImportPackage' }],
      output: "import * as foo from '@typescript-eslint/utils';",
    },
    {
      code: "import { foo } from '@typescript-eslint/types';",
      errors: [{ messageId: 'dontImportPackage' }],
      output: "import { foo } from '@typescript-eslint/utils';",
    },
    {
      code: "import foo from '@typescript-eslint/types';",
      errors: [{ messageId: 'dontImportPackage' }],
      output: "import foo from '@typescript-eslint/utils';",
    },
    {
      code: "import * as foo from '@typescript-eslint/types';",
      errors: [{ messageId: 'dontImportPackage' }],
      output: "import * as foo from '@typescript-eslint/utils';",
    },
  ],
  valid: [
    "import { foo } from '@typescript-eslint/utils';",
    "import foo from '@typescript-eslint/utils';",
    "import * as foo from '@typescript-eslint/utils';",
  ],
});
