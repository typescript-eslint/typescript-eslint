/* eslint-disable @typescript-eslint/no-deprecated -- TODO - migrate this test away from `batchedSingleLineTests` */

import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';

import type {
  MessageId,
  Options,
} from '../../src/rules/strict-boolean-expressions';

import rule from '../../src/rules/strict-boolean-expressions';
import { batchedSingleLineTests, getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();
const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

ruleTester.run('strict-boolean-expressions', rule, {
  invalid: [
    // non-boolean in RHS of test expression
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        if (true && (1 + 1)) {}
        while (false || "a" + "b") {}
        (x: object) => true || false || x ? true : false;
      `,
      errors: [
        {
          column: 14,
          data: {
            context: 'conditional',
          },
          line: 2,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: 'if (true && ((1 + 1) !== 0)) {}',
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: 'if (true && (!Number.isNaN((1 + 1)))) {}',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: 'if (true && (Boolean((1 + 1)))) {}',
            },
          ],
        },
        {
          column: 25,
          line: 3,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: '        while (false || (("a" + "b").length > 0)) {}',
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: '        while (false || (("a" + "b") !== "")) {}',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: '        while (false || (Boolean(("a" + "b")))) {}',
            },
          ],
        },
        {
          column: 41,
          data: {
            context: 'conditional',
          },
          line: 4,
          messageId: 'conditionErrorObject',
        },
      ],
      options: [
        { allowNullableObject: false, allowNumber: false, allowString: false },
      ],
    }),

    // check if all and only the outermost operands are checked
    {
      code: noFormat`if (('' && {}) || (0 && void 0)) { }`,
      errors: [
        {
          column: 6,
          line: 1,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: `if (((''.length > 0) && {}) || (0 && void 0)) { }`,
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `if ((('' !== "") && {}) || (0 && void 0)) { }`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `if (((Boolean('')) && {}) || (0 && void 0)) { }`,
            },
          ],
        },
        {
          column: 12,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorObject',
        },
        {
          column: 20,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: `if (('' && {}) || ((0 !== 0) && void 0)) { }`,
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: `if (('' && {}) || ((!Number.isNaN(0)) && void 0)) { }`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `if (('' && {}) || ((Boolean(0)) && void 0)) { }`,
            },
          ],
        },
        { column: 25, line: 1, messageId: 'conditionErrorNullish' },
      ],
      options: [
        { allowNullableObject: false, allowNumber: false, allowString: false },
      ],
      output: null,
    },
    {
      code: `
        declare const array: string[];
        array.some(x => x);
      `,
      errors: [
        {
          data: {
            context: 'array predicate return type',
          },
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: `
        declare const array: string[];
        array.some(x => x.length > 0);
      `,
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `
        declare const array: string[];
        array.some(x => x !== "");
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
        declare const array: string[];
        array.some(x => Boolean(x));
      `,
            },
            {
              messageId: 'explicitBooleanReturnType',
              output: `
        declare const array: string[];
        array.some((x): boolean => x);
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableBoolean: true, allowString: false }],
    },
    {
      code: noFormat`
declare const foo: true & { __BRAND: 'Foo' };
if (('' && foo) || (0 && void 0)) { }
      `,
      errors: [
        {
          column: 6,
          data: {
            context: 'conditional',
          },
          line: 3,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: `
declare const foo: true & { __BRAND: 'Foo' };
if (((''.length > 0) && foo) || (0 && void 0)) { }
      `,
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `
declare const foo: true & { __BRAND: 'Foo' };
if ((('' !== "") && foo) || (0 && void 0)) { }
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
declare const foo: true & { __BRAND: 'Foo' };
if (((Boolean('')) && foo) || (0 && void 0)) { }
      `,
            },
          ],
        },
        {
          column: 21,
          data: {
            context: 'conditional',
          },
          line: 3,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: `
declare const foo: true & { __BRAND: 'Foo' };
if (('' && foo) || ((0 !== 0) && void 0)) { }
      `,
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: `
declare const foo: true & { __BRAND: 'Foo' };
if (('' && foo) || ((!Number.isNaN(0)) && void 0)) { }
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
declare const foo: true & { __BRAND: 'Foo' };
if (('' && foo) || ((Boolean(0)) && void 0)) { }
      `,
            },
          ],
        },
        { column: 26, line: 3, messageId: 'conditionErrorNullish' },
      ],
      options: [
        { allowNullableObject: false, allowNumber: false, allowString: false },
      ],
      output: null,
    },
    {
      code: noFormat`
declare const foo: false & { __BRAND: 'Foo' };
if (('' && {}) || (foo && void 0)) { }
      `,
      errors: [
        {
          column: 6,
          data: {
            context: 'conditional',
          },
          line: 3,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: `
declare const foo: false & { __BRAND: 'Foo' };
if (((''.length > 0) && {}) || (foo && void 0)) { }
      `,
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `
declare const foo: false & { __BRAND: 'Foo' };
if ((('' !== "") && {}) || (foo && void 0)) { }
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
declare const foo: false & { __BRAND: 'Foo' };
if (((Boolean('')) && {}) || (foo && void 0)) { }
      `,
            },
          ],
        },
        {
          column: 12,
          data: {
            context: 'conditional',
          },
          line: 3,
          messageId: 'conditionErrorObject',
        },
        {
          column: 27,
          data: {
            context: 'conditional',
          },
          line: 3,
          messageId: 'conditionErrorNullish',
        },
      ],
      options: [
        { allowNullableObject: false, allowNumber: false, allowString: false },
      ],
      output: null,
    },

    // shouldn't check last logical operand when used for control flow
    {
      code: "'asd' && 123 && [] && null;",
      errors: [
        {
          column: 1,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: "('asd'.length > 0) && 123 && [] && null;",
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: '(\'asd\' !== "") && 123 && [] && null;',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "(Boolean('asd')) && 123 && [] && null;",
            },
          ],
        },
        {
          column: 10,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: "'asd' && (123 !== 0) && [] && null;",
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: "'asd' && (!Number.isNaN(123)) && [] && null;",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "'asd' && (Boolean(123)) && [] && null;",
            },
          ],
        },
        {
          column: 17,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorObject',
        },
      ],
      options: [{ allowNumber: false, allowString: false }],
      output: null,
    },
    {
      code: "'asd' || 123 || [] || null;",
      errors: [
        {
          column: 1,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: "('asd'.length > 0) || 123 || [] || null;",
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: '(\'asd\' !== "") || 123 || [] || null;',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "(Boolean('asd')) || 123 || [] || null;",
            },
          ],
        },
        {
          column: 10,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: "'asd' || (123 !== 0) || [] || null;",
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: "'asd' || (!Number.isNaN(123)) || [] || null;",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "'asd' || (Boolean(123)) || [] || null;",
            },
          ],
        },
        {
          column: 17,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorObject',
        },
      ],
      options: [{ allowNumber: false, allowString: false }],
      output: null,
    },
    {
      code: "let x = (1 && 'a' && null) || 0 || '' || {};",
      errors: [
        {
          column: 10,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: "let x = ((1 !== 0) && 'a' && null) || 0 || '' || {};",
            },
            {
              messageId: 'conditionFixCompareNaN',
              output:
                "let x = ((!Number.isNaN(1)) && 'a' && null) || 0 || '' || {};",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "let x = ((Boolean(1)) && 'a' && null) || 0 || '' || {};",
            },
          ],
        },
        {
          column: 15,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output:
                "let x = (1 && ('a'.length > 0) && null) || 0 || '' || {};",
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: "let x = (1 && ('a' !== \"\") && null) || 0 || '' || {};",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "let x = (1 && (Boolean('a')) && null) || 0 || '' || {};",
            },
          ],
        },
        {
          column: 22,
          line: 1,
          messageId: 'conditionErrorNullish',
        },
        {
          column: 31,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: "let x = (1 && 'a' && null) || (0 !== 0) || '' || {};",
            },
            {
              messageId: 'conditionFixCompareNaN',
              output:
                "let x = (1 && 'a' && null) || (!Number.isNaN(0)) || '' || {};",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "let x = (1 && 'a' && null) || (Boolean(0)) || '' || {};",
            },
          ],
        },
        {
          column: 36,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output:
                "let x = (1 && 'a' && null) || 0 || (''.length > 0) || {};",
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: "let x = (1 && 'a' && null) || 0 || ('' !== \"\") || {};",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "let x = (1 && 'a' && null) || 0 || (Boolean('')) || {};",
            },
          ],
        },
      ],
      options: [{ allowNumber: false, allowString: false }],
      output: null,
    },
    {
      code: "return (1 || 'a' || null) && 0 && '' && {};",
      errors: [
        {
          column: 9,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: "return ((1 !== 0) || 'a' || null) && 0 && '' && {};",
            },
            {
              messageId: 'conditionFixCompareNaN',
              output:
                "return ((!Number.isNaN(1)) || 'a' || null) && 0 && '' && {};",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "return ((Boolean(1)) || 'a' || null) && 0 && '' && {};",
            },
          ],
        },
        {
          column: 14,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output:
                "return (1 || ('a'.length > 0) || null) && 0 && '' && {};",
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: "return (1 || ('a' !== \"\") || null) && 0 && '' && {};",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "return (1 || (Boolean('a')) || null) && 0 && '' && {};",
            },
          ],
        },
        {
          column: 21,
          line: 1,
          messageId: 'conditionErrorNullish',
        },
        {
          column: 30,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: "return (1 || 'a' || null) && (0 !== 0) && '' && {};",
            },
            {
              messageId: 'conditionFixCompareNaN',
              output:
                "return (1 || 'a' || null) && (!Number.isNaN(0)) && '' && {};",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "return (1 || 'a' || null) && (Boolean(0)) && '' && {};",
            },
          ],
        },
        {
          column: 35,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output:
                "return (1 || 'a' || null) && 0 && (''.length > 0) && {};",
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: "return (1 || 'a' || null) && 0 && ('' !== \"\") && {};",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "return (1 || 'a' || null) && 0 && (Boolean('')) && {};",
            },
          ],
        },
      ],
      options: [{ allowNumber: false, allowString: false }],
      output: null,
    },
    {
      code: "console.log((1 && []) || ('a' && {}));",
      errors: [
        {
          column: 14,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: "console.log(((1 !== 0) && []) || ('a' && {}));",
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: "console.log(((!Number.isNaN(1)) && []) || ('a' && {}));",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "console.log(((Boolean(1)) && []) || ('a' && {}));",
            },
          ],
        },
        {
          column: 19,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorObject',
        },
        {
          column: 27,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: "console.log((1 && []) || (('a'.length > 0) && {}));",
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: 'console.log((1 && []) || ((\'a\' !== "") && {}));',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "console.log((1 && []) || ((Boolean('a')) && {}));",
            },
          ],
        },
      ],
      options: [{ allowNumber: false, allowString: false }],
      output: null,
    },

    // should check all logical operands when used in a condition
    {
      code: "if ((1 && []) || ('a' && {})) void 0;",
      errors: [
        {
          column: 6,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: "if (((1 !== 0) && []) || ('a' && {})) void 0;",
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: "if (((!Number.isNaN(1)) && []) || ('a' && {})) void 0;",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "if (((Boolean(1)) && []) || ('a' && {})) void 0;",
            },
          ],
        },
        {
          column: 11,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorObject',
        },
        {
          column: 19,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: "if ((1 && []) || (('a'.length > 0) && {})) void 0;",
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: 'if ((1 && []) || ((\'a\' !== "") && {})) void 0;',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "if ((1 && []) || ((Boolean('a')) && {})) void 0;",
            },
          ],
        },
        {
          column: 26,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorObject',
        },
      ],
      options: [{ allowNumber: false, allowString: false }],
      output: null,
    },
    {
      code: "let x = null || 0 || 'a' || [] ? {} : undefined;",
      errors: [
        {
          column: 9,
          line: 1,
          messageId: 'conditionErrorNullish',
        },
        {
          column: 17,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output:
                "let x = null || (0 !== 0) || 'a' || [] ? {} : undefined;",
            },
            {
              messageId: 'conditionFixCompareNaN',
              output:
                "let x = null || (!Number.isNaN(0)) || 'a' || [] ? {} : undefined;",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output:
                "let x = null || (Boolean(0)) || 'a' || [] ? {} : undefined;",
            },
          ],
        },
        {
          column: 22,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output:
                "let x = null || 0 || ('a'.length > 0) || [] ? {} : undefined;",
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output:
                'let x = null || 0 || (\'a\' !== "") || [] ? {} : undefined;',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output:
                "let x = null || 0 || (Boolean('a')) || [] ? {} : undefined;",
            },
          ],
        },
        {
          column: 29,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorObject',
        },
      ],
      options: [{ allowNumber: false, allowString: false }],
      output: null,
    },
    {
      code: "return !(null || 0 || 'a' || []);",
      errors: [
        {
          column: 10,
          line: 1,
          messageId: 'conditionErrorNullish',
        },
        {
          column: 18,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: "return !(null || (0 !== 0) || 'a' || []);",
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: "return !(null || (!Number.isNaN(0)) || 'a' || []);",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "return !(null || (Boolean(0)) || 'a' || []);",
            },
          ],
        },
        {
          column: 23,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: "return !(null || 0 || ('a'.length > 0) || []);",
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: 'return !(null || 0 || (\'a\' !== "") || []);',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: "return !(null || 0 || (Boolean('a')) || []);",
            },
          ],
        },
        {
          column: 30,
          data: {
            context: 'conditional',
          },
          line: 1,
          messageId: 'conditionErrorObject',
        },
      ],
      options: [{ allowNumber: false, allowString: false }],
      output: null,
    },

    // nullish in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        null || {};
        undefined && [];
        declare const x: null; if (x) {}
        (x: undefined) => !x;
        <T extends null | undefined>(x: T) => x ? 1 : 0;
        <T extends null>(x: T) => x ? 1 : 0;
        <T extends undefined>(x: T) => x ? 1 : 0;
      `,
      errors: [
        { column: 1, line: 2, messageId: 'conditionErrorNullish' },
        { column: 9, line: 3, messageId: 'conditionErrorNullish' },
        { column: 36, line: 4, messageId: 'conditionErrorNullish' },
        { column: 28, line: 5, messageId: 'conditionErrorNullish' },
        { column: 47, line: 6, messageId: 'conditionErrorNullish' },
        { column: 35, line: 7, messageId: 'conditionErrorNullish' },
        { column: 40, line: 8, messageId: 'conditionErrorNullish' },
      ],
    }),

    // object in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        [] || 1;
        ({}) && "a";
        declare const x: symbol; if (x) {}
        (x: () => void) => !x;
        <T extends object>(x: T) => x ? 1 : 0;
        <T extends Object | Function>(x: T) => x ? 1 : 0;
        <T extends { a: number }>(x: T) => x ? 1 : 0;
        <T extends () => void>(x: T) => x ? 1 : 0;
      `,
      errors: [
        {
          column: 1,
          data: {
            context: 'conditional',
          },
          line: 2,
          messageId: 'conditionErrorObject',
        },
        {
          column: 10,
          data: {
            context: 'conditional',
          },
          line: 3,
          messageId: 'conditionErrorObject',
        },
        {
          column: 38,
          data: {
            context: 'conditional',
          },
          line: 4,
          messageId: 'conditionErrorObject',
        },
        {
          column: 29,
          data: {
            context: 'conditional',
          },
          line: 5,
          messageId: 'conditionErrorObject',
        },
        {
          column: 37,
          data: {
            context: 'conditional',
          },
          line: 6,
          messageId: 'conditionErrorObject',
        },
        {
          column: 48,
          data: {
            context: 'conditional',
          },
          line: 7,
          messageId: 'conditionErrorObject',
        },
        {
          column: 44,
          data: {
            context: 'conditional',
          },
          line: 8,
          messageId: 'conditionErrorObject',
        },
        {
          column: 41,
          data: {
            context: 'conditional',
          },
          line: 9,
          messageId: 'conditionErrorObject',
        },
      ],
    }),

    // string in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        while ("") {}
        for (; "foo";) {}
        declare const x: string; if (x) {}
        (x: string) => (!x);
        <T extends string>(x: T) => x ? 1 : 0;
      `,
      errors: [
        {
          column: 8,
          data: {
            context: 'conditional',
          },
          line: 2,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: `while ("".length > 0) {}`,
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `while ("" !== "") {}`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `while (Boolean("")) {}`,
            },
          ],
        },
        {
          column: 16,
          data: {
            context: 'conditional',
          },
          line: 3,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: `        for (; "foo".length > 0;) {}`,
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `        for (; "foo" !== "";) {}`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        for (; Boolean("foo");) {}`,
            },
          ],
        },
        {
          column: 38,
          data: {
            context: 'conditional',
          },
          line: 4,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: `        declare const x: string; if (x.length > 0) {}`,
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `        declare const x: string; if (x !== "") {}`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        declare const x: string; if (Boolean(x)) {}`,
            },
          ],
        },
        {
          column: 26,
          data: {
            context: 'conditional',
          },
          line: 5,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: `        (x: string) => (x.length === 0);`,
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `        (x: string) => (x === "");`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        (x: string) => (!Boolean(x));`,
            },
          ],
        },
        {
          column: 37,
          data: {
            context: 'conditional',
          },
          line: 6,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: `        <T extends string>(x: T) => (x.length > 0) ? 1 : 0;`,
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `        <T extends string>(x: T) => (x !== "") ? 1 : 0;`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        <T extends string>(x: T) => (Boolean(x)) ? 1 : 0;`,
            },
          ],
        },
      ],
      options: [{ allowString: false }],
    }),

    // number in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        while (0n) {}
        for (; 123;) {}
        declare const x: number; if (x) {}
        (x: bigint) => !x;
        <T extends number>(x: T) => (x) ? 1 : 0;
        ![]["length"]; // doesn't count as array.length when computed
        declare const a: any[] & { notLength: number }; if (a.notLength) {}
      `,
      errors: [
        {
          column: 8,
          data: {
            context: 'conditional',
          },
          line: 2,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              // TODO: fix compare zero suggestion for bigint
              output: `while (0n !== 0) {}`,
            },
            {
              // TODO: remove check NaN suggestion for bigint
              messageId: 'conditionFixCompareNaN',
              output: `while (!Number.isNaN(0n)) {}`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `while (Boolean(0n)) {}`,
            },
          ],
        },
        {
          column: 16,
          data: {
            context: 'conditional',
          },
          line: 3,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: `        for (; 123 !== 0;) {}`,
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: `        for (; !Number.isNaN(123);) {}`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        for (; Boolean(123);) {}`,
            },
          ],
        },
        {
          column: 38,
          data: {
            context: 'conditional',
          },
          line: 4,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: `        declare const x: number; if (x !== 0) {}`,
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: `        declare const x: number; if (!Number.isNaN(x)) {}`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        declare const x: number; if (Boolean(x)) {}`,
            },
          ],
        },
        {
          column: 25,
          data: {
            context: 'conditional',
          },
          line: 5,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              // TODO: fix compare zero suggestion for bigint
              output: `        (x: bigint) => x === 0;`,
            },
            {
              // TODO: remove check NaN suggestion for bigint
              messageId: 'conditionFixCompareNaN',
              output: `        (x: bigint) => Number.isNaN(x);`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        (x: bigint) => !Boolean(x);`,
            },
          ],
        },
        {
          column: 38,
          data: {
            context: 'conditional',
          },
          line: 6,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: `        <T extends number>(x: T) => (x !== 0) ? 1 : 0;`,
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: `        <T extends number>(x: T) => (!Number.isNaN(x)) ? 1 : 0;`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        <T extends number>(x: T) => (Boolean(x)) ? 1 : 0;`,
            },
          ],
        },
        {
          column: 10,
          data: {
            context: 'conditional',
          },
          line: 7,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: `        []["length"] === 0; // doesn't count as array.length when computed`,
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: `        Number.isNaN([]["length"]); // doesn't count as array.length when computed`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        !Boolean([]["length"]); // doesn't count as array.length when computed`,
            },
          ],
        },
        {
          column: 61,
          data: {
            context: 'conditional',
          },
          line: 8,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: `        declare const a: any[] & { notLength: number }; if (a.notLength !== 0) {}`,
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: `        declare const a: any[] & { notLength: number }; if (!Number.isNaN(a.notLength)) {}`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        declare const a: any[] & { notLength: number }; if (Boolean(a.notLength)) {}`,
            },
          ],
        },
      ],
      options: [{ allowNumber: false }],
    }),

    // number (array.length) in boolean context

    {
      code: `
if (![].length) {
}
      `,
      errors: [
        {
          column: 6,
          data: {
            context: 'conditional',
          },
          line: 2,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareArrayLengthZero',
              output: `
if ([].length === 0) {
}
      `,
            },
          ],
        },
      ],
      options: [{ allowNumber: false }],
    },
    {
      code: `
(a: number[]) => a.length && '...';
      `,
      errors: [
        {
          column: 18,
          data: {
            context: 'conditional',
          },
          line: 2,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareArrayLengthNonzero',
              // not technically the same; changes from returning (nonzero) number to returning true
              output: `
(a: number[]) => (a.length > 0) && '...';
      `,
            },
          ],
        },
      ],
      options: [{ allowNumber: false }],
    },
    {
      code: `
<T extends unknown[]>(...a: T) => a.length || 'empty';
      `,
      errors: [
        {
          column: 35,
          data: {
            context: 'conditional',
          },
          line: 2,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareArrayLengthNonzero',
              // not technically the same; changes from returning (nonzero) number to returning true
              output: `
<T extends unknown[]>(...a: T) => (a.length > 0) || 'empty';
      `,
            },
          ],
        },
      ],
      options: [{ allowNumber: false }],
    },

    // mixed `string | number` value in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        declare const x: string | number; if (x) {}
        (x: bigint | string) => !x;
        <T extends number | bigint | string>(x: T) => x ? 1 : 0;
      `,
      errors: [
        { column: 39, line: 2, messageId: 'conditionErrorOther' },
        { column: 34, line: 3, messageId: 'conditionErrorOther' },
        { column: 55, line: 4, messageId: 'conditionErrorOther' },
      ],
      options: [{ allowNumber: true, allowString: true }],
    }),

    // nullable boolean in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        declare const x: boolean | null; if (x) {}
        (x?: boolean) => !x;
        <T extends boolean | null | undefined>(x: T) => x ? 1 : 0;
      `,
      errors: [
        {
          column: 38,
          data: {
            context: 'conditional',
          },
          line: 2,
          messageId: 'conditionErrorNullableBoolean',
          suggestions: [
            {
              messageId: 'conditionFixDefaultFalse',
              output: `declare const x: boolean | null; if (x ?? false) {}`,
            },
            {
              messageId: 'conditionFixCompareTrue',
              output: `declare const x: boolean | null; if (x === true) {}`,
            },
          ],
        },
        {
          column: 27,
          data: {
            context: 'conditional',
          },
          line: 3,
          messageId: 'conditionErrorNullableBoolean',
          suggestions: [
            {
              messageId: 'conditionFixDefaultFalse',
              output: `        (x?: boolean) => !(x ?? false);`,
            },
            {
              messageId: 'conditionFixCompareFalse',
              output: `        (x?: boolean) => x === false;`,
            },
          ],
        },
        {
          column: 57,
          data: {
            context: 'conditional',
          },
          line: 4,
          messageId: 'conditionErrorNullableBoolean',
          suggestions: [
            {
              messageId: 'conditionFixDefaultFalse',
              output: `        <T extends boolean | null | undefined>(x: T) => (x ?? false) ? 1 : 0;`,
            },
            {
              messageId: 'conditionFixCompareTrue',
              output: `        <T extends boolean | null | undefined>(x: T) => (x === true) ? 1 : 0;`,
            },
          ],
        },
      ],
      options: [{ allowNullableBoolean: false }],
    }),

    // nullable object in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        declare const x: object | null; if (x) {}
        (x?: { a: number }) => !x;
        <T extends {} | null | undefined>(x: T) => x ? 1 : 0;
      `,
      errors: [
        {
          column: 37,
          line: 2,
          messageId: 'conditionErrorNullableObject',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: 'declare const x: object | null; if (x != null) {}',
            },
          ],
        },
        {
          column: 33,
          line: 3,
          messageId: 'conditionErrorNullableObject',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `        (x?: { a: number }) => x == null;`,
            },
          ],
        },
        {
          column: 52,
          line: 4,
          messageId: 'conditionErrorNullableObject',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `        <T extends {} | null | undefined>(x: T) => (x != null) ? 1 : 0;`,
            },
          ],
        },
      ],
      options: [{ allowNullableObject: false }],
    }),

    // nullable string in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        declare const x: string | null; if (x) {}
        (x?: string) => !x;
        <T extends string | null | undefined>(x: T) => x ? 1 : 0;
        function foo(x: '' | 'bar' | null) { if (!x) {} }
      `,
      errors: [
        {
          column: 37,
          data: {
            context: 'conditional',
          },
          line: 2,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: 'declare const x: string | null; if (x != null) {}',
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output: 'declare const x: string | null; if (x ?? "") {}',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: 'declare const x: string | null; if (Boolean(x)) {}',
            },
          ],
        },
        {
          column: 26,
          data: {
            context: 'conditional',
          },
          line: 3,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: '        (x?: string) => x == null;',
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output: '        (x?: string) => !(x ?? "");',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: '        (x?: string) => !Boolean(x);',
            },
          ],
        },
        {
          column: 56,
          data: {
            context: 'conditional',
          },
          line: 4,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output:
                '        <T extends string | null | undefined>(x: T) => (x != null) ? 1 : 0;',
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output:
                '        <T extends string | null | undefined>(x: T) => (x ?? "") ? 1 : 0;',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output:
                '        <T extends string | null | undefined>(x: T) => (Boolean(x)) ? 1 : 0;',
            },
          ],
        },
        {
          column: 51,
          data: {
            context: 'conditional',
          },
          line: 5,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output:
                "        function foo(x: '' | 'bar' | null) { if (x == null) {} }",
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output:
                "        function foo(x: '' | 'bar' | null) { if (!(x ?? \"\")) {} }",
            },
            {
              messageId: 'conditionFixCastBoolean',
              output:
                "        function foo(x: '' | 'bar' | null) { if (!Boolean(x)) {} }",
            },
          ],
        },
      ],
    }),

    // nullable number in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        declare const x: number | null; if (x) {}
        (x?: number) => !x;
        <T extends number | null | undefined>(x: T) => x ? 1 : 0;
        function foo(x: 0 | 1 | null) { if (!x) {} }
      `,
      errors: [
        {
          column: 37,
          data: {
            context: 'conditional',
          },
          line: 2,
          messageId: 'conditionErrorNullableNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: 'declare const x: number | null; if (x != null) {}',
            },
            {
              messageId: 'conditionFixDefaultZero',
              output: 'declare const x: number | null; if (x ?? 0) {}',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: 'declare const x: number | null; if (Boolean(x)) {}',
            },
          ],
        },
        {
          column: 26,
          data: {
            context: 'conditional',
          },
          line: 3,
          messageId: 'conditionErrorNullableNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: '        (x?: number) => x == null;',
            },
            {
              messageId: 'conditionFixDefaultZero',
              output: '        (x?: number) => !(x ?? 0);',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: '        (x?: number) => !Boolean(x);',
            },
          ],
        },
        {
          column: 56,
          data: {
            context: 'conditional',
          },
          line: 4,
          messageId: 'conditionErrorNullableNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output:
                '        <T extends number | null | undefined>(x: T) => (x != null) ? 1 : 0;',
            },
            {
              messageId: 'conditionFixDefaultZero',
              output:
                '        <T extends number | null | undefined>(x: T) => (x ?? 0) ? 1 : 0;',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output:
                '        <T extends number | null | undefined>(x: T) => (Boolean(x)) ? 1 : 0;',
            },
          ],
        },
        {
          column: 46,
          data: {
            context: 'conditional',
          },
          line: 5,
          messageId: 'conditionErrorNullableNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output:
                '        function foo(x: 0 | 1 | null) { if (x == null) {} }',
            },
            {
              messageId: 'conditionFixDefaultZero',
              output:
                '        function foo(x: 0 | 1 | null) { if (!(x ?? 0)) {} }',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output:
                '        function foo(x: 0 | 1 | null) { if (!Boolean(x)) {} }',
            },
          ],
        },
      ],
    }),

    // nullable enum in boolean context
    {
      code: `
        enum ExampleEnum {
          This = 0,
          That = 1,
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (theEnum) {
        }
      `,
      errors: [
        {
          column: 13,
          data: {
            context: 'conditional',
          },
          endColumn: 20,
          endLine: 7,
          line: 7,
          messageId: 'conditionErrorNullableEnum',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        enum ExampleEnum {
          This = 0,
          That = 1,
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (theEnum != null) {
        }
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableEnum: false }],
    },
    {
      code: `
        enum ExampleEnum {
          This = 0,
          That = 1,
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (!theEnum) {
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            context: 'conditional',
          },
          endColumn: 21,
          endLine: 7,
          line: 7,
          messageId: 'conditionErrorNullableEnum',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        enum ExampleEnum {
          This = 0,
          That = 1,
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (theEnum == null) {
        }
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableEnum: false }],
    },
    {
      code: `
        enum ExampleEnum {
          This,
          That,
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (!theEnum) {
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            context: 'conditional',
          },
          endColumn: 21,
          endLine: 7,
          line: 7,
          messageId: 'conditionErrorNullableEnum',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        enum ExampleEnum {
          This,
          That,
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (theEnum == null) {
        }
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableEnum: false }],
    },
    {
      code: `
        enum ExampleEnum {
          This = '',
          That = 'a',
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (!theEnum) {
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            context: 'conditional',
          },
          endColumn: 21,
          endLine: 7,
          line: 7,
          messageId: 'conditionErrorNullableEnum',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        enum ExampleEnum {
          This = '',
          That = 'a',
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (theEnum == null) {
        }
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableEnum: false }],
    },
    {
      code: `
        enum ExampleEnum {
          This = '',
          That = 0,
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (!theEnum) {
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            context: 'conditional',
          },
          endColumn: 21,
          endLine: 7,
          line: 7,
          messageId: 'conditionErrorNullableEnum',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        enum ExampleEnum {
          This = '',
          That = 0,
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (theEnum == null) {
        }
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableEnum: false }],
    },
    {
      code: `
        enum ExampleEnum {
          This = 'one',
          That = 'two',
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (!theEnum) {
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            context: 'conditional',
          },
          endColumn: 21,
          endLine: 7,
          line: 7,
          messageId: 'conditionErrorNullableEnum',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        enum ExampleEnum {
          This = 'one',
          That = 'two',
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (theEnum == null) {
        }
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableEnum: false }],
    },
    {
      code: `
        enum ExampleEnum {
          This = 1,
          That = 2,
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (!theEnum) {
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            context: 'conditional',
          },
          endColumn: 21,
          endLine: 7,
          line: 7,
          messageId: 'conditionErrorNullableEnum',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        enum ExampleEnum {
          This = 1,
          That = 2,
        }
        const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
        if (theEnum == null) {
        }
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableEnum: false }],
    },

    // nullable mixed enum in boolean context
    {
      // falsy number and truthy string
      code: `
        enum ExampleEnum {
          This = 0,
          That = 'one',
        }
        (value?: ExampleEnum) => (value ? 1 : 0);
      `,
      errors: [
        {
          column: 35,
          data: {
            context: 'conditional',
          },
          endColumn: 40,
          endLine: 6,
          line: 6,
          messageId: 'conditionErrorNullableEnum',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        enum ExampleEnum {
          This = 0,
          That = 'one',
        }
        (value?: ExampleEnum) => ((value != null) ? 1 : 0);
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableEnum: false }],
    },
    {
      // falsy string and truthy number
      code: `
        enum ExampleEnum {
          This = '',
          That = 1,
        }
        (value?: ExampleEnum) => (!value ? 1 : 0);
      `,
      errors: [
        {
          column: 36,
          data: {
            context: 'conditional',
          },
          endColumn: 41,
          endLine: 6,
          line: 6,
          messageId: 'conditionErrorNullableEnum',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        enum ExampleEnum {
          This = '',
          That = 1,
        }
        (value?: ExampleEnum) => ((value == null) ? 1 : 0);
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableEnum: false }],
    },
    {
      // truthy string and truthy number
      code: `
        enum ExampleEnum {
          This = 'this',
          That = 1,
        }
        (value?: ExampleEnum) => (!value ? 1 : 0);
      `,
      errors: [
        {
          column: 36,
          data: {
            context: 'conditional',
          },
          endColumn: 41,
          endLine: 6,
          line: 6,
          messageId: 'conditionErrorNullableEnum',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        enum ExampleEnum {
          This = 'this',
          That = 1,
        }
        (value?: ExampleEnum) => ((value == null) ? 1 : 0);
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableEnum: false }],
    },
    {
      // falsy string and falsy number
      code: `
        enum ExampleEnum {
          This = '',
          That = 0,
        }
        (value?: ExampleEnum) => (!value ? 1 : 0);
      `,
      errors: [
        {
          column: 36,
          data: {
            context: 'conditional',
          },
          endColumn: 41,
          endLine: 6,
          line: 6,
          messageId: 'conditionErrorNullableEnum',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        enum ExampleEnum {
          This = '',
          That = 0,
        }
        (value?: ExampleEnum) => ((value == null) ? 1 : 0);
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableEnum: false }],
    },

    // any in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        if (x) {}
        x => !x;
        <T extends any>(x: T) => x ? 1 : 0;
        <T>(x: T) => x ? 1 : 0;
      `,
      errors: [
        {
          column: 5,
          data: {
            context: 'conditional',
          },
          line: 2,
          messageId: 'conditionErrorAny',
          suggestions: [
            {
              messageId: 'conditionFixCastBoolean',
              output: 'if (Boolean(x)) {}',
            },
          ],
        },
        {
          column: 15,
          data: {
            context: 'conditional',
          },
          line: 3,
          messageId: 'conditionErrorAny',
          suggestions: [
            {
              messageId: 'conditionFixCastBoolean',
              output: '        x => !(Boolean(x));',
            },
          ],
        },
        {
          column: 34,
          data: {
            context: 'conditional',
          },
          line: 4,
          messageId: 'conditionErrorAny',
          suggestions: [
            {
              messageId: 'conditionFixCastBoolean',
              output: '        <T extends any>(x: T) => (Boolean(x)) ? 1 : 0;',
            },
          ],
        },
        {
          column: 22,
          data: {
            context: 'conditional',
          },
          line: 5,
          messageId: 'conditionErrorAny',
          suggestions: [
            {
              messageId: 'conditionFixCastBoolean',
              output: '        <T>(x: T) => (Boolean(x)) ? 1 : 0;',
            },
          ],
        },
      ],
    }),

    // noStrictNullCheck
    {
      code: `
declare const x: string[] | null;
if (x) {
}
      `,
      errors: [
        {
          column: 1,
          line: 0,
          messageId: 'noStrictNullCheck',
        },
        {
          column: 5,
          data: {
            context: 'conditional',
          },
          line: 3,
          messageId: 'conditionErrorObject',
        },
      ],
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: path.join(rootPath, 'unstrict'),
        },
      },
      output: null,
    },

    // automatic semicolon insertion test
    {
      code: noFormat`
        declare const obj: { x: number } | null;
        !obj ? 1 : 0
        !obj
        obj || 0
        obj && 1 || 0
      `,
      errors: [
        {
          column: 10,
          line: 3,
          messageId: 'conditionErrorNullableObject',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        declare const obj: { x: number } | null;
        (obj == null) ? 1 : 0
        !obj
        obj || 0
        obj && 1 || 0
      `,
            },
          ],
        },
        {
          column: 10,
          line: 4,
          messageId: 'conditionErrorNullableObject',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        declare const obj: { x: number } | null;
        !obj ? 1 : 0
        obj == null
        obj || 0
        obj && 1 || 0
      `,
            },
          ],
        },
        {
          column: 9,
          line: 5,
          messageId: 'conditionErrorNullableObject',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        declare const obj: { x: number } | null;
        !obj ? 1 : 0
        !obj
        ;(obj != null) || 0
        obj && 1 || 0
      `,
            },
          ],
        },
        {
          column: 9,
          line: 6,
          messageId: 'conditionErrorNullableObject',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
        declare const obj: { x: number } | null;
        !obj ? 1 : 0
        !obj
        obj || 0
        ;(obj != null) && 1 || 0
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableObject: false }],
      output: null,
    },
    {
      code: `
declare function assert(x: unknown): asserts x;
declare const nullableString: string | null;
assert(nullableString);
      `,
      errors: [
        {
          column: 8,
          data: {
            context: 'conditional',
          },
          line: 4,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
declare function assert(x: unknown): asserts x;
declare const nullableString: string | null;
assert(nullableString != null);
      `,
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output: `
declare function assert(x: unknown): asserts x;
declare const nullableString: string | null;
assert(nullableString ?? "");
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
declare function assert(x: unknown): asserts x;
declare const nullableString: string | null;
assert(Boolean(nullableString));
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare function assert(a: number, b: unknown): asserts b;
declare const nullableString: string | null;
assert(foo, nullableString);
      `,
      errors: [
        {
          column: 13,
          data: {
            context: 'conditional',
          },
          line: 4,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
declare function assert(a: number, b: unknown): asserts b;
declare const nullableString: string | null;
assert(foo, nullableString != null);
      `,
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output: `
declare function assert(a: number, b: unknown): asserts b;
declare const nullableString: string | null;
assert(foo, nullableString ?? "");
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
declare function assert(a: number, b: unknown): asserts b;
declare const nullableString: string | null;
assert(foo, Boolean(nullableString));
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare function assert(a: number, b: unknown): asserts b;
declare function assert(one: number, two: unknown): asserts two;
declare const nullableString: string | null;
assert(foo, nullableString);
      `,
      errors: [
        {
          column: 13,
          data: {
            context: 'conditional',
          },
          line: 5,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
declare function assert(a: number, b: unknown): asserts b;
declare function assert(one: number, two: unknown): asserts two;
declare const nullableString: string | null;
assert(foo, nullableString != null);
      `,
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output: `
declare function assert(a: number, b: unknown): asserts b;
declare function assert(one: number, two: unknown): asserts two;
declare const nullableString: string | null;
assert(foo, nullableString ?? "");
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
declare function assert(a: number, b: unknown): asserts b;
declare function assert(one: number, two: unknown): asserts two;
declare const nullableString: string | null;
assert(foo, Boolean(nullableString));
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare function assert(this: object, a: number, b: unknown): asserts b;
declare const nullableString: string | null;
assert(foo, nullableString);
      `,
      errors: [
        {
          column: 13,
          data: {
            context: 'conditional',
          },
          line: 4,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
declare function assert(this: object, a: number, b: unknown): asserts b;
declare const nullableString: string | null;
assert(foo, nullableString != null);
      `,
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output: `
declare function assert(this: object, a: number, b: unknown): asserts b;
declare const nullableString: string | null;
assert(foo, nullableString ?? "");
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
declare function assert(this: object, a: number, b: unknown): asserts b;
declare const nullableString: string | null;
assert(foo, Boolean(nullableString));
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      // This should be checkable, but the TS API doesn't currently report
      // `someAssert(maybeString)` as a type predicate call, which appears to be
      // a bug.
      //
      // See https://github.com/microsoft/TypeScript/issues/59707
      code: `
function asserts1(x: string | number | undefined): asserts x {}
function asserts2(x: string | number | undefined): asserts x {}

const maybeString = Math.random() ? 'string'.slice() : undefined;

const someAssert: typeof asserts1 | typeof asserts2 =
  Math.random() > 0.5 ? asserts1 : asserts2;

someAssert(maybeString);
      `,
      errors: [
        {
          data: {
            context: 'conditional',
          },
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
function asserts1(x: string | number | undefined): asserts x {}
function asserts2(x: string | number | undefined): asserts x {}

const maybeString = Math.random() ? 'string'.slice() : undefined;

const someAssert: typeof asserts1 | typeof asserts2 =
  Math.random() > 0.5 ? asserts1 : asserts2;

someAssert(maybeString != null);
      `,
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output: `
function asserts1(x: string | number | undefined): asserts x {}
function asserts2(x: string | number | undefined): asserts x {}

const maybeString = Math.random() ? 'string'.slice() : undefined;

const someAssert: typeof asserts1 | typeof asserts2 =
  Math.random() > 0.5 ? asserts1 : asserts2;

someAssert(maybeString ?? "");
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
function asserts1(x: string | number | undefined): asserts x {}
function asserts2(x: string | number | undefined): asserts x {}

const maybeString = Math.random() ? 'string'.slice() : undefined;

const someAssert: typeof asserts1 | typeof asserts2 =
  Math.random() > 0.5 ? asserts1 : asserts2;

someAssert(Boolean(maybeString));
      `,
            },
          ],
        },
      ],
      output: null,
      skip: true,
    },
    {
      // The implementation signature doesn't count towards the call signatures
      code: `
function assert(this: object, a: number, b: unknown): asserts b;
function assert(a: bigint, b: unknown): asserts b;
function assert(this: object, a: string, two: string): asserts two;
function assert(
  this: object,
  a: string,
  assertee: string,
  c: bigint,
  d: object,
): asserts assertee;

function assert(...args: any[]) {
  throw new Error('lol');
}

declare const nullableString: string | null;
assert(3 as any, nullableString);
      `,
      errors: [
        {
          column: 18,
          data: {
            context: 'conditional',
          },
          line: 18,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
function assert(this: object, a: number, b: unknown): asserts b;
function assert(a: bigint, b: unknown): asserts b;
function assert(this: object, a: string, two: string): asserts two;
function assert(
  this: object,
  a: string,
  assertee: string,
  c: bigint,
  d: object,
): asserts assertee;

function assert(...args: any[]) {
  throw new Error('lol');
}

declare const nullableString: string | null;
assert(3 as any, nullableString != null);
      `,
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output: `
function assert(this: object, a: number, b: unknown): asserts b;
function assert(a: bigint, b: unknown): asserts b;
function assert(this: object, a: string, two: string): asserts two;
function assert(
  this: object,
  a: string,
  assertee: string,
  c: bigint,
  d: object,
): asserts assertee;

function assert(...args: any[]) {
  throw new Error('lol');
}

declare const nullableString: string | null;
assert(3 as any, nullableString ?? "");
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
function assert(this: object, a: number, b: unknown): asserts b;
function assert(a: bigint, b: unknown): asserts b;
function assert(this: object, a: string, two: string): asserts two;
function assert(
  this: object,
  a: string,
  assertee: string,
  c: bigint,
  d: object,
): asserts assertee;

function assert(...args: any[]) {
  throw new Error('lol');
}

declare const nullableString: string | null;
assert(3 as any, Boolean(nullableString));
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      // The implementation signature doesn't count towards the call signatures
      code: `
function assert(this: object, a: number, b: unknown): asserts b;
function assert(a: bigint, b: unknown): asserts b;
function assert(this: object, a: string, two: string): asserts two;
function assert(
  this: object,
  a: string,
  assertee: string,
  c: bigint,
  d: object,
): asserts assertee;
function assert(a: any, two: unknown, ...rest: any[]): asserts two;

function assert(...args: any[]) {
  throw new Error('lol');
}

declare const nullableString: string | null;
assert(3 as any, nullableString, 'more', 'args', 'afterwards');
      `,
      errors: [
        {
          column: 18,
          data: {
            context: 'conditional',
          },
          line: 19,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
function assert(this: object, a: number, b: unknown): asserts b;
function assert(a: bigint, b: unknown): asserts b;
function assert(this: object, a: string, two: string): asserts two;
function assert(
  this: object,
  a: string,
  assertee: string,
  c: bigint,
  d: object,
): asserts assertee;
function assert(a: any, two: unknown, ...rest: any[]): asserts two;

function assert(...args: any[]) {
  throw new Error('lol');
}

declare const nullableString: string | null;
assert(3 as any, nullableString != null, 'more', 'args', 'afterwards');
      `,
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output: `
function assert(this: object, a: number, b: unknown): asserts b;
function assert(a: bigint, b: unknown): asserts b;
function assert(this: object, a: string, two: string): asserts two;
function assert(
  this: object,
  a: string,
  assertee: string,
  c: bigint,
  d: object,
): asserts assertee;
function assert(a: any, two: unknown, ...rest: any[]): asserts two;

function assert(...args: any[]) {
  throw new Error('lol');
}

declare const nullableString: string | null;
assert(3 as any, nullableString ?? "", 'more', 'args', 'afterwards');
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
function assert(this: object, a: number, b: unknown): asserts b;
function assert(a: bigint, b: unknown): asserts b;
function assert(this: object, a: string, two: string): asserts two;
function assert(
  this: object,
  a: string,
  assertee: string,
  c: bigint,
  d: object,
): asserts assertee;
function assert(a: any, two: unknown, ...rest: any[]): asserts two;

function assert(...args: any[]) {
  throw new Error('lol');
}

declare const nullableString: string | null;
assert(3 as any, Boolean(nullableString), 'more', 'args', 'afterwards');
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare function assert(a: boolean, b: unknown): asserts b;
declare function assert({ a }: { a: boolean }, b: unknown): asserts b;
declare const nullableString: string | null;
declare const boo: boolean;
assert(boo, nullableString);
      `,
      errors: [
        {
          data: {
            context: 'conditional',
          },
          line: 6,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
declare function assert(a: boolean, b: unknown): asserts b;
declare function assert({ a }: { a: boolean }, b: unknown): asserts b;
declare const nullableString: string | null;
declare const boo: boolean;
assert(boo, nullableString != null);
      `,
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output: `
declare function assert(a: boolean, b: unknown): asserts b;
declare function assert({ a }: { a: boolean }, b: unknown): asserts b;
declare const nullableString: string | null;
declare const boo: boolean;
assert(boo, nullableString ?? "");
      `,
            },

            {
              messageId: 'conditionFixCastBoolean',
              output: `
declare function assert(a: boolean, b: unknown): asserts b;
declare function assert({ a }: { a: boolean }, b: unknown): asserts b;
declare const nullableString: string | null;
declare const boo: boolean;
assert(boo, Boolean(nullableString));
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      // This report matches TS's analysis, which selects the assertion overload.
      code: `
function assert(one: unknown): asserts one;
function assert(one: unknown, two: unknown): asserts two;
function assert(...args: unknown[]) {
  throw new Error('not implemented');
}
declare const nullableString: string | null;
assert(nullableString);
      `,
      errors: [
        {
          data: {
            context: 'conditional',
          },
          line: 8,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
function assert(one: unknown): asserts one;
function assert(one: unknown, two: unknown): asserts two;
function assert(...args: unknown[]) {
  throw new Error('not implemented');
}
declare const nullableString: string | null;
assert(nullableString != null);
      `,
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output: `
function assert(one: unknown): asserts one;
function assert(one: unknown, two: unknown): asserts two;
function assert(...args: unknown[]) {
  throw new Error('not implemented');
}
declare const nullableString: string | null;
assert(nullableString ?? "");
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
function assert(one: unknown): asserts one;
function assert(one: unknown, two: unknown): asserts two;
function assert(...args: unknown[]) {
  throw new Error('not implemented');
}
declare const nullableString: string | null;
assert(Boolean(nullableString));
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
['one', 'two', ''].find(x => {
  return x;
});
      `,
      errors: [
        {
          column: 25,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'explicitBooleanReturnType',
              output: `
['one', 'two', ''].find((x): boolean => {
  return x;
});
      `,
            },
          ],
        },
      ],
      options: [{ allowString: false }],
    },
    {
      code: `
['one', 'two', ''].find(x => {
  return;
});
      `,
      errors: [
        {
          column: 25,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'conditionErrorNullish',
          suggestions: [
            {
              messageId: 'explicitBooleanReturnType',
              output: `
['one', 'two', ''].find((x): boolean => {
  return;
});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
['one', 'two', ''].findLast(x => {
  return undefined;
});
      `,
      errors: [
        {
          column: 29,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'conditionErrorNullish',
          suggestions: [
            {
              messageId: 'explicitBooleanReturnType',
              output: `
['one', 'two', ''].findLast((x): boolean => {
  return undefined;
});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
['one', 'two', ''].find(x => {
  if (x) {
    return Math.random() > 0.5;
  }
});
      `,
      errors: [
        {
          column: 25,
          endColumn: 2,
          endLine: 6,
          line: 2,
          messageId: 'conditionErrorNullableBoolean',
          suggestions: [
            {
              messageId: 'explicitBooleanReturnType',
              output: `
['one', 'two', ''].find((x): boolean => {
  if (x) {
    return Math.random() > 0.5;
  }
});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const predicate = (x: string) => {
  if (x) {
    return Math.random() > 0.5;
  }
};

['one', 'two', ''].find(predicate);
      `,
      errors: [
        {
          column: 25,
          endColumn: 34,
          endLine: 8,
          line: 8,
          messageId: 'conditionErrorNullableBoolean',
        },
      ],
      options: [{ allowNullableBoolean: false }],
    },
    {
      code: `
[1, null].every(async x => {
  return x != null;
});
      `,
      errors: [
        {
          column: 17,
          data: {
            type: 'Promise<boolean>',
          },
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'predicateCannotBeAsync',
        },
      ],
    },
    {
      code: `
const predicate = async x => {
  return x != null;
};

[1, null].every(predicate);
      `,
      errors: [
        {
          column: 17,
          endColumn: 26,
          endLine: 6,
          line: 6,
          messageId: 'conditionErrorObject',
        },
      ],
    },
    {
      code: `
[1, null].every((x): boolean | number => {
  return x != null;
});
      `,
      errors: [
        {
          column: 17,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'conditionErrorOther',
        },
      ],
    },
    {
      code: `
[1, null].every((x): boolean | undefined => {
  return x != null;
});
      `,
      errors: [
        {
          column: 17,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'conditionErrorNullableBoolean',
        },
      ],
    },
    // various cases for the suggestion fix
    {
      code: `
[1, null].every((x, i) => {});
      `,
      errors: [
        {
          column: 17,
          endColumn: 29,
          endLine: 2,
          line: 2,
          messageId: 'conditionErrorNullish',
          suggestions: [
            {
              messageId: 'explicitBooleanReturnType',
              output: `
[1, null].every((x, i): boolean => {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
[() => {}, null].every((x: () => void) => {});
      `,
      errors: [
        {
          column: 24,
          endColumn: 45,
          endLine: 2,
          line: 2,
          messageId: 'conditionErrorNullish',
          suggestions: [
            {
              messageId: 'explicitBooleanReturnType',
              output: `
[() => {}, null].every((x: () => void): boolean => {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
[() => {}, null].every(function (x: () => void) {});
      `,
      errors: [
        {
          column: 24,
          endColumn: 51,
          endLine: 2,
          line: 2,
          messageId: 'conditionErrorNullish',
          suggestions: [
            {
              messageId: 'explicitBooleanReturnType',
              output: `
[() => {}, null].every(function (x: () => void): boolean {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
[() => {}, null].every(() => {});
      `,
      errors: [
        {
          column: 24,
          endColumn: 32,
          endLine: 2,
          line: 2,
          messageId: 'conditionErrorNullish',
          suggestions: [
            {
              messageId: 'explicitBooleanReturnType',
              output: `
[() => {}, null].every((): boolean => {});
      `,
            },
          ],
        },
      ],
    },
    // function overloading
    {
      code: `
declare function f(x: number): string;
declare function f(x: string | null): boolean;

[35].filter(f);
      `,
      errors: [
        {
          column: 13,
          endColumn: 14,
          endLine: 5,
          line: 5,
          messageId: 'conditionErrorOther',
        },
      ],
    },
    {
      code: `
declare function f(x: number): string;
declare function f(x: number | boolean): boolean;
declare function f(x: string | null): boolean;

[35].filter(f);
      `,
      errors: [
        {
          column: 13,
          endColumn: 14,
          endLine: 6,
          line: 6,
          messageId: 'conditionErrorOther',
        },
      ],
    },
    // type constraints
    {
      code: `
declare function foo<T>(x: number): T;
[1, null].every(foo);
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'conditionErrorAny',
        },
      ],
    },
    {
      code: `
function foo<T extends number>(x: number): T {}
[1, null].every(foo);
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'conditionErrorNumber',
        },
      ],
      options: [
        {
          allowNumber: false,
        },
      ],
    },
    {
      code: `
declare const nullOrString: string | null;
['one', null].filter(x => nullOrString);
      `,
      errors: [
        {
          column: 22,
          data: {
            context: 'array predicate return type',
          },
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
declare const nullOrString: string | null;
['one', null].filter(x => nullOrString != null);
      `,
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output: `
declare const nullOrString: string | null;
['one', null].filter(x => nullOrString ?? "");
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
declare const nullOrString: string | null;
['one', null].filter(x => Boolean(nullOrString));
      `,
            },
            {
              messageId: 'explicitBooleanReturnType',
              output: `
declare const nullOrString: string | null;
['one', null].filter((x): boolean => nullOrString);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const nullOrString: string | null;
['one', null].filter(x => !nullOrString);
      `,
      errors: [
        {
          column: 28,
          data: {
            context: 'conditional',
          },
          endColumn: 40,
          endLine: 3,
          line: 3,
          messageId: 'conditionErrorNullableString',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
declare const nullOrString: string | null;
['one', null].filter(x => nullOrString == null);
      `,
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              output: `
declare const nullOrString: string | null;
['one', null].filter(x => !(nullOrString ?? ""));
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
declare const nullOrString: string | null;
['one', null].filter(x => !Boolean(nullOrString));
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const anyValue: any;
['one', null].filter(x => anyValue);
      `,
      errors: [
        {
          column: 22,
          data: {
            context: 'array predicate return type',
          },
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'conditionErrorAny',
          suggestions: [
            {
              messageId: 'conditionFixCastBoolean',
              output: `
declare const anyValue: any;
['one', null].filter(x => Boolean(anyValue));
      `,
            },
            {
              messageId: 'explicitBooleanReturnType',
              output: `
declare const anyValue: any;
['one', null].filter((x): boolean => anyValue);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const nullOrBoolean: boolean | null;
[true, null].filter(x => nullOrBoolean);
      `,
      errors: [
        {
          column: 21,
          data: {
            context: 'array predicate return type',
          },
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'conditionErrorNullableBoolean',
          suggestions: [
            {
              messageId: 'conditionFixDefaultFalse',
              output: `
declare const nullOrBoolean: boolean | null;
[true, null].filter(x => nullOrBoolean ?? false);
      `,
            },
            {
              messageId: 'conditionFixCompareTrue',
              output: `
declare const nullOrBoolean: boolean | null;
[true, null].filter(x => nullOrBoolean === true);
      `,
            },
            {
              messageId: 'explicitBooleanReturnType',
              output: `
declare const nullOrBoolean: boolean | null;
[true, null].filter((x): boolean => nullOrBoolean);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
enum ExampleEnum {
  This = 0,
  That = 1,
}
const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
[0, 1].filter(x => theEnum);
      `,
      errors: [
        {
          column: 15,
          data: {
            context: 'array predicate return type',
          },
          endColumn: 27,
          endLine: 7,
          line: 7,
          messageId: 'conditionErrorNullableEnum',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
enum ExampleEnum {
  This = 0,
  That = 1,
}
const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
[0, 1].filter(x => theEnum != null);
      `,
            },
            {
              messageId: 'explicitBooleanReturnType',
              output: `
enum ExampleEnum {
  This = 0,
  That = 1,
}
const theEnum = Math.random() < 0.3 ? ExampleEnum.This : null;
[0, 1].filter((x): boolean => theEnum);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const nullOrNumber: number | null;
[0, null].filter(x => nullOrNumber);
      `,
      errors: [
        {
          column: 18,
          data: {
            context: 'array predicate return type',
          },
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'conditionErrorNullableNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
declare const nullOrNumber: number | null;
[0, null].filter(x => nullOrNumber != null);
      `,
            },
            {
              messageId: 'conditionFixDefaultZero',
              output: `
declare const nullOrNumber: number | null;
[0, null].filter(x => nullOrNumber ?? 0);
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
declare const nullOrNumber: number | null;
[0, null].filter(x => Boolean(nullOrNumber));
      `,
            },
            {
              messageId: 'explicitBooleanReturnType',
              output: `
declare const nullOrNumber: number | null;
[0, null].filter((x): boolean => nullOrNumber);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const objectValue: object = {};
[{ a: 0 }, {}].filter(x => objectValue);
      `,
      errors: [
        {
          column: 23,
          data: {
            context: 'array predicate return type',
          },
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'conditionErrorObject',
          suggestions: [
            {
              messageId: 'explicitBooleanReturnType',
              output: `
const objectValue: object = {};
[{ a: 0 }, {}].filter((x): boolean => objectValue);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const objectValue: object = {};
[{ a: 0 }, {}].filter(x => {
  return objectValue;
});
      `,
      errors: [
        {
          column: 23,
          data: {
            context: 'array predicate return type',
          },
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'conditionErrorObject',
          suggestions: [
            {
              messageId: 'explicitBooleanReturnType',
              output: `
const objectValue: object = {};
[{ a: 0 }, {}].filter((x): boolean => {
  return objectValue;
});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const nullOrObject: object | null;
[{ a: 0 }, null].filter(x => nullOrObject);
      `,
      errors: [
        {
          column: 25,
          data: {
            context: 'array predicate return type',
          },
          endColumn: 42,
          endLine: 3,
          line: 3,
          messageId: 'conditionErrorNullableObject',
          suggestions: [
            {
              messageId: 'conditionFixCompareNullish',
              output: `
declare const nullOrObject: object | null;
[{ a: 0 }, null].filter(x => nullOrObject != null);
      `,
            },
            {
              messageId: 'explicitBooleanReturnType',
              output: `
declare const nullOrObject: object | null;
[{ a: 0 }, null].filter((x): boolean => nullOrObject);
      `,
            },
          ],
        },
      ],
      options: [{ allowNullableObject: false }],
    },
    {
      code: `
const numbers: number[] = [1];
[1, 2].filter(x => numbers.length);
      `,
      errors: [
        {
          column: 15,
          data: {
            context: 'array predicate return type',
          },
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareArrayLengthNonzero',
              output: `
const numbers: number[] = [1];
[1, 2].filter(x => numbers.length > 0);
      `,
            },
            {
              messageId: 'explicitBooleanReturnType',
              output: `
const numbers: number[] = [1];
[1, 2].filter((x): boolean => numbers.length);
      `,
            },
          ],
        },
      ],
      options: [{ allowNumber: false }],
    },
    {
      code: `
const numberValue: number = 1;
[1, 2].filter(x => numberValue);
      `,
      errors: [
        {
          column: 15,
          data: {
            context: 'array predicate return type',
          },
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'conditionErrorNumber',
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: `
const numberValue: number = 1;
[1, 2].filter(x => numberValue !== 0);
      `,
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: `
const numberValue: number = 1;
[1, 2].filter(x => !Number.isNaN(numberValue));
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
const numberValue: number = 1;
[1, 2].filter(x => Boolean(numberValue));
      `,
            },
            {
              messageId: 'explicitBooleanReturnType',
              output: `
const numberValue: number = 1;
[1, 2].filter((x): boolean => numberValue);
      `,
            },
          ],
        },
      ],
      options: [{ allowNumber: false }],
    },
    {
      code: `
const stringValue: string = 'hoge';
['hoge', 'foo'].filter(x => stringValue);
      `,
      errors: [
        {
          column: 24,
          data: {
            context: 'array predicate return type',
          },
          endColumn: 40,
          endLine: 3,
          line: 3,
          messageId: 'conditionErrorString',
          suggestions: [
            {
              messageId: 'conditionFixCompareStringLength',
              output: `
const stringValue: string = 'hoge';
['hoge', 'foo'].filter(x => stringValue.length > 0);
      `,
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `
const stringValue: string = 'hoge';
['hoge', 'foo'].filter(x => stringValue !== "");
      `,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `
const stringValue: string = 'hoge';
['hoge', 'foo'].filter(x => Boolean(stringValue));
      `,
            },
            {
              messageId: 'explicitBooleanReturnType',
              output: `
const stringValue: string = 'hoge';
['hoge', 'foo'].filter((x): boolean => stringValue);
      `,
            },
          ],
        },
      ],
      options: [{ allowString: false }],
    },
  ],

  valid: [
    // boolean in boolean context
    "true ? 'a' : 'b';",
    `
if (false) {
}
    `,
    'while (true) {}',
    'for (; false; ) {}',
    '!true;',
    'false || 123;',
    "true && 'foo';",
    '!(false || true);',
    'true && false ? true : false;',
    '(false && true) || false;',
    '(false && true) || [];',
    '(false && 1) || (true && 2);',
    `
declare const x: boolean;
if (x) {
}
    `,
    '(x: boolean) => !x;',
    '<T extends boolean>(x: T) => (x ? 1 : 0);',
    `
declare const x: never;
if (x) {
}
    `,

    // string in boolean context
    `
if ('') {
}
    `,
    "while ('x') {}",
    "for (; ''; ) {}",
    "('' && '1') || x;",
    `
declare const x: string;
if (x) {
}
    `,
    '(x: string) => !x;',
    '<T extends string>(x: T) => (x ? 1 : 0);',

    // number in boolean context
    `
if (0) {
}
    `,
    'while (1n) {}',
    'for (; Infinity; ) {}',
    '(0 / 0 && 1 + 2) || x;',
    `
declare const x: number;
if (x) {
}
    `,
    '(x: bigint) => !x;',
    '<T extends number>(x: T) => (x ? 1 : 0);',

    // nullable object in boolean context
    `
declare const x: null | object;
if (x) {
}
    `,
    '(x?: { a: any }) => !x;',
    '<T extends {} | null | undefined>(x: T) => (x ? 1 : 0);',

    // nullable boolean in boolean context
    {
      code: `
        declare const x: boolean | null;
        if (x) {
        }
      `,
      options: [{ allowNullableBoolean: true }],
    },
    {
      code: `
        (x?: boolean) => !x;
      `,
      options: [{ allowNullableBoolean: true }],
    },
    {
      code: `
        <T extends boolean | null | undefined>(x: T) => (x ? 1 : 0);
      `,
      options: [{ allowNullableBoolean: true }],
    },
    {
      code: `
        const a: (undefined | boolean | null)[] = [true, undefined, null];
        a.some(x => x);
      `,
      options: [{ allowNullableBoolean: true }],
    },

    // nullable string in boolean context
    {
      code: `
        declare const x: string | null;
        if (x) {
        }
      `,
      options: [{ allowNullableString: true }],
    },
    {
      code: `
        (x?: string) => !x;
      `,
      options: [{ allowNullableString: true }],
    },
    {
      code: `
        <T extends string | null | undefined>(x: T) => (x ? 1 : 0);
      `,
      options: [{ allowNullableString: true }],
    },

    // nullable number in boolean context
    {
      code: `
        declare const x: number | null;
        if (x) {
        }
      `,
      options: [{ allowNullableNumber: true }],
    },
    {
      code: `
        (x?: number) => !x;
      `,
      options: [{ allowNullableNumber: true }],
    },
    {
      code: `
        <T extends number | null | undefined>(x: T) => (x ? 1 : 0);
      `,
      options: [{ allowNullableNumber: true }],
    },
    {
      code: `
        declare const arrayOfArrays: (null | unknown[])[];
        const isAnyNonEmptyArray1 = arrayOfArrays.some(array => array?.length);
      `,
      options: [{ allowNullableNumber: true }],
    },

    // any in boolean context
    {
      code: `
        declare const x: any;
        if (x) {
        }
      `,
      options: [{ allowAny: true }],
    },
    {
      code: `
        x => !x;
      `,
      options: [{ allowAny: true }],
    },
    {
      code: `
        <T extends any>(x: T) => (x ? 1 : 0);
      `,
      options: [{ allowAny: true }],
    },
    {
      code: `
        declare const arrayOfArrays: any[];
        const isAnyNonEmptyArray1 = arrayOfArrays.some(array => array);
      `,
      options: [{ allowAny: true }],
    },

    // logical operator
    {
      code: `
        1 && true && 'x' && {};
      `,
      options: [{ allowNumber: true, allowString: true }],
    },
    {
      code: `
        let x = 0 || false || '' || null;
      `,
      options: [{ allowNumber: true, allowString: true }],
    },
    {
      code: `
        if (1 && true && 'x') void 0;
      `,
      options: [{ allowNumber: true, allowString: true }],
    },
    {
      code: `
        if (0 || false || '') void 0;
      `,
      options: [{ allowNumber: true, allowString: true }],
    },
    {
      code: `
        1 && true && 'x' ? {} : null;
      `,
      options: [{ allowNumber: true, allowString: true }],
    },
    {
      code: `
        0 || false || '' ? null : {};
      `,
      options: [{ allowNumber: true, allowString: true }],
    },
    {
      code: `
        declare const arrayOfArrays: string[];
        const isAnyNonEmptyArray1 = arrayOfArrays.some(array => array);
      `,
      options: [{ allowString: true }],
    },
    {
      code: `
        declare const arrayOfArrays: number[];
        const isAnyNonEmptyArray1 = arrayOfArrays.some(array => array);
      `,
      options: [{ allowNumber: true }],
    },
    {
      code: `
        declare const arrayOfArrays: (null | object)[];
        const isAnyNonEmptyArray1 = arrayOfArrays.some(array => array);
      `,
      options: [{ allowNullableObject: true }],
    },

    // nullable enum in boolean context
    {
      code: `
        enum ExampleEnum {
          This = 0,
          That = 1,
        }
        const rand = Math.random();
        let theEnum: ExampleEnum | null = null;
        if (rand < 0.3) {
          theEnum = ExampleEnum.This;
        }
        if (theEnum) {
        }
      `,
      options: [{ allowNullableEnum: true }],
    },
    {
      code: `
        enum ExampleEnum {
          This = 0,
          That = 1,
        }
        const rand = Math.random();
        let theEnum: ExampleEnum | null = null;
        if (rand < 0.3) {
          theEnum = ExampleEnum.This;
        }
        if (!theEnum) {
        }
      `,
      options: [{ allowNullableEnum: true }],
    },
    {
      code: `
        enum ExampleEnum {
          This = 1,
          That = 2,
        }
        const rand = Math.random();
        let theEnum: ExampleEnum | null = null;
        if (rand < 0.3) {
          theEnum = ExampleEnum.This;
        }
        if (!theEnum) {
        }
      `,
      options: [{ allowNullableEnum: true }],
    },
    {
      code: `
        enum ExampleEnum {
          This = 'one',
          That = 'two',
        }
        const rand = Math.random();
        let theEnum: ExampleEnum | null = null;
        if (rand < 0.3) {
          theEnum = ExampleEnum.This;
        }
        if (!theEnum) {
        }
      `,
      options: [{ allowNullableEnum: true }],
    },

    // nullable mixed enum in boolean context
    {
      // falsy number and truthy string
      code: `
        enum ExampleEnum {
          This = 0,
          That = 'one',
        }
        (value?: ExampleEnum) => (value ? 1 : 0);
      `,
      options: [{ allowNullableEnum: true }],
    },
    {
      // falsy string and truthy number
      code: `
        enum ExampleEnum {
          This = '',
          That = 1,
        }
        (value?: ExampleEnum) => (!value ? 1 : 0);
      `,
      options: [{ allowNullableEnum: true }],
    },
    {
      // truthy string and truthy number
      code: `
        enum ExampleEnum {
          This = 'this',
          That = 1,
        }
        (value?: ExampleEnum) => (!value ? 1 : 0);
      `,
      options: [{ allowNullableEnum: true }],
    },
    {
      // falsy string and falsy number
      code: `
        enum ExampleEnum {
          This = '',
          That = 0,
        }
        (value?: ExampleEnum) => (!value ? 1 : 0);
      `,
      options: [{ allowNullableEnum: true }],
    },
    {
      code: `
        enum ExampleEnum {
          This = '',
          That = 0,
        }
        declare const arrayOfArrays: (ExampleEnum | null)[];
        const isAnyNonEmptyArray1 = arrayOfArrays.some(array => array);
      `,
      options: [{ allowNullableEnum: true }],
    },
    {
      code: `
declare const x: string[] | null;
// eslint-disable-next-line
if (x) {
}
      `,
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: path.join(rootPath, 'unstrict'),
        },
      },
      options: [
        {
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: true,
        },
      ],
    },

    `
function f(arg: 'a' | null) {
  if (arg) console.log(arg);
}
    `,
    `
function f(arg: 'a' | 'b' | null) {
  if (arg) console.log(arg);
}
    `,
    {
      code: `
declare const x: 1 | null;
declare const y: 1;
if (x) {
}
if (y) {
}
      `,
      options: [
        {
          allowNumber: true,
        },
      ],
    },
    `
function f(arg: 1 | null) {
  if (arg) console.log(arg);
}
    `,
    `
function f(arg: 1 | 2 | null) {
  if (arg) console.log(arg);
}
    `,
    `
interface Options {
  readonly enableSomething?: true;
}

function f(opts: Options): void {
  if (opts.enableSomething) console.log('Do something');
}
    `,
    `
declare const x: true | null;
if (x) {
}
    `,
    {
      code: `
declare const x: 'a' | null;
declare const y: 'a';
if (x) {
}
if (y) {
}
      `,
      options: [
        {
          allowString: true,
        },
      ],
    },
    `
declare const foo: boolean & { __BRAND: 'Foo' };
if (foo) {
}
    `,
    `
declare const foo: true & { __BRAND: 'Foo' };
if (foo) {
}
    `,
    `
declare const foo: false & { __BRAND: 'Foo' };
if (foo) {
}
    `,
    `
declare function assert(a: number, b: unknown): asserts a;
declare const nullableString: string | null;
declare const boo: boolean;
assert(boo, nullableString);
    `,
    `
declare function assert(a: boolean, b: unknown): asserts b is string;
declare const nullableString: string | null;
declare const boo: boolean;
assert(boo, nullableString);
    `,
    `
declare function assert(a: number, b: unknown): asserts b;
declare const nullableString: string | null;
declare const boo: boolean;
assert(nullableString, boo);
    `,
    `
declare function assert(a: number, b: unknown): asserts b;
declare const nullableString: string | null;
declare const boo: boolean;
assert(...nullableString, nullableString);
    `,
    `
declare function assert(
  this: object,
  a: number,
  b?: unknown,
  c?: unknown,
): asserts c;
declare const nullableString: string | null;
declare const foo: number;
const o: { assert: typeof assert } = {
  assert,
};
o.assert(foo, nullableString);
    `,
    {
      code: `
declare function assert(x: unknown): x is string;
declare const nullableString: string | null;
assert(nullableString);
      `,
    },
    {
      code: `
class ThisAsserter {
  assertThis(this: unknown, arg2: unknown): asserts this {}
}

declare const lol: string | number | unknown | null;

const thisAsserter: ThisAsserter = new ThisAsserter();
thisAsserter.assertThis(lol);
      `,
    },
    {
      code: `
function assert(this: object, a: number, b: unknown): asserts b;
function assert(a: bigint, b: unknown): asserts b;
function assert(this: object, a: string, two: string): asserts two;
function assert(
  this: object,
  a: string,
  assertee: string,
  c: bigint,
  d: object,
): asserts assertee;
function assert(...args: any[]): void;

function assert(...args: any[]) {
  throw new Error('lol');
}

declare const nullableString: string | null;
assert(3 as any, nullableString);
      `,
    },
    // Intentional use of `any` to test a function call with no call signatures.
    `
declare const assert: any;
declare const nullableString: string | null;
assert(nullableString);
    `,
    // Coverage for absent "test expression".
    // Ensure that no crash or false positive occurs
    `
      for (let x = 0; ; x++) {
        break;
      }
    `,
    `
[true, false].some(function (x) {
  return x;
});
    `,
    `
[true, false].some(function check(x) {
  return x;
});
    `,
    `
[true, false].some(x => {
  return x;
});
    `,
    `
[1, null].filter(function (x) {
  return x != null;
});
    `,
    `
['one', 'two', ''].filter(function (x) {
  return !!x;
});
    `,
    `
['one', 'two', ''].filter(function (x): boolean {
  return !!x;
});
    `,
    `
['one', 'two', ''].filter(function (x): boolean {
  if (x) {
    return true;
  }
});
    `,
    `
['one', 'two', ''].filter(function (x): boolean {
  if (x) {
    return true;
  }

  throw new Error('oops');
});
    `,
    `
declare const predicate: (string) => boolean;
['one', 'two', ''].filter(predicate);
    `,
    `
declare function notNullish<T>(x: T): x is NonNullable<T>;
['one', null].filter(notNullish);
    `,
    `
declare function predicate(x: string | null): x is string;
['one', null].filter(predicate);
    `,
    `
declare function predicate<T extends boolean>(x: string | null): T;
['one', null].filter(predicate);
    `,
    `
declare function f(x: number): boolean;
declare function f(x: string | null): boolean;

[35].filter(f);
    `,
  ],
});
