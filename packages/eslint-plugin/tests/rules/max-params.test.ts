import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/max-params';

const ruleTester = new RuleTester();

ruleTester.run('max-params', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    'function foo() {}',
    'const foo = function () {};',
    'const foo = () => {};',
    'function foo(a) {}',
    `
class Foo {
  constructor(a) {}
}
    `,
    `
class Foo {
  method(this: void, a, b, c) {}
}
    `,
    `
class Foo {
  method(this: Foo, a, b) {}
}
    `,
    {
      code: 'function foo(a, b, c, d) {}',
      options: [{ max: 4 }],
    },
    {
      code: 'function foo(a, b, c, d) {}',
      options: [{ maximum: 4 }],
    },
    {
      code: `
class Foo {
  method(this: void) {}
}
      `,
      options: [{ max: 0 }],
    },
    {
      code: `
class Foo {
  method(this: void, a) {}
}
      `,
      options: [{ max: 1 }],
    },
    {
      code: `
class Foo {
  method(this: void, a) {}
}
      `,
      options: [{ countVoidThis: true, max: 2 }],
    },
    {
      code: `
declare function makeDate(m: number, d: number, y: number): Date;
      `,
      options: [{ max: 3 }],
    },
    {
      code: `
type sum = (a: number, b: number) => number;
      `,
      options: [{ max: 2 }],
    },
  ],
  invalid: [
    {
      code: 'function foo(a, b, c, d) {}',
      errors: [
        {
          column: 1,
          data: {
            count: '4',
            max: '3',
            name: "Function 'foo'",
          },
          endColumn: 13,
          endLine: 1,
          line: 1,
          messageId: 'exceed',
        },
      ],
    },
    {
      code: 'const foo = function (a, b, c, d) {};',
      errors: [
        {
          column: 13,
          data: {
            count: '4',
            max: '3',
            name: 'Function',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'exceed',
        },
      ],
    },
    {
      code: 'const foo = (a, b, c, d) => {};',
      errors: [
        {
          column: 26,
          data: {
            count: '4',
            max: '3',
            name: 'Arrow function',
          },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'exceed',
        },
      ],
    },
    {
      code: 'const foo = a => {};',
      errors: [
        {
          column: 15,
          data: {
            count: '1',
            max: '0',
            name: 'Arrow function',
          },
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'exceed',
        },
      ],
      options: [{ max: 0 }],
    },
    {
      code: `
class Foo {
  method(this: void, a, b, c, d) {}
}
      `,
      errors: [
        {
          column: 3,
          data: {
            count: '4',
            max: '3',
            name: "Method 'method'",
          },
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'exceed',
        },
      ],
    },
    {
      code: `
class Foo {
  method(this: void, a) {}
}
      `,
      errors: [
        {
          column: 3,
          data: {
            count: '2',
            max: '1',
            name: "Method 'method'",
          },
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'exceed',
        },
      ],
      options: [{ countVoidThis: true, max: 1 }],
    },
    {
      code: `
class Foo {
  method(this: Foo, a, b, c) {}
}
      `,
      errors: [
        {
          column: 3,
          data: {
            count: '4',
            max: '3',
            name: "Method 'method'",
          },
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'exceed',
        },
      ],
    },
    {
      code: `
declare function makeDate(m: number, d: number, y: number): Date;
      `,
      errors: [
        {
          column: 1,
          data: {
            count: '3',
            max: '1',
            name: "Function 'makeDate'",
          },
          endColumn: 26,
          endLine: 2,
          line: 2,
          messageId: 'exceed',
        },
      ],
      options: [{ max: 1 }],
    },
    {
      code: `
type sum = (a: number, b: number) => number;
      `,
      errors: [
        {
          column: 12,
          data: {
            count: '2',
            max: '1',
            name: 'Function',
          },
          endColumn: 12,
          endLine: 2,
          line: 2,
          messageId: 'exceed',
        },
      ],
      options: [{ max: 1 }],
    },
  ],
});
