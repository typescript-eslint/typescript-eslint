import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-meaningless-void-operator';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

ruleTester.run('no-meaningless-void-operator', rule, {
  invalid: [
    {
      code: 'void (() => {})();',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: '(() => {})();',
    },
    {
      code: `
function foo() {}
void foo();
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
function foo() {}
foo();
      `,
    },
    {
      code: `
function bar(x: never) {
  void x;
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'meaninglessVoidOperator',
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
      options: [{ checkNever: true }],
      output: null,
    },
  ],
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
});
