import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-empty-object-type';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-empty-object-type', rule, {
  valid: [
    'let value: object;',
    'let value: Object;',
    'let value: { inner: true };',
    'type MyNonNullable<T> = T & {};',
  ],
  invalid: [
    {
      code: 'let value: {};',
      errors: [
        {
          column: 12,
          line: 1,
          endColumn: 14,
          endLine: 1,
          messageId: 'banEmptyObjectType',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyObjectType',
              output: 'let value: object;',
            },
            {
              data: { replacement: 'unknown' },
              messageId: 'replaceEmptyObjectType',
              output: 'let value: unknown;',
            },
          ],
        },
      ],
    },
    {
      code: `
let value: {
  /* ... */
};
      `,
      errors: [
        {
          line: 2,
          endLine: 4,
          column: 12,
          endColumn: 2,
          messageId: 'banEmptyObjectType',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyObjectType',
              output: `
let value: object;
      `,
            },
            {
              data: { replacement: 'unknown' },
              messageId: 'replaceEmptyObjectType',
              output: `
let value: unknown;
      `,
            },
          ],
        },
      ],
    },
    {
      code: 'type MyUnion<T> = T | {};',
      errors: [
        {
          column: 23,
          line: 1,
          endColumn: 25,
          endLine: 1,
          messageId: 'banEmptyObjectType',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyObjectType',
              output: 'type MyUnion<T> = T | object;',
            },
            {
              data: { replacement: 'unknown' },
              messageId: 'replaceEmptyObjectType',
              output: 'type MyUnion<T> = T | unknown;',
            },
          ],
        },
      ],
    },
  ],
});
