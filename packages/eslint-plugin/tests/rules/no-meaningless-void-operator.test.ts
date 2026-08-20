import rule from '../../src/rules/no-meaningless-void-operator';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-meaningless-void-operator', rule, {
  valid: [
    `
(() => {})();

function foo() {}
foo(); // nothing to discard

function bar(): number {
  return 2;
}
void bar();
    `,
    `
function bar(x: never) {
  void x;
}
    `,
    `
declare function getValue(): string;
void getValue();
    `,
    `
declare const box: { getValue(): string };
void box.getValue();
    `,
    `
declare const box: { value: string };
void box.value.toUpperCase();
    `,
    `
declare const box: { method(): string } | undefined;
void box?.method();
    `,
    `
declare function getValue(): string | void;
void getValue();
    `,
    `
declare function getValue(): string | undefined;
void getValue();
    `,
    `
declare const box: { method?: () => string };
void box.method?.();
    `,
    `
declare function getValue(): string;
void (getValue() as string);
    `,
    `
declare const box: { value: never };
void box.value;
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
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare const box: { value: string };
box;
      `,
    },
    {
      code: `
declare const box: { value: string };
void box.value;
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare const box: { value: string };
box.value;
      `,
    },
    {
      code: `
declare const box: { value: string } | undefined;
void box?.value;
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare const box: { value: string } | undefined;
box?.value;
      `,
    },
    {
      code: `
declare const box: { value: string };
void (box.value as string);
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare const box: { value: string };
(box.value as string);
      `,
    },
    {
      code: `
declare const box: { value: string };
void (box.value satisfies string);
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare const box: { value: string };
(box.value satisfies string);
      `,
    },
    {
      code: `
declare const box: { value: string };
void box.value!;
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare const box: { value: string };
box.value!;
      `,
    },
    {
      code: `
declare const wrapper: { box?: { value: string } };
void wrapper?.box?.value!;
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare const wrapper: { box?: { value: string } };
wrapper?.box?.value!;
      `,
    },
    {
      code: `
declare function fn(): void;
declare const box: { value: string };
void (fn(), box.value);
      `,
      errors: [
        {
          column: 1,
          line: 4,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare function fn(): void;
declare const box: { value: string };
(fn(), box.value);
      `,
    },
    {
      code: `
declare function fn(): void;
declare const box: { value: string };
void (fn(), box.value)!;
      `,
      errors: [
        {
          column: 1,
          line: 4,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare function fn(): void;
declare const box: { value: string };
(fn(), box.value)!;
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
    {
      code: `
declare const box: { value: never };
void box.value;
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
          suggestions: [
            {
              messageId: 'removeVoid',
              output: `
declare const box: { value: never };
box.value;
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
