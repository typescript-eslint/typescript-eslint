import { getEslintCoreRule } from '../../src/util/getEslintCoreRule';
import { RuleTester } from '../RuleTester';

const rule = getEslintCoreRule('prefer-const');

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
