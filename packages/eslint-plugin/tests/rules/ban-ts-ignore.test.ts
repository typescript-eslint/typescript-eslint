import rule from '../../src/rules/ban-ts-ignore';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('ban-ts-ignore', rule, {
  valid: [
    `// just a comment containing @ts-ignore somewhere`,
    `/* @ts-ignore */`,
    `/** @ts-ignore */`,
    `/*
// @ts-ignore in a block
*/`,
  ],
  invalid: [
    {
      code: '// @ts-ignore',
      errors: [
        {
          messageId: 'tsIgnoreComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-ignore: Suppress next line',
      errors: [
        {
          messageId: 'tsIgnoreComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '/////@ts-ignore: Suppress next line',
      errors: [
        {
          messageId: 'tsIgnoreComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
if (false) {
  // @ts-ignore: Unreachable code error
  console.log("hello");
}
            `,
      errors: [
        {
          messageId: 'tsIgnoreComment',
          line: 3,
          column: 3,
        },
      ],
    },
  ],
});
