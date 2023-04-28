import { RuleTester } from '@typescript-eslint/rule-tester';

import { getESLintCoreRule } from '../../src/util/getESLintCoreRule';

const rule = getESLintCoreRule('no-implicit-globals');
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-implicit-globals', rule, {
  valid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/23
    `
function foo() {
  return 'bar';
}

module.exports = foo;
    `,
  ],
  invalid: [],
});
