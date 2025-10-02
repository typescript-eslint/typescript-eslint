import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-call';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.noImplicitThis.json',
      projectService: false,
    },
  },
});

ruleTester.run('no-unsafe-call', rule, {
  valid: [
    `
function foo(x: () => void) {
  x();
}
    `,
    `
function foo(x?: { a: () => void }) {
  x?.a();
}
    `,
    `
function foo(x: { a?: () => void }) {
  x.a?.();
}
    `,
    'new Map();',
    'String.raw`foo`;',
    "const x = import('./foo');",
    // https://github.com/typescript-eslint/typescript-eslint/issues/1825
    `
      let foo: any = 23;
      String(foo); // ERROR: Unsafe call of an any typed value
    `,
    // TS 3.9 changed this to be safe
    `
      function foo<T extends any>(x: T) {
        x();
      }
    `,
    `
      // create a scope since it's illegal to declare a duplicate identifier
      // 'Function' in the global script scope.
      {
        type Function = () => void;
        const notGlobalFunctionType: Function = (() => {}) as Function;
        notGlobalFunctionType();
      }
    `,
    `
interface SurprisinglySafe extends Function {
  (): string;
}
declare const safe: SurprisinglySafe;
safe();
    `,
    `
interface CallGoodConstructBad extends Function {
  (): void;
}
declare const safe: CallGoodConstructBad;
safe();
    `,
    `
interface ConstructSignatureMakesSafe extends Function {
  new (): ConstructSignatureMakesSafe;
}
declare const safe: ConstructSignatureMakesSafe;
new safe();
    `,
    `
interface SafeWithNonVoidCallSignature extends Function {
  (): void;
  (x: string): string;
}
declare const safe: SafeWithNonVoidCallSignature;
safe();
    `,
    // Function has type FunctionConstructor, so it's not within this rule's purview
    `
      new Function('lol');
    `,
    // Function has type FunctionConstructor, so it's not within this rule's purview
    `
      Function('lol');
    `,
  ],
  invalid: [
    {
      code: `
function foo(x: any) {
  x();
}
      `,
      errors: [
        {
          column: 3,
          data: {
            type: '`any`',
          },
          endColumn: 4,
          line: 3,
          messageId: 'unsafeCall',
        },
      ],
    },
    {
      code: `
function foo(x: any) {
  x?.();
}
      `,
      errors: [
        {
          column: 3,
          data: {
            type: '`any`',
          },
          endColumn: 4,
          line: 3,
          messageId: 'unsafeCall',
        },
      ],
    },
    {
      code: `
function foo(x: any) {
  x.a.b.c.d.e.f.g();
}
      `,
      errors: [
        {
          column: 3,
          data: {
            type: '`any`',
          },
          endColumn: 18,
          line: 3,
          messageId: 'unsafeCall',
        },
      ],
    },
    {
      code: `
function foo(x: any) {
  x.a.b.c.d.e.f.g?.();
}
      `,
      errors: [
        {
          column: 3,
          data: {
            type: '`any`',
          },
          endColumn: 18,
          line: 3,
          messageId: 'unsafeCall',
        },
      ],
    },
    {
      code: `
function foo(x: { a: any }) {
  x.a();
}
      `,
      errors: [
        {
          column: 3,
          data: {
            type: '`any`',
          },
          endColumn: 6,
          line: 3,
          messageId: 'unsafeCall',
        },
      ],
    },
    {
      code: `
function foo(x: { a: any }) {
  x?.a();
}
      `,
      errors: [
        {
          column: 3,
          data: {
            type: '`any`',
          },
          endColumn: 7,
          line: 3,
          messageId: 'unsafeCall',
        },
      ],
    },
    {
      code: `
function foo(x: { a: any }) {
  x.a?.();
}
      `,
      errors: [
        {
          column: 3,
          data: {
            type: '`any`',
          },
          endColumn: 6,
          line: 3,
          messageId: 'unsafeCall',
        },
      ],
    },
    {
      code: `
function foo(x: any) {
  new x();
}
      `,
      errors: [{ messageId: 'unsafeNew' }],
    },
    {
      code: `
function foo(x: { a: any }) {
  new x.a();
}
      `,
      errors: [{ messageId: 'unsafeNew' }],
    },
    {
      code: `
function foo(x: any) {
  x\`foo\`;
}
      `,
      errors: [{ messageId: 'unsafeTemplateTag' }],
    },
    {
      code: `
function foo(x: { tag: any }) {
  x.tag\`foo\`;
}
      `,
      errors: [{ messageId: 'unsafeTemplateTag' }],
    },

    {
      code: noFormat`
const methods = {
  methodA() {
    return this.methodB()
  },
  methodB() {
    return true
  },
  methodC() {
    return this()
  }
};
      `,
      errors: [
        {
          column: 12,
          endColumn: 24,
          line: 4,
          messageId: 'unsafeCallThis',
        },
        {
          column: 12,
          endColumn: 16,
          line: 10,
          messageId: 'unsafeCallThis',
        },
      ],
    },
    {
      code: `
let value: NotKnown;
value();
      `,
      errors: [
        {
          column: 1,
          data: {
            type: '`error` type',
          },
          endColumn: 6,
          line: 3,
          messageId: 'unsafeCall',
        },
      ],
    },
    {
      code: `
const t: Function = () => {};
t();
      `,
      errors: [
        {
          data: {
            type: '`Function`',
          },
          line: 3,
          messageId: 'unsafeCall',
        },
      ],
    },
    {
      code: `
const f: Function = () => {};
f\`oo\`;
      `,
      errors: [
        {
          data: {
            type: '`Function`',
          },
          line: 3,
          messageId: 'unsafeTemplateTag',
        },
      ],
    },
    {
      code: `
declare const maybeFunction: unknown;
if (typeof maybeFunction === 'function') {
  maybeFunction('call', 'with', 'any', 'args');
}
      `,
      errors: [
        {
          data: {
            type: '`Function`',
          },
          line: 4,
          messageId: 'unsafeCall',
        },
      ],
    },
    {
      code: `
interface Unsafe extends Function {}
declare const unsafe: Unsafe;
unsafe();
      `,
      errors: [
        {
          data: {
            type: '`Function`',
          },
          line: 4,
          messageId: 'unsafeCall',
        },
      ],
    },
    {
      code: `
interface Unsafe extends Function {}
declare const unsafe: Unsafe;
unsafe\`bad\`;
      `,
      errors: [
        {
          data: {
            type: '`Function`',
          },
          line: 4,
          messageId: 'unsafeTemplateTag',
        },
      ],
    },
    {
      code: `
interface Unsafe extends Function {}
declare const unsafe: Unsafe;
new unsafe();
      `,
      errors: [
        {
          data: {
            type: '`Function`',
          },
          line: 4,
          messageId: 'unsafeNew',
        },
      ],
    },
    {
      code: `
interface UnsafeToConstruct extends Function {
  (): void;
}
declare const unsafe: UnsafeToConstruct;
new unsafe();
      `,
      errors: [
        {
          data: {
            type: '`Function`',
          },
          line: 6,
          messageId: 'unsafeNew',
        },
      ],
    },
    {
      code: `
interface StillUnsafe extends Function {
  property: string;
}
declare const unsafe: StillUnsafe;
unsafe();
      `,
      errors: [
        {
          data: {
            type: '`Function`',
          },
          line: 6,
          messageId: 'unsafeCall',
        },
      ],
    },
  ],
});
