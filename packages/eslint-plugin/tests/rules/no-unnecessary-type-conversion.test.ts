import rule from '../../src/rules/no-unnecessary-type-conversion';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-unnecessary-type-conversion', rule, {
  assertionOptions: {
    requireData: true,
  },
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
    '~~1.1;',
    '~~-1.1;',
    '~~(1.5 + 2.3);',
    '~~(1 / 3);',
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
function String(value: unknown) {
  return value;
}
function foo(value: string) {
  return String(value);
}
export {};
    `,
    `
function Number(value: unknown) {
  return value;
}
function foo(value: number) {
  return Number(value);
}
export {};
    `,
    `
function Boolean(value: unknown) {
  return value;
}
function foo(value: boolean) {
  return Boolean(value);
}
export {};
    `,
    `
function BigInt(value: unknown) {
  return value;
}
function foo(value: bigint) {
  return BigInt(value);
}
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
    `
enum CustomIds {
  Id1 = 'id1',
  Id2 = 'id2',
}
const customId = 'id1';
const compareWithToString = customId === CustomIds.Id1.toString();
    `,
  ],

  invalid: [
    {
      code: "String('asdf');",
      errors: [
        {
          column: 1,
          data: { type: 'string', violation: 'Passing a string to String()' },
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: "'asdf';",
            },
            {
              data: { type: 'string' },
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
          data: {
            type: 'string',
            violation: "Calling a string's .toString() method",
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: "'asdf';",
            },
            {
              data: { type: 'string' },
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
          data: { type: 'string', violation: "Concatenating '' with a string" },
          endColumn: 6,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: "'asdf';",
            },
            {
              data: { type: 'string' },
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
          data: { type: 'string', violation: "Concatenating a string with ''" },
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: "'asdf';",
            },
            {
              data: { type: 'string' },
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
          data: { type: 'string', violation: "Concatenating a string with ''" },
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
              data: { type: 'string' },
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
          data: { type: 'string', violation: "Concatenating a string with ''" },
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
              data: { type: 'string' },
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
          data: { type: 'number', violation: 'Passing a number to Number()' },
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '123;',
            },
            {
              data: { type: 'number' },
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
          data: {
            type: 'number',
            violation: 'Using the unary + operator on a number',
          },
          endColumn: 2,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '123;',
            },
            {
              data: { type: 'number' },
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
          data: { type: 'number', violation: 'Using ~~ on an integer' },
          endColumn: 3,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '123;',
            },
            {
              data: { type: 'number' },
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
          data: {
            type: 'boolean',
            violation: 'Passing a boolean to Boolean()',
          },
          endColumn: 8,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: 'true;',
            },
            {
              data: { type: 'boolean' },
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
          data: { type: 'boolean', violation: 'Using !! on a boolean' },
          endColumn: 3,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: 'true;',
            },
            {
              data: { type: 'boolean' },
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
          data: { type: 'bigint', violation: 'Passing a bigint to BigInt()' },
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '3n;',
            },
            {
              data: { type: 'bigint' },
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
          column: 10,
          data: { type: 'string', violation: 'Passing a string to String()' },
          endColumn: 16,
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
              data: { type: 'string' },
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
          column: 10,
          data: { type: 'number', violation: 'Passing a number to Number()' },
          endColumn: 16,
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
              data: { type: 'number' },
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
          column: 10,
          data: {
            type: 'boolean',
            violation: 'Passing a boolean to Boolean()',
          },
          endColumn: 17,
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
              data: { type: 'boolean' },
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
          column: 10,
          data: { type: 'bigint', violation: 'Passing a bigint to BigInt()' },
          endColumn: 16,
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
              data: { type: 'bigint' },
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
          data: { type: 'string', violation: 'Passing a string to String()' },
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: "('a' + 'b').length;",
            },
            {
              data: { type: 'string' },
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
          data: {
            type: 'string',
            violation: "Calling a string's .toString() method",
          },
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: "('a' + 'b').length;",
            },
            {
              data: { type: 'string' },
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
          data: {
            type: 'number',
            violation: 'Using the unary + operator on a number',
          },
          endColumn: 6,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '2 * (2 + 2);',
            },
            {
              data: { type: 'number' },
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
          data: { type: 'number', violation: 'Passing a number to Number()' },
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '2 * (2 + 2);',
            },
            {
              data: { type: 'number' },
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
          data: { type: 'boolean', violation: 'Using !! on a boolean' },
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: 'false && (false || true);',
            },
            {
              data: { type: 'boolean' },
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
          data: {
            type: 'boolean',
            violation: 'Passing a boolean to Boolean()',
          },
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: 'false && (false || true);',
            },
            {
              data: { type: 'boolean' },
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
          data: { type: 'bigint', violation: 'Passing a bigint to BigInt()' },
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '2n * (2n + 2n);',
            },
            {
              data: { type: 'bigint' },
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
          column: 1,
          data: { type: 'string', violation: 'Passing a string to String()' },
          endColumn: 7,
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
              data: { type: 'string' },
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
          column: 5,
          data: {
            type: 'string',
            violation: "Calling a string's .toString() method",
          },
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
              data: { type: 'string' },
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
      code: '~~1;',
      errors: [
        {
          column: 1,
          data: { type: 'number', violation: 'Using ~~ on an integer' },
          endColumn: 3,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '1;',
            },
            {
              data: { type: 'number' },
              messageId: 'suggestSatisfies',
              output: '1 satisfies number;',
            },
          ],
        },
      ],
    },
    {
      code: '~~-1;',
      errors: [
        {
          column: 1,
          data: { type: 'number', violation: 'Using ~~ on an integer' },
          endColumn: 3,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: '(-1);',
            },
            {
              data: { type: 'number' },
              messageId: 'suggestSatisfies',
              output: '(-1) satisfies number;',
            },
          ],
        },
      ],
    },
    {
      code: `
declare const threeOrFour: 3 | 4;
~~threeOrFour;
      `,
      errors: [
        {
          column: 1,
          data: { type: 'number', violation: 'Using ~~ on an integer' },
          endColumn: 3,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryTypeConversion',
          suggestions: [
            {
              messageId: 'suggestRemove',
              output: `
declare const threeOrFour: 3 | 4;
threeOrFour;
      `,
            },
            {
              data: { type: 'number' },
              messageId: 'suggestSatisfies',
              output: `
declare const threeOrFour: 3 | 4;
threeOrFour satisfies number;
      `,
            },
          ],
        },
      ],
    },
  ],
});
