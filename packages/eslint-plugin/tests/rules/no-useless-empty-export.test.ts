// this rule tests the spacing, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-useless-empty-export';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('no-useless-empty-export', rule, {
  valid: [
    "declare module '_'",
    "import {} from '_';",
    "import * as _ from '_';",
    'export = {};',
    'export = 3;',
    'export const _ = {};',
    `
      const _ = {};
      export default _;
    `,
    `
      export * from '_';
      export = {};
    `,
    `
      export {};
    `,
    // https://github.com/microsoft/TypeScript/issues/38592
    {
      code: `
        export type A = 1;
        export {};
      `,
      filename: 'foo.d.ts',
    },
    {
      code: `
        export declare const a = 2;
        export {};
      `,
      filename: 'foo.d.ts',
    },
    {
      code: `
        import type { A } from '_';
        export {};
      `,
      filename: 'foo.d.ts',
    },
    {
      code: `
        import { A } from '_';
        export {};
      `,
      filename: 'foo.d.ts',
    },
  ],
  invalid: [
    {
      code: `
export const _ = {};
export {};
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'uselessExport',
        },
      ],
      output: `
export const _ = {};

      `,
    },
    {
      code: `
export * from '_';
export {};
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'uselessExport',
        },
      ],
      output: `
export * from '_';

      `,
    },
    {
      code: `
export {};
export * from '_';
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 2,
          line: 2,
          messageId: 'uselessExport',
        },
      ],
      output: `

export * from '_';
      `,
    },
    {
      code: `
const _ = {};
export default _;
export {};
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 4,
          line: 4,
          messageId: 'uselessExport',
        },
      ],
      output: `
const _ = {};
export default _;

      `,
    },
    {
      code: `
export {};
const _ = {};
export default _;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 2,
          line: 2,
          messageId: 'uselessExport',
        },
      ],
      output: `

const _ = {};
export default _;
      `,
    },
    {
      code: `
const _ = {};
export { _ };
export {};
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 4,
          line: 4,
          messageId: 'uselessExport',
        },
      ],
      output: `
const _ = {};
export { _ };

      `,
    },
    {
      code: `
import _ = require('_');
export {};
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'uselessExport',
        },
      ],
      output: `
import _ = require('_');

      `,
    },
    {
      code: `
import _ = require('_');
export {};
export {};
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'uselessExport',
        },
        {
          column: 1,
          endColumn: 11,
          endLine: 4,
          line: 4,
          messageId: 'uselessExport',
        },
      ],
      output: `
import _ = require('_');


      `,
    },
  ],
});
