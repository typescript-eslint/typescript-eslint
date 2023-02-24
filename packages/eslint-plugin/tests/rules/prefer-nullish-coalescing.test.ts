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
const ignorablePrimitiveTypes = ['string', 'number', 'boolean'];

function typeValidTest(
  cb: (type: string) => TSESLint.ValidTestCase<Options> | string,
): (TSESLint.ValidTestCase<Options> | string)[] {
  return types.map(type => cb(type));
}
function nullishTypeValidTest(
  cb: (
    nullish: string,
    type: string,
  ) => TSESLint.ValidTestCase<Options> | string,
): (TSESLint.ValidTestCase<Options> | string)[] {
  return nullishTypes.reduce<(TSESLint.ValidTestCase<Options> | string)[]>(
    (acc, nullish) => {
      types.forEach(type => {
        acc.push(cb(nullish, type));
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
  ) => TSESLint.InvalidTestCase<MessageIds, Options>,
): TSESLint.InvalidTestCase<MessageIds, Options>[] {
  return nullishTypes.reduce<TSESLint.InvalidTestCase<MessageIds, Options>[]>(
    (acc, nullish) => {
      types.forEach(type => {
        acc.push(cb(nullish, type));
      });
      return acc;
    },
    [],
  );
}

ruleTester.run('prefer-nullish-coalescing', rule, {
  valid: [
    ...typeValidTest(
      type => `
declare const x: ${type};
x || 'foo';
      `,
    ),
    ...nullishTypeValidTest(
      (nullish, type) => `
declare const x: ${type} | ${nullish};
x ?? 'foo';
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
declare const x: string;
x === null ? x : y;
      `,
      `
declare const x: string | undefined;
x === null ? x : y;
      `,
      `
declare const x: string | null;
x === undefined ? x : y;
      `,
      `
declare const x: string | undefined | null;
x !== undefined ? x : y;
      `,
      `
declare const x: string | undefined | null;
x !== null ? x : y;
      `,
      `
declare const x: string | null | any;
x === null ? x : y;
      `,
      `
declare const x: string | null | unknown;
x === null ? x : y;
      `,
      `
declare const x: string | undefined;
x === null ? x : y;
      `,
    ].map(code => ({
      code,
      options: [{ ignoreTernaryTests: false }] as const,
    })),

    // ignoreConditionalTests
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
x || 'foo' ? null : null;
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
if (x || 'foo') {}
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
do {} while (x || 'foo')
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
for (;x || 'foo';) {}
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
while (x || 'foo') {}
      `,
      options: [{ ignoreConditionalTests: true }],
    })),

    // ignoreMixedLogicalExpressions
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
a || b && c;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
a || b || c && d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
a && b || c || d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
    ...ignorablePrimitiveTypes.map<TSESLint.ValidTestCase<Options>>(type => ({
      code: `
declare const x: ${type} | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { [type]: true } }],
    })),
  ],
  invalid: [
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
x || 'foo';
      `,
      output: null,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 5,
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: ${type} | ${nullish};
x ?? 'foo';
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
declare const x: string | undefined;
x !== undefined ? x : y;
      `,
      `
declare const x: string | undefined;
undefined !== x ? x : y;
      `,
      `
declare const x: string | undefined;
undefined === x ? y : x;
      `,
      `
declare const x: string | undefined;
undefined === x ? y : x;
      `,
      `
declare const x: string | null;
x !== null ? x : y;
      `,
      `
declare const x: string | null;
null !== x ? x : y;
      `,
      `
declare const x: string | null;
null === x ? y : x;
      `,
      `
declare const x: string | null;
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
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
x || 'foo' ? null : null;
      `,
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 5,
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: ${type} | ${nullish};
x ?? 'foo' ? null : null;
      `,
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
if (x || 'foo') {}
      `,
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 7,
          endLine: 3,
          endColumn: 9,
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: ${type} | ${nullish};
if (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
do {} while (x || 'foo')
      `,
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 16,
          endLine: 3,
          endColumn: 18,
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: ${type} | ${nullish};
do {} while (x ?? 'foo')
      `,
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
for (;x || 'foo';) {}
      `,
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 9,
          endLine: 3,
          endColumn: 11,
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: ${type} | ${nullish};
for (;x ?? 'foo';) {}
      `,
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
while (x || 'foo') {}
      `,
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 10,
          endLine: 3,
          endColumn: 12,
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: ${type} | ${nullish};
while (x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
    })),

    // ignoreMixedLogicalExpressions
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
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
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
a ?? b && c;
      `,
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
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
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
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
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
a || b ?? c && d;
      `,
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
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
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
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
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
a && b || c ?? d;
      `,
            },
          ],
        },
      ],
    })),

    // should not false positive for functions inside conditional tests
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
if (() => x || 'foo') {}
      `,
      output: null,
      options: [{ ignoreConditionalTests: true }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 13,
          endLine: 3,
          endColumn: 15,
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: ${type} | ${nullish};
if (() => x ?? 'foo') {}
      `,
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
if (function werid() { return x || 'foo' }) {}
      `,
      output: null,
      options: [{ ignoreConditionalTests: true }],
      errors: [
        {
          messageId: 'preferNullishOverOr',
          line: 3,
          column: 33,
          endLine: 3,
          endColumn: 35,
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: ${type} | ${nullish};
if (function werid() { return x ?? 'foo' }) {}
      `,
            },
          ],
        },
      ],
    })),
    // https://github.com/typescript-eslint/typescript-eslint/issues/1290
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type};
declare const c: ${type};
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
declare const a: ${type} | ${nullish};
declare const b: ${type};
declare const c: ${type};
(a ?? b) || c;
      `,
            },
          ],
        },
      ],
    })),
    ...ignorablePrimitiveTypes.map<
      TSESLint.InvalidTestCase<MessageIds, Options>
    >(ignoreablePrimitive => ({
      code: `
declare const x: ${ignoreablePrimitive} | undefined;
x || y;
      `,
      options: [
        {
          ignorePrimitives: Object.fromEntries(
            ignorablePrimitiveTypes
              .filter(t => t !== ignoreablePrimitive)
              .map(t => [t, true]),
          ),
        },
      ],
      errors: [
        {
          messageId: 'preferNullishOverOr',
        },
      ],
    })),
  ],
});
