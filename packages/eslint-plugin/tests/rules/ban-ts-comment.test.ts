import rule from '../../src/rules/ban-ts-comment';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('ts-ignore', rule, {
  valid: [
    `// just a comment containing @ts-ignore somewhere`,
    `/* @ts-ignore */`,
    `/** @ts-ignore */`,
    `/*
// @ts-ignore in a block
*/`,
    {
      code: '// @ts-ignore',
      options: [{ 'ts-ignore': false }],
    },
  ],
  invalid: [
    {
      code: '// @ts-ignore',
      options: [{ 'ts-ignore': true }],
      errors: [
        {
          data: { directive: 'ignore' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-ignore',
      errors: [
        {
          data: { directive: 'ignore' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-ignore: Suppress next line',
      errors: [
        {
          data: { directive: 'ignore' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '/////@ts-ignore: Suppress next line',
      errors: [
        {
          data: { directive: 'ignore' },
          messageId: 'tsDirectiveComment',
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
          data: { directive: 'ignore' },
          messageId: 'tsDirectiveComment',
          line: 3,
          column: 3,
        },
      ],
    },
  ],
});

ruleTester.run('ts-nocheck', rule, {
  valid: [
    `// just a comment containing @ts-nocheck somewhere`,
    `/* @ts-nocheck */`,
    `/** @ts-nocheck */`,
    `/*
// @ts-nocheck in a block
*/`,
    {
      code: '// @ts-nocheck',
      options: [{ 'ts-nocheck': false }],
    },
  ],
  invalid: [
    {
      code: '// @ts-nocheck',
      options: [{ 'ts-nocheck': true }],
      errors: [
        {
          data: { directive: 'nocheck' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-nocheck',
      errors: [
        {
          data: { directive: 'nocheck' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-nocheck: Suppress next line',
      errors: [
        {
          data: { directive: 'nocheck' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '/////@ts-nocheck: Suppress next line',
      errors: [
        {
          data: { directive: 'nocheck' },
          messageId: 'tsDirectiveComment',
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
          data: { directive: 'nocheck' },
          messageId: 'tsDirectiveComment',
          line: 3,
          column: 3,
        },
      ],
    },
  ],
});

ruleTester.run('ts-check', rule, {
  valid: [
    `// just a comment containing @ts-check somewhere`,
    `/* @ts-check */`,
    `/** @ts-check */`,
    `/*
// @ts-check in a block
*/`,
    {
      code: '// @ts-check',
      options: [{ 'ts-check': false }],
    },
  ],
  invalid: [
    {
      code: '// @ts-check',
      options: [{ 'ts-check': true }],
      errors: [
        {
          data: { directive: 'check' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-check: Suppress next line',
      options: [{ 'ts-check': true }],
      errors: [
        {
          data: { directive: 'check' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '/////@ts-check: Suppress next line',
      options: [{ 'ts-check': true }],

      errors: [
        {
          data: { directive: 'check' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
if (false) {
  // @ts-check: Unreachable code error
  console.log("hello");
}
            `,
      options: [{ 'ts-check': true }],
      errors: [
        {
          data: { directive: 'check' },
          messageId: 'tsDirectiveComment',
          line: 3,
          column: 3,
        },
      ],
    },
  ],
});
