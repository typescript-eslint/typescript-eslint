import { getEslintCoreRule } from '../../src/util/getEslintCoreRule';
import { RuleTester } from '../RuleTester';

const rule = getEslintCoreRule('no-dupe-args');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-dupe-args', rule, {
  valid: [
    // https://github.com/eslint/typescript-eslint-parser/issues/535
    `
function foo({ bar }: { bar: string }) {
  console.log(bar);
}
    `,
  ],
  invalid: [],
});
