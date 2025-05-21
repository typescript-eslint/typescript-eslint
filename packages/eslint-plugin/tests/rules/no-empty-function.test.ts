import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-empty-function';

const ruleTester = new RuleTester();

ruleTester.run('no-empty-function', rule, {
  valid: [
    {
      code: `
class Person {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }
}
      `,
    },
    {
      code: `
class Person {
  constructor(private name: string) {}
}
      `,
    },
    {
      code: `
class Person {
  constructor(name: string) {}
}
      `,
      options: [{ allow: ['constructors'] }],
    },
    {
      code: `
class Person {
  otherMethod(name: string) {}
}
      `,
      options: [{ allow: ['methods'] }],
    },
    {
      code: `
class Foo {
  private constructor() {}
}
      `,
      options: [{ allow: ['private-constructors'] }],
    },
    {
      code: `
class Foo {
  protected constructor() {}
}
      `,
      options: [{ allow: ['protected-constructors'] }],
    },
    {
      code: `
function foo() {
  const a = null;
}
      `,
    },
    {
      code: `
class Foo {
  @decorator()
  foo() {}
}
      `,
      options: [{ allow: ['decoratedFunctions'] }],
    },
    {
      code: `
class Foo extends Base {
  override foo() {}
}
      `,
      options: [{ allow: ['overrideMethods'] }],
    },
  ],

  invalid: [
    {
      code: `
class Person {
  constructor(name: string) {}
}
      `,
      errors: [
        {
          column: 29,
          data: {
            name: 'constructor',
          },
          line: 3,
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: `
class Person {
  otherMethod(name: string) {}
}
      `,
      errors: [
        {
          column: 29,
          data: {
            name: "method 'otherMethod'",
          },
          line: 3,
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: `
class Foo {
  private constructor() {}
}
      `,
      errors: [
        {
          column: 25,
          data: {
            name: 'constructor',
          },
          line: 3,
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: `
class Foo {
  protected constructor() {}
}
      `,
      errors: [
        {
          column: 27,
          data: {
            name: 'constructor',
          },
          line: 3,
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: `
function foo() {}
      `,
      errors: [
        {
          column: 16,
          data: {
            name: "function 'foo'",
          },
          line: 2,
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: `
class Foo {
  @decorator()
  foo() {}
}
      `,
      errors: [
        {
          column: 9,
          data: {
            name: "method 'foo'",
          },
          line: 4,
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: `
class Foo extends Base {
  override foo() {}
}
      `,
      errors: [
        {
          column: 18,
          data: {
            name: "method 'foo'",
          },
          line: 3,
          messageId: 'unexpected',
        },
      ],
    },
  ],
});
