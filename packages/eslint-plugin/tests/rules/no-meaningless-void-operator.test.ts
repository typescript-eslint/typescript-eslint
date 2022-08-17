import rule from '../../src/rules/no-meaningless-void-operator';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-meaningless-void-operator', rule, {
  valid: [
    `
(() => {})();

function foo() {}
foo(); // nothing to discard

function bar(x: number) {
  void x;
  return 2;
}
void bar(); // discarding a number
    `,
    `
function bar(x: never) {
  void x;
}
    `,
  ],
  invalid: [
    {
      code: 'void (() => {})();',
      output: '(() => {})();',
      errors: [
        {
          messageId: 'meaninglessVoidOperator',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
function foo() {}
void foo();
      `,
      output: `
function foo() {}
foo();
      `,
      errors: [
        {
          messageId: 'meaninglessVoidOperator',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      options: [{ checkNever: true }],
      code: `
function bar(x: never) {
  void x;
}
      `,
      errors: [
        {
          messageId: 'meaninglessVoidOperator',
          line: 3,
          column: 3,
          suggestions: [
            {
              messageId: 'removeVoid',
              output: `
function bar(x: never) {
  x;
}
      `,
            },
          ],
        },
      ],
    },
  ],
});
