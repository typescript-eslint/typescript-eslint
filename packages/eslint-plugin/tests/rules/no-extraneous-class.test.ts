import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/no-extraneous-class';

const empty = {
  messageId: 'empty' as const,
};
const onlyStatic = {
  messageId: 'onlyStatic' as const,
};
const onlyConstructor = {
  messageId: 'onlyConstructor' as const,
};

const ruleTester = new RuleTester();

ruleTester.run('no-extraneous-class', rule, {
  invalid: [
    {
      code: 'class Foo {}',
      errors: [empty],
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
      errors: [onlyStatic, onlyStatic],
    },
    {
      code: `
class Foo {
  constructor() {}
}
      `,
      errors: [onlyConstructor],
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
      errors: [onlyStatic, empty],
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
          ...onlyStatic,
          type: AST_NODE_TYPES.ClassDeclaration,
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
          messageId: 'onlyConstructor',
        },
      ],
      options: [{ allowWithDecorator: false }],
    },
    {
      code: `
abstract class Foo {}
      `,
      errors: [empty],
    },
    {
      code: `
abstract class Foo {
  static property: string;
}
      `,
      errors: [onlyStatic],
    },
    {
      code: `
abstract class Foo {
  constructor() {}
}
      `,
      errors: [onlyConstructor],
    },
    {
      code: `
class Foo {
  static accessor prop: string;
}
      `,
      errors: [onlyStatic],
    },
    {
      code: `
abstract class Foo {
  static accessor prop: string;
}
      `,
      errors: [onlyStatic],
    },
  ],

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
});
