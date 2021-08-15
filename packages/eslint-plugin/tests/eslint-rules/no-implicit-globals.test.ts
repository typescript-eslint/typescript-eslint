import { getEslintCoreRule } from '../../src/util/getEslintCoreRule';
import { RuleTester } from '../RuleTester';

const rule = getEslintCoreRule('no-implicit-globals');
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
