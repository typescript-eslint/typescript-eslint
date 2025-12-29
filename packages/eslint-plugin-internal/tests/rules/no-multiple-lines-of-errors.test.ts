// Ironically, the rule itself needs to be tested for how it handles multiple errors.
/* eslint-disable @typescript-eslint/internal/no-multiple-lines-of-errors */
import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-multiple-lines-of-errors.js';

const ruleTester = new RuleTester();

ruleTester.run('no-multiple-lines-of-errors', rule, {
  invalid: [
    {
      code: `
ruleTester.run('test', rule, {
  invalid: [
    {
      errors: [
        { messageId: '...', line: 1 },
        { messageId: '...', line: 2 },
      ],
    },
  ],
});
      `,
      errors: [
        {
          column: 9,
          line: 7,
          messageId: 'multipleLines',
        },
      ],
    },
    {
      code: `
ruleTester.run('test', rule, {
  invalid: [
    {
      errors: [
        { messageId: '...', line: 1 },
        { messageId: '...', line: 2 },
        { messageId: '...', line: 3 },
      ],
    },
  ],
});
      `,
      errors: [
        {
          column: 9,
          line: 7,
          messageId: 'multipleLines',
        },
        {
          column: 9,
          line: 8,
          messageId: 'multipleLines',
        },
      ],
    },
  ],
  valid: [
    `
ruleTester.run('test', rule, {
  invalid: [
    {
      errors: [{ messageId: '...', line: 1 }],
    },
  ],
});
    `,
    `
ruleTester.run('test', rule, {
  invalid: [
    {
      errors: [
        { messageId: '...', ...dataA },
        { messageId: '...', ...dataB },
      ],
    },
  ],
});
    `,
    `
ruleTester.run('test', rule, {
  invalid: [
    {
      errors: [
        { messageId: '...', [line]: 1 },
        { messageId: '...', [line]: 2 },
      ],
    },
  ],
});
    `,
    `
ruleTester.run('test', rule, {
  invalid: [
    {
      errors: [
        { messageId: '...', line: 1 },
        { messageId: '...', line: 1 },
      ],
    },
  ],
});
    `,
    `
ruleTester.run('test', rule, {
  [invalid]: [
    {
      errors: [
        { messageId: '...', line: 1 },
        { messageId: '...', line: 2 },
      ],
    },
  ],
});
    `,
    `
ruleTester.run('test', rule, {
  invalid: [
    {
      [errors]: [
        { messageId: '...', line: 1 },
        { messageId: '...', line: 2 },
      ],
    },
  ],
});
    `,
    `
ruleTester.run('test', rule, {
  invalid: [
    {
      errors: [
        { messageId: '...', line: '1' },
        { messageId: '...', line: '2' },
      ],
    },
  ],
});
    `,
    `
ruleTester.run('test', rule, {
  invalid: [
    {
      errors: [
        { messageId: '...', line: () => 1 },
        { messageId: '...', line: () => 2 },
      ],
    },
  ],
});
    `,
    `
ruleTester.run('test', rule, {
  invalid: [
    {
      errors: [
        { messageId: '...', line: 1 },
        { messageId: '...', line: 1 },
        { messageId: '...', line: 1 },
      ],
    },
  ],
});
    `,
  ],
});
