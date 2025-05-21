import { RuleTester } from '@typescript-eslint/rule-tester';

import { getESLintCoreRule } from '../../src/util/getESLintCoreRule';

const rule = getESLintCoreRule('strict');

const ruleTester = new RuleTester();

ruleTester.run('strict', rule, {
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
      errors: [
        {
          column: 9,
          line: 3,
          message: "Use the function form of 'use strict'.",
          // the base rule doesn't use messageId
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ],
      languageOptions: {
        parserOptions: {
          sourceType: 'script',
        },
      },
    },
  ],
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
});
