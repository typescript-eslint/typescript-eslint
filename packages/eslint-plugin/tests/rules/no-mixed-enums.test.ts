import rule from '../../src/rules/no-mixed-enums';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parserOptions: {
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-mixed-enums', rule, {
  valid: [
    `
      enum Fruit {}
    `,
    `
      enum Fruit {
        Apple,
      }
    `,
    `
      enum Fruit {
        Apple,
        Banana,
      }
    `,
    `
      enum Fruit {
        Apple = 0,
        Banana,
      }
    `,
    `
      enum Fruit {
        Apple,
        Banana = 1,
      }
    `,
    `
      enum Fruit {
        Apple = 0,
        Banana = 1,
      }
    `,
    `
      const getValue = () => 0;
      enum Fruit {
        Apple,
        Banana = getValue(),
      }
    `,
    `
      const getValue = () => 0;
      enum Fruit {
        Apple = getValue(),
        Banana = getValue(),
      }
    `,
    `
      const getValue = () => '';
      enum Fruit {
        Apple = '',
        Banana = getValue(),
      }
    `,
    `
      const getValue = () => '';
      enum Fruit {
        Apple = getValue(),
        Banana = '',
      }
    `,
    `
      const getValue = () => '';
      enum Fruit {
        Apple = getValue(),
        Banana = getValue(),
      }
    `,
  ],
  invalid: [
    {
      code: `
        enum Fruit {
          Apple,
          Banana = 'banana',
        }
      `,
      errors: [
        {
          endColumn: 28,
          column: 20,
          line: 4,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
          Banana = 'banana',
          Cherry = 'cherry',
        }
      `,
      errors: [
        {
          endColumn: 28,
          column: 20,
          line: 4,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
          Banana,
          Cherry = 'cherry',
        }
      `,
      errors: [
        {
          endColumn: 28,
          column: 20,
          line: 5,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple = 0,
          Banana = 'banana',
        }
      `,
      errors: [
        {
          endColumn: 28,
          column: 20,
          line: 4,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        const getValue = () => 0;
        enum Fruit {
          Apple = getValue(),
          Banana = 'banana',
        }
      `,
      errors: [
        {
          endColumn: 28,
          column: 20,
          line: 5,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        const getValue = () => '';
        enum Fruit {
          Apple,
          Banana = getValue(),
        }
      `,
      errors: [
        {
          endColumn: 30,
          column: 20,
          line: 5,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        const getValue = () => '';
        enum Fruit {
          Apple = getValue(),
          Banana = 0,
        }
      `,
      errors: [
        {
          endColumn: 21,
          column: 20,
          line: 5,
          messageId: 'mixed',
        },
      ],
    },
  ],
});
