import { RuleTester } from '@typescript-eslint/rule-tester';

import { getESLintCoreRule } from '../../src/util/getESLintCoreRule';

const rule = getESLintCoreRule('no-dupe-args');

const ruleTester = new RuleTester();

ruleTester.run('no-dupe-args', rule, {
  invalid: [],
  valid: [
    // https://github.com/eslint/typescript-eslint-parser/issues/535
    `
function foo({ bar }: { bar: string }) {
  console.log(bar);
}
    `,
  ],
});
