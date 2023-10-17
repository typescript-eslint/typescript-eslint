import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-member-access';
import { getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    EXPERIMENTAL_useProjectService: false,
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
          line: 3,
          column: 5,
          endColumn: 6,
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
          line: 3,
          column: 5,
          endColumn: 6,
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
          line: 3,
          column: 7,
          endColumn: 8,
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
          line: 3,
          column: 5,
          endColumn: 8,
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
          line: 3,
          column: 5,
          endColumn: 8,
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
          line: 3,
          column: 5,
          endColumn: 6,
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
          line: 3,
          column: 7,
          endColumn: 8,
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
          line: 3,
          column: 6,
          endColumn: 12,
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
          line: 3,
          column: 5,
          endColumn: 13,
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
          line: 3,
          column: 5,
          endColumn: 8,
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
          line: 3,
          column: 5,
          endColumn: 6,
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
          column: 17,
          endColumn: 24,
        },
        {
          messageId: 'unsafeThisMemberExpression',
          line: 8,
          column: 17,
          endColumn: 30,
        },
        {
          messageId: 'unsafeThisMemberExpression',
          line: 14,
          column: 19,
          endColumn: 26,
        },
      ],
    },
    {
      code: `
class C {
  getObs$: any;
  getPopularDepartments(): void {
    this.getObs$.pipe().subscribe(res => {
      console.log(res);
    });
  }
}
      `,
      errors: [
        {
          messageId: 'unsafeMemberExpression',
          line: 5,
          column: 18,
          endColumn: 22,
        },
        {
          messageId: 'unsafeMemberExpression',
          line: 5,
          column: 25,
          endColumn: 34,
        },
      ],
    },
  ],
});
