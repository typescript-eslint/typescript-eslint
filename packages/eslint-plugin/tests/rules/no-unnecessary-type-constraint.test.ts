import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unnecessary-type-constraint';

const ruleTester = new RuleTester();

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
    'const data = <T,>() => {};',
    'const data = <T, U>() => {};',
    'const data = <T extends number>() => {};',
    'const data = <T extends number | string>() => {};',
  ],
  invalid: [
    {
      code: 'function data<T extends any>() {}',
      errors: [
        {
          column: 15,
          data: { constraint: 'any', name: 'T' },
          endColumn: 28,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
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
          column: 15,
          data: { constraint: 'any', name: 'T' },
          endColumn: 28,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
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
          column: 18,
          data: { constraint: 'any', name: 'U' },
          endColumn: 31,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
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
          column: 15,
          data: { constraint: 'any', name: 'T' },
          endColumn: 28,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
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
          column: 15,
          data: { constraint: 'any', name: 'T' },
          endColumn: 28,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
              output: `const data = <T,>() => {};`,
            },
          ],
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: 'const data = <T extends any>() => {};',
      errors: [
        {
          column: 15,
          data: { constraint: 'any', name: 'T' },
          endColumn: 28,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
              output: `const data = <T,>() => {};`,
            },
          ],
        },
      ],
      filename: 'file.mts',
    },
    {
      code: 'const data = <T extends any>() => {};',
      errors: [
        {
          column: 15,
          data: { constraint: 'any', name: 'T' },
          endColumn: 28,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
              output: `const data = <T,>() => {};`,
            },
          ],
        },
      ],
      filename: 'file.cts',
    },
    {
      code: noFormat`const data = <T extends any,>() => {};`,
      errors: [
        {
          column: 15,
          data: { constraint: 'any', name: 'T' },
          endColumn: 28,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
              output: `const data = <T,>() => {};`,
            },
          ],
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: noFormat`const data = <T extends any, >() => {};`,
      errors: [
        {
          column: 15,
          data: { constraint: 'any', name: 'T' },
          endColumn: 28,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
              output: `const data = <T, >() => {};`,
            },
          ],
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: noFormat`const data = <T extends any ,>() => {};`,
      errors: [
        {
          column: 15,
          data: { constraint: 'any', name: 'T' },
          endColumn: 28,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
              output: `const data = <T ,>() => {};`,
            },
          ],
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: noFormat`const data = <T extends any , >() => {};`,
      errors: [
        {
          column: 15,
          data: { constraint: 'any', name: 'T' },
          endColumn: 28,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
              output: `const data = <T , >() => {};`,
            },
          ],
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: 'const data = <T extends any = unknown>() => {};',
      errors: [
        {
          column: 15,
          data: { constraint: 'any', name: 'T' },
          endColumn: 38,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
              output: 'const data = <T = unknown>() => {};',
            },
          ],
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: 'const data = <T extends any, U extends any>() => {};',
      errors: [
        {
          column: 15,
          data: { constraint: 'any', name: 'T' },
          endColumn: 28,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
              output: `const data = <T, U extends any>() => {};`,
            },
          ],
        },
        {
          column: 30,
          data: { constraint: 'any', name: 'U' },
          endColumn: 43,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
              output: `const data = <T extends any, U>() => {};`,
            },
          ],
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: 'function data<T extends unknown>() {}',
      errors: [
        {
          column: 15,
          data: { constraint: 'unknown', name: 'T' },
          endColumn: 32,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'unknown' },
              messageId: 'removeUnnecessaryConstraint',
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
          column: 15,
          data: { constraint: 'any', name: 'T' },
          endColumn: 28,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'any' },
              messageId: 'removeUnnecessaryConstraint',
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
          column: 15,
          data: { constraint: 'unknown', name: 'T' },
          endColumn: 32,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'unknown' },
              messageId: 'removeUnnecessaryConstraint',
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
          column: 12,
          data: { constraint: 'unknown', name: 'T' },
          endColumn: 29,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'unknown' },
              messageId: 'removeUnnecessaryConstraint',
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
          column: 20,
          data: { constraint: 'unknown', name: 'T' },
          endColumn: 37,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'unknown' },
              messageId: 'removeUnnecessaryConstraint',
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
          column: 10,
          data: { constraint: 'unknown', name: 'T' },
          endColumn: 27,
          line: 3,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'unknown' },
              messageId: 'removeUnnecessaryConstraint',
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
          column: 10,
          data: { constraint: 'unknown', name: 'T' },
          endColumn: 27,
          line: 3,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'unknown' },
              messageId: 'removeUnnecessaryConstraint',
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
          column: 16,
          data: { constraint: 'unknown', name: 'T' },
          endColumn: 33,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'unknown' },
              messageId: 'removeUnnecessaryConstraint',
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
          column: 11,
          data: { constraint: 'unknown', name: 'T' },
          endColumn: 28,
          line: 1,
          messageId: 'unnecessaryConstraint',
          suggestions: [
            {
              data: { constraint: 'unknown' },
              messageId: 'removeUnnecessaryConstraint',
              output: 'type Data<T> = {};',
            },
          ],
        },
      ],
    },
  ],
});
