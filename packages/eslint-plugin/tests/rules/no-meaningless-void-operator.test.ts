import { noFormat } from '@typescript-eslint/rule-tester';

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
    `
declare let x: number;
void (x = 1);
    `,
    `
declare let x: number;
() => void (x = 1);
    `,
    `
declare let x: number;
void (x += 1);
    `,
    `
declare let x: number;
declare let y: number;
void (x = y = 1);
    `,
    `
declare let x: string;
declare function getValue(): string;
void (x = getValue());
    `,
    `
declare const obj: { prop: number };
void (obj.prop = 1);
    `,
    `
declare let x: number;
declare let y: number;
void ((x = 1), (y = 2));
    `,
    `
declare function tag(strings: TemplateStringsArray): string;
void tag\`value\`;
    `,
    {
      code: `
declare function getValue(): string | undefined;
void getValue();
      `,
      options: [{ checkNever: true }],
    },
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
declare function tag(strings: TemplateStringsArray): void;
void tag\`value\`;
      `,
      errors: [
        {
          column: 1,
          data: { type: 'void' },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare function tag(strings: TemplateStringsArray): void;
tag\`value\`;
      `,
    },
    {
      code: noFormat`
declare function foo(): void;
void /* comment */ foo();
      `,
      errors: [
        {
          column: 1,
          data: { type: 'void' },
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare function foo(): void;
/* comment */ foo();
      `,
    },
    {
      code: noFormat`
declare function foo(): void;
function bar() {
  return void // comment
    foo();
}
      `,
      errors: [
        {
          column: 10,
          data: { type: 'void' },
          endColumn: 10,
          endLine: 5,
          line: 4,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare function foo(): void;
function bar() {
  return foo();
}
      `,
    },
    {
      code: noFormat`
declare function foo(): void;
function bar() {
  throw void /*
  */ foo();
}
      `,
      errors: [
        {
          column: 9,
          data: { type: 'void' },
          endColumn: 11,
          endLine: 5,
          line: 4,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare function foo(): void;
function bar() {
  throw foo();
}
      `,
    },
    {
      code: noFormat`
void function () {}();
      `,
      errors: [
        {
          column: 1,
          data: { type: 'void' },
          endColumn: 22,
          endLine: 2,
          line: 2,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
(function () {}());
      `,
    },
    {
      code: noFormat`
declare let x: number;
x = 1
void function () {}()
      `,
      errors: [
        {
          column: 1,
          data: { type: 'void' },
          endColumn: 22,
          endLine: 4,
          line: 4,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare let x: number;
x = 1
;(function () {}())
      `,
    },
    {
      code: noFormat`
declare let x: number;
x = 1
void {}
      `,
      errors: [
        {
          column: 1,
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: `
declare let x: number;
x = 1
;({})
      `,
    },
    {
      code: `
const fn = () => void { method() {} }.method();
      `,
      errors: [
        {
          column: 18,
          data: { type: 'void' },
          endColumn: 47,
          endLine: 2,
          line: 2,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
const fn = () => ({ method() {} }.method());
      `,
    },
    {
      code: noFormat`
declare let x: number;
x = 1
void (() => {})()
      `,
      errors: [
        {
          column: 1,
          data: { type: 'void' },
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare let x: number;
x = 1
;(() => {})()
      `,
    },
    {
      code: `
const value = void (() => {})();
      `,
      errors: [
        {
          column: 15,
          data: { type: 'void' },
          endColumn: 32,
          endLine: 2,
          line: 2,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
const value = (() => {})();
      `,
    },
    {
      code: noFormat`
declare let x: number;
x = 1;
void (() => {})()
      `,
      errors: [
        {
          column: 1,
          data: { type: 'void' },
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: `
declare let x: number;
x = 1;
(() => {})()
      `,
    },
    {
      code: noFormat`
declare let x: number;
x = 1
void [x]
      `,
      errors: [
        {
          column: 1,
          endColumn: 9,
          endLine: 4,
          line: 4,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: `
declare let x: number;
x = 1
;[x]
      `,
    },
    {
      code: noFormat`
declare let x: number;
x = 1
void x
      `,
      errors: [
        {
          column: 1,
          endColumn: 7,
          endLine: 4,
          line: 4,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: `
declare let x: number;
x = 1
x
      `,
    },
    {
      code: `
void {};
      `,
      errors: [
        {
          column: 1,
          endColumn: 8,
          endLine: 2,
          line: 2,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: `
({});
      `,
    },
    {
      code: `
void async function () {};
      `,
      errors: [
        {
          column: 1,
          endColumn: 26,
          endLine: 2,
          line: 2,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: `
(async function () {});
      `,
    },
    {
      code: `
declare const async: number;
void async;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: `
declare const async: number;
async;
      `,
    },
    {
      code: noFormat`
void (function () {});
      `,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 2,
          line: 2,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: `
(function () {});
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
      // `satisfies` requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
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
    {
      code: `
declare let x: number;
void x;
      `,
      errors: [
        {
          column: 1,
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'meaninglessVoidOnNonCall',
        },
      ],
      output: `
declare let x: number;
x;
      `,
    },
    {
      code: `
declare let x: number;
void ++x;
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
declare let x: number;
++x;
      `,
    },
    {
      code: `
declare let x: number;
void x++;
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
declare let x: number;
x++;
      `,
    },
  ],
});
