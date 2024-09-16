import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-function-type';

const ruleTester = new RuleTester();

ruleTester.run('no-unsafe-function-type', rule, {
  valid: [
    'let value: () => void;',
    'let value: <T>(t: T) => T;',
    `
      type Function = () => void;
      let value: Function;
    `,
  ],
  invalid: [
    {
      code: 'let value: Function;',
      errors: [
        {
          column: 12,
          line: 1,
          messageId: 'bannedFunctionType',
        },
      ],
      output: null,
    },
    {
      code: 'let value: Function[];',
      errors: [
        {
          column: 12,
          line: 1,
          messageId: 'bannedFunctionType',
        },
      ],
      output: null,
    },
    {
      code: 'let value: Function | number;',
      errors: [
        {
          column: 12,
          line: 1,
          messageId: 'bannedFunctionType',
        },
      ],
      output: null,
    },
    {
      code: `
        class Weird implements Function {
          // ...
        }
      `,
      errors: [
        {
          column: 32,
          line: 2,
          messageId: 'bannedFunctionType',
        },
      ],
      output: null,
    },
    {
      code: `
        interface Weird extends Function {
          // ...
        }
      `,
      errors: [
        {
          column: 33,
          line: 2,
          messageId: 'bannedFunctionType',
        },
      ],
      output: null,
    },
  ],
});
