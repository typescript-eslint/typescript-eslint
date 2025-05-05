import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-dupe-class-members';

const ruleTester = new RuleTester();

ruleTester.run('no-dupe-class-members', rule, {
  invalid: [
    {
      code: `
class A {
  foo() {}
  foo() {}
}
      `,
      errors: [
        { column: 3, data: { name: 'foo' }, line: 4, messageId: 'unexpected' },
      ],
    },
    {
      code: `
!class A {
  foo() {}
  foo() {}
};
      `,
      errors: [
        { column: 3, data: { name: 'foo' }, line: 4, messageId: 'unexpected' },
      ],
    },
    {
      code: noFormat`
class A {
  'foo'() {}
  'foo'() {}
}
      `,
      errors: [
        { column: 3, data: { name: 'foo' }, line: 4, messageId: 'unexpected' },
      ],
    },
    {
      code: `
class A {
  10() {}
  1e1() {}
}
      `,
      errors: [
        { column: 3, data: { name: '10' }, line: 4, messageId: 'unexpected' },
      ],
    },
    {
      code: `
class A {
  foo() {}
  foo() {}
  foo() {}
}
      `,
      errors: [
        { column: 3, data: { name: 'foo' }, line: 4, messageId: 'unexpected' },
        { column: 3, data: { name: 'foo' }, line: 5, messageId: 'unexpected' },
      ],
    },
    {
      code: `
class A {
  static foo() {}
  static foo() {}
}
      `,
      errors: [
        { column: 3, data: { name: 'foo' }, line: 4, messageId: 'unexpected' },
      ],
    },
    {
      code: `
class A {
  foo() {}
  get foo() {}
}
      `,
      errors: [
        { column: 3, data: { name: 'foo' }, line: 4, messageId: 'unexpected' },
      ],
    },
    {
      code: `
class A {
  set foo(value) {}
  foo() {}
}
      `,
      errors: [
        { column: 3, data: { name: 'foo' }, line: 4, messageId: 'unexpected' },
      ],
    },
    {
      code: `
class A {
  foo;
  foo = 42;
}
      `,
      errors: [
        { column: 3, data: { name: 'foo' }, line: 4, messageId: 'unexpected' },
      ],
    },
    {
      code: `
class A {
  foo;
  foo() {}
}
      `,
      errors: [
        { column: 3, data: { name: 'foo' }, line: 4, messageId: 'unexpected' },
      ],
    },
  ],
  valid: [
    `
class A {
  foo() {}
  bar() {}
}
    `,
    `
class A {
  static foo() {}
  foo() {}
}
    `,
    `
class A {
  get foo() {}
  set foo(value) {}
}
    `,
    `
class A {
  static foo() {}
  get foo() {}
  set foo(value) {}
}
    `,
    `
class A {
  foo() {}
}
class B {
  foo() {}
}
    `,
    `
class A {
  [foo]() {}
  foo() {}
}
    `,
    `
class A {
  foo() {}
  bar() {}
  baz() {}
}
    `,
    `
class A {
  *foo() {}
  *bar() {}
  *baz() {}
}
    `,
    `
class A {
  get foo() {}
  get bar() {}
  get baz() {}
}
    `,
    `
class A {
  1() {}
  2() {}
}
    `,
    `
      class Foo {
        foo(a: string): string;
        foo(a: number): number;
        foo(a: any): any {}
      }
    `,
  ],
});
