import rule from '../../src/rules/type-name-prefix';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('type-name-prefix', rule, {
  valid: [
    `type Color = "white";`,
    {
      code: `type TColor = "white";`,
      options: [{ prefixWithT: 'always' }],
    },
    {
      code: `type TThreshold = 100 | 50;`,
      options: [{ prefixWithT: 'always' }],
    },
    {
      code: `type T20x = 200 | 201;`,
      options: [{ prefixWithT: 'always' }],
    },
    {
      code: `type Color = "white";`,
      options: [{ prefixWithT: 'never' }],
    },
    {
      code: `type Threshold = 100 | 50;`,
      options: [{ prefixWithT: 'never' }],
    },
  ],
  invalid: [
    {
      code: `type TColor = "white";`,
      errors: [
        {
          messageId: 'never',
          line: 1,
          column: 6,
        },
      ],
    },
    {
      code: `type Color = "white";`,
      options: [{ prefixWithT: 'always' }],
      errors: [
        {
          messageId: 'always',
          line: 1,
          column: 6,
        },
      ],
    },
    {
      code: `type Threshold = 100 | 50;`,
      options: [{ prefixWithT: 'always' }],
      errors: [
        {
          messageId: 'always',
          line: 1,
          column: 6,
        },
      ],
    },
    {
      code: `type TColor = "white";`,
      options: [{ prefixWithT: 'never' }],
      errors: [
        {
          messageId: 'never',
          line: 1,
          column: 6,
        },
      ],
    },
    {
      code: `type TThreshold = 100 | 50;`,
      options: [{ prefixWithT: 'never' }],
      errors: [
        {
          messageId: 'never',
          line: 1,
          column: 6,
        },
      ],
    },
  ],
});
