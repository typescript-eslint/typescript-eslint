import * as path from 'node:path';

import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import { RuleTester } from '@typescript-eslint/rule-tester';

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
      tsconfigRootDir: rootPath,
      project: './tsconfig.json',
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
function nullishTypeTest<
  T extends
    | ValidTestCase<Options>
    | InvalidTestCase<MessageIds, Options>
    | string,
>(cb: (nullish: string, type: string) => T): T[] {
  return nullishTypes.flatMap(nullish => types.map(type => cb(nullish, type)));
}

ruleTester.run('prefer-nullish-coalescing', rule, {
  valid: [
    ...typeValidTest(
      type => `
declare const x: ${type};
x || 'foo';
      `,
    ),
    ...nullishTypeTest(
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
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
x || 'foo' ? null : null;
      `,
    })),
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
if (x || 'foo') {}
      `,
    })),
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
do {} while (x || 'foo')
      `,
    })),
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
for (;x || 'foo';) {}
      `,
    })),
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
while (x || 'foo') {}
      `,
    })),

    // ignoreMixedLogicalExpressions
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
a || b && c;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
a || b || c && d;
      `,
      options: [{ ignoreMixedLogicalExpressions: true }],
    })),
    ...nullishTypeTest((nullish, type) => ({
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
            string: true,
            number: false,
            boolean: true,
            bigint: true,
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
            string: true,
            number: true,
            boolean: true,
            bigint: false,
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
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(a || b);
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean(a || b || c);
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean(a || (b && c));
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean((a || b) ?? c);
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean(a ?? (b || c));
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean(a ? b || c : 'fail');
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean(a ? 'success' : b || c);
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

const test = Boolean(((a = b), b || c));
      `,
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if (a || b || c) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if (a || (b && c)) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if ((a || b) ?? c) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if (a ?? (b || c)) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if (a ? b || c : 'fail') {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if (a ? 'success' : b || c) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
    {
      code: `
let a: string | boolean | undefined;
let b: string | boolean | undefined;
let c: string | boolean | undefined;

if (((a = b), b || c)) {
}
      `,
      options: [
        {
          ignoreConditionalTests: true,
        },
      ],
    },
  ],
  invalid: [
    ...nullishTypeTest((nullish, type) => ({
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
        code: code.replaceAll('x', 'x.z[1][this[this.o]]["3"][a.b.c]'),
        output: null,
        options: [{ ignoreTernaryTests: false }] as const,
        errors: [
          {
            messageId: 'preferNullishOverTernary' as const,
            line: 1,
            column: 1,
            endLine: 1,
            endColumn: code.replaceAll('x', 'x.z[1][this[this.o]]["3"][a.b.c]')
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
      {
        code: code.replaceAll('y', '(z = y)'),
        output: null,
        options: [{ ignoreTernaryTests: false }] as const,
        errors: [
          {
            messageId: 'preferNullishOverTernary' as const,
            line: 1,
            column: 1,
            endLine: 1,
            endColumn: code.replaceAll('y', '(z = y)').length,
            suggestions: [
              {
                messageId: 'suggestNullish' as const,
                output: 'x ?? (z = y);',
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
      output: null,
      errors: [
        {
          messageId: 'noStrictNullCheck',
          line: 0,
          column: 1,
        },
      ],
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: path.join(rootPath, 'unstrict'),
        },
      },
    },

    // ignoreConditionalTests
    ...nullishTypeTest((nullish, type) => ({
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
    ...nullishTypeTest((nullish, type) => ({
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
    ...nullishTypeTest((nullish, type) => ({
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
    ...nullishTypeTest((nullish, type) => ({
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
    ...nullishTypeTest((nullish, type) => ({
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
    ...nullishTypeTest((nullish, type) => ({
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
    ...nullishTypeTest((nullish, type) => ({
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
    ...nullishTypeTest((nullish, type) => ({
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
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
if (() => x || 'foo') {}
      `,
      output: null,
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
    ...nullishTypeTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
if (function werid() { return x || 'foo' }) {}
      `,
      output: null,
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
    ...nullishTypeTest((nullish, type) => ({
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
    // default for missing option
    {
      code: `
declare const x: string | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: { number: true, boolean: true, bigint: true },
        },
      ],
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
    },
    {
      code: `
declare const x: number | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: { string: true, boolean: true, bigint: true },
        },
      ],
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
    },
    {
      code: `
declare const x: boolean | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: { string: true, number: true, bigint: true },
        },
      ],
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
    },
    {
      code: `
declare const x: bigint | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: { string: true, number: true, boolean: true },
        },
      ],
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
    },
    // falsy
    {
      code: `
declare const x: '' | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: false,
            number: true,
            boolean: true,
            bigint: true,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: \`\` | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: false,
            number: true,
            boolean: true,
            bigint: true,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: 0 | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: true,
            number: false,
            boolean: true,
            bigint: true,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: 0n | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: true,
            number: true,
            boolean: true,
            bigint: false,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: false | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: true,
            number: true,
            boolean: false,
            bigint: true,
          },
        },
      ],
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
    },
    // truthy
    {
      code: `
declare const x: 'a' | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: false,
            number: true,
            boolean: true,
            bigint: true,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: \`hello\${'string'}\` | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: false,
            number: true,
            boolean: true,
            bigint: true,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: 1 | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: true,
            number: false,
            boolean: true,
            bigint: true,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: 1n | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: true,
            number: true,
            boolean: true,
            bigint: false,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: true | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: true,
            number: true,
            boolean: false,
            bigint: true,
          },
        },
      ],
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
    },
    // Unions of same primitive
    {
      code: `
declare const x: 'a' | 'b' | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: false,
            number: true,
            boolean: true,
            bigint: true,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: 'a' | \`b\` | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: false,
            number: true,
            boolean: true,
            bigint: true,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: 0 | 1 | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: true,
            number: false,
            boolean: true,
            bigint: true,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: 1 | 2 | 3 | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: true,
            number: false,
            boolean: true,
            bigint: true,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: 0n | 1n | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: true,
            number: true,
            boolean: true,
            bigint: false,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: 1n | 2n | 3n | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: true,
            number: true,
            boolean: true,
            bigint: false,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: true | false | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: true,
            number: true,
            boolean: false,
            bigint: true,
          },
        },
      ],
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
    },
    // Mixed unions
    {
      code: `
declare const x: 0 | 1 | 0n | 1n | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: true,
            number: false,
            boolean: true,
            bigint: false,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: true | false | null | undefined;
x || y;
      `,
      output: null,
      options: [
        {
          ignorePrimitives: {
            string: true,
            number: true,
            boolean: false,
            bigint: true,
          },
        },
      ],
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
    },
    {
      code: `
declare const x: null;
x || y;
      `,
      output: null,
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
    },
    {
      code: `
const x = undefined;
x || y;
      `,
      output: null,
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
    },
    {
      code: `
null || y;
      `,
      output: null,
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
    },
    {
      code: `
undefined || y;
      `,
      output: null,
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
      output: null,
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
      output: null,
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
      output: null,
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
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;
let c: boolean | undefined;

const x = Boolean(a || b);
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;
let c: boolean | undefined;

const x = Boolean(a ?? b);
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreBooleanCoercion: false,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = String(a || b);
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = String(a ?? b);
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(() => a || b);
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(() => a ?? b);
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(function weird() {
  return a || b;
});
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(function weird() {
  return a ?? b;
});
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

declare function f(x: unknown): unknown;

const x = Boolean(f(a || b));
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;

declare function f(x: unknown): unknown;

const x = Boolean(f(a ?? b));
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(1 + (a || b));
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;

const x = Boolean(1 + (a ?? b));
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
    {
      code: `
let a: string | true | undefined;
let b: string | boolean | undefined;

declare function f(x: unknown): unknown;

if (f(a || b)) {
}
      `,
      errors: [
        {
          messageId: 'preferNullishOverOr',
          suggestions: [
            {
              messageId: 'suggestNullish',
              output: `
let a: string | true | undefined;
let b: string | boolean | undefined;

declare function f(x: unknown): unknown;

if (f(a ?? b)) {
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          ignoreBooleanCoercion: true,
        },
      ],
    },
  ],
});
