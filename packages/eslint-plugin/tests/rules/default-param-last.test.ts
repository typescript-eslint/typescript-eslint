import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/default-param-last';

const ruleTester = new RuleTester();

ruleTester.run('default-param-last', rule, {
  valid: [
    'function foo() {}',
    'function foo(a: number) {}',
    'function foo(a = 1) {}',
    'function foo(a?: number) {}',
    'function foo(a: number, b: number) {}',
    'function foo(a: number, b: number, c?: number) {}',
    'function foo(a: number, b = 1) {}',
    'function foo(a: number, b = 1, c = 1) {}',
    'function foo(a: number, b = 1, c?: number) {}',
    'function foo(a: number, b?: number, c = 1) {}',
    'function foo(a: number, b = 1, ...c) {}',

    'const foo = function () {};',
    'const foo = function (a: number) {};',
    'const foo = function (a = 1) {};',
    'const foo = function (a?: number) {};',
    'const foo = function (a: number, b: number) {};',
    'const foo = function (a: number, b: number, c?: number) {};',
    'const foo = function (a: number, b = 1) {};',
    'const foo = function (a: number, b = 1, c = 1) {};',
    'const foo = function (a: number, b = 1, c?: number) {};',
    'const foo = function (a: number, b?: number, c = 1) {};',
    'const foo = function (a: number, b = 1, ...c) {};',

    'const foo = () => {};',
    'const foo = (a: number) => {};',
    'const foo = (a = 1) => {};',
    'const foo = (a?: number) => {};',
    'const foo = (a: number, b: number) => {};',
    'const foo = (a: number, b: number, c?: number) => {};',
    'const foo = (a: number, b = 1) => {};',
    'const foo = (a: number, b = 1, c = 1) => {};',
    'const foo = (a: number, b = 1, c?: number) => {};',
    'const foo = (a: number, b?: number, c = 1) => {};',
    'const foo = (a: number, b = 1, ...c) => {};',
    `
class Foo {
  constructor(a: number, b: number, c: number) {}
}
    `,
    `
class Foo {
  constructor(a: number, b?: number, c = 1) {}
}
    `,
    `
class Foo {
  constructor(a: number, b = 1, c?: number) {}
}
    `,
    `
class Foo {
  constructor(
    public a: number,
    protected b: number,
    private c: number,
  ) {}
}
    `,
    `
class Foo {
  constructor(
    public a: number,
    protected b?: number,
    private c = 10,
  ) {}
}
    `,
    `
class Foo {
  constructor(
    public a: number,
    protected b = 10,
    private c?: number,
  ) {}
}
    `,
    `
class Foo {
  constructor(
    a: number,
    protected b?: number,
    private c = 0,
  ) {}
}
    `,
    `
class Foo {
  constructor(
    a: number,
    b?: number,
    private c = 0,
  ) {}
}
    `,
    `
class Foo {
  constructor(
    a: number,
    private b?: number,
    c = 0,
  ) {}
}
    `,
  ],
  invalid: [
    {
      code: 'function foo(a = 1, b: number) {}',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'function foo(a = 1, b = 2, c: number) {}',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
        {
          column: 21,
          endColumn: 26,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'function foo(a = 1, b: number, c = 2, d: number) {}',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
        {
          column: 32,
          endColumn: 37,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'function foo(a = 1, b: number, c = 2) {}',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'function foo(a = 1, b: number, ...c) {}',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'function foo(a?: number, b: number) {}',
      errors: [
        {
          column: 14,
          endColumn: 24,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'function foo(a: number, b?: number, c: number) {}',
      errors: [
        {
          column: 25,
          endColumn: 35,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'function foo(a = 1, b?: number, c: number) {}',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
        {
          column: 21,
          endColumn: 31,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'function foo(a = 1, { b }) {}',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'function foo({ a } = {}, b) {}',
      errors: [
        {
          column: 14,
          endColumn: 24,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'function foo({ a, b } = { a: 1, b: 2 }, c) {}',
      errors: [
        {
          column: 14,
          endColumn: 39,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'function foo([a] = [], b) {}',
      errors: [
        {
          column: 14,
          endColumn: 22,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'function foo([a, b] = [1, 2], c) {}',
      errors: [
        {
          column: 14,
          endColumn: 29,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = function (a = 1, b: number) {};',
      errors: [
        {
          column: 23,
          endColumn: 28,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = function (a = 1, b = 2, c: number) {};',
      errors: [
        {
          column: 23,
          endColumn: 28,
          line: 1,
          messageId: 'shouldBeLast',
        },
        {
          column: 30,
          endColumn: 35,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = function (a = 1, b: number, c = 2, d: number) {};',
      errors: [
        {
          column: 23,
          endColumn: 28,
          line: 1,
          messageId: 'shouldBeLast',
        },
        {
          column: 41,
          endColumn: 46,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = function (a = 1, b: number, c = 2) {};',
      errors: [
        {
          column: 23,
          endColumn: 28,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = function (a = 1, b: number, ...c) {};',
      errors: [
        {
          column: 23,
          endColumn: 28,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = function (a?: number, b: number) {};',
      errors: [
        {
          column: 23,
          endColumn: 33,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = function (a: number, b?: number, c: number) {};',
      errors: [
        {
          column: 34,
          endColumn: 44,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = function (a = 1, b?: number, c: number) {};',
      errors: [
        {
          column: 23,
          endColumn: 28,
          line: 1,
          messageId: 'shouldBeLast',
        },
        {
          column: 30,
          endColumn: 40,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = function (a = 1, { b }) {};',
      errors: [
        {
          column: 23,
          endColumn: 28,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = function ({ a } = {}, b) {};',
      errors: [
        {
          column: 23,
          endColumn: 33,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = function ({ a, b } = { a: 1, b: 2 }, c) {};',
      errors: [
        {
          column: 23,
          endColumn: 48,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = function ([a] = [], b) {};',
      errors: [
        {
          column: 23,
          endColumn: 31,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = function ([a, b] = [1, 2], c) {};',
      errors: [
        {
          column: 23,
          endColumn: 38,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = (a = 1, b: number) => {};',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = (a = 1, b = 2, c: number) => {};',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
        {
          column: 21,
          endColumn: 26,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = (a = 1, b: number, c = 2, d: number) => {};',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
        {
          column: 32,
          endColumn: 37,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = (a = 1, b: number, c = 2) => {};',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = (a = 1, b: number, ...c) => {};',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = (a?: number, b: number) => {};',
      errors: [
        {
          column: 14,
          endColumn: 24,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = (a: number, b?: number, c: number) => {};',
      errors: [
        {
          column: 25,
          endColumn: 35,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = (a = 1, b?: number, c: number) => {};',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
        {
          column: 21,
          endColumn: 31,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = (a = 1, { b }) => {};',
      errors: [
        {
          column: 14,
          endColumn: 19,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = ({ a } = {}, b) => {};',
      errors: [
        {
          column: 14,
          endColumn: 24,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = ({ a, b } = { a: 1, b: 2 }, c) => {};',
      errors: [
        {
          column: 14,
          endColumn: 39,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = ([a] = [], b) => {};',
      errors: [
        {
          column: 14,
          endColumn: 22,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: 'const foo = ([a, b] = [1, 2], c) => {};',
      errors: [
        {
          column: 14,
          endColumn: 29,
          line: 1,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(
    public a: number,
    protected b?: number,
    private c: number,
  ) {}
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 25,
          line: 5,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(
    public a: number,
    protected b = 0,
    private c: number,
  ) {}
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 20,
          line: 5,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(
    public a?: number,
    private b: number,
  ) {}
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 22,
          line: 4,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(
    public a = 0,
    private b: number,
  ) {}
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 17,
          line: 4,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(a = 0, b: number) {}
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 20,
          line: 3,
          messageId: 'shouldBeLast',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(a?: number, b: number) {}
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 25,
          line: 3,
          messageId: 'shouldBeLast',
        },
      ],
    },
  ],
});
