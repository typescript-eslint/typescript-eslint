import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-call';
import { getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.noImplicitThis.json',
    tsconfigRootDir: getFixturesRootDir(),
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
  ],
  invalid: [
    {
      code: `
function foo(x: any) {
  x();
}
      `,
      errors: [{ messageId: 'unsafeCall' }],
    },
    {
      code: `
function foo(x: any) {
  x?.();
}
      `,
      errors: [{ messageId: 'unsafeCall' }],
    },
    {
      code: `
function foo(x: any) {
  x.a.b.c.d.e.f.g();
}
      `,
      errors: [{ messageId: 'unsafeCall' }],
    },
    {
      code: `
function foo(x: any) {
  x.a.b.c.d.e.f.g?.();
}
      `,
      errors: [{ messageId: 'unsafeCall' }],
    },
    {
      code: `
function foo(x: { a: any }) {
  x.a();
}
      `,
      errors: [{ messageId: 'unsafeCall' }],
    },
    {
      code: `
function foo(x: { a: any }) {
  x?.a();
}
      `,
      errors: [{ messageId: 'unsafeCall' }],
    },
    {
      code: `
function foo(x: { a: any }) {
  x.a?.();
}
      `,
      errors: [{ messageId: 'unsafeCall' }],
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
  ],
});
