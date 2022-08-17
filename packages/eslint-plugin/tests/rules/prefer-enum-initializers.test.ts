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
      `,
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
      `,
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 1,
}
      `,
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 'Up',
}
      `,
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
      `,
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
      `,
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 1,
  Down,
}
      `,
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 'Up',
  Down,
}
      `,
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
      `,
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up,
  Down = 2,
}
      `,
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up,
  Down = 'Down',
}
      `,
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
      `,
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
      `,
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 'Up',
  Down = 2,
}
      `,
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 'Up',
  Down = 'Down',
}
      `,
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
      `,
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
      `,
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 1,
  Down = 'Down',
}
      `,
            },
            {
              messageId: 'defineInitializerSuggestion',
              output: `
enum Direction {
  Up = 'Up',
  Down = 'Down',
}
      `,
            },
          ],
        },
      ],
    },
  ],
});
