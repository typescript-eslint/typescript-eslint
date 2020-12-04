import * as path from 'path';
import rule, {
  Options,
  MessageId,
} from '../../src/rules/strict-boolean-expressions';
import {
  batchedSingleLineTests,
  getFixturesRootDir,
  RuleTester,
  noFormat,
} from '../RuleTester';

const rootPath = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('strict-boolean-expressions', rule, {
  valid: [
    // boolean in boolean context
    ...batchedSingleLineTests<Options>({
      code: noFormat`
        true ? "a" : "b";
        if (false) {}
        while (true) {}
        for (; false;) {}
        !true;
        false || 123;
        true && "foo";
        !(false || true);
        true && false ? true : false;
        false && true || false;
        false && true || [];
        (false && 1) || (true && 2);
        declare const x: boolean; if (x) {}
        (x: boolean) => !x;
        <T extends boolean>(x: T) => x ? 1 : 0;
        declare const x: never; if (x) {}
      `,
    }),

    // string in boolean context
    ...batchedSingleLineTests<Options>({
      code: noFormat`
        if ("") {}
        while ("x") {}
        for (; "";) {}
        "" && "1" || x;
        declare const x: string; if (x) {}
        (x: string) => !x;
        <T extends string>(x: T) => x ? 1 : 0;
      `,
    }),

    // number in boolean context
    ...batchedSingleLineTests<Options>({
      code: noFormat`
        if (0) {}
        while (1n) {}
        for (; Infinity;) {}
        0 / 0 && 1 + 2 || x;
        declare const x: number; if (x) {}
        (x: bigint) => !x;
        <T extends number>(x: T) => x ? 1 : 0;
      `,
    }),

    // nullable object in boolean context
    ...batchedSingleLineTests<Options>({
      code: noFormat`
        declare const x: null | object; if (x) {}
        (x?: { a: any }) => !x;
        <T extends {} | null | undefined>(x: T) => x ? 1 : 0;
      `,
    }),

    // nullable boolean in boolean context
    ...batchedSingleLineTests<Options>({
      options: [{ allowNullableBoolean: true }],
      code: noFormat`
        declare const x: boolean | null; if (x) {}
        (x?: boolean) => !x;
        <T extends boolean | null | undefined>(x: T) => x ? 1 : 0;
      `,
    }),

    // nullable string in boolean context
    ...batchedSingleLineTests<Options>({
      options: [{ allowNullableString: true }],
      code: noFormat`
        declare const x: string | null; if (x) {}
        (x?: string) => !x;
        <T extends string | null | undefined>(x: T) => x ? 1 : 0;
      `,
    }),

    // nullable number in boolean context
    ...batchedSingleLineTests<Options>({
      options: [{ allowNullableNumber: true }],
      code: noFormat`
        declare const x: number | null; if (x) {}
        (x?: number) => !x;
        <T extends number | null | undefined>(x: T) => x ? 1 : 0;
      `,
    }),

    // any in boolean context
    ...batchedSingleLineTests<Options>({
      options: [{ allowAny: true }],
      code: noFormat`
        declare const x: any; if (x) {}
        (x) => !x;
        <T extends any>(x: T) => x ? 1 : 0;
      `,
    }),
    {
      code: `
declare const x: string[] | null;
// eslint-disable-next-line
if (x) {
}
      `,
      options: [
        {
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: true,
        },
      ],
      parserOptions: {
        tsconfigRootDir: path.join(rootPath, 'unstrict'),
      },
    },
  ],

  invalid: [
    // non-boolean in RHS of test expression
    ...batchedSingleLineTests<MessageId, Options>({
      options: [
        { allowString: false, allowNumber: false, allowNullableObject: false },
      ],
      code: noFormat`
        if (true && 1) {}
        while (false || "a") {}
        (x: object) => true || false || x ? true : false;
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 2,
          column: 13,
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              output: 'if (true && (1 !== 0)) {}',
            },
            {
              messageId: 'conditionFixCompareNaN',
              output: 'if (true && (!Number.isNaN(1))) {}',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: 'if (true && (Boolean(1))) {}',
            },
          ],
        },
        {
          messageId: 'conditionErrorString',
          line: 3,
          column: 25,
          suggestions: [
            {
              messageId: 'conditionFixCompareEmptyString',
              output: '        while (false || ("a" !== "")) {}',
            },
            {
              messageId: 'conditionFixCompareLength',
              output: '        while (false || ("a".length > 0)) {}',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: '        while (false || (Boolean("a"))) {}',
            },
          ],
        },
        { messageId: 'conditionErrorObject', line: 4, column: 41 },
      ],
    }),

    // check if all and only the outermost operands are checked
    {
      options: [
        { allowString: false, allowNumber: false, allowNullableObject: false },
      ],
      code: noFormat`if (('' && {}) || (0 && void 0)) { }`,
      errors: [
        {
          messageId: 'conditionErrorString',
          line: 1,
          column: 6,
          suggestions: [
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `if ((('' !== "") && {}) || (0 && void 0)) { }`,
            },
            {
              messageId: 'conditionFixCompareLength',
              output: `if (((''.length > 0) && {}) || (0 && void 0)) { }`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `if (((Boolean('')) && {}) || (0 && void 0)) { }`,
            },
          ],
        },
        { messageId: 'conditionErrorObject', line: 1, column: 12 },
        {
          messageId: 'conditionErrorNumber',
          line: 1,
          column: 20,
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
        { messageId: 'conditionErrorNullish', line: 1, column: 25 },
      ],
    },

    // nullish in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        null || {};
        undefined && [];
        declare const x: null; if (x) {}
        (x: undefined) => !x;
        <T extends null | undefined>(x: T) => x ? 1 : 0;
      `,
      errors: [
        { messageId: 'conditionErrorNullish', line: 2, column: 1 },
        { messageId: 'conditionErrorNullish', line: 3, column: 9 },
        { messageId: 'conditionErrorNullish', line: 4, column: 36 },
        { messageId: 'conditionErrorNullish', line: 5, column: 28 },
        { messageId: 'conditionErrorNullish', line: 6, column: 47 },
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
      `,
      errors: [
        { messageId: 'conditionErrorObject', line: 2, column: 1 },
        { messageId: 'conditionErrorObject', line: 3, column: 10 },
        { messageId: 'conditionErrorObject', line: 4, column: 38 },
        { messageId: 'conditionErrorObject', line: 5, column: 29 },
        { messageId: 'conditionErrorObject', line: 6, column: 37 },
      ],
    }),

    // string in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      options: [{ allowString: false }],
      code: noFormat`
        while ("") {}
        for (; "foo";) {}
        declare const x: string; if (x) {}
        (x: string) => !x;
        <T extends string>(x: T) => x ? 1 : 0;
      `,
      errors: [
        {
          messageId: 'conditionErrorString',
          line: 2,
          column: 8,
          suggestions: [
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `while ("" !== "") {}`,
            },
            {
              messageId: 'conditionFixCompareLength',
              output: `while ("".length > 0) {}`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `while (Boolean("")) {}`,
            },
          ],
        },
        {
          messageId: 'conditionErrorString',
          line: 3,
          column: 16,
          suggestions: [
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `        for (; "foo" !== "";) {}`,
            },
            {
              messageId: 'conditionFixCompareLength',
              output: `        for (; "foo".length > 0;) {}`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        for (; Boolean("foo");) {}`,
            },
          ],
        },
        {
          messageId: 'conditionErrorString',
          line: 4,
          column: 38,
          suggestions: [
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `        declare const x: string; if (x !== "") {}`,
            },
            {
              messageId: 'conditionFixCompareLength',
              output: `        declare const x: string; if (x.length > 0) {}`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        declare const x: string; if (Boolean(x)) {}`,
            },
          ],
        },
        {
          messageId: 'conditionErrorString',
          line: 5,
          column: 25,
          suggestions: [
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `        (x: string) => (x === "");`,
            },
            {
              messageId: 'conditionFixCompareLength',
              output: `        (x: string) => (x.length === 0);`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        (x: string) => (!Boolean(x));`,
            },
          ],
        },
        {
          messageId: 'conditionErrorString',
          line: 6,
          column: 37,
          suggestions: [
            {
              messageId: 'conditionFixCompareEmptyString',
              output: `        <T extends string>(x: T) => (x !== "") ? 1 : 0;`,
            },
            {
              messageId: 'conditionFixCompareLength',
              output: `        <T extends string>(x: T) => (x.length > 0) ? 1 : 0;`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        <T extends string>(x: T) => (Boolean(x)) ? 1 : 0;`,
            },
          ],
        },
      ],
    }),

    // number in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      options: [{ allowNumber: false }],
      code: noFormat`
        while (0n) {}
        for (; 123;) {}
        declare const x: number; if (x) {}
        (x: bigint) => !x;
        <T extends number>(x: T) => x ? 1 : 0;
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 2,
          column: 8,
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
          messageId: 'conditionErrorNumber',
          line: 3,
          column: 16,
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
          messageId: 'conditionErrorNumber',
          line: 4,
          column: 38,
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
          messageId: 'conditionErrorNumber',
          line: 5,
          column: 25,
          suggestions: [
            {
              messageId: 'conditionFixCompareZero',
              // TODO: fix compare zero suggestion for bigint
              output: `        (x: bigint) => (x === 0);`,
            },
            {
              // TODO: remove check NaN suggestion for bigint
              messageId: 'conditionFixCompareNaN',
              output: `        (x: bigint) => (Number.isNaN(x));`,
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: `        (x: bigint) => (!Boolean(x));`,
            },
          ],
        },
        {
          messageId: 'conditionErrorNumber',
          line: 6,
          column: 37,
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
      ],
    }),

    // mixed `string | number` value in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      options: [{ allowString: true, allowNumber: true }],
      code: noFormat`
        declare const x: string | number; if (x) {}
        (x: bigint | string) => !x;
        <T extends number | bigint | string>(x: T) => x ? 1 : 0;
      `,
      errors: [
        { messageId: 'conditionErrorOther', line: 2, column: 39 },
        { messageId: 'conditionErrorOther', line: 3, column: 34 },
        { messageId: 'conditionErrorOther', line: 4, column: 55 },
      ],
    }),

    // nullable boolean in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      options: [{ allowNullableBoolean: false }],
      code: noFormat`
        declare const x: boolean | null; if (x) {}
        (x?: boolean) => !x;
        <T extends boolean | null | undefined>(x: T) => x ? 1 : 0;
      `,
      errors: [
        { messageId: 'conditionErrorNullableBoolean', line: 2, column: 38 },
        { messageId: 'conditionErrorNullableBoolean', line: 3, column: 27 },
        { messageId: 'conditionErrorNullableBoolean', line: 4, column: 57 },
      ],
      output: `
        declare const x: boolean | null; if (x ?? false) {}
        (x?: boolean) => !(x ?? false);
        <T extends boolean | null | undefined>(x: T) => (x ?? false) ? 1 : 0;
      `,
    }),

    // nullable object in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      options: [{ allowNullableObject: false }],
      code: noFormat`
        declare const x: object | null; if (x) {}
        (x?: { a: number }) => !x;
        <T extends {} | null | undefined>(x: T) => x ? 1 : 0;
      `,
      errors: [
        { messageId: 'conditionErrorNullableObject', line: 2, column: 37 },
        { messageId: 'conditionErrorNullableObject', line: 3, column: 33 },
        { messageId: 'conditionErrorNullableObject', line: 4, column: 52 },
      ],
      output: `
        declare const x: object | null; if (x != null) {}
        (x?: { a: number }) => (x == null);
        <T extends {} | null | undefined>(x: T) => (x != null) ? 1 : 0;
      `,
    }),

    // nullable string in boolean context
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        declare const x: string | null; if (x) {}
        (x?: string) => !x;
        <T extends string | null | undefined>(x: T) => x ? 1 : 0;
      `,
      errors: [
        {
          messageId: 'conditionErrorNullableString',
          line: 2,
          column: 37,
          suggestions: [
            {
              messageId: 'conditionFixDefaultFalsy',
              output: 'declare const x: string | null; if (x ?? "") {}',
            },
            {
              messageId: 'conditionFixCompareNullish',
              output: 'declare const x: string | null; if (x != null) {}',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: 'declare const x: string | null; if (Boolean(x)) {}',
            },
          ],
        },
        {
          messageId: 'conditionErrorNullableString',
          line: 3,
          column: 26,
          suggestions: [
            {
              messageId: 'conditionFixDefaultFalsy',
              output: '        (x?: string) => !(x ?? "");',
            },
            {
              messageId: 'conditionFixCompareNullish',
              output: '        (x?: string) => (x == null);',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: '        (x?: string) => (!Boolean(x));',
            },
          ],
        },
        {
          messageId: 'conditionErrorNullableString',
          line: 4,
          column: 56,
          suggestions: [
            {
              messageId: 'conditionFixDefaultFalsy',
              output:
                '        <T extends string | null | undefined>(x: T) => (x ?? "") ? 1 : 0;',
            },
            {
              messageId: 'conditionFixCompareNullish',
              output:
                '        <T extends string | null | undefined>(x: T) => (x != null) ? 1 : 0;',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output:
                '        <T extends string | null | undefined>(x: T) => (Boolean(x)) ? 1 : 0;',
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
      `,
      errors: [
        {
          messageId: 'conditionErrorNullableNumber',
          line: 2,
          column: 37,
          suggestions: [
            {
              messageId: 'conditionFixDefaultFalsy',
              output: 'declare const x: number | null; if (x ?? 0) {}',
            },
            {
              messageId: 'conditionFixCompareNullish',
              output: 'declare const x: number | null; if (x != null) {}',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: 'declare const x: number | null; if (Boolean(x)) {}',
            },
          ],
        },
        {
          messageId: 'conditionErrorNullableNumber',
          line: 3,
          column: 26,
          suggestions: [
            {
              messageId: 'conditionFixDefaultFalsy',
              output: '        (x?: number) => !(x ?? 0);',
            },
            {
              messageId: 'conditionFixCompareNullish',
              output: '        (x?: number) => (x == null);',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output: '        (x?: number) => (!Boolean(x));',
            },
          ],
        },
        {
          messageId: 'conditionErrorNullableNumber',
          line: 4,
          column: 56,
          suggestions: [
            {
              messageId: 'conditionFixDefaultFalsy',
              output:
                '        <T extends number | null | undefined>(x: T) => (x ?? 0) ? 1 : 0;',
            },
            {
              messageId: 'conditionFixCompareNullish',
              output:
                '        <T extends number | null | undefined>(x: T) => (x != null) ? 1 : 0;',
            },
            {
              messageId: 'conditionFixCastBoolean',
              output:
                '        <T extends number | null | undefined>(x: T) => (Boolean(x)) ? 1 : 0;',
            },
          ],
        },
      ],
    }),

    // any in boolean context
    // TODO: when `T` is not `extends any` then the error is `conditionErrorObject` (says it's always truthy, which is false)
    ...batchedSingleLineTests<MessageId, Options>({
      code: noFormat`
        if (x) {}
        x => !x;
        <T extends any>(x: T) => x ? 1 : 0;
      `,
      errors: [
        {
          messageId: 'conditionErrorAny',
          line: 2,
          column: 5,
          suggestions: [
            {
              messageId: 'conditionFixCastBoolean',
              output: 'if (Boolean(x)) {}',
            },
          ],
        },
        {
          messageId: 'conditionErrorAny',
          line: 3,
          column: 15,
          suggestions: [
            {
              messageId: 'conditionFixCastBoolean',
              output: '        x => !(Boolean(x));',
            },
          ],
        },
        {
          messageId: 'conditionErrorAny',
          line: 4,
          column: 34,
          suggestions: [
            {
              messageId: 'conditionFixCastBoolean',
              output: '        <T extends any>(x: T) => (Boolean(x)) ? 1 : 0;',
            },
          ],
        },
      ],
    }),
    {
      code: `
declare const x: string[] | null;
if (x) {
}
      `,
      errors: [
        {
          messageId: 'noStrictNullCheck',
          line: 0,
          column: 1,
        },
        {
          messageId: 'conditionErrorObject',
          line: 3,
          column: 5,
        },
      ],
      parserOptions: {
        tsconfigRootDir: path.join(rootPath, 'unstrict'),
      },
    },
  ],
});
