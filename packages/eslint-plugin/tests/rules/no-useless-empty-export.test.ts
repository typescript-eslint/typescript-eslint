/* eslint-disable eslint-comments/no-use */
// this rule tests the spacing, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */
import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-useless-empty-export';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
});

const error = {
  messageId: 'uselessExport',
} as const;

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
  ],
  invalid: [
    {
      code: `
export const _ = {};
export {};
      `,
      errors: [error],
      output: `
export const _ = {};

      `,
    },
    {
      code: `
export * from '_';
export {};
      `,
      errors: [error],
      output: `
export * from '_';

      `,
    },
    {
      code: `
export {};
export * from '_';
      `,
      errors: [error],
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
      errors: [error],
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
      errors: [error],
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
      errors: [error],
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
      errors: [error],
      output: `
import _ = require('_');

      `,
    },
  ],
});
