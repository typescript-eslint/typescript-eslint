'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('eslint/lib/rules/strict'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  parser: '@typescript-eslint/parser'
});

ruleTester.run('strict', rule, {
  valid: [
    // https://github.com/bradzacher/eslint-plugin-typescript/issues/255
    // https://github.com/typescript-eslint/typescript-eslint/issues/58
    `
window.whatevs = {
  myFunc() {
    console.log('yep');
  }
};
`
  ],
  invalid: [
    {
      // https://github.com/bradzacher/eslint-plugin-typescript/issues/255
      // https://github.com/typescript-eslint/typescript-eslint/issues/58
      code: `
window.whatevs = {
  myFunc() {
    console.log('yep');
  }
};
`,
      parserOptions: {
        sourceType: 'script'
      },
      errors: [
        {
          message: "Use the function form of 'use strict'.",
          line: 3,
          column: 9
        }
      ]
    }
  ]
});
