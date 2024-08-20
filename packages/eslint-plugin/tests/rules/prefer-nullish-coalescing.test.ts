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
  cb: (type: string) => ValidTestCase<Options> | string,
): (ValidTestCase<Options> | string)[] {
  return types.map(type => cb(type));
}
function nullishTypeValidTest(
  cb: (nullish: string, type: string) => ValidTestCase<Options> | string,
): (ValidTestCase<Options> | string)[] {
  return nullishTypes.reduce<(ValidTestCase<Options> | string)[]>(
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
  cb: (nullish: string, type: string) => InvalidTestCase<MessageIds, Options>,
): InvalidTestCase<MessageIds, Options>[] {
  return nullishTypes.reduce<InvalidTestCase<MessageIds, Options>[]>(
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
  invalid: [
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
x || 'foo';
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
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
declare const x: string | undefined;
x !== undefined ? x : y;
      `,
      `
declare const x: string | undefined;
undefined !== x ? x : y;
      `,
      `
declare const x: string | undefined;
x === undefined ? y : x;
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
x === null ? y : x;
      `,
      `
declare const x: string | null;
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
      ],
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: path.join(rootPath, 'unstrict'),
        },
      },
      output: null,
    },

    // ignoreConditionalTests
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
x || 'foo' ? null : null;
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
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
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
if (x || 'foo') {}
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
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
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
do {} while (x || 'foo')
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
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
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
for (;x || 'foo';) {}
      `,
      errors: [
        {
          column: 9,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
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
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
while (x || 'foo') {}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
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
      options: [{ ignoreConditionalTests: false }],
      output: null,
    })),

    // ignoreMixedLogicalExpressions
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
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
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
a ?? b && c;
      `,
            },
          ],
        },
      ],
      options: [{ ignoreMixedLogicalExpressions: false }],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
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
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
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
      options: [{ ignoreMixedLogicalExpressions: false }],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
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
          column: 13,
          endColumn: 15,
          endLine: 6,
          line: 6,
          messageId: 'preferNullishOverOr',
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
      options: [{ ignoreMixedLogicalExpressions: false }],
    })),

    // should not false positive for functions inside conditional tests
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
if (() => x || 'foo') {}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
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
      output: null,
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
if (function werid() { return x || 'foo' }) {}
      `,
      errors: [
        {
          column: 33,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'preferNullishOverOr',
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
      output: null,
    })),
    // https://github.com/typescript-eslint/typescript-eslint/issues/1290
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type};
declare const c: ${type};
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
declare const a: ${type} | ${nullish};
declare const b: ${type};
declare const c: ${type};
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
declare const x: string | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: string | undefined;
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
declare const x: number | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: number | undefined;
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
declare const x: boolean | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: boolean | undefined;
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
declare const x: bigint | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: bigint | undefined;
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
declare const x: '' | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: '' | undefined;
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
declare const x: \`\` | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: \`\` | undefined;
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
declare const x: 0 | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: 0 | undefined;
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
declare const x: 0n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: 0n | undefined;
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
declare const x: false | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: false | undefined;
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
declare const x: 'a' | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: 'a' | undefined;
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
declare const x: \`hello\${'string'}\` | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: \`hello\${'string'}\` | undefined;
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
declare const x: 1 | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: 1 | undefined;
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
declare const x: 1n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: 1n | undefined;
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
declare const x: true | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: true | undefined;
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
declare const x: 'a' | 'b' | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: 'a' | 'b' | undefined;
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
declare const x: 'a' | \`b\` | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: 'a' | \`b\` | undefined;
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
declare const x: 0 | 1 | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: 0 | 1 | undefined;
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
declare const x: 1 | 2 | 3 | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: 1 | 2 | 3 | undefined;
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
declare const x: 0n | 1n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: 0n | 1n | undefined;
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
declare const x: 1n | 2n | 3n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: 1n | 2n | 3n | undefined;
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
declare const x: true | false | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: true | false | undefined;
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
declare const x: 0 | 1 | 0n | 1n | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: 0 | 1 | 0n | 1n | undefined;
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
declare const x: true | false | null | undefined;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: true | false | null | undefined;
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
declare const x: null;
x || y;
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
declare const x: null;
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
declare const x: Enum | undefined;
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
declare const x: Enum | undefined;
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
declare const x: Enum.A | Enum.B | undefined;
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
declare const x: Enum.A | Enum.B | undefined;
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
declare const x: Enum | undefined;
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
declare const x: Enum | undefined;
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
declare const x: Enum.A | Enum.B | undefined;
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
declare const x: Enum.A | Enum.B | undefined;
x ?? y;
      `,
            },
          ],
        },
      ],
      output: null,
    },
  ],
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
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
if (x || 'foo') {}
      `,
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
do {} while (x || 'foo')
      `,
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
for (;x || 'foo';) {}
      `,
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
while (x || 'foo') {}
      `,
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
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare const x: ${type} | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { [type]: true } }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare const x: ${type} | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare const x: (${type} & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: { [type]: true } }],
    })),
    ...ignorablePrimitiveTypes.map<ValidTestCase<Options>>(type => ({
      code: `
declare const x: (${type} & { __brand?: any }) | undefined;
x || y;
      `,
      options: [{ ignorePrimitives: true }],
    })),
    `
      declare const x: any;
      declare const y: number;
      x || y;
    `,
    `
      declare const x: unknown;
      declare const y: number;
      x || y;
    `,
    `
      declare const x: never;
      declare const y: number;
      x || y;
    `,
    {
      code: `
declare const x: 0 | 1 | 0n | 1n | undefined;
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
declare const x: 0 | 1 | 0n | 1n | undefined;
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
declare const x: 0 | 'foo' | undefined;
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
declare const x: 0 | 'foo' | undefined;
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
declare const x: Enum | undefined;
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
declare const x: Enum.A | Enum.B | undefined;
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
declare const x: Enum | undefined;
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
declare const x: Enum.A | Enum.B | undefined;
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
});
