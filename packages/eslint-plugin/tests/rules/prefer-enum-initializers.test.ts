import rule from '../../src/rules/prefer-enum-initializers';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('prefer-enum-initializers', rule, {
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
  Up,
}
      `.trimRight(),
      errors: [
        {
          messageId: 'defineInitializer',
          data: { name: 'Up' },
          line: 3,
          suggestions: [
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 0,
}
              `.trimRight(),
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 1,
}
              `.trimRight(),
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 'Up',
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
  Down,
}
      `.trimRight(),
      errors: [
        {
          messageId: 'defineInitializer',
          data: { name: 'Up' },
          line: 3,
          suggestions: [
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 0,
  Down,
}
              `.trimRight(),
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 1,
  Down,
}
              `.trimRight(),
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 'Up',
  Down,
}
              `.trimRight(),
            },
          ],
        },
        {
          messageId: 'defineInitializer',
          data: { name: 'Down' },
          line: 4,
          suggestions: [
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up,
  Down = 1,
}
              `.trimRight(),
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up,
  Down = 2,
}
              `.trimRight(),
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up,
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
  Up = 'Up',
  Down,
}
      `.trimRight(),
      errors: [
        {
          messageId: 'defineInitializer',
          data: { name: 'Down' },
          line: 4,
          suggestions: [
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 'Up',
  Down = 1,
}
              `.trimRight(),
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 'Up',
  Down = 2,
}
              `.trimRight(),
            },
            {
              messageId: 'defineInitializerSuggestion',
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
  Down = 'Down',
}
      `.trimRight(),
      errors: [
        {
          messageId: 'defineInitializer',
          data: { name: 'Up' },
          line: 3,
          suggestions: [
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 0,
  Down = 'Down',
}
              `.trimRight(),
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 1,
  Down = 'Down',
}
              `.trimRight(),
            },
            {
              messageId: 'defineInitializerSuggestion',
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
  ],
});
