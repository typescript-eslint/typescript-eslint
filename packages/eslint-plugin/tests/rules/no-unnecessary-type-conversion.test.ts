import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unnecessary-type-conversion';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

ruleTester.run('no-unnecessary-type-conversion', rule, {
  invalid: [
    {
      code: "String('asdf');",
      errors: [
        {
          column: 1,
          endColumn: 7,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: "'asdf';",
            },
            {
              messageId: 'suggestSatisfies',
              output: "'asdf' satisfies string;",
            },
          ],
        },
      ],
    },
    {
      code: "'asdf'.toString();",
      errors: [
        {
          column: 8,
          endColumn: 18,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: "'asdf';",
            },
            {
              messageId: 'suggestSatisfies',
              output: "'asdf' satisfies string;",
            },
          ],
        },
      ],
    },
    {
      code: "'' + 'asdf';",
      errors: [
        {
          column: 1,
          endColumn: 6,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: "'asdf';",
            },
            {
              messageId: 'suggestSatisfies',
              output: "'asdf' satisfies string;",
            },
          ],
        },
      ],
    },
    {
      code: "'asdf' + '';",
      errors: [
        {
          column: 7,
          endColumn: 12,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: "'asdf';",
            },
            {
              messageId: 'suggestSatisfies',
              output: "'asdf' satisfies string;",
            },
          ],
        },
      ],
    },
    {
      code: `
let str = 'asdf';
str += '';
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: `
let str = 'asdf';

      `,
            },
            {
              messageId: 'suggestSatisfies',
              output: `
let str = 'asdf';
str satisfies string;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
let str = 'asdf';
'asdf' + (str += '');
      `,
      errors: [
        {
          column: 11,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: `
let str = 'asdf';
'asdf' + (str);
      `,
            },
            {
              messageId: 'suggestSatisfies',
              output: `
let str = 'asdf';
'asdf' + (str satisfies string);
      `,
            },
          ],
        },
      ],
    },
    {
      code: 'Number(123);',
      errors: [
        {
          column: 1,
          endColumn: 7,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '123;',
            },
            {
              messageId: 'suggestSatisfies',
              output: '123 satisfies number;',
            },
          ],
        },
      ],
    },
    {
      code: '+123;',
      errors: [
        {
          column: 1,
          endColumn: 2,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '123;',
            },
            {
              messageId: 'suggestSatisfies',
              output: '123 satisfies number;',
            },
          ],
        },
      ],
    },
    {
      code: '~~123;',
      errors: [
        {
          column: 1,
          endColumn: 3,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '123;',
            },
            {
              messageId: 'suggestSatisfies',
              output: '123 satisfies number;',
            },
          ],
        },
      ],
    },
    {
      code: 'Boolean(true);',
      errors: [
        {
          column: 1,
          endColumn: 8,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: 'true;',
            },
            {
              messageId: 'suggestSatisfies',
              output: 'true satisfies boolean;',
            },
          ],
        },
      ],
    },
    {
      code: '!!true;',
      errors: [
        {
          column: 1,
          endColumn: 3,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: 'true;',
            },
            {
              messageId: 'suggestSatisfies',
              output: 'true satisfies boolean;',
            },
          ],
        },
      ],
    },
    {
      code: 'BigInt(3n);',
      errors: [
        {
          column: 1,
          endColumn: 7,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '3n;',
            },
            {
              messageId: 'suggestSatisfies',
              output: '3n satisfies bigint;',
            },
          ],
        },
      ],
    },

    // using type conversion idioms on generics that extend primitives is invalid
    {
      code: `
        function f<T extends string>(x: T) {
          return String(x);
        }
      `,
      errors: [
        {
          column: 18,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: `
        function f<T extends string>(x: T) {
          return x;
        }
      `,
            },
            {
              messageId: 'suggestSatisfies',
              output: `
        function f<T extends string>(x: T) {
          return x satisfies string;
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        function f<T extends number>(x: T) {
          return Number(x);
        }
      `,
      errors: [
        {
          column: 18,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: `
        function f<T extends number>(x: T) {
          return x;
        }
      `,
            },
            {
              messageId: 'suggestSatisfies',
              output: `
        function f<T extends number>(x: T) {
          return x satisfies number;
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        function f<T extends boolean>(x: T) {
          return Boolean(x);
        }
      `,
      errors: [
        {
          column: 18,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: `
        function f<T extends boolean>(x: T) {
          return x;
        }
      `,
            },
            {
              messageId: 'suggestSatisfies',
              output: `
        function f<T extends boolean>(x: T) {
          return x satisfies boolean;
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        function f<T extends bigint>(x: T) {
          return BigInt(x);
        }
      `,
      errors: [
        {
          column: 18,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: `
        function f<T extends bigint>(x: T) {
          return x;
        }
      `,
            },
            {
              messageId: 'suggestSatisfies',
              output: `
        function f<T extends bigint>(x: T) {
          return x satisfies bigint;
        }
      `,
            },
          ],
        },
      ],
    },

    // make sure fixes preserve parentheses in cases where logic would otherwise break
    {
      code: "String('a' + 'b').length;",
      errors: [
        {
          column: 1,
          endColumn: 7,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: "('a' + 'b').length;",
            },
            {
              messageId: 'suggestSatisfies',
              output: "(('a' + 'b') satisfies string).length;",
            },
          ],
        },
      ],
    },
    {
      code: "('a' + 'b').toString().length;",
      errors: [
        {
          column: 13,
          endColumn: 23,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: "('a' + 'b').length;",
            },
            {
              messageId: 'suggestSatisfies',
              output: "(('a' + 'b') satisfies string).length;",
            },
          ],
        },
      ],
    },
    {
      code: '2 * +(2 + 2);',
      errors: [
        {
          column: 5,
          endColumn: 6,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '2 * (2 + 2);',
            },
            {
              messageId: 'suggestSatisfies',
              output: '2 * ((2 + 2) satisfies number);',
            },
          ],
        },
      ],
    },
    {
      code: '2 * Number(2 + 2);',
      errors: [
        {
          column: 5,
          endColumn: 11,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '2 * (2 + 2);',
            },
            {
              messageId: 'suggestSatisfies',
              output: '2 * ((2 + 2) satisfies number);',
            },
          ],
        },
      ],
    },
    {
      code: '2 * ~~(2 + 2);',
      errors: [
        {
          column: 5,
          endColumn: 7,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '2 * (2 + 2);',
            },
            {
              messageId: 'suggestSatisfies',
              output: '2 * ((2 + 2) satisfies number);',
            },
          ],
        },
      ],
    },
    {
      code: 'false && !!(false || true);',
      errors: [
        {
          column: 10,
          endColumn: 12,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: 'false && (false || true);',
            },
            {
              messageId: 'suggestSatisfies',
              output: 'false && ((false || true) satisfies boolean);',
            },
          ],
        },
      ],
    },
    {
      code: 'false && Boolean(false || true);',
      errors: [
        {
          column: 10,
          endColumn: 17,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: 'false && (false || true);',
            },
            {
              messageId: 'suggestSatisfies',
              output: 'false && ((false || true) satisfies boolean);',
            },
          ],
        },
      ],
    },
    {
      code: '2n * BigInt(2n + 2n);',
      errors: [
        {
          column: 6,
          endColumn: 12,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '2n * (2n + 2n);',
            },
            {
              messageId: 'suggestSatisfies',
              output: '2n * ((2n + 2n) satisfies bigint);',
            },
          ],
        },
      ],
    },

    // make sure suggestions add parentheses in cases where syntax would otherwise break
    {
      code: `
        let str = 'asdf';
        String(str).length;
      `,
      errors: [
        {
          column: 9,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: `
        let str = 'asdf';
        str.length;
      `,
            },
            {
              messageId: 'suggestSatisfies',
              output: `
        let str = 'asdf';
        (str satisfies string).length;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        let str = 'asdf';
        str.toString().length;
      `,
      errors: [
        {
          column: 13,
          endColumn: 23,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: `
        let str = 'asdf';
        str.length;
      `,
            },
            {
              messageId: 'suggestSatisfies',
              output: `
        let str = 'asdf';
        (str satisfies string).length;
      `,
            },
          ],
        },
      ],
    },
  ],

  valid: [
    // standard type conversions are valid
    'String(1);',
    '(1).toString();',
    '`${1}`;',
    "'' + 1;",
    "1 + '';",
    `
      let str = 1;
      str += '';
    `,
    "Number('2');",
    "+'2';",
    "~~'2';",
    'Boolean(0);',
    '!!0;',
    'BigInt(3);',

    // things that are not type conversion idioms (but look similar) are valid
    "new String('asdf');",
    'new Number(2);',
    'new Boolean(true);',
    '!false;',
    '~2;',
    `
      function String(value: unknown) {
        return value;
      }
      String('asdf');
      export {};
    `,
    `
      function Number(value: unknown) {
        return value;
      }
      Number(2);
      export {};
    `,
    `
      function Boolean(value: unknown) {
        return value;
      }
      Boolean(true);
      export {};
    `,
    `
      function BigInt(value: unknown) {
        return value;
      }
      BigInt(3n);
      export {};
    `,
    `
      function toString(value: unknown) {
        return value;
      }
      toString('asdf');
    `,
    `
      export {};
      declare const toString: string;
      toString.toUpperCase();
    `,

    // using type conversion idioms to unbox boxed primitives is valid
    'String(new String());',
    'new String().toString();',
    "'' + new String();",
    "new String() + '';",
    `
      let str = new String();
      str += '';
    `,
    'Number(new Number());',
    '+new Number();',
    '~~new Number();',
    'Boolean(new Boolean());',
    '!!new Boolean();',
  ],
});
