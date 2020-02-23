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
    'import { foo } from "@typescript-eslint/experimental-utils";',
    'import foo from "@typescript-eslint/experimental-utils";',
    'import * as foo from "@typescript-eslint/experimental-utils";',
  ],
  invalid: batchedSingleLineTests({
    code: `
import { foo } from "@typescript-eslint/typescript-estree";
import foo from "@typescript-eslint/typescript-estree";
import * as foo from "@typescript-eslint/typescript-estree";
    `,
    output: `
import { foo } from "@typescript-eslint/experimental-utils";
import foo from "@typescript-eslint/experimental-utils";
import * as foo from "@typescript-eslint/experimental-utils";
    `,
    errors: [
      {
        messageId: 'dontImportTSEStree',
        line: 2,
      },
      {
        messageId: 'dontImportTSEStree',
        line: 3,
      },
      {
        messageId: 'dontImportTSEStree',
        line: 4,
      },
    ],
  }),
});
