import type { TSESLint } from '@typescript-eslint/utils';
import * as path from 'path';

import type {
  MessageIds,
  Options,
} from '../../src/rules/prefer-nullish-coalescing';
import rule from '../../src/rules/prefer-nullish-coalescing';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

const types = ['string', 'number', 'boolean', 'object'];
const nullishTypes = ['null', 'undefined', 'null | undefined'];

function typeValidTest(
  cb: (
    type: string,
    equals: '' | '=',
  ) => TSESLint.ValidTestCase<Options> | string,
): (TSESLint.ValidTestCase<Options> | string)[] {
  return [
    ...types.map(type => cb(type, '')),
    ...types.map(type => cb(type, '=')),
  ];
}

function nullishTypeValidTest(
  cb: (
    nullish: string,
    type: string,
    equals: string,
  ) => TSESLint.ValidTestCase<Options> | string,
): (TSESLint.ValidTestCase<Options> | string)[] {
  return nullishTypes.reduce<(TSESLint.ValidTestCase<Options> | string)[]>(
    (acc, nullish) => {
      types.forEach(type => {
        acc.push(cb(nullish, type, ''), cb(nullish, type, '='));
      });
      return acc;
    },
    [],
  );
}
function nullishTypeInvalidTest(
  cb: (
    nullish: string,
    type: string,
    equals: string,
  ) => TSESLint.InvalidTestCase<MessageIds, Options>,
): TSESLint.InvalidTestCase<MessageIds, Options>[] {
  return nullishTypes.reduce<TSESLint.InvalidTestCase<MessageIds, Options>[]>(
    (acc, nullish) => {
      types.forEach(type => {
        acc.push(cb(nullish, type, ''));
        acc.push(cb(nullish, type, '='));
      });
      return acc;
    },
    [],
  );
}

ruleTester.run('prefer-nullish-coalescing', rule, {
  valid: [
    ...typeValidTest(
      (type, equals) => `
declare let x: ${type};
(x ||${equals} 'foo');
      `,
    ),
    ...nullishTypeValidTest(
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
      `
declare let x: string | undefined;
x === null ? x : y;
      `,
    ].map(code => ({
      code,
      options: [{ ignoreTernaryTests: false }] as const,
    })),

    // ignoreConditionalTests
    ...nullishTypeValidTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
(x ||${equals} 'foo') ? null : null;
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
if ((x ||${equals} 'foo')) {}
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
do {} while ((x ||${equals} 'foo'))
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
for (;(x ||${equals} 'foo');) {}
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
while ((x ||${equals} 'foo')) {}
      `,
      options: [{ ignoreConditionalTests: true }],
    })),

    // ignoreMixedLogicalExpressions
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
a || b && c;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a || b || c && d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a && b || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
  ],
  invalid: [
    ...nullishTypeInvalidTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
(x ||${equals} 'foo');
      `,
      output: null,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 4,
          endLine: 3,
          endColumn: 6 + equals.length,
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
        output: null,
        options: [{ ignoreTernaryTests: false }] as const,
        errors: [
          {
            messageId: 'preferNullishOverTernary' as const,
            line: 1,
            column: 1,
            endLine: 1,
            endColumn: code.length,
            suggestions: [
              {
                messageId: 'suggestNullish' as const,
                output: 'x ?? y;',
              },
            ],
          },
        ],
      },
      {
        code: code.replace(/x/g, 'x.z[1][this[this.o]]["3"][a.b.c]'),
        output: null,
        options: [{ ignoreTernaryTests: false }] as const,
        errors: [
          {
            messageId: 'preferNullishOverTernary' as const,
            line: 1,
            column: 1,
            endLine: 1,
            endColumn: code.replace(/x/g, 'x.z[1][this[this.o]]["3"][a.b.c]')
              .length,
            suggestions: [
              {
                messageId: 'suggestNullish' as const,
                output: 'x.z[1][this[this.o]]["3"][a.b.c] ?? y;',
              },
            ],
          },
        ],
      },
    ]),

    {
      code: 'this != undefined ? this : y;',
      output: null,
      options: [{ ignoreTernaryTests: false }] as const,
      errors: [
        {
          messageId: 'preferNullishOverTernary' as const,
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 29,
          suggestions: [
            {
              messageId: 'suggestNullish' as const,
              output: 'this ?? y;',
            },
          ],
        },
      ],
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
      output: null,
      options: [{ ignoreTernaryTests: false }] as const,
      errors: [
        {
          messageId: 'preferNullishOverTernary' as const,
          line: 3,
          column: 1,
          endLine: 3,
          endColumn: code.split('\n')[2].length,
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
    })),

    // noStrictNullCheck
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
      ],
      parserOptions: {
        tsconfigRootDir: path.join(rootPath, 'unstrict'),
      },
    },

    // ignoreConditionalTests
    ...nullishTypeInvalidTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
(x ||${equals} 'foo') ? null : null;
      `,
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 4,
          endLine: 3,
          endColumn: 6 + equals.length,
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
    })),
    ...nullishTypeInvalidTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
if ((x ||${equals} 'foo')) {}
      `,
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 8,
          endLine: 3,
          endColumn: 10 + equals.length,
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
    })),
    ...nullishTypeInvalidTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
do {} while ((x ||${equals} 'foo'))
      `,
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 17,
          endLine: 3,
          endColumn: 19 + equals.length,
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
    })),
    ...nullishTypeInvalidTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
for (;(x ||${equals} 'foo');) {}
      `,
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 10,
          endLine: 3,
          endColumn: 12 + equals.length,
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
    })),
    ...nullishTypeInvalidTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
while ((x ||${equals} 'foo')) {}
      `,
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 11,
          endLine: 3,
          endColumn: 13 + equals.length,
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
    })),

    // ignoreMixedLogicalExpressions
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
a || b && c;
      `,
      options: [{ ignoreMixedLogicalExpressions: false }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 5,
          column: 3,
          endLine: 5,
          endColumn: 5,
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
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a || b || c && d;
      `,
      options: [{ ignoreMixedLogicalExpressions: false }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 6,
          column: 3,
          endLine: 6,
          endColumn: 5,
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
          messageId: 'preferNullishOverOr',
          line: 6,
          column: 8,
          endLine: 6,
          endColumn: 10,
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
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a && b || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: false }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 6,
          column: 8,
          endLine: 6,
          endColumn: 10,
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
          messageId: 'preferNullishOverOr',
          line: 6,
          column: 13,
          endLine: 6,
          endColumn: 15,
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
    })),

    // should not false positive for functions inside conditional tests
    ...nullishTypeInvalidTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
if (() => (x ||${equals} 'foo')) {}
      `,
      output: null,
      options: [{ ignoreConditionalTests: true }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 14,
          endLine: 3,
          endColumn: 16 + equals.length,
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
    })),
    ...nullishTypeInvalidTest((nullish, type, equals) => ({
      code: `
declare let x: ${type} | ${nullish};
if (function weird() { return (x ||${equals} 'foo') }) {}
      `,
      output: null,
      options: [{ ignoreConditionalTests: true }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 34,
          endLine: 3,
          endColumn: 36 + equals.length,
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
    })),
    // https://github.com/typescript-eslint/typescript-eslint/issues/1290
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let a: ${type} | ${nullish};
declare let b: ${type};
declare let c: ${type};
a || b || c;
      `,
      output: null,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 5,
          column: 3,
          endLine: 5,
          endColumn: 5,
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
    })),
  ],
});
