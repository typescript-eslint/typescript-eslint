import rule from 'eslint/lib/rules/strict';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('strict', rule, {
  valid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/58
    `
window.whatevs = {
  myFunc() {
    console.log('yep');
  },
};
    `,
  ],
  invalid: [
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/58
      code: `
window.whatevs = {
  myFunc() {
    console.log('yep');
  },
};
      `,
      parserOptions: {
        sourceType: 'script',
      },
      errors: [
        {
          message: "Use the function form of 'use strict'.",
          line: 3,
          column: 9,
          // the base rule doesn't use messageId
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ],
    },
  ],
});
