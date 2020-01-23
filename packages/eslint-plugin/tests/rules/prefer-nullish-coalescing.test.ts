import { TSESLint } from '@typescript-eslint/experimental-utils';
import path from 'path';
import rule, {
  MessageIds,
  Options,
} from '../../src/rules/prefer-nullish-coalescing';
import { RuleTester } from '../RuleTester';

const rootPath = path.join(process.cwd(), 'tests/fixtures/');

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
  ],
  invalid: [
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
x || 'foo';
      `,
      output: `
declare const x: ${type} | ${nullish};
x ?? 'foo';
      `,
      errors: [
        {
          messageId: 'preferNullish',
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 5,
        },
      ],
    })),

    // ignoreConditionalTests
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
x || 'foo' ? null : null;
      `,
      output: `
declare const x: ${type} | ${nullish};
x ?? 'foo' ? null : null;
      `,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullish',
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 5,
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
if (x || 'foo') {}
      `,
      output: `
declare const x: ${type} | ${nullish};
if (x ?? 'foo') {}
      `,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullish',
          line: 3,
          column: 7,
          endLine: 3,
          endColumn: 9,
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
do {} while (x || 'foo')
      `,
      output: `
declare const x: ${type} | ${nullish};
do {} while (x ?? 'foo')
      `,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullish',
          line: 3,
          column: 16,
          endLine: 3,
          endColumn: 18,
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
for (;x || 'foo';) {}
      `,
      output: `
declare const x: ${type} | ${nullish};
for (;x ?? 'foo';) {}
      `,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullish',
          line: 3,
          column: 9,
          endLine: 3,
          endColumn: 11,
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
while (x || 'foo') {}
      `,
      output: `
declare const x: ${type} | ${nullish};
while (x ?? 'foo') {}
      `,
      options: [{ ignoreConditionalTests: false }],
      errors: [
        {
          messageId: 'preferNullish',
          line: 3,
          column: 10,
          endLine: 3,
          endColumn: 12,
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
      `.trimRight(),
      options: [{ ignoreMixedLogicalExpressions: false }],
      errors: [
        {
          messageId: 'preferNullish',
          line: 5,
          column: 3,
          endLine: 5,
          endColumn: 5,
          suggestions: [
            {
              messageId: 'preferNullish',
              output: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
a ?? b && c;
              `.trimRight(),
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
      `.trimRight(),
      options: [{ ignoreMixedLogicalExpressions: false }],
      errors: [
        {
          messageId: 'preferNullish',
          line: 6,
          column: 3,
          endLine: 6,
          endColumn: 5,
          suggestions: [
            {
              messageId: 'preferNullish',
              output: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
(a ?? b) || c && d;
              `.trimRight(),
            },
          ],
        },
        {
          messageId: 'preferNullish',
          line: 6,
          column: 8,
          endLine: 6,
          endColumn: 10,
          suggestions: [
            {
              messageId: 'preferNullish',
              output: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
a || b ?? c && d;
              `.trimRight(),
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
      `.trimRight(),
      options: [{ ignoreMixedLogicalExpressions: false }],
      errors: [
        {
          messageId: 'preferNullish',
          line: 6,
          column: 8,
          endLine: 6,
          endColumn: 10,
          suggestions: [
            {
              messageId: 'preferNullish',
              output: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
a && (b ?? c) || d;
              `.trimRight(),
            },
          ],
        },
        {
          messageId: 'preferNullish',
          line: 6,
          column: 13,
          endLine: 6,
          endColumn: 15,
          suggestions: [
            {
              messageId: 'preferNullish',
              output: `
declare const a: ${type} | ${nullish};
declare const b: ${type} | ${nullish};
declare const c: ${type} | ${nullish};
declare const d: ${type} | ${nullish};
a && b || c ?? d;
              `.trimRight(),
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
      output: `
declare const x: ${type} | ${nullish};
if (() => x ?? 'foo') {}
      `,
      options: [{ ignoreConditionalTests: true }],
      errors: [
        {
          messageId: 'preferNullish',
          line: 3,
          column: 13,
          endLine: 3,
          endColumn: 15,
        },
      ],
    })),
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const x: ${type} | ${nullish};
if (function werid() { return x || 'foo' }) {}
      `,
      output: `
declare const x: ${type} | ${nullish};
if (function werid() { return x ?? 'foo' }) {}
      `,
      options: [{ ignoreConditionalTests: true }],
      errors: [
        {
          messageId: 'preferNullish',
          line: 3,
          column: 33,
          endLine: 3,
          endColumn: 35,
        },
      ],
    })),

    // testing the suggestion fixer option
    {
      code: `
declare const x: string | null;
x || 'foo';
      `.trimRight(),
      output: null,
      options: [{ forceSuggestionFixer: true }],
      errors: [
        {
          messageId: 'preferNullish',
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 5,
          suggestions: [
            {
              messageId: 'preferNullish',
              output: `
declare const x: string | null;
x ?? 'foo';
              `.trimRight(),
            },
          ],
        },
      ],
    },

    // https://github.com/typescript-eslint/typescript-eslint/issues/1290
    ...nullishTypeInvalidTest((nullish, type) => ({
      code: `
declare const a: ${type} | ${nullish};
declare const b: ${type};
declare const c: ${type};
a || b || c;
      `.trimRight(),
      output: `
declare const a: ${type} | ${nullish};
declare const b: ${type};
declare const c: ${type};
(a ?? b) || c;
      `.trimRight(),
      errors: [
        {
          messageId: 'preferNullish',
          line: 5,
          column: 3,
          endLine: 5,
          endColumn: 5,
        },
      ],
    })),
  ],
});
