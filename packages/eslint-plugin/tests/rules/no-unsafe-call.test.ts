import rule from '../../src/rules/no-unsafe-call';
import {
  batchedSingleLineTests,
  getFixturesRootDir,
  noFormat,
  RuleTester,
} from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    EXPERIMENTAL_useProjectService: false,
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
    ...batchedSingleLineTests({
      code: noFormat`
function foo(x: any) { x() }
function foo(x: any) { x?.() }
function foo(x: any) { x.a.b.c.d.e.f.g() }
function foo(x: any) { x.a.b.c.d.e.f.g?.() }
      `,
      errors: [
        {
          messageId: 'unsafeCall',
          line: 2,
          column: 24,
          endColumn: 25,
        },
        {
          messageId: 'unsafeCall',
          line: 3,
          column: 24,
          endColumn: 25,
        },
        {
          messageId: 'unsafeCall',
          line: 4,
          column: 24,
          endColumn: 39,
        },
        {
          messageId: 'unsafeCall',
          line: 5,
          column: 24,
          endColumn: 39,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: noFormat`
function foo(x: { a: any }) { x.a() }
function foo(x: { a: any }) { x?.a() }
function foo(x: { a: any }) { x.a?.() }
      `,
      errors: [
        {
          messageId: 'unsafeCall',
          line: 2,
          column: 31,
          endColumn: 34,
        },
        {
          messageId: 'unsafeCall',
          line: 3,
          column: 31,
          endColumn: 35,
        },
        {
          messageId: 'unsafeCall',
          line: 4,
          column: 31,
          endColumn: 34,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: noFormat`
function foo(x: any) { new x() }
function foo(x: { a: any }) { new x.a() }
      `,
      errors: [
        {
          messageId: 'unsafeNew',
          line: 2,
          column: 24,
          endColumn: 31,
        },
        {
          messageId: 'unsafeNew',
          line: 3,
          column: 31,
          endColumn: 40,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: noFormat`
function foo(x: any) { x\`foo\` }
function foo(x: { tag: any }) { x.tag\`foo\` }
      `,
      errors: [
        {
          messageId: 'unsafeTemplateTag',
          line: 2,
          column: 24,
          endColumn: 25,
        },
        {
          messageId: 'unsafeTemplateTag',
          line: 3,
          column: 33,
          endColumn: 38,
        },
      ],
    }),
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
