import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/debug-namespace';

const ruleTester = new RuleTester();

ruleTester.run('debug-namespace', rule, {
  invalid: [
    {
      code: "const log = debug('not:correct');",
      errors: [
        {
          column: 19,
          endColumn: 32,
          line: 1,
          messageId: 'mismatched',
        },
      ],
      filename: 'typescript-eslint/packages/example/file.ts',
      output: "const log = debug('typescript-eslint:example:file');",
    },
    {
      code: "const log = debug('not:correct');",
      errors: [
        {
          column: 19,
          endColumn: 32,
          line: 1,
          messageId: 'mismatched',
        },
      ],
      filename: '/Users/example/typescript-eslint/packages/example/file.ts',
      output: "const log = debug('typescript-eslint:example:file');",
    },
    {
      code: "const log = debug('not:correct');",
      errors: [
        {
          column: 19,
          endColumn: 32,
          line: 1,
          messageId: 'mismatched',
        },
      ],
      filename: 'C:\\Code\\typescript-eslint\\packages\\example\\file.ts',
      output: "const log = debug('typescript-eslint:example:file');",
    },
  ],
  valid: [
    {
      code: "const log = debug('typescript-eslint:example:file');",
      filename: 'typescript-eslint/packages/example/file.ts',
    },
    {
      code: "const logCustom = debug('typescript-eslint:example:file');",
      filename: 'typescript-eslint/packages/example/file.ts',
    },
    {
      code: "const logCustom = debug('...');",
      filename: 'typescript-eslint/packages/example/file.ts',
    },
    {
      code: "debug('...');",
      filename: 'typescript-eslint/packages/example/file.ts',
    },
    {
      code: 'const log = debug(null);',
      filename: 'typescript-eslint/packages/example/file.ts',
    },
    {
      code: 'const log = debug(123);',
      filename: 'typescript-eslint/packages/example/file.ts',
    },
  ],
});
