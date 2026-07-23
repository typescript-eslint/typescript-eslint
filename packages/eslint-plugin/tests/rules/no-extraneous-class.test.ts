import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-extraneous-class';

const ruleTester = new RuleTester();

ruleTester.run('no-extraneous-class', rule, {
  valid: [
    `
class Foo {
  public prop = 1;
  constructor() {}
}
    `,
    `
export class CClass extends BaseClass {
  public static helper(): void {}
  private static privateHelper(): boolean {
    return true;
  }
  constructor() {}
}
    `,
    `
class Foo {
  constructor(public bar: string) {}
}
    `,
    {
      code: 'class Foo {}',
      options: [{ allowEmpty: true }],
    },
    {
      code: `
class Foo {
  constructor() {}
}
      `,
      options: [{ allowConstructorOnly: true }],
    },
    {
      code: `
export class Bar {
  public static helper(): void {}
  private static privateHelper(): boolean {
    return true;
  }
}
      `,
      options: [{ allowStaticOnly: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/170
    `
export default class {
  hello() {
    return 'I am foo!';
  }
}
    `,
    {
      code: `
@FooDecorator
class Foo {}
      `,
      options: [{ allowWithDecorator: true }],
    },
    {
      code: `
@FooDecorator
class Foo {
  constructor(foo: Foo) {
    foo.subscribe(a => {
      console.log(a);
    });
  }
}
      `,
      options: [{ allowWithDecorator: true }],
    },
    `
abstract class Foo {
  abstract property: string;
}
    `,
    `
abstract class Foo {
  abstract method(): string;
}
    `,
    `
class Foo {
  accessor prop: string;
}
    `,
    `
class Foo {
  accessor prop = 'bar';
  static bar() {
    return false;
  }
}
    `,
    `
class Foo {
  [key: string]: string;
}
    `,
    `
abstract class Foo {
  accessor prop: string;
}
    `,
    `
abstract class Foo {
  abstract accessor prop: string;
}
    `,
  ],

  invalid: [
    {
      code: 'class Foo {}',
      errors: [
        {
          column: 7,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'empty',
        },
      ],
    },
    {
      code: `
class Foo {
  public prop = 1;
  constructor() {
    class Bar {
      static PROP = 2;
    }
  }
}
export class Bar {
  public static helper(): void {}
  private static privateHelper(): boolean {
    return true;
  }
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 5,
          line: 5,
          messageId: 'onlyStatic',
        },
        {
          column: 14,
          endColumn: 17,
          endLine: 10,
          line: 10,
          messageId: 'onlyStatic',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor() {}
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 10,
          endLine: 2,
          line: 2,
          messageId: 'onlyConstructor',
        },
      ],
    },
    {
      code: `
export class AClass {
  public static helper(): void {}
  private static privateHelper(): boolean {
    return true;
  }
  constructor() {
    class nestedClass {}
  }
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 20,
          endLine: 2,
          line: 2,
          messageId: 'onlyStatic',
        },
        {
          column: 11,
          endColumn: 22,
          endLine: 8,
          line: 8,
          messageId: 'empty',
        },
      ],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/170
      code: `
export default class {
  static hello() {}
}
      `,
      errors: [
        {
          column: 16,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'onlyStatic',
        },
      ],
    },
    {
      code: `
@FooDecorator
class Foo {}
      `,
      errors: [
        {
          column: 7,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'empty',
        },
      ],
      options: [{ allowWithDecorator: false }],
    },
    {
      code: `
@FooDecorator
class Foo {
  constructor(foo: Foo) {
    foo.subscribe(a => {
      console.log(a);
    });
  }
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'onlyConstructor',
        },
      ],
      options: [{ allowWithDecorator: false }],
    },
    {
      code: `
abstract class Foo {}
      `,
      errors: [
        {
          column: 16,
          endColumn: 19,
          endLine: 2,
          line: 2,
          messageId: 'empty',
        },
      ],
    },
    {
      code: `
abstract class Foo {
  static property: string;
}
      `,
      errors: [
        {
          column: 16,
          endColumn: 19,
          endLine: 2,
          line: 2,
          messageId: 'onlyStatic',
        },
      ],
    },
    {
      code: `
abstract class Foo {
  constructor() {}
}
      `,
      errors: [
        {
          column: 16,
          endColumn: 19,
          endLine: 2,
          line: 2,
          messageId: 'onlyConstructor',
        },
      ],
    },
    {
      code: `
class Foo {
  static accessor prop: string;
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 10,
          endLine: 2,
          line: 2,
          messageId: 'onlyStatic',
        },
      ],
    },
    {
      code: `
abstract class Foo {
  static accessor prop: string;
}
      `,
      errors: [
        {
          column: 16,
          endColumn: 19,
          endLine: 2,
          line: 2,
          messageId: 'onlyStatic',
        },
      ],
    },
  ],
});
