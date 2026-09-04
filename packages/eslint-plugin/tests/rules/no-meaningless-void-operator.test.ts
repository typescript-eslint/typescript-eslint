import rule from '../../src/rules/no-meaningless-void-operator';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-meaningless-void-operator', rule, {
  assertionOptions: {
    requireData: true,
  },
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
declare function fail(): never;
void fail();
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
    'void 0;',
    `
declare const promise: Promise<number>;
void promise;
    `,
    `
declare const thenable: { then(onFulfilled: () => void): void };
void thenable;
    `,
    `
void new Promise<void>(resolve => {
  resolve();
});
    `,
    `
declare function fn(): void;
declare function getValue(): string;
void (fn(), getValue());
    `,
  ],
  invalid: [
    {
      code: 'void (() => {})();',
      errors: [
        {
          column: 1,
          data: { type: 'void' },
          endColumn: 18,
          endLine: 1,
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
          data: { type: 'void' },
          endColumn: 11,
          endLine: 3,
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
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOnNonCall',
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
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOnNonCall',
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
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOnNonCall',
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
void (<string>box.value);
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: `
declare const box: { value: string };
(<string>box.value);
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
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOnNonCall',
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
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOnNonCall',
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
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOnNonCall',
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
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOnNonCall',
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
          endColumn: 23,
          endLine: 4,
          line: 4,
          messageId: 'meaninglessVoidOnNonCall',
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
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'meaninglessVoidOnNonCall',
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
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: `
function bar(x: never) {
  x;
}
      `,
    },
    {
      code: `
declare const box: { value: never };
void box.value;
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: `
declare const box: { value: never };
box.value;
      `,
    },
    {
      code: `
declare function fail(): never;
void fail();
      `,
      errors: [
        {
          column: 1,
          data: { type: 'never' },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOperator',
          suggestions: [
            {
              messageId: 'removeVoid',
              output: `
declare function fail(): never;
fail();
      `,
            },
          ],
        },
      ],
      options: [{ checkNever: true }],
      output: null,
    },
    {
      code: 'void 1;',
      errors: [
        {
          column: 1,
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: '1;',
    },
    {
      code: "void '0';",
      errors: [
        {
          column: 1,
          endColumn: 9,
          endLine: 1,
          line: 1,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: "'0';",
    },
    {
      code: `
declare const value: string;
const result = void value;
      `,
      errors: [
        {
          column: 16,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: null,
    },
  ],
});
