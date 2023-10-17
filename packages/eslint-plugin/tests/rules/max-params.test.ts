import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/max-params';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('max-params', rule, {
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
      options: [{ max: 2, countVoidThis: true }],
    },
  ],
  invalid: [
    { code: 'function foo(a, b, c, d) {}', errors: [{ messageId: 'exceed' }] },
    {
      code: 'const foo = function (a, b, c, d) {};',
      errors: [{ messageId: 'exceed' }],
    },
    {
      code: 'const foo = (a, b, c, d) => {};',
      errors: [{ messageId: 'exceed' }],
    },
    {
      code: 'const foo = a => {};',
      options: [{ max: 0 }],
      errors: [{ messageId: 'exceed' }],
    },
    {
      code: `
class Foo {
  method(this: void, a, b, c, d) {}
}
      `,
      errors: [{ messageId: 'exceed' }],
    },
    {
      code: `
class Foo {
  method(this: void, a) {}
}
      `,
      options: [{ max: 1, countVoidThis: true }],
      errors: [{ messageId: 'exceed' }],
    },
    {
      code: `
class Foo {
  method(this: Foo, a, b, c) {}
}
      `,
      errors: [{ messageId: 'exceed' }],
    },
  ],
});
