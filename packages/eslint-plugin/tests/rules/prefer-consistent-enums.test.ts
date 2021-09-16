import rule from '../../src/rules/prefer-consistent-enums';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('prefer-consistent-enums', rule, {
  valid: [
    `
enum Direction {}
    `,
    `
enum Direction {
  Up = 1,
}
    `,
    `
enum Direction {
  Up = 1,
  Down = 2,
}
    `,
    `
enum Direction {
  Up = 'Up',
  Down = 'Down',
}
    `,
  ],
  // We need to keep indentation for avoiding @typescript-eslint/internal/plugin-test-formatting.
  // Use trimRight() to make tests pass for now. https://github.com/typescript-eslint/typescript-eslint/pull/2326#discussion_r461760044
  invalid: [
    {
      code: `
enum Direction {
  Up = 'Up',
  Down,
}
      `.trimRight(),
      errors: [
        {
          messageId: 'nonConsistentEnum',
          data: { name: 'Direction' },
          line: 4,
          suggestions: [
            {
              messageId: 'nonConsistentEnumSuggestion',
              output: `
enum Direction {
  Up = 'Up',
  Down = 'Down',
}
              `.trimRight(),
            },
          ],
        },
      ],
    },
    {
      code: `
enum Direction {
  Up,
  Down = 5,
}
      `.trimRight(),
      errors: [
        {
          messageId: 'nonConsistentEnum',
          data: { name: 'Direction' },
          line: 4,
          suggestions: [
            {
              messageId: 'nonConsistentEnumSuggestionNoInitializer',
              output: `
enum Direction {
  Up,
  Down,
}
              `.trimRight(),
            },
          ],
        },
      ],
    },
    {
      code: `
enum Direction {
  Up = 0,
  Down = 'Down',
}
      `.trimRight(),
      errors: [
        {
          messageId: 'nonConsistentEnum',
          data: { name: 'Direction' },
          line: 4,
          suggestions: [
            {
              messageId: 'nonConsistentEnumSuggestion',
              output: `
enum Direction {
  Up = 0,
  Down = 1,
}
              `.trimRight(),
            },
          ],
        },
      ],
    },
    {
      code: `
enum Direction {
  Up = 123,
  Down = 'Down',
}
      `.trimRight(),
      errors: [
        {
          messageId: 'nonConsistentEnum',
          data: { name: 'Direction' },
          line: 4,
          suggestions: [
            {
              messageId: 'nonConsistentEnumSuggestion',
              output: `
enum Direction {
  Up = 123,
  Down = 124,
}
              `.trimRight(),
            },
          ],
        },
      ],
    },
    {
      code: `
enum Direction {
  Up = 'Up',
  Down = 2,
  Left = 3,
}
      `.trimRight(),
      errors: [
        {
          messageId: 'nonConsistentEnum',
          data: { name: 'Direction' },
          line: 4,
          suggestions: [
            {
              messageId: 'nonConsistentEnumSuggestion',
              output: `
enum Direction {
  Up = 'Up',
  Down = '2',
  Left = 3,
}
              `.trimRight(),
            },
          ],
        },
        {
          messageId: 'nonConsistentEnum',
          data: { name: 'Direction' },
          line: 5,
          suggestions: [
            {
              messageId: 'nonConsistentEnumSuggestion',
              output: `
enum Direction {
  Up = 'Up',
  Down = 2,
  Left = '3',
}
              `.trimRight(),
            },
          ],
        },
      ],
    },
    {
      code: `
enum Test {
  A,
  B = 1 + 2,
}
      `.trimRight(),
      errors: [
        {
          messageId: 'nonConsistentEnum',
          data: { name: 'Test' },
          line: 4,
          suggestions: [
            {
              messageId: 'nonConsistentEnumSuggestionNoInitializer',
              output: `
enum Test {
  A,
  B,
}
              `.trimRight(),
            },
          ],
        },
      ],
    },
  ],
});
