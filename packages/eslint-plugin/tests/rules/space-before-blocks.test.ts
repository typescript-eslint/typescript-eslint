/* eslint-disable eslint-comments/no-use */
// this rule tests spacing, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/space-before-blocks';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('space-before-blocks', rule, {
  valid: [
    {
      code: `
        enum Test{
          KEY1 = 2,
        }
      `,
      options: ['never'],
    },
    {
      code: `
        interface Test{
          prop1: number;
        }
      `,
      options: ['never'],
    },
    {
      code: `
        enum Test {
          KEY1 = 2,
        }
      `,
      options: ['always'],
    },
    {
      code: `
        interface Test {
          prop1: number;
        }
      `,
      options: ['always'],
    },
    {
      code: `
        enum Test{
          KEY1 = 2,
        }
      `,
      options: [{ classes: 'never' }],
    },
    {
      code: `
        interface Test{
          prop1: number;
        }
      `,
      options: [{ classes: 'never' }],
    },
    {
      code: `
        enum Test {
          KEY1 = 2,
        }
      `,
      options: [{ classes: 'always' }],
    },
    {
      code: `
        interface Test {
          prop1: number;
        }
      `,
      options: [{ classes: 'always' }],
    },
    {
      code: `
        interface Test{
          prop1: number;
        }
      `,
      options: [{ classes: 'off' }],
    },
  ],
  invalid: [
    {
      code: `
        enum Test{
          A = 2,
          B = 1,
        }
      `,
      output: `
        enum Test {
          A = 2,
          B = 1,
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 18,
          line: 2,
        },
      ],
      options: ['always'],
    },
    {
      code: `
        interface Test{
          prop1: number;
        }
      `,
      output: `
        interface Test {
          prop1: number;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 23,
          line: 2,
        },
      ],
      options: ['always'],
    },
    {
      code: `
        enum Test{
          A = 2,
          B = 1,
        }
      `,
      output: `
        enum Test {
          A = 2,
          B = 1,
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 18,
          line: 2,
        },
      ],
      options: [{ classes: 'always' }],
    },
    {
      code: `
        interface Test{
          prop1: number;
        }
      `,
      output: `
        interface Test {
          prop1: number;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 23,
          line: 2,
        },
      ],
      options: [{ classes: 'always' }],
    },
    {
      code: `
        enum Test {
          A = 2,
          B = 1,
        }
      `,
      output: `
        enum Test{
          A = 2,
          B = 1,
        }
      `,
      errors: [
        {
          messageId: 'unexpectedSpace',
          column: 19,
          line: 2,
        },
      ],
      options: ['never'],
    },
    {
      code: `
        interface Test {
          prop1: number;
        }
      `,
      output: `
        interface Test{
          prop1: number;
        }
      `,
      errors: [
        {
          messageId: 'unexpectedSpace',
          column: 24,
          line: 2,
        },
      ],
      options: ['never'],
    },
    {
      code: `
        enum Test {
          A = 2,
          B = 1,
        }
      `,
      output: `
        enum Test{
          A = 2,
          B = 1,
        }
      `,
      errors: [
        {
          messageId: 'unexpectedSpace',
          column: 19,
          line: 2,
        },
      ],
      options: [{ classes: 'never' }],
    },
    {
      code: `
        interface Test {
          prop1: number;
        }
      `,
      output: `
        interface Test{
          prop1: number;
        }
      `,
      errors: [
        {
          messageId: 'unexpectedSpace',
          column: 24,
          line: 2,
        },
      ],
      options: [{ classes: 'never' }],
    },
  ],
});
