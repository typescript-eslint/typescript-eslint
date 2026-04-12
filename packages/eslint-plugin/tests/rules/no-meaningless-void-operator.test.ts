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
    // Function call returning non-void (side effects possible, void is intentional)
    `
declare function getStr(): string;
void getStr();
    `,
    // Common pattern: ignoring a Promise
    `
void Promise.resolve();
    `,
    // Method call returning non-void (side effects possible)
    `
declare const obj: { method(): string };
void obj.method();
    `,
    // Computed member access with a key expression that may have side effects
    `
declare const obj: Record<string, number>;
declare function getKey(): string;
void obj[getKey()];
    `,
    // Member access where the object is not clearly side-effect-free
    `
declare function getBox(): { value: string };
void getBox().value;
    `,
    // String method with arguments — arguments may affect the result
    `
declare const str: string;
void str.normalize('NFC');
    `,
    // Optional call — covers node.optional = true in isSideEffectFreeStringMethodCall
    `
declare const str: string;
void str.toUpperCase?.();
    `,
    // Computed method call — covers callee.computed = true in isSideEffectFreeStringMethodCall
    `
declare const str: string;
void str['toUpperCase']();
    `,
    // String method called on a non-string type
    `
declare const someObj: { toString(): string };
void someObj.toString();
    `,
    // Private class method — property is PrivateIdentifier, not Identifier
    `
class Foo {
  #method() {
    return 'hello';
  }
  bar() {
    void this.#method();
  }
}
    `,
    // Template literal — hits the default case in isClearlyMeaninglessExpression
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
  ],
});
