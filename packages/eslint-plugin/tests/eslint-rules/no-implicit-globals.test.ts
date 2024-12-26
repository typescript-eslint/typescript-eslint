import { RuleTester } from '@typescript-eslint/rule-tester';

import { getESLintCoreRule } from '../../src/util/getESLintCoreRule';

const rule = getESLintCoreRule('no-implicit-globals');
const ruleTester = new RuleTester();

ruleTester.run('no-implicit-globals', rule, {
  invalid: [],
  valid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/23
    `
function foo() {
  return 'bar';
}

module.exports = foo;
    `,
  ],
});
