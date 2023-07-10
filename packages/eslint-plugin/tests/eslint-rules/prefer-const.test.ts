import { RuleTester } from '@typescript-eslint/rule-tester';

import { getESLintCoreRule } from '../../src/util/getESLintCoreRule';

const rule = getESLintCoreRule('prefer-const');

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('prefer-const', rule, {
  valid: [
    `
let x: number | undefined = 1;
x! += 1;
    `,
    `
let x: number | undefined = 1;
(<number>x) += 1;
    `,
    `
let x: number | undefined = 1;
(x as number) += 1;
    `,
  ],
  invalid: [],
});
