import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-function-type';

const ruleTester = new RuleTester();

ruleTester.run('no-unsafe-function-type', rule, {
  assertionOptions: {
    requireData: true,
  },
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
    `
export {};
type Function = () => void;
let value: Function;
    `,
    `
interface Function {
  value: 1;
}
let value: Function;
    `,
  ],
  invalid: [
    {
      code: 'let value: Function;',
      errors: [
        {
          column: 12,
          endColumn: 20,
          endLine: 1,
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
          endColumn: 20,
          endLine: 1,
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
          endColumn: 20,
          endLine: 1,
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
          column: 24,
          endColumn: 32,
          endLine: 2,
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
          column: 25,
          endColumn: 33,
          endLine: 2,
          line: 2,
          messageId: 'bannedFunctionType',
        },
      ],
      output: null,
    },
    {
      code: `
export {};
namespace Function {}
let value: Function;
      `,
      errors: [
        {
          column: 12,
          endColumn: 20,
          endLine: 4,
          line: 4,
          messageId: 'bannedFunctionType',
        },
      ],
      output: null,
    },
    {
      code: `
export {};
namespace Function {
  export const value = 1;
}
let value: Function;
      `,
      errors: [
        {
          column: 12,
          endColumn: 20,
          endLine: 6,
          line: 6,
          messageId: 'bannedFunctionType',
        },
      ],
      output: null,
    },
    {
      code: `
export {};
namespace Function {}
class Weird implements Function {}
      `,
      errors: [
        {
          column: 24,
          endColumn: 32,
          endLine: 4,
          line: 4,
          messageId: 'bannedFunctionType',
        },
      ],
      output: null,
    },
    {
      code: `
export {};
declare global {
  interface Function {
    value: 1;
  }
  let value: Function;
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 22,
          endLine: 7,
          line: 7,
          messageId: 'bannedFunctionType',
        },
      ],
      output: null,
    },
    {
      code: `
interface Function {
  value: 1;
}
declare let value: Function;
      `,
      errors: [
        {
          column: 20,
          endColumn: 28,
          endLine: 5,
          line: 5,
          messageId: 'bannedFunctionType',
        },
      ],
      filename: 'test.d.ts',
      output: null,
    },
  ],
});
