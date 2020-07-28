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
  invalid: [
    {
      code: `
enum Direction {
  Up,
}
      `,
      options: ['key-name'],
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
      options: ['key-name'],
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
}
      `,
      options: ['0-based'],
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
      options: ['0-based'],
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
      options: ['1-based'],
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
  Up = 1,
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
  Down = 2,
}
      `,
            },
          ],
        },
      ],
    },
  ],
});
