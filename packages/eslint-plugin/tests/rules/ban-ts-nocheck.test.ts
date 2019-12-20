import rule from '../../src/rules/ban-ts-nocheck';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('ban-ts-nocheck', rule, {
  valid: [
    `// just a comment containing @ts-nocheck somewhere`,
    `/* @ts-nocheck */`,
    `/** @ts-nocheck */`,
    `/*
// @ts-nocheck in a block
*/`,
  ],
  invalid: [
    {
      code: '// @ts-nocheck',
      errors: [
        {
          messageId: 'tsNocheckComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-nocheck: Suppress next line',
      errors: [
        {
          messageId: 'tsNocheckComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '/////@ts-nocheck: Suppress next line',
      errors: [
        {
          messageId: 'tsNocheckComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
if (false) {
  // @ts-nocheck: Unreachable code error
  console.log("hello");
}
            `,
      errors: [
        {
          messageId: 'tsNocheckComment',
          line: 3,
          column: 3,
        },
      ],
    },
  ],
});
