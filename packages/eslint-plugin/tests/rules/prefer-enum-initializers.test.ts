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
              /* eslint-disable @typescript-eslint/internal/plugin-test-formatting */
              output: `
enum Direction {
  Up = 'Up',
}
      `,
              /* eslint-enable @typescript-eslint/internal/plugin-test-formatting */
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
              /* eslint-disable @typescript-eslint/internal/plugin-test-formatting */
              output: `
enum Direction {
  Up = 'Up',
  Down,
}
      `,
              /* eslint-enable @typescript-eslint/internal/plugin-test-formatting */
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
              /* eslint-disable @typescript-eslint/internal/plugin-test-formatting */
              output: `
enum Direction {
  Up,
  Down = 'Down',
}
      `,
              /* eslint-enable @typescript-eslint/internal/plugin-test-formatting */
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
              /* eslint-disable @typescript-eslint/internal/plugin-test-formatting */
              output: `
enum Direction {
  Up = 0,
}
      `,
              /* eslint-enable @typescript-eslint/internal/plugin-test-formatting */
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
              /* eslint-disable @typescript-eslint/internal/plugin-test-formatting */
              output: `
enum Direction {
  Up = 0,
  Down,
}
      `,
              /* eslint-enable @typescript-eslint/internal/plugin-test-formatting */
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
              /* eslint-disable @typescript-eslint/internal/plugin-test-formatting */
              output: `
enum Direction {
  Up,
  Down = 1,
}
      `,
              /* eslint-enable @typescript-eslint/internal/plugin-test-formatting */
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
              /* eslint-disable @typescript-eslint/internal/plugin-test-formatting */
              output: `
enum Direction {
  Up = 1,
  Down,
}
      `,
              /* eslint-enable @typescript-eslint/internal/plugin-test-formatting */
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
              /* eslint-disable @typescript-eslint/internal/plugin-test-formatting */
              output: `
enum Direction {
  Up,
  Down = 2,
}
      `,
              /* eslint-enable @typescript-eslint/internal/plugin-test-formatting */
            },
          ],
        },
      ],
    },
  ],
});
