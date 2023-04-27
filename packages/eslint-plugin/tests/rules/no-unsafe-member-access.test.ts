import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-member-access';
import { getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.noImplicitThis.json',
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
    {
      code: `
function foo(x: any) {
  x.a;
}
      `,
      errors: [
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: '.a',
          },
        },
      ],
    },
    {
      code: `
function foo(x: any) {
  x.a.b.c.d.e.f.g;
}
      `,
      errors: [
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: '.a',
          },
        },
      ],
    },
    {
      code: `
function foo(x: { a: any }) {
  x.a.b.c.d.e.f.g;
}
      `,
      errors: [
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: '.b',
          },
        },
      ],
    },
    {
      code: `
function foo(x: any) {
  x['a'];
}
      `,
      errors: [
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: "['a']",
          },
        },
      ],
    },
    {
      code: `
function foo(x: any) {
  x['a']['b']['c'];
}
      `,
      errors: [
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: "['a']",
          },
        },
      ],
    },
    {
      code: `
function foo(x: { a: number }, y: any) {
  x[y];
}
      `,
      errors: [
        {
          messageId: 'unsafeComputedMemberAccess',
          data: {
            property: '[y]',
          },
        },
      ],
    },
    {
      code: `
function foo(x?: { a: number }, y: any) {
  x?.[y];
}
      `,
      errors: [
        {
          messageId: 'unsafeComputedMemberAccess',
          data: {
            property: '[y]',
          },
        },
      ],
    },
    {
      code: `
function foo(x: { a: number }, y: any) {
  x[(y += 1)];
}
      `,
      errors: [
        {
          messageId: 'unsafeComputedMemberAccess',
          data: {
            property: '[y += 1]',
          },
        },
      ],
    },
    {
      code: `
function foo(x: { a: number }, y: any) {
  x[1 as any];
}
      `,
      errors: [
        {
          messageId: 'unsafeComputedMemberAccess',
          data: {
            property: '[1 as any]',
          },
        },
      ],
    },
    {
      code: `
function foo(x: { a: number }, y: any) {
  x[y()];
}
      `,
      errors: [
        {
          messageId: 'unsafeComputedMemberAccess',
          data: {
            property: '[y()]',
          },
        },
      ],
    },
    {
      code: `
function foo(x: string[], y: any) {
  x[y];
}
      `,
      errors: [
        {
          messageId: 'unsafeComputedMemberAccess',
          data: {
            property: '[y]',
          },
        },
      ],
    },

    {
      code: noFormat`
const methods = {
  methodA() {
    return this.methodB()
  },
  methodB() {
    const getProperty = () => Math.random() > 0.5 ? 'methodB' : 'methodC'
    return this[getProperty()]()
  },
  methodC() {
    return true
  },
  methodD() {
    return (this?.methodA)?.()
  }
};
      `,
      errors: [
        {
          messageId: 'unsafeThisMemberExpression',
          line: 4,
          column: 12,
          endColumn: 24,
        },
        {
          messageId: 'unsafeThisMemberExpression',
          line: 8,
          column: 12,
          endColumn: 31,
        },
        {
          messageId: 'unsafeThisMemberExpression',
          line: 14,
          column: 13,
          endColumn: 26,
        },
      ],
    },
  ],
});
