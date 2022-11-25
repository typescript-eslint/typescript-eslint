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
        type Test = string | (() => void);
      `,
    },
    {
      code: `
        type Test = string & (() => void);
      `,
    },
    {
      code: `
        type Test = string | (((() => void)));
      `,
    },
    {
      code: `
        type Test = string & (((() => void)));
      `,
    },
    {
      code: `
        type Test = (() => boolean) | (() => void);
      `,
    },
    {
      code: `
        type Test = (() => boolean) & (() => void);
      `,
    },
    {
      code: `
        type Test = (((() => boolean))) | (((() => void)));
      `,
    },
    {
      code: `
        type Test = (((() => boolean))) & (((() => void)));
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
        class Test {
          private value:number | (() => void) = 1;
        }
      `,
    },
    {
      code: `
        class Test {
          private value:number & (() => void) = 1;
        }
      `,
    },
    {
      code: `
        class Test {
          private value:number | (((() => void))) = 1;
        }
      `,
    },
    {
      code: `
        class Test {
          private value:number & (((() => void))) = 1;
        }
      `,
    },
    {
      code: `
        class Test {
          value: { prop: string }[] = [];
        }
      `,
    },
    {
      code: `
        class Test {
          value:{prop:string}[] = [];
        }
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
        class Test {
          optional? = false;
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
        type Test =
        | string
        | (() => void);
      `,
    },
    {
      code: `
        type Test =
        & string
        & (() => void);
      `,
    },
    {
      code: `
        type Test =
        | (() => boolean)
        | (() => void);
      `,
    },
    {
      code: `
        type Test =
        & (() => boolean)
        & (() => void);
      `,
    },
    {
      code: `
        type Test =
        | string
        | (((() => void)));
      `,
    },
    {
      code: `
        type Test =
        & string
        & (((() => void)));
      `,
    },
    {
      code: `
        type Test =
        | (((() => boolean)))
        | (((() => void)));
      `,
    },
    {
      code: `
        type Test =
        & (((() => boolean)))
        & (((() => void)));
      `,
    },
    {
      code: 'type Baz<T> = T extends (bar: string) => void ? string : number',
    },
    {
      code: 'type Foo<T> = T extends { bar: string } ? string : number',
    },
    {
      code: 'type Baz<T> = T extends (bar: string) => void ? { x: string } : { y: string }',
    },
    {
      code: 'type Foo<T extends (...args: any[]) => any> = T;',
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
          prop:
            & string
            & (() => void);
        }
      `,
    },
    {
      code: `
        interface Test {
          prop:
            | string
            | (() => void);
        }
      `,
    },
    {
      code: `
        interface Test {
          prop:
            & string
            & (((() => void)));
        }
      `,
    },
    {
      code: `
        interface Test {
          prop:
            | string
            | (((() => void)));
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
        interface Test {
          props: string | (() => void);
        }
      `,
    },
    {
      code: `
        interface Test {
          props: string & (() => void);
        }
      `,
    },
    {
      code: `
        interface Test {
          props:  (() => boolean) & (() => void);
        }
      `,
    },
    {
      code: `
        interface Test {
          props: string | (((() => void)));
        }
      `,
    },
    {
      code: `
        interface Test {
          props: string & (((() => void)));
        }
      `,
    },
    {
      code: `
        interface Test {
          props:  (((() => boolean))) & (((() => void)));
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
        const x: string & (() => void);
      `,
    },
    {
      code: `
        const x: string & (((() => void)));
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
        class Test {
          value: { prop: string }[]= [];
        }
      `,
      output: `
        class Test {
          value: { prop: string }[] = [];
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 36,
          line: 3,
        },
      ],
    },
    {
      code: `
        class Test {
          value: { prop: string }[] =[];
        }
      `,
      output: `
        class Test {
          value: { prop: string }[] = [];
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 37,
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
        type Test= (() => void) | number;
      `,
      output: `
        type Test = (() => void) | number;
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
        type Test= (((() => void))) | number;
      `,
      output: `
        type Test = (((() => void))) | number;
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
        type Test =(() => void) | number;
      `,
      output: `
        type Test = (() => void) | number;
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
        type Test =(((() => void))) | number;
      `,
      output: `
        type Test = (((() => void))) | number;
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
        type Test = string| (() => void);
      `,
      output: `
        type Test = string | (() => void);
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
        type Test = string| (((() => void)));
      `,
      output: `
        type Test = string | (((() => void)));
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
        type Test = string |(() => void);
      `,
      output: `
        type Test = string | (() => void);
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
        type Test = string |(((() => void)));
      `,
      output: `
        type Test = string | (((() => void)));
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
        type Test = string &(() => void);
      `,
      output: `
        type Test = string & (() => void);
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
        type Test = string &(((() => void)));
      `,
      output: `
        type Test = string & (((() => void)));
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
        type Test = string& (() => void);
      `,
      output: `
        type Test = string & (() => void);
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
        type Test = string& (((() => void)));
      `,
      output: `
        type Test = string & (((() => void)));
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
        type Test = (() => boolean)| (() => void);
      `,
      output: `
        type Test = (() => boolean) | (() => void);
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 36,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test = (((() => boolean)))| (((() => void)));
      `,
      output: `
        type Test = (((() => boolean))) | (((() => void)));
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 40,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test = (() => boolean)& (() => void);
      `,
      output: `
        type Test = (() => boolean) & (() => void);
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 36,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test = (((() => boolean)))& (((() => void)));
      `,
      output: `
        type Test = (((() => boolean))) & (((() => void)));
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 40,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test = (() => boolean)|(() => void);
      `,
      output: `
        type Test = (() => boolean) | (() => void);
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 36,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test = (((() => boolean)))|(((() => void)));
      `,
      output: `
        type Test = (((() => boolean))) | (((() => void)));
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 40,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test = (() => boolean)&(() => void);
      `,
      output: `
        type Test = (() => boolean) & (() => void);
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 36,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test = (((() => boolean)))&(((() => void)));
      `,
      output: `
        type Test = (((() => boolean))) & (((() => void)));
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 40,
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
        |string
        | (() => void);
      `,
      output: `
        type Test =
        | string
        | (() => void);
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
        |string
        | (((() => void)));
      `,
      output: `
        type Test =
        | string
        | (((() => void)));
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
        type Test = |string|(((() => void)))|string;
      `,
      output: `
        type Test = | string | (((() => void))) | string;
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 21,
          line: 2,
        },
        {
          messageId: 'missingSpace',
          column: 28,
          line: 2,
        },
        {
          messageId: 'missingSpace',
          column: 45,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test=|string|(((() => void)))|string;
      `,
      output: `
        type Test = |string | (((() => void))) | string;
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 18,
          line: 2,
        },
        {
          messageId: 'missingSpace',
          column: 19,
          line: 2,
        },
        {
          messageId: 'missingSpace',
          column: 26,
          line: 2,
        },
        {
          messageId: 'missingSpace',
          column: 43,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test=(string&number)|string|(((() => void)));
      `,
      output: `
        type Test = (string & number) | string | (((() => void)));
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 18,
          line: 2,
        },
        {
          messageId: 'missingSpace',
          column: 26,
          line: 2,
        },
        {
          messageId: 'missingSpace',
          column: 34,
          line: 2,
        },
        {
          messageId: 'missingSpace',
          column: 41,
          line: 2,
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
        type Test =
        &string
        & (() => void);
      `,
      output: `
        type Test =
        & string
        & (() => void);
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
        & (((() => void)));
      `,
      output: `
        type Test =
        & string
        & (((() => void)));
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
        type Test<T> = T extends boolean?true:false
      `,
      output: `
        type Test<T> = T extends boolean ? true : false
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 41,
          line: 2,
        },
        {
          messageId: 'missingSpace',
          column: 46,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test<T> = T extends boolean? true :false
      `,
      output: `
        type Test<T> = T extends boolean ? true : false
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 41,
          line: 2,
        },
        {
          messageId: 'missingSpace',
          column: 48,
          line: 2,
        },
      ],
    },
    {
      code: `
        type Test<T> = T extends boolean?
          true :false
      `,
      output: `
        type Test<T> = T extends boolean ?
          true : false
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 41,
          line: 2,
        },
        {
          messageId: 'missingSpace',
          column: 16,
          line: 3,
        },
      ],
    },
    {
      code: `
        type Test<T> = T extends boolean?
          true
          :false
      `,
      output: `
        type Test<T> = T extends boolean ?
          true
          : false
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 41,
          line: 2,
        },
        {
          messageId: 'missingSpace',
          column: 11,
          line: 4,
        },
      ],
    },
    {
      code: `
        type Test<T> = T extends boolean
          ?true:
          false
      `,
      output: `
        type Test<T> = T extends boolean
          ? true :
          false
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 11,
          line: 3,
        },
        {
          messageId: 'missingSpace',
          column: 16,
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
          prop: string| (() => void);
        }
      `,
      output: `
        interface Test {
          prop: string | (() => void);
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
          prop: string| (((() => void)));
        }
      `,
      output: `
        interface Test {
          prop: string | (((() => void)));
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
          prop: string |(() => void);
        }
      `,
      output: `
        interface Test {
          prop: string | (() => void);
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
          prop: string |(((() => void)));
        }
      `,
      output: `
        interface Test {
          prop: string | (((() => void)));
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
          prop: (() => boolean) |(() => void);
        }
      `,
      output: `
        interface Test {
          prop: (() => boolean) | (() => void);
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
        interface Test {
          prop: (((() => boolean))) |(((() => void)));
        }
      `,
      output: `
        interface Test {
          prop: (((() => boolean))) | (((() => void)));
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 37,
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
          prop: string &(() => void);
        }
      `,
      output: `
        interface Test {
          prop: string & (() => void);
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
          prop: string &(((() => void)));
        }
      `,
      output: `
        interface Test {
          prop: string & (((() => void)));
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
          prop: string& (() => void);
        }
      `,
      output: `
        interface Test {
          prop: string & (() => void);
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
          prop: string& (((() => void)));
        }
      `,
      output: `
        interface Test {
          prop: string & (((() => void)));
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
            |string
            | (() => void);
        }
      `,
      output: `
        interface Test {
          prop:
            | string
            | (() => void);
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
            |string
            | (((() => void)));
        }
      `,
      output: `
        interface Test {
          prop:
            | string
            | (((() => void)));
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
        interface Test {
          prop:
            &string
            & (() => void);
        }
      `,
      output: `
        interface Test {
          prop:
            & string
            & (() => void);
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
            & (((() => void)));
        }
      `,
      output: `
        interface Test {
          prop:
            & string
            & (((() => void)));
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
        const x: string &(() => void);
      `,
      output: `
        const x: string & (() => void);
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
        const x: string &(((() => void)));
      `,
      output: `
        const x: string & (((() => void)));
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
        const x: string& (() => void);
      `,
      output: `
        const x: string & (() => void);
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
        const x: string& (((() => void)));
      `,
      output: `
        const x: string & (((() => void)));
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
        const x: string| (() => void);
      `,
      output: `
        const x: string | (() => void);
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
        const x: string| (((() => void)));
      `,
      output: `
        const x: string | (((() => void)));
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
          value: string |(() => void);
        }
      `,
      output: `
        class Test {
          value: string | (() => void);
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
          value: string |(((() => void)));
        }
      `,
      output: `
        class Test {
          value: string | (((() => void)));
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
          value: string& (() => void);
        }
      `,
      output: `
        class Test {
          value: string & (() => void);
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
          value: string& (((() => void)));
        }
      `,
      output: `
        class Test {
          value: string & (((() => void)));
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
        class Test {
          value: string| (() => void);
        }
      `,
      output: `
        class Test {
          value: string | (() => void);
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
          value: string| (((() => void)));
        }
      `,
      output: `
        class Test {
          value: string | (((() => void)));
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
          optional?= false;
        }
      `,
      output: `
        class Test {
          optional? = false;
        }
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 20,
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
        function foo<T extends string &(() => void)>() {}
      `,
      output: `
        function foo<T extends string & (() => void)>() {}
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
        function foo<T extends string &(((() => void)))>() {}
      `,
      output: `
        function foo<T extends string & (((() => void)))>() {}
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
        function foo<T extends string& (() => void)>() {}
      `,
      output: `
        function foo<T extends string & (() => void)>() {}
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
        function foo<T extends string& (((() => void)))>() {}
      `,
      output: `
        function foo<T extends string & (((() => void)))>() {}
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
        function foo<T extends string |(() => void)>() {}
      `,
      output: `
        function foo<T extends string | (() => void)>() {}
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
        function foo<T extends string |(((() => void)))>() {}
      `,
      output: `
        function foo<T extends string | (((() => void)))>() {}
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
        function foo<T extends string| (() => void)>() {}
      `,
      output: `
        function foo<T extends string | (() => void)>() {}
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
        function foo<T extends string| (((() => void)))>() {}
      `,
      output: `
        function foo<T extends string | (((() => void)))>() {}
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
        function bar(): string &(() => void) {}
      `,
      output: `
        function bar(): string & (() => void) {}
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
        function bar(): string &(((() => void))) {}
      `,
      output: `
        function bar(): string & (((() => void))) {}
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
        function bar(): string& (() => void) {}
      `,
      output: `
        function bar(): string & (() => void) {}
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
        function bar(): string& (((() => void))) {}
      `,
      output: `
        function bar(): string & (((() => void))) {}
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
        function bar(): string |(() => void) {}
      `,
      output: `
        function bar(): string | (() => void) {}
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
        function bar(): string |(((() => void))) {}
      `,
      output: `
        function bar(): string | (((() => void))) {}
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
    {
      code: `
        function bar(): string| (() => void) {}
      `,
      output: `
        function bar(): string | (() => void) {}
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
        function bar(): string| (((() => void))) {}
      `,
      output: `
        function bar(): string | (((() => void))) {}
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
        function bar(): (() => boolean)| (() => void) {}
      `,
      output: `
        function bar(): (() => boolean) | (() => void) {}
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 40,
          line: 2,
        },
      ],
    },
    {
      code: `
        function bar(): (((() => boolean)))| (((() => void))) {}
      `,
      output: `
        function bar(): (((() => boolean))) | (((() => void))) {}
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 44,
          line: 2,
        },
      ],
    },
    {
      code: `
        function bar(): (() => boolean)& (() => void) {}
      `,
      output: `
        function bar(): (() => boolean) & (() => void) {}
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 40,
          line: 2,
        },
      ],
    },
    {
      code: `
        function bar(): (((() => boolean)))& (((() => void))) {}
      `,
      output: `
        function bar(): (((() => boolean))) & (((() => void))) {}
      `,
      errors: [
        {
          messageId: 'missingSpace',
          column: 44,
          line: 2,
        },
      ],
    },
  ],
});
