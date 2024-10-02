import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-call';
import { getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.noImplicitThis.json',
      projectService: false,
      tsconfigRootDir: getFixturesRootDir(),
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
          messageId: 'unsafeCall',
          line: 3,
          column: 3,
          endColumn: 4,
          data: {
            type: '`any`',
          },
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
          messageId: 'unsafeCall',
          line: 3,
          column: 3,
          endColumn: 4,
          data: {
            type: '`any`',
          },
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
          messageId: 'unsafeCall',
          line: 3,
          column: 3,
          endColumn: 18,
          data: {
            type: '`any`',
          },
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
          messageId: 'unsafeCall',
          line: 3,
          column: 3,
          endColumn: 18,
          data: {
            type: '`any`',
          },
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
          messageId: 'unsafeCall',
          line: 3,
          column: 3,
          endColumn: 6,
          data: {
            type: '`any`',
          },
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
          messageId: 'unsafeCall',
          line: 3,
          column: 3,
          endColumn: 7,
          data: {
            type: '`any`',
          },
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
          messageId: 'unsafeCall',
          line: 3,
          column: 3,
          endColumn: 6,
          data: {
            type: '`any`',
          },
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
          messageId: 'unsafeCallThis',
          line: 4,
          column: 12,
          endColumn: 24,
        },
        {
          messageId: 'unsafeCallThis',
          line: 10,
          column: 12,
          endColumn: 16,
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
          messageId: 'unsafeCall',
          line: 3,
          column: 1,
          endColumn: 6,
          data: {
            type: '`error` type',
          },
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
          messageId: 'unsafeCall',
          line: 3,
          data: {
            type: '`Function`',
          },
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
          messageId: 'unsafeTemplateTag',
          line: 3,
          data: {
            type: '`Function`',
          },
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
          messageId: 'unsafeCall',
          line: 4,
          data: {
            type: '`Function`',
          },
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
          messageId: 'unsafeCall',
          line: 4,
          data: {
            type: '`Function`',
          },
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
          messageId: 'unsafeTemplateTag',
          line: 4,
          data: {
            type: '`Function`',
          },
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
          messageId: 'unsafeNew',
          line: 4,
          data: {
            type: '`Function`',
          },
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
          messageId: 'unsafeNew',
          line: 6,
          data: {
            type: '`Function`',
          },
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
          messageId: 'unsafeCall',
          line: 6,
          data: {
            type: '`Function`',
          },
        },
      ],
    },
  ],
});
