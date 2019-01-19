'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('eslint/lib/rules/no-shadow'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {}
  },
  parser: 'typescript-eslint-parser'
});

ruleTester.run('no-shadow', rule, {
  valid: [
    // https://github.com/eslint/typescript-eslint-parser/issues/459
    `
type foo = any;
function bar(foo: any) {}
    `
  ],
  invalid: []
});
