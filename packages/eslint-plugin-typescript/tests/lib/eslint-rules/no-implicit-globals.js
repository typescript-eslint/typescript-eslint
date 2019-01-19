'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('eslint/lib/rules/no-implicit-globals'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  parser: 'typescript-eslint-parser'
});

ruleTester.run('no-implicit-globals', rule, {
  valid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/23
    `
function foo() {
  return "bar";
}

module.exports = foo;
    `
  ],
  invalid: []
});
