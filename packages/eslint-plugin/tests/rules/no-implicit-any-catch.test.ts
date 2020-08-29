/* eslint-disable eslint-comments/no-use */
// TODO - prettier currently removes the type annotations, re-enable this once prettier is updated
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import rule from '../../src/rules/no-implicit-any-catch';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-implicit-any-catch', rule, {
  valid: [
    `
try {
} catch (e1: unknown) {}
    `,
    {
      code: `
try {
} catch (e2: any) {}
      `,
      options: [{ allowExplicitAny: true }],
    },
  ],
  invalid: [
    {
      code: `
try {
} catch (e3) {}
      `.trim(),
      errors: [
        {
          line: 2,
          column: 3,
          messageId: 'implicitAnyInCatch',
          endLine: 2,
          endColumn: 16,
          suggestions: [
            {
              messageId: 'suggestExplicitUnknown',
              output: `
try {
} catch (e3: unknown) {}
              `.trim(),
            },
          ],
        },
      ],
    },
    {
      code: `
try {
} catch (e4: any) {}
      `.trim(),
      options: [{ allowExplicitAny: false }],
      errors: [
        {
          line: 2,
          column: 3,
          messageId: 'explicitAnyInCatch',
          endLine: 2,
          endColumn: 21,
          suggestions: [
            {
              messageId: 'suggestExplicitUnknown',
              output: `
try {
} catch (e4: unknown) {}
              `.trim(),
            },
          ],
        },
      ],
    },
  ],
});
