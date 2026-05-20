import rule from '../../src/rules/no-meaningless-void-operator';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-meaningless-void-operator', rule, {
  valid: [
    `
(() => {})();

function foo() {}
foo(); // nothing to discard

async function bar() {
  return 2;
}
void bar(); // intentionally not awaited

declare const promise: Promise<string>;
void promise; // intentionally not awaited
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
declare const box: { value: string };

void box;
void box.value;
void box.value.toUpperCase();
      `,
      errors: [
        {
          column: 1,
          line: 4,
          messageId: 'meaninglessVoidOperator',
        },
        {
          column: 1,
          line: 5,
          messageId: 'meaninglessVoidOperator',
        },
        {
          column: 1,
          line: 6,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare const box: { value: string };

box;
box.value;
box.value.toUpperCase();
      `,
    },
    {
      code: `
function bar(x: number) {
  void x;
  return 2;
}
void bar(); // not an async result
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
        {
          column: 1,
          line: 6,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
function bar(x: number) {
  x;
  return 2;
}
bar(); // not an async result
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
});
