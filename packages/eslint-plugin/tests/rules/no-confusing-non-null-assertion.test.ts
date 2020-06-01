import rule from '../../src/rules/no-confusing-non-null-assertion';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-confusing-non-null-assertion', rule, {
  valid: [
    //
    'a == b!;',
  ],
  invalid: [
    {
      code: 'c + a! == b;',
      errors: [
        {
          messageId: 'confusing',
          line: 1,
          column: 5,
          suggestions: undefined,
        },
      ],
    },
    {
      code: 'a! == b;',
      errors: [
        {
          messageId: 'confusing',
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
          messageId: 'confusing',
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
  ],
});
