import { TSESLint } from '@typescript-eslint/utils';
import rule, {
  MessageIds,
  Options,
} from '../../src/rules/prefer-nullish-coalescing';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

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
      (type, equals) => `
declare let x: ${type};
x ||${equals} 'foo';
      `,
    ),
    ...nullishTypeValidTest(
      (nullish, type) => `
declare let x: ${type} | ${nullish};
x ?? 'foo';
      `,
    ),
    ...nullishTypeValidTest(
      (nullish, type) => `
declare let x: ${type} | ${nullish};
x ??= 'foo';
      `,
    ),

    // ignoreConditionalTests
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
x || 'foo' ? null : null;
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
(x ||= 'foo') ? null : null;
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
if (x || 'foo') {}
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
if (x ||= 'foo') {}
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
do {} while (x || 'foo')
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
for (;x || 'foo';) {}
      `,
      options: [{ ignoreConditionalTests: true }],
    })),
    ...nullishTypeValidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
while (x || 'foo') {}
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
a ||= b && c;
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
a ||= b || c && d;
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
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
x || 'foo';
      `.trimEnd(),
      output: null,
      errors: [
        {
          messageId: 'preferNullishLogical',
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 5,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let x: ${type} | ${nullish};
x ?? 'foo';
              `.trimEnd(),
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
x ||= 'foo';
      `.trimEnd(),
      output: null,
      errors: [
        {
          messageId: 'preferNullishAssignment',
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 6,
          suggestions: [
            {
              messageId: 'suggestNullishAssignment',
              output: `
declare let x: ${type} | ${nullish};
x ??= 'foo';
              `.trimEnd(),
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
x ||= 'foo' ? null : null;
      `.trimEnd(),
      output: null,
      errors: [
        {
          messageId: 'preferNullishAssignment',
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 6,
          suggestions: [
            {
              messageId: 'suggestNullishAssignment',
              output: `
declare let x: ${type} | ${nullish};
x ??= 'foo' ? null : null;
              `.trimEnd(),
            },
          ],
        },
      ],
    })),

    // ignoreConditionalTests
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
x || 'foo' ? null : null;
      `.trimEnd(),
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishLogical',
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 5,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let x: ${type} | ${nullish};
x ?? 'foo' ? null : null;
              `.trimEnd(),
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
if (x || 'foo') {}
      `.trimEnd(),
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishLogical',
          line: 3,
          column: 7,
          endLine: 3,
          endColumn: 9,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let x: ${type} | ${nullish};
if (x ?? 'foo') {}
              `.trimEnd(),
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
if (x ||= 'foo') {}
      `.trimEnd(),
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishAssignment',
          line: 3,
          column: 7,
          endLine: 3,
          endColumn: 10,
          suggestions: [
            {
              messageId: 'suggestNullishAssignment',
              output: `
declare let x: ${type} | ${nullish};
if (x ??= 'foo') {}
              `.trimEnd(),
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
do {} while (x || 'foo')
      `.trimEnd(),
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishLogical',
          line: 3,
          column: 16,
          endLine: 3,
          endColumn: 18,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let x: ${type} | ${nullish};
do {} while (x ?? 'foo')
              `.trimEnd(),
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
do {} while (x ||= 'foo')
      `.trimEnd(),
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishAssignment',
          line: 3,
          column: 16,
          endLine: 3,
          endColumn: 19,
          suggestions: [
            {
              messageId: 'suggestNullishAssignment',
              output: `
declare let x: ${type} | ${nullish};
do {} while (x ??= 'foo')
              `.trimEnd(),
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
for (;x || 'foo';) {}
      `.trimEnd(),
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishLogical',
          line: 3,
          column: 9,
          endLine: 3,
          endColumn: 11,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let x: ${type} | ${nullish};
for (;x ?? 'foo';) {}
              `.trimEnd(),
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
while (x || 'foo') {}
      `.trimEnd(),
      output: null,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullishLogical',
          line: 3,
          column: 10,
          endLine: 3,
          endColumn: 12,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let x: ${type} | ${nullish};
while (x ?? 'foo') {}
              `.trimEnd(),
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
      `.trimEnd(),
      options: [{ ignoreMixedLogicalExpressions: false }],
      errors: [
        {
          messageId: 'preferNullishLogical',
          line: 5,
          column: 3,
          endLine: 5,
          endColumn: 5,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
a ?? b && c;
              `.trimEnd(),
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
a ||= b && c;
      `.trimEnd(),
      options: [{ ignoreMixedLogicalExpressions: false }],
      errors: [
        {
          messageId: 'preferNullishAssignment',
          line: 5,
          column: 3,
          endLine: 5,
          endColumn: 6,
          suggestions: [
            {
              messageId: 'suggestNullishAssignment',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
a ??= b && c;
              `.trimEnd(),
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
      `.trimEnd(),
      options: [{ ignoreMixedLogicalExpressions: false }],
      errors: [
        {
          messageId: 'preferNullishLogical',
          line: 6,
          column: 3,
          endLine: 6,
          endColumn: 5,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
(a ?? b) || c && d;
              `.trimEnd(),
            },
          ],
        },
        {
          messageId: 'preferNullishLogical',
          line: 6,
          column: 8,
          endLine: 6,
          endColumn: 10,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a || b ?? c && d;
              `.trimEnd(),
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
a ||= b || c && d;
      `.trimEnd(),
      options: [{ ignoreMixedLogicalExpressions: false }],
      errors: [
        {
          messageId: 'preferNullishAssignment',
          line: 6,
          column: 3,
          endLine: 6,
          endColumn: 6,
          suggestions: [
            {
              messageId: 'suggestNullishAssignment',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a ??= b || c && d;
              `.trimEnd(),
            },
          ],
        },
        {
          messageId: 'preferNullishLogical',
          line: 6,
          column: 9,
          endLine: 6,
          endColumn: 11,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a ||= b ?? c && d;
              `.trimEnd(),
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
      `.trimEnd(),
      options: [{ ignoreMixedLogicalExpressions: false }],
      errors: [
        {
          messageId: 'preferNullishLogical',
          line: 6,
          column: 8,
          endLine: 6,
          endColumn: 10,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a && (b ?? c) || d;
              `.trimEnd(),
            },
          ],
        },
        {
          messageId: 'preferNullishLogical',
          line: 6,
          column: 13,
          endLine: 6,
          endColumn: 15,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type} | ${nullish};
declare let c: ${type} | ${nullish};
declare let d: ${type} | ${nullish};
a && b || c ?? d;
              `.trimEnd(),
            },
          ],
        },
      ],
    })),

    // should not false positive for functions inside conditional tests
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
if (() => x || 'foo') {}
      `.trimEnd(),
      output: null,
      options: [{ ignoreConditionalTests: true }],
      errors: [
        {
          messageId: 'preferNullishLogical',
          line: 3,
          column: 13,
          endLine: 3,
          endColumn: 15,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let x: ${type} | ${nullish};
if (() => x ?? 'foo') {}
              `.trimEnd(),
            },
          ],
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare let x: ${type} | ${nullish};
if (function werid() { return x || 'foo' }) {}
      `.trimEnd(),
      output: null,
      options: [{ ignoreConditionalTests: true }],
      errors: [
        {
          messageId: 'preferNullishLogical',
          line: 3,
          column: 33,
          endLine: 3,
          endColumn: 35,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let x: ${type} | ${nullish};
if (function werid() { return x ?? 'foo' }) {}
              `.trimEnd(),
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
      `.trimEnd(),
      output: null,
      errors: [
        {
          messageId: 'preferNullishLogical',
          line: 5,
          column: 3,
          endLine: 5,
          endColumn: 5,
          suggestions: [
            {
              messageId: 'suggestNullishLogical',
              output: `
declare let a: ${type} | ${nullish};
declare let b: ${type};
declare let c: ${type};
(a ?? b) || c;
              `.trimEnd(),
            },
          ],
        },
      ],
    })),
  ],
});
