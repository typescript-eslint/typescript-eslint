import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';

import { RuleTester } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';

import type {
  MessageIds,
  Options,
} from '../../src/rules/prefer-nullish-coalescing';

import rule from '../../src/rules/prefer-nullish-coalescing';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

const types = ['string', 'number', 'boolean', 'object'];
const nullishTypes = ['null', 'undefined', 'null | undefined'];
const ignorablePrimitiveTypes = ['string', 'number', 'boolean', 'bigint'];

function typeValidTest(
  cb: (type: string, equals: '' | '=') => ValidTestCase<Options> | string,
): (ValidTestCase<Options> | string)[] {
  return [
    ...types.map(type => cb(type, '')),
    ...types.map(type => cb(type, '=')),
  ];
}

const nullishTypeTest = <
  T extends
    | InvalidTestCase<MessageIds, Options>
    | ValidTestCase<Options>
    | string,
>(
  cb: (nullish: string, type: string, equals: string) => T,
): T[] =>
  nullishTypes.flatMap(nullish =>
    types.flatMap(type =>
      ['', ...(cb.length === 3 ? ['='] : [])].map(equals =>
        cb(nullish, type, equals),
      ),
    ),
  );

ruleTester.run('prefer-nullish-coalescing', rule, {
  valid: [
    ...typeValidTest(
      (type, equals) => `
declare let x: ${type};
(x ||${equals} 'foo');
      `,
    ),
    ...nullishTypeTest(
      (nullish, type, equals) => `
declare let x: ${type} | ${nullish};
x ??${equals} 'foo';
      `,
    ),

    {
      code: 'x !== undefined && x !== null ? x : y;',
      options: [{ ignoreTernaryTests: true }],
    },

    ...[
      'x !== undefined && x !== null ? "foo" : "bar";',
      'x !== null && x !== undefined && x !== 5 ? x : y',
      'x === null || x === undefined || x === 5 ? x : y',
      'x === undefined && x !== null ? x : y;',
      'x === undefined && x === null ? x : y;',
      'x !== undefined && x === null ? x : y;',
      'x === undefined || x !== null ? x : y;',
      'x === undefined || x === null ? x : y;',
      'x !== undefined || x === null ? x : y;',
      'x !== undefined || x === null ? y : x;',
      'x === null || x === null ? y : x;',
      'x === undefined || x === undefined ? y : x;',
      'x == null ? x : y;',
      'undefined == null ? x : y;',
      'undefined != z ? x : y;',
      'x == undefined ? x : y;',
      'x != null ? y : x;',
      'x != undefined ? y : x;',
      'null == x ? x : y;',
      'undefined == x ? x : y;',
      'null != x ? y : x;',
      'undefined != x ? y : x;',
      `
declare let x: string;
x === null ? x : y;
      `,
      `
declare let x: string | undefined;
x === null ? x : y;
      `,
      `
declare let x: string | null;
x === undefined ? x : y;
      `,
      `
declare let x: string | undefined | null;
x !== undefined ? x : y;
      `,
      `
declare let x: string | undefined | null;
x !== null ? x : y;
      `,
      `
declare let x: string | null | any;
x === null ? x : y;
      `,
      `
declare let x: string | null | unknown;
x === null ? x : y;
      `,
    ].map(code => ({
      code,
      options: [{ ignoreTernaryTests: false }] as const,
    })),

    // ignoreConditionalTests
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
(x ||${equals} 'foo') ? null : null;
      `,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
if ((x ||${equals} 'foo')) {}
      `,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
do {} while ((x ||${equals} 'foo'))
      `,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
for (;(x ||${equals} 'foo');) {}
      `,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
while ((x ||${equals} 'foo')) {}
      `,
    })),

    // ignoreMixedLogicalExpressions
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
a || b && c;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a || b || c && d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a && b || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: ${type} | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { [type]: true } }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: ${type} | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: (${type} & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { [type]: true } }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare let x: (${type} & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    })),
    `
      declare let x: any;
      declare let y: number;
      x || y;
    `,
    `
      declare let x: unknown;
      declare let y: number;
      x || y;
    `,
    `
      declare let x: never;
      declare let y: number;
      x || y;
    `,
    {
      code: `
declare let x: 0 | 1 | 0n | 1n | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 1 | 0n | 1n | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 'foo' | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
            string: true,
          },
        },
      ],
    },
    {
      code: `
declare let x: 0 | 'foo' | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
            string: false,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum.A | Enum.B | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            number: true,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            string: true,
          },
        },
      ],
    },
    {
      code: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum.A | Enum.B | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: {
            string: true,
          },
        },
      ],
    },
  ],
  invalid: [
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
(x ||${equals} 'foo');
      `,
      errors: [
        {
          column: 4,
          endColumn: 6 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
(x ??${equals} 'foo');
      `,
            },
          ],
        },
      ],
      output: null,
    })),

    ...[
      'x !== undefined && x !== null ? x : y;',
      'x !== null && x !== undefined ? x : y;',
      'x === undefined || x === null ? y : x;',
      'x === null || x === undefined ? y : x;',
      'undefined !== x && x !== null ? x : y;',
      'null !== x && x !== undefined ? x : y;',
      'undefined === x || x === null ? y : x;',
      'null === x || x === undefined ? y : x;',
      'x !== undefined && null !== x ? x : y;',
      'x !== null && undefined !== x ? x : y;',
      'x === undefined || null === x ? y : x;',
      'x === null || undefined === x ? y : x;',
      'undefined !== x && null !== x ? x : y;',
      'null !== x && undefined !== x ? x : y;',
      'undefined === x || null === x ? y : x;',
      'null === x || undefined === x ? y : x;',
      'x != undefined && x != null ? x : y;',
      'x == undefined || x == null ? y : x;',
      'x != undefined && x !== null ? x : y;',
      'x == undefined || x === null ? y : x;',
      'x !== undefined && x != null ? x : y;',
      'undefined != x ? x : y;',
      'null != x ? x : y;',
      'undefined == x ? y : x;',
      'null == x ? y : x;',
      'x != undefined ? x : y;',
      'x != null ? x : y;',
      'x == undefined  ? y : x;',
      'x == null ? y : x;',
    ].flatMap(code => [
      {
        code,
        errors: [
          {
            column: 1,
            endColumn: code.length,
            endLine: 1,
            line: 1,
            messageId: 'preferNullishOverTernary' as const,
            suggestions: [
              {
                messageId: 'suggestNullish' as const,
                output: 'x ?? y;',
              },
            ],
          },
        ],
        options: [{ ignoreTernaryTests: false }] as const,
        output: null,
      },
      {
        code: code.replaceAll('x', 'x.z[1][this[this.o]]["3"][a.b.c]'),
        errors: [
          {
            column: 1,
            endColumn: code.replaceAll('x', 'x.z[1][this[this.o]]["3"][a.b.c]')
              .length,
            endLine: 1,
            line: 1,
            messageId: 'preferNullishOverTernary' as const,
            suggestions: [
              {
                messageId: 'suggestNullish' as const,
                output: 'x.z[1][this[this.o]]["3"][a.b.c] ?? y;',
              },
            ],
          },
        ],
        options: [{ ignoreTernaryTests: false }] as const,
        output: null,
      },
      {
        code: code.replaceAll('y', '(z = y)'),
        errors: [
          {
            column: 1,
            endColumn: code.replaceAll('y', '(z = y)').length,
            endLine: 1,
            line: 1,
            messageId: 'preferNullishOverTernary' as const,
            suggestions: [
              {
                messageId: 'suggestNullish' as const,
                output: 'x ?? (z = y);',
              },
            ],
          },
        ],
        options: [{ ignoreTernaryTests: false }] as const,
        output: null,
      },
    ]),

    {
      code: 'this != undefined ? this : y;',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferNullishOverTernary' as const,
          suggestions: [
            {
              messageId: 'suggestNullish' as const,
              output: 'this ?? y;',
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }] as const,
      output: null,
    },

    ...[
      `
declare let x: string | undefined;
x !== undefined ? x : y;
      `,
      `
declare let x: string | undefined;
undefined !== x ? x : y;
      `,
      `
declare let x: string | undefined;
undefined === x ? y : x;
      `,
      `
declare let x: string | undefined;
undefined === x ? y : x;
      `,
      `
declare let x: string | null;
x !== null ? x : y;
      `,
      `
declare let x: string | null;
null !== x ? x : y;
      `,
      `
declare let x: string | null;
null === x ? y : x;
      `,
      `
declare let x: string | null;
null === x ? y : x;
      `,
    ].map(code => ({
      code,
      errors: [
        {
          column: 1,
          endColumn: code.split('\n')[2].length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverTernary' as const,
          suggestions: [
            {
              messageId: 'suggestNullish' as const,
              output: `
${code.split('\n')[1]}
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreTernaryTests: false }] as const,
      output: null,
    })),

    // noStrictNullCheck
    {
      code: `
declare let x: string[] | null;
if (x) {
}
      `,
      errors: [
        {
          column: 1,
          line: 0,
          messageId: 'noStrictNullCheck',
        },
      ],
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: path.join(rootPath, 'unstrict'),
        },
      },
      output: null,
    },

    // ignoreConditionalTests
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
(x ||${equals} 'foo') ? null : null;
      `,
      errors: [
        {
          column: 4,
          endColumn: 6 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
(x ??${equals} 'foo') ? null : null;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
if ((x ||${equals} 'foo')) {}
      `,
      errors: [
        {
          column: 8,
          endColumn: 10 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
if ((x ??${equals} 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
do {} while ((x ||${equals} 'foo'))
      `,
      errors: [
        {
          column: 17,
          endColumn: 19 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
do {} while ((x ??${equals} 'foo'))
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
for (;(x ||${equals} 'foo');) {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
for (;(x ??${equals} 'foo');) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
while ((x ||${equals} 'foo')) {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 13 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
while ((x ??${equals} 'foo')) {}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),

    // ignoreMixedLogicalExpressions
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
a || b && c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
a ?? b && c;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    })),
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a || b || c && d;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
(a ?? b) || c && d;
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a || b ?? c && d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    })),
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a && b || c || d;
      `,
      errors: [
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a && (b ?? c) || d;
      `,
            },
          ],
        },
        {
          column: 13,
          endColumn: 15,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a && b || c ?? d;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    })),

    // should not false positive for functions inside conditional tests
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
if (() => (x ||${equals} 'foo')) {}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
if (() => (x ??${equals} 'foo')) {}
      `,
            },
          ],
        },
      ],
      output: null,
    })),
    ...nullishTypeTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
if (function weird() { return (x ||${equals} 'foo') }) {}
      `,
      errors: [
        {
          column: 34,
          endColumn: 36 + equals.length,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: ${type} | ${nullish};
if (function weird() { return (x ??${equals} 'foo') }) {}
      `,
            },
          ],
        },
      ],
      output: null,
    })),
    // https://github.com/typescript-eslint/typescript-eslint/issues/1290
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type};
declare let c: ${type};
a || b || c;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type};
declare let c: ${type};
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
      output: null,
    })),
    // default for missing option
    {
      code: `
declare let x: string | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: string | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: { bigint: true, boolean: true, number: true },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: number | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: number | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: { bigint: true, boolean: true, string: true },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: boolean | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: boolean | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: { bigint: true, number: true, string: true },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: bigint | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: bigint | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: { boolean: true, number: true, string: true },
        },
      ],
      output: null,
    },
    // falsy
    {
      code: `
declare let x: '' | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: '' | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: \`\` | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: \`\` | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0 | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: false | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: false | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    // truthy
    {
      code: `
declare let x: 'a' | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 'a' | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: \`hello\${'string'}\` | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: \`hello\${'string'}\` | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1 | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: true | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: true | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    // Unions of same primitive
    {
      code: `
declare let x: 'a' | 'b' | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 'a' | 'b' | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 'a' | \`b\` | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 'a' | \`b\` | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: true,
            string: false,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0 | 1 | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0 | 1 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1 | 2 | 3 | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1 | 2 | 3 | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 0n | 1n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0n | 1n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: 1n | 2n | 3n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 1n | 2n | 3n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: true | false | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: true | false | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    // Mixed unions
    {
      code: `
declare let x: 0 | 1 | 0n | 1n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: 0 | 1 | 0n | 1n | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: false,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: true | false | null | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: true | false | null | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignorePrimitives: {
            bigint: true,
            boolean: false,
            number: true,
            string: true,
          },
        },
      ],
      output: null,
    },
    {
      code: `
declare let x: null;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare let x: null;
x ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
const x = undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
const x = undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
null || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
null ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
undefined || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
undefined ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum.A | Enum.B | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
enum Enum {
  A = 0,
  B = 1,
  C = 2,
}
declare let x: Enum.A | Enum.B | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum.A | Enum.B | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}
declare let x: Enum.A | Enum.B | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
  ],
});
