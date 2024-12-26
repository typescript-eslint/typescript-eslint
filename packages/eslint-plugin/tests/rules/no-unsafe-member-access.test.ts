import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-member-access';
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
class B implements FG.A {}
    `,
    `
interface B extends FG.A {}
    `,
    `
class B implements F.S.T.A {}
    `,
    `
interface B extends F.S.T.A {}
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
          column: 5,
          data: {
            property: '.a',
            type: '`any`',
          },
          endColumn: 6,
          line: 3,
          messageId: 'unsafeMemberExpression',
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
          column: 5,
          data: {
            property: '.a',
            type: '`any`',
          },
          endColumn: 6,
          line: 3,
          messageId: 'unsafeMemberExpression',
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
          column: 7,
          data: {
            property: '.b',
            type: '`any`',
          },
          endColumn: 8,
          line: 3,
          messageId: 'unsafeMemberExpression',
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
          column: 5,
          data: {
            property: "['a']",
            type: '`any`',
          },
          endColumn: 8,
          line: 3,
          messageId: 'unsafeMemberExpression',
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
          column: 5,
          data: {
            property: "['a']",
            type: '`any`',
          },
          endColumn: 8,
          line: 3,
          messageId: 'unsafeMemberExpression',
        },
      ],
    },
    {
      code: `
let value: NotKnown;

value.property;
      `,
      errors: [
        {
          column: 7,
          data: {
            property: '.property',
            type: '`error` typed',
          },
          endColumn: 15,
          line: 4,
          messageId: 'unsafeMemberExpression',
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
          column: 5,
          data: {
            property: '[y]',
            type: '`any`',
          },
          endColumn: 6,
          line: 3,
          messageId: 'unsafeComputedMemberAccess',
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
          column: 7,
          data: {
            property: '[y]',
            type: '`any`',
          },
          endColumn: 8,
          line: 3,
          messageId: 'unsafeComputedMemberAccess',
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
          column: 6,
          data: {
            property: '[y += 1]',
            type: '`any`',
          },
          endColumn: 12,
          line: 3,
          messageId: 'unsafeComputedMemberAccess',
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
          column: 5,
          data: {
            property: '[1 as any]',
            type: '`any`',
          },
          endColumn: 13,
          line: 3,
          messageId: 'unsafeComputedMemberAccess',
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
          column: 5,
          data: {
            property: '[y()]',
            type: '`any`',
          },
          endColumn: 8,
          line: 3,
          messageId: 'unsafeComputedMemberAccess',
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
          column: 5,
          data: {
            property: '[y]',
            type: '`any`',
          },
          endColumn: 6,
          line: 3,
          messageId: 'unsafeComputedMemberAccess',
        },
      ],
    },
    {
      code: `
function foo(x: { a: number }, y: NotKnown) {
  x[y];
}
      `,
      errors: [
        {
          column: 5,
          data: {
            property: '[y]',
            type: '`error` typed',
          },
          endColumn: 6,
          line: 3,
          messageId: 'unsafeComputedMemberAccess',
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
          column: 17,
          endColumn: 24,
          line: 4,
          messageId: 'unsafeThisMemberExpression',
        },
        {
          column: 17,
          endColumn: 30,
          line: 8,
          messageId: 'unsafeThisMemberExpression',
        },
        {
          column: 19,
          endColumn: 26,
          line: 14,
          messageId: 'unsafeThisMemberExpression',
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
          column: 18,
          endColumn: 22,
          line: 5,
          messageId: 'unsafeMemberExpression',
        },
        {
          column: 25,
          endColumn: 34,
          line: 5,
          messageId: 'unsafeMemberExpression',
        },
      ],
    },
  ],
});
