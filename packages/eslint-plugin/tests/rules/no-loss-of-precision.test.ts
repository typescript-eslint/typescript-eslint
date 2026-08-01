import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-loss-of-precision';

const ruleTester = new RuleTester();

ruleTester.run('no-loss-of-precision', rule, {
  valid: [
    'const x = 12345;',
    'const x = 123.456;',
    'const x = -123.456;',
    'const x = 123_456;',
    'const x = 123_00_000_000_000_000_000_000_000;',
    'const x = 123.000_000_000_000_000_000_000_0;',
  ],
  invalid: [
    {
      code: 'const x = 9007199254740993;',
      errors: [
        {
          column: 11,
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noLossOfPrecision',
        },
      ],
    },
    {
      code: 'const x = 9_007_199_254_740_993;',
      errors: [
        {
          column: 11,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'noLossOfPrecision',
        },
      ],
    },
    {
      code: 'const x = 9_007_199_254_740.993e3;',
      errors: [
        {
          column: 11,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'noLossOfPrecision',
        },
      ],
    },
    {
      code: 'const x = 0b100_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_001;',
      errors: [
        {
          column: 11,
          endColumn: 84,
          endLine: 1,
          line: 1,
          messageId: 'noLossOfPrecision',
        },
      ],
    },
  ],
});
