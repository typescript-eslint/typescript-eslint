import rule from '../../src/rules/no-meaningless-void-operator';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-meaningless-void-operator', rule, {
  valid: [
    `
(() => {})();

function foo() {}
foo(); // nothing to discard

function bar() {
  return 2;
}
void bar(); // discarding a number
    `,
    `
function bar(x: never) {
  void x;
}
    `,
    `
declare function getStr(): string;
void getStr();
    `,
    `
void Promise.resolve();
    `,
    `
declare const promise: Promise<number>;
void promise;
    `,
    `
declare const obj: Record<string, number>;
declare function getKey(): string;
void obj[getKey()];
    `,
    `
declare function getBox(): { value: string };
void getBox().value;
    `,
    `
declare const str: string;
void str.normalize('NFC');
    `,
    `
declare const str: string;
void \`\${str}\`;
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
declare const box: { value: string };

void box;
      `,
      errors: [
        {
          column: 1,
          line: 4,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const box: { value: string };

void box.value;
      `,
      errors: [
        {
          column: 1,
          line: 4,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const box: { value: string };

void box.value.toUpperCase();
      `,
      errors: [
        {
          column: 1,
          line: 4,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const str: string;
void str.toUpperCase?.();
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const str: string;
void str['toUpperCase']();
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const x: string;
void x;
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const obj: { value?: { nested: string } };
void obj.value?.nested;
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const x: unknown;
void (x as string);
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const obj: { key: number };
void obj['key'];
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const x: string | null;
void x!;
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
class Foo {
  bar() {
    void this;
  }
}
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const fn: <T>() => T;
void fn<string>;
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const x: unknown;
void (<string>x);
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: 'void (42).toString();',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: 'void true.toString();',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const s: symbol;
void s.toString();
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
interface Box {
  getValue: () => string;
}
declare const box: Box;
void box.getValue();
void box.getValue().toUpperCase();
      `,
      errors: [
        {
          column: 1,
          line: 6,
          messageId: 'meaninglessVoidOperator',
        },
        {
          column: 1,
          line: 7,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const obj: { method(): string };
void obj.method();
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
declare const someObj: { toString(): string };
void someObj.toString();
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
    {
      code: `
class Foo {
  #method() {
    return 'hello';
  }
  bar() {
    void this.#method();
  }
}
      `,
      errors: [
        {
          column: 5,
          line: 7,
          messageId: 'meaninglessVoidOperator',
        },
      ],
      output: null,
    },
  ],
});
