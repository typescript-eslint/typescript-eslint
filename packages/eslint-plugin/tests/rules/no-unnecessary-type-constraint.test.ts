import rule from '../../src/rules/no-unnecessary-type-constraint';
import { noFormat, RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-unnecessary-type-constraint', rule, {
  valid: [
    'function data() {}',
    'function data<T>() {}',
    'function data<T, U>() {}',
    'function data<T extends number>() {}',
    'function data<T extends number | string>() {}',
    'function data<T extends any | number>() {}',
    `
type TODO = any;
function data<T extends TODO>() {}
    `,
    'const data = () => {};',
    'const data = <T>() => {};',
    'const data = <T, U>() => {};',
    'const data = <T extends number>() => {};',
    'const data = <T extends number | string>() => {};',
  ],
  invalid: [
    {
      code: 'function data<T extends any>() {}',
      errors: [
        {
          data: { constraint: 'any', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 28,
          column: 15,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'any' },
              output: 'function data<T>() {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function data<T extends any, U>() {}',
      errors: [
        {
          data: { constraint: 'any', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 28,
          column: 15,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'any' },
              output: 'function data<T, U>() {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function data<T, U extends any>() {}',
      errors: [
        {
          data: { constraint: 'any', name: 'U' },
          messageId: 'unnecessaryConstraint',
          endColumn: 31,
          column: 18,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'any' },
              output: 'function data<T, U>() {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function data<T extends any, U extends T>() {}',
      errors: [
        {
          data: { constraint: 'any', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 28,
          column: 15,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'any' },
              output: 'function data<T, U extends T>() {}',
            },
          ],
        },
      ],
    },
    {
      code: 'const data = <T extends any>() => {};',
      errors: [
        {
          data: { constraint: 'any', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 28,
          column: 15,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'any' },
              output: `const data = <T,>() => {};`,
            },
          ],
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: noFormat`const data = <T extends any,>() => {};`,
      errors: [
        {
          data: { constraint: 'any', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 28,
          column: 15,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'any' },
              output: `const data = <T,>() => {};`,
            },
          ],
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: noFormat`const data = <T extends any, >() => {};`,
      errors: [
        {
          data: { constraint: 'any', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 28,
          column: 15,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'any' },
              output: `const data = <T, >() => {};`,
            },
          ],
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: noFormat`const data = <T extends any ,>() => {};`,
      errors: [
        {
          data: { constraint: 'any', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 28,
          column: 15,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'any' },
              output: `const data = <T ,>() => {};`,
            },
          ],
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: noFormat`const data = <T extends any , >() => {};`,
      errors: [
        {
          data: { constraint: 'any', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 28,
          column: 15,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'any' },
              output: `const data = <T , >() => {};`,
            },
          ],
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: 'const data = <T extends any = unknown>() => {};',
      errors: [
        {
          data: { constraint: 'any', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 38,
          column: 15,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'any' },
              output: 'const data = <T = unknown>() => {};',
            },
          ],
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: 'const data = <T extends any, U extends any>() => {};',
      errors: [
        {
          data: { constraint: 'any', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 28,
          column: 15,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'any' },
              output: `const data = <T, U extends any>() => {};`,
            },
          ],
        },
        {
          data: { constraint: 'any', name: 'U' },
          messageId: 'unnecessaryConstraint',
          endColumn: 43,
          column: 30,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'any' },
              output: `const data = <T extends any, U>() => {};`,
            },
          ],
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: 'function data<T extends unknown>() {}',
      errors: [
        {
          data: { constraint: 'unknown', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 32,
          column: 15,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'unknown' },
              output: 'function data<T>() {}',
            },
          ],
        },
      ],
    },
    {
      code: 'const data = <T extends any>() => {};',
      errors: [
        {
          data: { constraint: 'any', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 28,
          column: 15,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'any' },
              output: 'const data = <T>() => {};',
            },
          ],
        },
      ],
    },
    {
      code: 'const data = <T extends unknown>() => {};',
      errors: [
        {
          data: { constraint: 'unknown', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 32,
          column: 15,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'unknown' },
              output: 'const data = <T>() => {};',
            },
          ],
        },
      ],
    },
    {
      code: 'class Data<T extends unknown> {}',
      errors: [
        {
          data: { constraint: 'unknown', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 29,
          column: 12,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'unknown' },
              output: 'class Data<T> {}',
            },
          ],
        },
      ],
    },
    {
      code: 'const Data = class<T extends unknown> {};',
      errors: [
        {
          data: { constraint: 'unknown', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 37,
          column: 20,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'unknown' },
              output: 'const Data = class<T> {};',
            },
          ],
        },
      ],
    },
    {
      code: `
class Data {
  member<T extends unknown>() {}
}
      `,
      errors: [
        {
          data: { constraint: 'unknown', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 27,
          column: 10,
          line: 3,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'unknown' },
              output: `
class Data {
  member<T>() {}
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const Data = class {
  member<T extends unknown>() {}
};
      `,
      errors: [
        {
          data: { constraint: 'unknown', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 27,
          column: 10,
          line: 3,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'unknown' },
              output: `
const Data = class {
  member<T>() {}
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: 'interface Data<T extends unknown> {}',
      errors: [
        {
          data: { constraint: 'unknown', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 33,
          column: 16,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'unknown' },
              output: 'interface Data<T> {}',
            },
          ],
        },
      ],
    },
    {
      code: 'type Data<T extends unknown> = {};',
      errors: [
        {
          data: { constraint: 'unknown', name: 'T' },
          messageId: 'unnecessaryConstraint',
          endColumn: 28,
          column: 11,
          line: 1,
          suggestions: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: { constraint: 'unknown' },
              output: 'type Data<T> = {};',
            },
          ],
        },
      ],
    },
  ],
});
