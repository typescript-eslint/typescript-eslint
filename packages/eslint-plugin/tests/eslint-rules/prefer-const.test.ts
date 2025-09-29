import { RuleTester } from '@typescript-eslint/rule-tester';

import { getESLintCoreRule } from '../../src/util/getESLintCoreRule';

const rule = getESLintCoreRule('prefer-const');

const ruleTester = new RuleTester();

ruleTester.run('prefer-const', rule, {
  invalid: [],
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
    `
let x: number | undefined = 1;
x!++;
    `,
    `
let x: number | undefined = 1;
(<number>x)++;
    `,
    `
let x: number | undefined = 1;
(x as number)++;
    `,
  ],
});
