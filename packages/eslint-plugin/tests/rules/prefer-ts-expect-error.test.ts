import rule from '../../src/rules/prefer-ts-expect-error';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
          messageId: 'preferExpectErrorComment',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'preferExpectErrorComment',
              output: '// @ts-expect-error',
            },
          ],
        },
      ],
    },
    {
      code: '// @ts-ignore: Suppress next line',

      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'preferExpectErrorComment',
              output: '// @ts-expect-error: Suppress next line',
            },
          ],
        },
      ],
    },
    {
      code: '///@ts-ignore: Suppress next line',
      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'preferExpectErrorComment',
              output: '///@ts-expect-error: Suppress next line',
            },
          ],
        },
      ],
    },
    {
      code: `
if (false) {
  // @ts-ignore: Unreachable code error
  console.log('hello');
}
      `.trimRight(),
      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 3,
          column: 3,
          suggestions: [
            {
              messageId: 'preferExpectErrorComment',
              output: `
if (false) {
  // @ts-expect-error: Unreachable code error
  console.log('hello');
}
              `.trimRight(),
            },
          ],
        },
      ],
    },
    {
      code: '/* @ts-ignore */',
      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'preferExpectErrorComment',
              output: '/* @ts-expect-error */',
            },
          ],
        },
      ],
    },
    {
      code: `
/**
 * Explaining comment
 *
 * @ts-ignore */
      `.trimRight(),
      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 2,
          column: 1,
          suggestions: [
            {
              messageId: 'preferExpectErrorComment',
              output: `
/**
 * Explaining comment
 *
 * @ts-expect-error */
              `.trimRight(),
            },
          ],
        },
      ],
    },
    {
      code: '/* @ts-ignore in a single block */',
      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'preferExpectErrorComment',
              output: '/* @ts-expect-error in a single block */',
            },
          ],
        },
      ],
    },
    {
      code: `
/*
// @ts-ignore in a block with single line comments */
      `.trimRight(),
      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 2,
          column: 1,
          suggestions: [
            {
              messageId: 'preferExpectErrorComment',
              output: `
/*
// @ts-expect-error in a block with single line comments */
              `.trimRight(),
            },
          ],
        },
      ],
    },
  ],
});
