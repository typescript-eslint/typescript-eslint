import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-function-type';

const ruleTester = new RuleTester();

ruleTester.run('no-unsafe-function-type', rule, {
  valid: [
    'let value: () => void;',
    'let value: <T>(t: T) => T;',
    `
      // create a scope since it's illegal to declare a duplicate identifier
      // 'Function' in the global script scope.
      {
        type Function = () => void;
        let value: Function;
      }
    `,
  ],
  invalid: [
    {
      code: 'let value: Function;',
      output: null,
      errors: [
        {
          messageId: 'bannedFunctionType',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'let value: Function[];',
      output: null,
      errors: [
        {
          messageId: 'bannedFunctionType',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'let value: Function | number;',
      output: null,
      errors: [
        {
          messageId: 'bannedFunctionType',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: `
        class Weird implements Function {
          // ...
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'bannedFunctionType',
          line: 2,
          column: 32,
        },
      ],
    },
    {
      code: `
        interface Weird extends Function {
          // ...
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'bannedFunctionType',
          line: 2,
          column: 33,
        },
      ],
    },
  ],
});
