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
      output: '// @ts-expect-error',
      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-ignore: Suppress next line',
      output: '// @ts-expect-error: Suppress next line',

      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '///@ts-ignore: Suppress next line',
      output: '///@ts-expect-error: Suppress next line',
      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
if (false) {
  // @ts-ignore: Unreachable code error
  console.log('hello');
}
      `,
      output: `
if (false) {
  // @ts-expect-error: Unreachable code error
  console.log('hello');
}
      `,
      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 3,
          column: 3,
        },
      ],
    },
    {
      code: '/* @ts-ignore */',
      output: '/* @ts-expect-error */',
      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
/**
 * Explaining comment
 *
 * @ts-ignore */
      `,
      output: `
/**
 * Explaining comment
 *
 * @ts-expect-error */
      `,
      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: '/* @ts-ignore in a single block */',
      output: '/* @ts-expect-error in a single block */',
      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
/*
// @ts-ignore in a block with single line comments */
      `,
      output: `
/*
// @ts-expect-error in a block with single line comments */
      `,
      errors: [
        {
          messageId: 'preferExpectErrorComment',
          line: 2,
          column: 1,
        },
      ],
    },
  ],
});
