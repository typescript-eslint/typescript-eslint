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
    '/* @ts-ignore */',
    '/** @ts-ignore */',
    `
/*
// @ts-ignore in a block
*/
    `,
    '// @ts-expect-error',
    `
if (false) {
  // @ts-expect-error: Unreachable code error
  console.log('hello');
}
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
      code: '/////@ts-ignore: Suppress next line',
      output: '/////@ts-expect-error: Suppress next line',
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
  ],
});
