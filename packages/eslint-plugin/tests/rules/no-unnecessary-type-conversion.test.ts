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
      function String(value) {
        return value;
      }
      String('asdf');
    `,
    `
      function Number(value) {
        return value;
      }
      Number(2);
    `,
    `
      function Boolean(value) {
        return value;
      }
      Boolean(true);
    `,
    `
      function BigInt(value) {
        return value;
      }
      BigInt(3n);
    `,
    `
      function toString(value) {
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
    'String(new String);',
    'new String.toString();',
    "'' + new String;",
    "new String + '';",
    `
      let str = new String;
      str += '';
    `,
    'Number(new Number);',
    '+new Number;',
    '~~new Number;',
    'Boolean(new Boolean);',
    '!!new Boolean;',
  ],

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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: "'asdf' satisfies string;",
            },
          ],
        },
      ],
      output: "'asdf';",
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: "'asdf' satisfies string;",
            },
          ],
        },
      ],
      output: "'asdf';",
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: "'asdf' satisfies string;",
            },
          ],
        },
      ],
      output: "'asdf';",
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: "'asdf' satisfies string;",
            },
          ],
        },
      ],
      output: "'asdf';",
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: `
let str = 'asdf';
str satisfies string;
      `,
            },
          ],
        },
      ],
      output: `
let str = 'asdf';

      `,
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: `
let str = 'asdf';
'asdf' + (str satisfies string);
      `,
            },
          ],
        },
      ],
      output: `
let str = 'asdf';
'asdf' + (str);
      `,
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: '123 satisfies number;',
            },
          ],
        },
      ],
      output: '123;',
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: '123 satisfies number;',
            },
          ],
        },
      ],
      output: '123;',
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: '123 satisfies number;',
            },
          ],
        },
      ],
      output: '123;',
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: 'true satisfies boolean;',
            },
          ],
        },
      ],
      output: 'true;',
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: 'true satisfies boolean;',
            },
          ],
        },
      ],
      output: 'true;',
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: '3n satisfies bigint;',
            },
          ],
        },
      ],
      output: '3n;',
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: `
        function f<T extends string>(x: T) {
          return x satisfies string;
        }
      `,
            },
          ],
        },
      ],
      output: `
        function f<T extends string>(x: T) {
          return x;
        }
      `,
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: `
        function f<T extends number>(x: T) {
          return x satisfies number;
        }
      `,
            },
          ],
        },
      ],
      output: `
        function f<T extends number>(x: T) {
          return x;
        }
      `,
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: `
        function f<T extends boolean>(x: T) {
          return x satisfies boolean;
        }
      `,
            },
          ],
        },
      ],
      output: `
        function f<T extends boolean>(x: T) {
          return x;
        }
      `,
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: `
        function f<T extends bigint>(x: T) {
          return x satisfies bigint;
        }
      `,
            },
          ],
        },
      ],
      output: `
        function f<T extends bigint>(x: T) {
          return x;
        }
      `,
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: "(('a' + 'b') satisfies string).length;",
            },
          ],
        },
      ],
      output: "('a' + 'b').length;",
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: "(('a' + 'b') satisfies string).length;",
            },
          ],
        },
      ],
      output: "('a' + 'b').length;",
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: '2 * ((2 + 2) satisfies number);',
            },
          ],
        },
      ],
      output: '2 * (2 + 2);',
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: '2 * ((2 + 2) satisfies number);',
            },
          ],
        },
      ],
      output: '2 * (2 + 2);',
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: '2 * ((2 + 2) satisfies number);',
            },
          ],
        },
      ],
      output: '2 * (2 + 2);',
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: 'false && ((false || true) satisfies boolean);',
            },
          ],
        },
      ],
      output: 'false && (false || true);',
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: 'false && ((false || true) satisfies boolean);',
            },
          ],
        },
      ],
      output: 'false && (false || true);',
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: '2n * ((2n + 2n) satisfies bigint);',
            },
          ],
        },
      ],
      output: '2n * (2n + 2n);',
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: `
        let str = 'asdf';
        (str satisfies string).length;
      `,
            },
          ],
        },
      ],
      output: `
        let str = 'asdf';
        str.length;
      `,
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
              messageId: 'unnecessaryTypeConversionSuggestion',
              output: `
        let str = 'asdf';
        (str satisfies string).length;
      `,
            },
          ],
        },
      ],
      output: `
        let str = 'asdf';
        str.length;
      `,
    },
  ],
});
