/* eslint-disable eslint-comments/no-use */
// this rule tests spacing, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import rule from '../../src/rules/space-infix-ops';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('space-infix-ops', rule, {
  valid: [
    {
      code: `
        enum Test {
          KEY1 = 2,
        }
      `,
    },
    {
      code: `
        enum Test {
          KEY1 = "value",
        }
      `,
    },
    {
      code: `
        enum Test {
          KEY1,
        }
      `,
    },
    {
      code: `
        class Test {
          public readonly value?: number;
        }
      `,
    },
    {
      code: `
        class Test {
          public readonly value = 1;
        }
      `,
    },
    {
      code: `
        class Test {
          private value:number = 1;
        }
      `,
    },
    {
      code: `
        type Test = string;
      `,
    },
    {
      code: `
        type Test = string | boolean;
      `,
    },
    {
      code: `
        type Test = string & boolean;
      `,
    },
    {
      code: `
        class Test {
          private value:number | string = 1;
        }
      `,
    },
    {
      code: `
        class Test {
          private value:number & string = 1;
        }
      `,
    },
    {
      code: `
        type Test =
        | string
        | boolean;
      `,
    },
    {
      code: `
        type Test =
        & string
        & boolean;
      `,
    },
    {
      code: `
        interface Test {
          prop:
            & string
            & boolean;
        }
      `,
    },
    {
      code: `
        interface Test {
          prop:
            | string
            | boolean;
        }
      `,
    },
    {
      code: `
        interface Test {
          props: string;
        }
      `,
    },
    {
      code: `
        interface Test {
          props: string | boolean;
        }
      `,
    },
    {
      code: `
        interface Test {
          props: string & boolean;
        }
      `,
    },
    {
      code: `
        const x: string & number;
      `,
    },
    {
      code: `
        class Test {
           value: string & number;
        }
      `,
    },
    {
      code: `
        function foo<T extends string & number>() {}
      `,
    },
    {
      code: `
        function bar(): string & number {}
      `,
    },
  ],
  invalid: [
    {
      code: `
        enum Test {
          A= 2,
          B = 1,
        }
      `,
      output: `
        enum Test {
          A = 2,
          B = 1,
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 12,
          line: 3,
        },
      ],
    },
    {
      code: `
        enum Test {
          KEY1= "value1",
          KEY2 = "value2",
        }
      `,
      output: `
        enum Test {
          KEY1 = "value1",
          KEY2 = "value2",
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 15,
          line: 3,
        },
      ],
    },
    {
      code: `
        enum Test {
          A =2,
          B = 1,
        }
      `,
      output: `
        enum Test {
          A = 2,
          B = 1,
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 13,
          line: 3,
        },
      ],
    },
    {
      code: `
        class Test {
          public readonly value= 2;
        }
      `,
      output: `
        class Test {
          public readonly value = 2;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 32,
          line: 3,
        },
      ],
    },
    {
      code: `
        class Test {
          public readonly value =2;
        }
      `,
      output: `
        class Test {
          public readonly value = 2;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 33,
          line: 3,
        },
      ],
    },
    {
      code: `
        type Test= string | number;
      `,
      output: `
        type Test = string | number;
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 18,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test =string | number;
      `,
      output: `
        type Test = string | number;
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 19,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test = string| number;
      `,
      output: `
        type Test = string | number;
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 27,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test = string |number;
      `,
      output: `
        type Test = string | number;
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 28,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test = string &number;
      `,
      output: `
        type Test = string & number;
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 28,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test = string& number;
      `,
      output: `
        type Test = string & number;
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 27,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test =
        |string
        | number;
      `,
      output: `
        type Test =
        | string
        | number;
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 9,
          line: 3,
        },
      ],
    },
    {
      code: `
        type Test =
        &string
        & number;
      `,
      output: `
        type Test =
        & string
        & number;
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 9,
          line: 3,
        },
      ],
    },
    {
      code: `
        interface Test {
          prop: string| number;
        }
      `,
      output: `
        interface Test {
          prop: string | number;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 23,
          line: 3,
        },
      ],
    },
    {
      code: `
        interface Test {
          prop: string |number;
        }
      `,
      output: `
        interface Test {
          prop: string | number;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 24,
          line: 3,
        },
      ],
    },
    {
      code: `
        interface Test {
          prop: string &number;
        }
      `,
      output: `
        interface Test {
          prop: string & number;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 24,
          line: 3,
        },
      ],
    },
    {
      code: `
        interface Test {
          prop: string& number;
        }
      `,
      output: `
        interface Test {
          prop: string & number;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 23,
          line: 3,
        },
      ],
    },
    {
      code: `
        interface Test {
          prop:
            |string
            | number;
        }
      `,
      output: `
        interface Test {
          prop:
            | string
            | number;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 13,
          line: 4,
        },
      ],
    },
    {
      code: `
        interface Test {
          prop:
            &string
            & number;
        }
      `,
      output: `
        interface Test {
          prop:
            & string
            & number;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 13,
          line: 4,
        },
      ],
    },
    {
      code: `
        const x: string &number;
      `,
      output: `
        const x: string & number;
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 25,
          line: 2,
        },
      ],
    },
    {
      code: `
        const x: string& number;
      `,
      output: `
        const x: string & number;
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 24,
          line: 2,
        },
      ],
    },
    {
      code: `
        const x: string| number;
      `,
      output: `
        const x: string | number;
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 24,
          line: 2,
        },
      ],
    },
    {
      code: `
        class Test {
          value: string |number;
        }
      `,
      output: `
        class Test {
          value: string | number;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 25,
          line: 3,
        },
      ],
    },
    {
      code: `
        class Test {
          value: string& number;
        }
      `,
      output: `
        class Test {
          value: string & number;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 24,
          line: 3,
        },
      ],
    },
    {
      code: `
        class Test {
          value: string| number;
        }
      `,
      output: `
        class Test {
          value: string | number;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 24,
          line: 3,
        },
      ],
    },
    {
      code: `
        function foo<T extends string &number>() {}
      `,
      output: `
        function foo<T extends string & number>() {}
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 39,
          line: 2,
        },
      ],
    },
    {
      code: `
        function foo<T extends string& number>() {}
      `,
      output: `
        function foo<T extends string & number>() {}
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 38,
          line: 2,
        },
      ],
    },
    {
      code: `
        function foo<T extends string |number>() {}
      `,
      output: `
        function foo<T extends string | number>() {}
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 39,
          line: 2,
        },
      ],
    },
    {
      code: `
        function foo<T extends string| number>() {}
      `,
      output: `
        function foo<T extends string | number>() {}
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 38,
          line: 2,
        },
      ],
    },
    {
      code: `
        function bar(): string &number {}
      `,
      output: `
        function bar(): string & number {}
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 32,
          line: 2,
        },
      ],
    },
    {
      code: `
        function bar(): string& number {}
      `,
      output: `
        function bar(): string & number {}
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 31,
          line: 2,
        },
      ],
    },
    {
      code: `
        function bar(): string |number {}
      `,
      output: `
        function bar(): string | number {}
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 32,
          line: 2,
        },
      ],
    },
    {
      code: `
        function bar(): string| number {}
      `,
      output: `
        function bar(): string | number {}
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 31,
          line: 2,
        },
      ],
    },
  ],
});
