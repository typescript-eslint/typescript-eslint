import rule from '../../src/rules/no-typescript-estree-import';
import { RuleTester, batchedSingleLineTests } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
});

ruleTester.run('no-typescript-estree-import', rule, {
  valid: [
    "import { foo } from '@typescript-eslint/experimental-utils';",
    "import foo from '@typescript-eslint/experimental-utils';",
    "import * as foo from '@typescript-eslint/experimental-utils';",
  ],
  invalid: batchedSingleLineTests({
    code: `
import { foo } from '@typescript-eslint/typescript-estree';
import foo from '@typescript-eslint/typescript-estree';
import * as foo from '@typescript-eslint/typescript-estree';
import { foo } from '@typescript-eslint/types';
import foo from '@typescript-eslint/types';
import * as foo from '@typescript-eslint/types';
    `,
    output: `
import { foo } from '@typescript-eslint/experimental-utils';
import foo from '@typescript-eslint/experimental-utils';
import * as foo from '@typescript-eslint/experimental-utils';
import { foo } from '@typescript-eslint/experimental-utils';
import foo from '@typescript-eslint/experimental-utils';
import * as foo from '@typescript-eslint/experimental-utils';
    `,
    errors: [
      {
        messageId: 'dontImportPackage',
        line: 2,
      },
      {
        messageId: 'dontImportPackage',
        line: 3,
      },
      {
        messageId: 'dontImportPackage',
        line: 4,
      },
      {
        messageId: 'dontImportPackage',
        line: 5,
      },
      {
        messageId: 'dontImportPackage',
        line: 6,
      },
      {
        messageId: 'dontImportPackage',
        line: 7,
      },
    ],
  }),
});
