import rule from '../../src/rules/no-confusing-non-null-assertion';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-confusing-non-null-assertion', rule, {
  valid: [
    //
    'a == b!;',
    'a = b!;',
    'a !== b;',
    'a != b;',
    '(a + b!) == c;',
    '(a + b!) = c;',
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
      code: 'new Object! = 1;',
      errors: [
        {
          messageId: 'confusingAssign',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'wrapUpLeft',
              output: '(new Object!) = 1;',
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
      code: '(a==b)! =c;',
      errors: [
        {
          messageId: 'confusingAssign',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'notNeedInAssign',
              output: '(a==b) =c;',
            },
          ],
        },
      ],
    },
  ],
});
