/* eslint-disable eslint-comments/no-use */
// this rule enforces adding parens, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

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
          messageId: 'confusingEqual',
          line: 1,
          column: 1,
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
          messageId: 'confusingEqual',
          line: 1,
          column: 1,
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
          messageId: 'confusingEqual',
          line: 1,
          column: 1,
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
          messageId: 'confusingEqual',
          line: 1,
          column: 1,
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
          messageId: 'confusingEqual',
          line: 1,
          column: 1,
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
          messageId: 'confusingAssign',
          line: 1,
          column: 1,
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
          messageId: 'confusingAssign',
          line: 1,
          column: 1,
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
          messageId: 'confusingAssign',
          line: 1,
          column: 1,
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
          messageId: 'confusingOperator',
          data: { operator: 'in' },
          line: 1,
          column: 1,
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
          messageId: 'confusingOperator',
          data: { operator: 'in' },
          line: 2,
          column: 1,
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
          messageId: 'confusingOperator',
          data: { operator: 'instanceof' },
          line: 1,
          column: 1,
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
