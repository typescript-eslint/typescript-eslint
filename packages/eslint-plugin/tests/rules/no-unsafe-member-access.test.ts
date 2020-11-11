import rule from '../../src/rules/no-unsafe-member-access';
import {
  RuleTester,
  batchedSingleLineTests,
  getFixturesRootDir,
  noFormat,
} from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: getFixturesRootDir(),
  },
});

ruleTester.run('no-unsafe-member-access', rule, {
  valid: [
    `
function foo(x: { a: number }, y: any) {
  x[y++];
}
    `,
    `
function foo(x: { a: number }) {
  x.a;
}
    `,
    `
function foo(x?: { a: number }) {
  x?.a;
}
    `,
    `
function foo(x: { a: number }) {
  x['a'];
}
    `,
    `
function foo(x?: { a: number }) {
  x?.['a'];
}
    `,
    `
function foo(x: { a: number }, y: string) {
  x[y];
}
    `,
    `
function foo(x?: { a: number }, y: string) {
  x?.[y];
}
    `,
    `
function foo(x: string[]) {
  x[1];
}
    `,
    `
function foo(x?: string[]) {
  x?.[1++];
}
    `,
    `
function foo(x?: string[]) {
  x?.[(1 as any)++];
}
    `,
    `
class B implements FG.A {}
    `,
    `
interface B extends FG.A {}
    `,
  ],
  invalid: [
    ...batchedSingleLineTests({
      code: noFormat`
function foo(x: any) { x.a }
function foo(x: any) { x.a.b.c.d.e.f.g }
function foo(x: { a: any }) { x.a.b.c.d.e.f.g }
      `,
      errors: [
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: '.a',
          },
          line: 2,
          column: 24,
          endColumn: 27,
        },
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: '.a',
          },
          line: 3,
          column: 24,
          endColumn: 27,
        },
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: '.b',
          },
          line: 4,
          column: 31,
          endColumn: 36,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: noFormat`
function foo(x: any) { x['a'] }
function foo(x: any) { x['a']['b']['c'] }
      `,
      errors: [
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: "['a']",
          },
          line: 2,
          column: 24,
          endColumn: 30,
        },
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: "['a']",
          },
          line: 3,
          column: 24,
          endColumn: 30,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: noFormat`
function foo(x: { a: number }, y: any) { x[y] }
function foo(x?: { a: number }, y: any) { x?.[y] }
function foo(x: { a: number }, y: any) { x[y += 1] }
function foo(x: { a: number }, y: any) { x[1 as any] }
function foo(x: { a: number }, y: any) { x[y()] }
function foo(x: string[], y: any) { x[y] }
      `,
      errors: [
        {
          messageId: 'unsafeComputedMemberAccess',
          data: {
            property: '[y]',
          },
          line: 2,
          column: 44,
          endColumn: 45,
        },
        {
          messageId: 'unsafeComputedMemberAccess',
          data: {
            property: '[y]',
          },
          line: 3,
          column: 47,
          endColumn: 48,
        },
        {
          messageId: 'unsafeComputedMemberAccess',
          data: {
            property: '[y += 1]',
          },
          line: 4,
          column: 44,
          endColumn: 50,
        },
        {
          messageId: 'unsafeComputedMemberAccess',
          data: {
            property: '[1 as any]',
          },
          line: 5,
          column: 44,
          endColumn: 52,
        },
        {
          messageId: 'unsafeComputedMemberAccess',
          data: {
            property: '[y()]',
          },
          line: 6,
          column: 44,
          endColumn: 47,
        },
        {
          messageId: 'unsafeComputedMemberAccess',
          data: {
            property: '[y]',
          },
          line: 7,
          column: 39,
          endColumn: 40,
        },
      ],
    }),
  ],
});
