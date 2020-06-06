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
    // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
    '(a + b!) == c;',
    // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
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
              // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
              output: '(a + b!) == c;',
            },
          ],
        },
      ],
    },
    {
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      code: '(obj = new new OuterObj().InnerObj).Name! == c;',
      errors: [
        {
          messageId: 'confusingEqual',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'notNeedInEqualTest',
              // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
              output: '(obj = new new OuterObj().InnerObj).Name == c;',
            },
          ],
        },
      ],
    },
    {
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      code: '(a==b)! ==c;',
      errors: [
        {
          messageId: 'confusingEqual',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'notNeedInEqualTest',
              // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
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
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      code: '(obj = new new OuterObj().InnerObj).Name! = c;',
      errors: [
        {
          messageId: 'confusingAssign',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'notNeedInAssign',
              // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
              output: '(obj = new new OuterObj().InnerObj).Name = c;',
            },
          ],
        },
      ],
    },
    {
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      code: '(a=b)! =c;',
      errors: [
        {
          messageId: 'confusingAssign',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'notNeedInAssign',
              // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
              output: '(a=b) =c;',
            },
          ],
        },
      ],
    },
  ],
});
