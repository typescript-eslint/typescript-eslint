import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-ts-expect-error';

const ruleTester = new RuleTester();

ruleTester.run('prefer-ts-expect-error', rule, {
  valid: [
    '// @ts-nocheck',
    '// @ts-check',
    '// just a comment containing @ts-ignore somewhere',
    `
{
  /*
        just a comment containing @ts-ignore somewhere in a block
      */
}
    `,
    '// @ts-expect-error',
    `
if (false) {
  // @ts-expect-error: Unreachable code error
  console.log('hello');
}
    `,
    `
/**
 * Explaining comment
 *
 * @ts-expect-error
 *
 * Not last line
 * */
    `,
  ],
  invalid: [
    {
      code: '// @ts-ignore',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'preferExpectErrorComment',
        },
      ],
      output: '// @ts-expect-error',
    },
    {
      code: '// @ts-ignore: Suppress next line',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'preferExpectErrorComment',
        },
      ],

      output: '// @ts-expect-error: Suppress next line',
    },
    {
      code: '///@ts-ignore: Suppress next line',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'preferExpectErrorComment',
        },
      ],
      output: '///@ts-expect-error: Suppress next line',
    },
    {
      code: `
if (false) {
  // @ts-ignore: Unreachable code error
  console.log('hello');
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'preferExpectErrorComment',
        },
      ],
      output: `
if (false) {
  // @ts-expect-error: Unreachable code error
  console.log('hello');
}
      `,
    },
    {
      code: '/* @ts-ignore */',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'preferExpectErrorComment',
        },
      ],
      output: '/* @ts-expect-error */',
    },
    {
      code: `
/**
 * Explaining comment
 *
 * @ts-ignore */
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'preferExpectErrorComment',
        },
      ],
      output: `
/**
 * Explaining comment
 *
 * @ts-expect-error */
      `,
    },
    {
      code: '/* @ts-ignore in a single block */',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'preferExpectErrorComment',
        },
      ],
      output: '/* @ts-expect-error in a single block */',
    },
    {
      code: `
/*
// @ts-ignore in a block with single line comments */
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'preferExpectErrorComment',
        },
      ],
      output: `
/*
// @ts-expect-error in a block with single line comments */
      `,
    },
    // Tests for ECMAScript line terminators (fixes #12353)
    {
      // CR line terminator
      code: noFormat`/* first line\r * @ts-ignore */`,
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'preferExpectErrorComment',
        },
      ],
      output: '/* first line\r * @ts-expect-error */',
    },
    {
      // Line Separator (U+2028)
      code: '/* first line\u2028 * @ts-ignore */',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'preferExpectErrorComment',
        },
      ],
      output: '/* first line\u2028 * @ts-expect-error */',
    },
    {
      // Paragraph Separator (U+2029)
      code: '/* first line\u2029 * @ts-ignore */',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'preferExpectErrorComment',
        },
      ],
      output: '/* first line\u2029 * @ts-expect-error */',
    },
    {
      // CRLF line terminator
      code: noFormat`/* first line\r\n * @ts-ignore */`,
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'preferExpectErrorComment',
        },
      ],
      output: '/* first line\r\n * @ts-expect-error */',
    },
  ],
});
