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
    "new String('asdf');",
    '!false;',
    '~256;',
    `
      function String(value) {
        return value;
      }
      String('asdf');
    `,
  ],

  invalid: [
    {
      code: "String('asdf');",
      errors: [
        {
          column: 1,
          endColumn: 7,
          messageId: 'unnecessaryTypeConversion',
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
          column: 9,
          endColumn: 18,
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
        str;
      `,
    },
    {
      code: 'Number(123);',
      errors: [
        {
          column: 1,
          endColumn: 7,
          messageId: 'unnecessaryTypeConversion',
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
        },
      ],
      output: 'true;',
    },
    {
      code: 'BigInt(BigInt(1));',
      errors: [
        {
          column: 1,
          endColumn: 7,
          messageId: 'unnecessaryTypeConversion',
        },
      ],
      output: 'BigInt(1);',
    },

    // make sure autofixes preserve parentheses in cases where logic would otherwise break
    {
      code: "String('a' + 'b').length;",
      errors: [
        {
          column: 1,
          endColumn: 7,
          messageId: 'unnecessaryTypeConversion',
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
        },
      ],
      output: '2n * (2n + 2n);',
    },
  ],
});
