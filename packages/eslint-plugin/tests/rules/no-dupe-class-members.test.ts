import rule from '../../src/rules/no-dupe-class-members';
import { RuleTester, noFormat } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-dupe-class-members', rule, {
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
  invalid: [
    {
      code: `
class A {
  foo() {}
  foo() {}
}
      `,
      errors: [
        { line: 4, column: 3, messageId: 'unexpected', data: { name: 'foo' } },
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
        { line: 4, column: 3, messageId: 'unexpected', data: { name: 'foo' } },
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
        { line: 4, column: 3, messageId: 'unexpected', data: { name: 'foo' } },
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
        { line: 4, column: 3, messageId: 'unexpected', data: { name: '10' } },
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
        { line: 4, column: 3, messageId: 'unexpected', data: { name: 'foo' } },
        { line: 5, column: 3, messageId: 'unexpected', data: { name: 'foo' } },
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
        { line: 4, column: 3, messageId: 'unexpected', data: { name: 'foo' } },
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
        { line: 4, column: 3, messageId: 'unexpected', data: { name: 'foo' } },
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
        { line: 4, column: 3, messageId: 'unexpected', data: { name: 'foo' } },
      ],
    },
  ],
});
