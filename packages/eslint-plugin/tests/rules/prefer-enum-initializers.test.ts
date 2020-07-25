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
    `
enum Direction {
  Up = 1,
  Down = 'Up',
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
      errors: [
        {
          messageId: 'defineInitializer',
          data: { name: 'Up' },
          line: 3,
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
        },
        {
          messageId: 'defineInitializer',
          data: { name: 'Down' },
          line: 4,
        },
      ],
    },
    {
      code: `
enum Direction {
  Up = 1,
  Down,
}
      `,
      errors: [
        {
          messageId: 'defineInitializer',
          data: { name: 'Down' },
          line: 4,
        },
      ],
    },
    {
      code: `
enum Direction {
  Up,
  Down = 2,
}
      `,
      errors: [
        {
          messageId: 'defineInitializer',
          data: { name: 'Up' },
          line: 3,
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
        },
      ],
    },
  ],
});
