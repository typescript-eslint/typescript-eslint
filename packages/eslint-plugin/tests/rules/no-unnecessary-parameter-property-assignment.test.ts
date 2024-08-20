import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unnecessary-parameter-property-assignment';

const ruleTester = new RuleTester();

ruleTester.run('no-unnecessary-parameter-property-assignment', rule, {
  invalid: [
    {
      code: `
class Foo {
  constructor(public foo: string) {
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo?: string) {
    this.foo = foo!;
  }
}
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo?: string) {
    this.foo = foo as any;
  }
}
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo = '') {
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo = '') {
    this.foo = foo;
    this.foo += 'foo';
  }
}
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    this.foo ||= foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    this.foo ??= foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    this.foo &&= foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private foo: string) {
    this['foo'] = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private foo: string) {
    function bar() {
      this.foo = foo;
    }
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          line: 7,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private foo: string) {
    this.bar = () => {
      this.foo = foo;
    };
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          line: 7,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private foo: string) {
    class Bar {
      constructor(private foo: string) {
        this.foo = foo;
      }
    }
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 9,
          line: 6,
          messageId: 'unnecessaryAssign',
        },
        {
          column: 5,
          line: 9,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private foo: string) {
    this.foo = foo;
  }
  bar = () => {
    this.foo = 'foo';
  };
}
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private foo: string) {
    this.foo = foo;
  }
  init = foo => {
    this.foo = foo;
  };
}
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private foo: string) {
    this.foo = foo;
  }
  init = class Bar {
    constructor(private foo: string) {
      this.foo = foo;
    }
  };
}
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
        {
          column: 7,
          line: 8,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private foo: string) {
    {
      this.foo = foo;
    }
  }
}
      `,
      errors: [
        {
          column: 7,
          line: 5,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private foo: string) {
    (() => {
      this.foo = foo;
    })();
  }
}
      `,
      errors: [
        {
          column: 7,
          line: 5,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
  ],
  valid: [
    `
class Foo {
  constructor(foo: string) {}
}
    `,
    `
class Foo {
  constructor(private foo: string) {}
}
    `,
    `
class Foo {
  constructor(private foo: string) {
    this.foo = bar;
  }
}
    `,
    `
class Foo {
  constructor(private foo: any) {
    this.foo = foo.bar;
  }
}
    `,
    `
class Foo {
  constructor(private foo: string) {
    this.foo = this.bar;
  }
}
    `,
    `
class Foo {
  foo: string;
  constructor(foo: string) {
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar: string;
  constructor(private foo: string) {
    this.bar = foo;
  }
}
    `,
    `
class Foo {
  constructor(private foo: string) {
    this.bar = () => {
      this.foo = foo;
    };
  }
}
    `,
    `
class Foo {
  constructor(private foo: string) {
    this[\`\${foo}\`] = foo;
  }
}
    `,
    `
function Foo(foo) {
  this.foo = foo;
}
    `,
    `
const foo = 'foo';
this.foo = foo;
    `,
    `
class Foo {
  constructor(public foo: number) {
    this.foo += foo;
    this.foo -= foo;
    this.foo *= foo;
    this.foo /= foo;
    this.foo %= foo;
    this.foo **= foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    this.foo += 1;
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(
    public foo: number,
    bar: boolean,
  ) {
    if (bar) {
      this.foo += 1;
    } else {
      this.foo = foo;
    }
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    this.foo = foo;
  }
  init = (this.foo += 1);
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    {
      const foo = 1;
      this.foo = foo;
    }
  }
}
    `,
    `
declare const name: string;
class Foo {
  constructor(public foo: number) {
    this[name] = foo;
  }
}
    `,
    `
declare const name: string;
class Foo {
  constructor(public foo: number) {
    Foo.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    this.foo = foo;
  }
  init = (() => {
    this.foo += 1;
  })();
}
    `,
    `
declare const name: string;
class Foo {
  constructor(public foo: number) {
    this[name] = foo;
  }
  init = (this[name] = 1);
  init2 = (Foo.foo = 1);
}
    `,
  ],
});
