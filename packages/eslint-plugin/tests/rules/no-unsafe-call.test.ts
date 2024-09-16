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
  ],
});
