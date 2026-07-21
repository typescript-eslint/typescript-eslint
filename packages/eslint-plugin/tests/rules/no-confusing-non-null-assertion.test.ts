// this rule enforces adding parens, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */

import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-confusing-non-null-assertion';

const ruleTester = new RuleTester();

ruleTester.run('no-confusing-non-null-assertion', rule, {
  valid: [
    //
    'a == b!;',
    'a = b!;',
    'a !== b;',
    'a != b;',
    '(a + b!) == c;',
    '(a + b!) = c;',
    '(a + b!) in c;',
    '(a || b!) instanceof c;',
  ],
  invalid: [
    {
      code: 'a! == b;',
      errors: [
        {
          column: 1,
          endColumn: 8,
          endLine: 1,
          line: 1,
          messageId: 'confusingEqual',
          suggestions: [
            {
              messageId: 'notNeedInEqualTest',
              output: 'a == b;',
            },
          ],
        },
      ],
    },
    {
      code: 'a! === b;',
      errors: [
        {
          column: 1,
          endColumn: 9,
          endLine: 1,
          line: 1,
          messageId: 'confusingEqual',
          suggestions: [
            {
              messageId: 'notNeedInEqualTest',
              output: 'a === b;',
            },
          ],
        },
      ],
    },
    {
      code: 'a + b! == c;',
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'confusingEqual',
          suggestions: [
            {
              messageId: 'wrapUpLeft',
              output: '(a + b!) == c;',
            },
          ],
        },
      ],
    },
    {
      code: '(obj = new new OuterObj().InnerObj).Name! == c;',
      errors: [
        {
          column: 1,
          endColumn: 47,
          endLine: 1,
          line: 1,
          messageId: 'confusingEqual',
          suggestions: [
            {
              messageId: 'notNeedInEqualTest',
              output: '(obj = new new OuterObj().InnerObj).Name == c;',
            },
          ],
        },
      ],
    },
    {
      code: '(a==b)! ==c;',
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'confusingEqual',
          suggestions: [
            {
              messageId: 'notNeedInEqualTest',
              output: '(a==b) ==c;',
            },
          ],
        },
      ],
    },
    {
      code: 'a! = b;',
      errors: [
        {
          column: 1,
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'confusingAssign',
          suggestions: [
            {
              messageId: 'notNeedInAssign',
              output: 'a = b;',
            },
          ],
        },
      ],
    },
    {
      code: '(obj = new new OuterObj().InnerObj).Name! = c;',
      errors: [
        {
          column: 1,
          endColumn: 46,
          endLine: 1,
          line: 1,
          messageId: 'confusingAssign',
          suggestions: [
            {
              messageId: 'notNeedInAssign',
              output: '(obj = new new OuterObj().InnerObj).Name = c;',
            },
          ],
        },
      ],
    },
    {
      code: '(a=b)! =c;',
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'confusingAssign',
          suggestions: [
            {
              messageId: 'notNeedInAssign',
              output: '(a=b) =c;',
            },
          ],
        },
      ],
    },
    {
      code: 'a! in b;',
      errors: [
        {
          column: 1,
          data: { operator: 'in' },
          endColumn: 8,
          endLine: 1,
          line: 1,
          messageId: 'confusingOperator',
          suggestions: [
            {
              messageId: 'notNeedInOperator',
              output: 'a in b;',
            },
            {
              messageId: 'wrapUpLeft',
              output: '(a!) in b;',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`
a !in b;
      `,
      errors: [
        {
          column: 1,
          data: { operator: 'in' },
          endColumn: 8,
          endLine: 2,
          line: 2,
          messageId: 'confusingOperator',
          suggestions: [
            {
              messageId: 'notNeedInOperator',
              output: `
a in b;
      `,
            },
            {
              messageId: 'wrapUpLeft',
              output: `
(a !)in b;
      `,
            },
          ],
        },
      ],
    },
    {
      code: 'a! instanceof b;',
      errors: [
        {
          column: 1,
          data: { operator: 'instanceof' },
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'confusingOperator',
          suggestions: [
            {
              messageId: 'notNeedInOperator',
              output: 'a instanceof b;',
            },
            {
              messageId: 'wrapUpLeft',
              output: '(a!) instanceof b;',
            },
          ],
        },
      ],
    },
  ],
});
