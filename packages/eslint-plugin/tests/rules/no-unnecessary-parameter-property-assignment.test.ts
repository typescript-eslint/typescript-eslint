import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unnecessary-parameter-property-assignment';

const ruleTester = new RuleTester();

ruleTester.run('no-unnecessary-parameter-property-assignment', rule, {
  assertionOptions: {
    requireData: true,
  },
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
    `
class Foo {
  constructor(public foo: string) {
    this[foo] = foo;
  }
}
    `,
    `
class User {
  constructor(public name: string) {
    name = name.trim();
    this.name = name;
  }
}
    `,
    `
class User {
  constructor(public name: string) {
    name += '!';
    this.name = name;
  }
}
    `,
    `
class User {
  constructor(
    public name: string,
    flag: boolean,
  ) {
    if (flag) {
      name = name.trim();
    }
    this.name = name;
  }
}
    `,
    `
class User {
  constructor(
    public name: string,
    public age: number,
  ) {
    name = name.trim();
    this.name = name;
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    setTimeout(() => {
      this.foo = foo;
    });
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    [1].forEach(() => {
      this.foo += 'bar';
    });
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    [1].forEach(() => {
      this.foo++;
    });
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar = [1].map(() => {
    this.foo = 'bar';
  });
  constructor(public foo: string) {
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    ((foo: string) => {
      this.foo = foo;
    })('bar');
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    foo++;
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    [foo] = [1];
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    ({ foo } = { foo: 1 });
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    this.foo++;
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    [this.foo] = [1];
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    ({ foo: this.foo } = { foo: 1 });
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    for (this.foo of [1]) {
    }
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    for (this.foo in {}) {
    }
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    [this.foo = 1] = [];
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number[]) {
    [...this.foo] = [1];
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    this.foo = 'bar';
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  #foo: string;
  constructor(public foo: string) {
    this.#foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(foo: string) {
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(
    public bar: string,
    foo: string,
  ) {
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(
    public bar = '',
    foo: string,
  ) {
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    const setFoo = function () {
      this.foo = foo;
    };
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    const setFoo = () => {
      this.foo = foo;
    };
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    (function () {
      this.foo = foo;
    })();
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    (this.foo as number) = 1;
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    (this.foo as number)++;
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    (<number>this.foo) = 1;
    this.foo = foo;
  }
}
    `,
    {
      code: `
class Foo {
  constructor(public foo: number) {
    (this.foo satisfies number) = 1;
    this.foo = foo;
  }
}
      `,
      // `satisfies` requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
    },
    `
class Foo {
  constructor(public foo: number) {
    this.foo! = 1;
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    [this.foo!] = [1];
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    ({ foo: this.foo as number } = { foo: 1 });
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    for (this.foo! of [1]) {
    }
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo?: number) {
    delete this.foo;
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo?: number) {
    delete this['foo'];
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo?: number) {
    delete this?.foo;
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo?: number) {
    delete (this.foo as number | undefined);
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    const setFoo = () => {
      this.foo = 1;
    };
    setFoo();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    let setFoo = () => {
      this.foo = 1;
    };
    setFoo();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    const setFoo = () => {
      this.foo++;
    };
    const run = () => setFoo();
    run();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    const setFoo = () => {
      this.foo = 1;
    };
    function run() {
      setFoo();
    }
    run();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo?: number) {
    const setFoo = () => {
      delete this.foo;
    };
    register(setFoo);
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    const setFoo = () => {
      const inner = () => {
        this.foo = 1;
      };
      inner();
    };
    setFoo();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: number) {
    const setters = {
      foo: () => {
        this.foo = 1;
      },
    };
    setters.foo();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    var foo = 'bar';
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    for (var foo of ['bar']) {
    }
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    for (let i = 0; i < 2; i++) {
      this.foo = foo;
      foo = 'bar';
    }
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    for (const x of [1, 2]) {
      this.foo = foo;
      this.foo = 'bar';
    }
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    (() => {
      while (Math.random()) {
        this.foo = foo;
        foo = 'bar';
      }
    })();
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    do {
      this.foo = foo;
      foo = 'bar';
    } while (Math.random());
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    const change = () => {
      this.foo = 'bar';
    };
    for (let i = 0; i < 2; i++) {
      this.foo = foo;
      change();
    }
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    for (let i = 0; i < 2; foo = 'bar') {
      this.foo = foo;
    }
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    change();
    this.foo = foo;
    function change() {
      foo = 'bar';
    }
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    const change = () => {
      foo = 'bar';
    };
    [1].forEach(change);
    this.foo = foo;
  }
}
    `,
    `
class Outer {
  constructor(public foo: string) {
    class Inner {
      static {
        this.foo = foo;
      }
      static foo: string;
    }
  }
}
    `,
    `
class Outer {
  constructor(public foo: string) {
    class Inner {
      foo = (this.foo = foo);
    }
  }
}
    `,
    `
class Outer {
  constructor(public foo: string) {
    class Inner {
      foo = () => {
        this.foo = foo;
      };
    }
  }
}
    `,
    `
class Outer {
  constructor(public foo: string) {
    class Inner {
      [(this.foo = 'bar')] = 1;
    }
    this.foo = foo;
  }
}
    `,
    `
class Outer {
  constructor(public foo: string) {
    class Inner {
      static {
        foo = 'bar';
      }
    }
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    (() => {
      setTimeout(() => {
        this.foo = foo;
      });
    })();
  }
}
    `,
    `
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    this.bar = () => {
      this.foo = 'x';
    };
    this.bar();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    this['bar'] = () => {
      this.foo = 'x';
    };
    this.bar();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    this.bar = () => {
      foo = 'x';
    };
    this.bar();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    this.bar = () => {
      this.foo = 'x';
    };
    const { bar } = this;
    bar();
    this.foo = foo;
  }
}
    `,
    `
declare function register(foo: Foo): void;
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    this.bar = () => {
      this.foo = 'x';
    };
    register(this);
    this.foo = foo;
  }
}
    `,
    `
declare const key: string;
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    this.bar = () => {
      this.foo = 'x';
    };
    this[key]();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    const setBar = () => {
      this.bar = () => {
        this.foo = 'x';
      };
    };
    setBar();
    this.bar();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    for (const _ of [1, 2]) {
      this.foo = foo;
      this.bar = () => {
        this.foo = 'x';
      };
      this.bar();
    }
  }
}
    `,
    `
class Foo {
  handlers: { a: () => void };
  constructor(public foo: string) {
    this.handlers = {
      a: () => {
        this.foo = 'x';
      },
    };
    this.handlers.a();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    const handlers = {
      a: () => {
        this.foo = 'x';
      },
    };
    handlers.a();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    const handlers = {
      inner: {
        a: () => {
          foo = 'x';
        },
      },
    };
    handlers.inner.a();
    this.foo = foo;
  }
}
    `,
    `
declare function register(handlers: object): void;
class Foo {
  constructor(public foo: string) {
    register({
      a: () => {
        this.foo = 'x';
      },
    });
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    const handlers = [
      () => {
        this.foo = 'x';
      },
    ];
    handlers[0]();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    (async () => {
      await 0;
      this.foo = foo;
    })();
    this.foo = 'x';
  }
}
    `,
    // The part of an async IIFE before its first `await` runs immediately,
    // but this rule doesn't tell it apart from the rest.
    `
class Foo {
  constructor(public foo: string) {
    (async () => {
      this.foo = foo;
    })();
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    (async () => {
      (() => {
        this.foo = foo;
      })();
    })();
  }
}
    `,
    `
class Foo {
  constructor(public foo: string) {
    (async () => {
      await 0;
      this.foo = 'x';
    })();
    this.foo = foo;
  }
}
    `,
    // The assignment's value also reaches the function.
    `
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    (this.bar = () => {
      this.foo = 'x';
    })();
    this.foo = foo;
  }
}
    `,
    `
declare function run(f: () => void): void;
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    run(
      (this.bar = () => {
        this.foo = 'x';
      }),
    );
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    const f = (this.bar = () => {
      this.foo = 'x';
    });
    f();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  handlers?: { a: () => void };
  constructor(public foo: string) {
    (this.handlers = {
      a: () => {
        this.foo = 'x';
      },
    }).a();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar?: () => void;
  baz?: () => void;
  constructor(public foo: string) {
    this.bar = this.baz = () => {
      this.foo = 'x';
    };
    this.baz();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    (this.bar = () => {
      foo = 'x';
    })();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar = () => {
    this.foo = 'x';
  };
  constructor(public foo: string) {
    this.bar();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar = function (this: Foo) {
    this.foo = 'x';
  };
  constructor(public foo: string) {
    this.bar();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  handlers = {
    a: () => {
      this.foo = 'x';
    },
  };
  constructor(public foo: string) {
    this.handlers.a();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  handlers = [
    () => {
      this.foo = 'x';
    },
  ];
  constructor(public foo: string) {
    this.handlers[0]();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar = () => {
    this.foo = 'x';
  };
  constructor(public foo: string) {
    const { bar } = this;
    bar();
    this.foo = foo;
  }
}
    `,
    `
declare function register(foo: Foo): void;
class Foo {
  bar = () => {
    this.foo = 'x';
  };
  constructor(public foo: string) {
    register(this);
    this.foo = foo;
  }
}
    `,
    // Field initializers run as part of the constructor.
    `
class Foo {
  bar = () => {
    this.foo = 'x';
  };
  baz = this.bar();
  constructor(public foo: string) {
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  #bar = () => {
    this.foo = 'x';
  };
  constructor(public foo: string) {
    this.#bar();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar = () => {
    const g = () => {
      this.foo = 'x';
    };
    g();
  };
  constructor(public foo: string) {
    this.bar();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  a = () => this.b();
  b = () => {
    this.foo = 'x';
  };
  constructor(public foo: string) {
    this.a();
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar = (foo: string) => {
    this.foo = foo;
  };
  constructor(public foo: string) {
    this.bar('x');
    this.foo = foo;
  }
}
    `,
    `
class Foo {
  bar = () => {
    this.foo = 'x';
  };
  constructor(public foo: string) {
    this['bar']();
    this.foo = foo;
  }
}
    `,
    {
      code: `
class Foo {
  accessor bar = () => {
    this.foo = 'x';
  };
  constructor(public foo: string) {
    this.bar();
    this.foo = foo;
  }
}
      `,
      // `accessor` requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
    },
    `
class Foo {
  bar = () => {
    this.foo = 'x';
  };
  constructor(foo: number);
  constructor(public foo: string) {
    this.bar();
    this.foo = foo;
  }
}
    `,
  ],
  invalid: [
    {
      code: `
class Foo {
  constructor(public foo: string) {
    [1].forEach(function () {
      this.foo += 'bar';
    });
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    [1].forEach(() => {
      this.foo = foo;
    });
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    [1].forEach(() => {
      this.foo ??= foo;
    });
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  bar = [1].map(function () {
    this.foo = 'bar';
  });
  constructor(public foo: string) {
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  bar = [
    () => {
      this.foo = 'bar';
    },
  ];
  constructor(public foo: string) {
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 9,
          line: 9,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
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
          endColumn: 19,
          endLine: 4,
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
          endColumn: 20,
          endLine: 4,
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
          endColumn: 26,
          endLine: 4,
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
          endColumn: 19,
          endLine: 4,
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
          endColumn: 19,
          endLine: 4,
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
          endColumn: 21,
          endLine: 4,
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
          endColumn: 21,
          endLine: 4,
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
          endColumn: 21,
          endLine: 4,
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
          endColumn: 22,
          endLine: 4,
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
          endColumn: 19,
          endLine: 7,
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
          endColumn: 19,
          endLine: 7,
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
  }
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 23,
          endLine: 6,
          line: 6,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private foo: string) {
    class Bar {
      constructor(private foo: string) {}
    }
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 7,
          line: 7,
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
          endColumn: 19,
          endLine: 4,
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
          endColumn: 19,
          endLine: 4,
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
    constructor(private foo: string) {}
  };
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private foo: string) {}
  init = class Bar {
    constructor(private foo: string) {
      this.foo = foo;
    }
  };
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 21,
          endLine: 6,
          line: 6,
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
          endColumn: 21,
          endLine: 5,
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
          endColumn: 21,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class User {
  constructor(public name: string) {
    this.name = name;
    name = name.trim();
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 21,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class User {
  constructor(
    public name: string,
    public age: number,
  ) {
    name = name.trim();
    this.name = name;
    this.age = age;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 9,
          line: 9,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      // Identifier write that is not the parameter must not suppress the report.
      code: `
class User {
  constructor(public name: string) {
    let local = name;
    local = local.trim();
    this.name = name;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 21,
          endLine: 6,
          line: 6,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  bar = () => {
    (() => {
      this.foo = 'bar';
    })();
  };
  constructor(public foo: string) {
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 9,
          line: 9,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    {
      let foo = '';
      foo = 'bar';
    }
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 8,
          line: 8,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    const copy = { foo: this.foo };
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    ({ [this.foo]: copy } = { bar: '' });
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    const increment = () => {
      this.foo++;
    };
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: number) {
    const setFoo = () => {
      this.foo = 1;
    };
    this.foo = foo;
    setFoo();
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: number) {
    const setFoo = () => {
      this.foo = 1;
      setFoo();
    };
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 8,
          line: 8,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: number) {
    const setFoo = () => {
      this.foo = 1;
    };
    function run() {
      setFoo();
    }
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 10,
          line: 10,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo?: number) {
    [1].forEach(function () {
      delete this.foo;
    });
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: number) {
    this.foo = foo;
    (this.foo as number) = 1;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    for (const x of [1, 2]) {
      this.foo = foo;
    }
    foo = 'bar';
    this.foo = 'baz';
  }
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 21,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    (() => {
      (() => {
        this.foo = foo;
      })();
    })();
  }
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 23,
          endLine: 6,
          line: 6,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Outer {
  constructor(public foo: string) {
    class Inner {
      static {
        this.foo = 'bar';
      }
      static foo: string;
    }
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 10,
          line: 10,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    var foo: string;
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    this.foo = foo;
    var foo = 'bar';
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    function change() {
      foo = 'bar';
    }
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    const change = () => {
      foo = 'bar';
    };
    this.foo = foo;
    change();
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string[]) {
    let copy;
    [copy = this.foo] = [];
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 6,
          line: 6,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string[]) {
    for (const x of this.foo) {
    }
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 6,
          line: 6,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    this.bar = () => {
      this.foo = 'x';
    };
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 8,
          line: 8,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    this.bar = () => {
      foo = 'x';
    };
    this.foo = foo;
    this.bar();
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 8,
          line: 8,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      // Like writes in other methods, calls from them are not tracked.
      code: `
class Foo {
  bar?: () => void;
  init(): void {}
  constructor(public foo: string) {
    this.bar = () => {
      this.foo = 'x';
    };
    this.init();
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 10,
          line: 10,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  handlers: { a: () => void };
  constructor(public foo: string) {
    this.handlers = {
      a: () => {
        this.foo = 'x';
      },
    };
    this.foo = foo;
    this.handlers.a();
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 10,
          line: 10,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    const handlers = {
      a: () => {
        this.foo = 'x';
      },
    };
    this.foo = foo;
    handlers.a();
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 9,
          line: 9,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    const handlers = {
      inner: {
        a: () => {
          foo = 'x';
        },
      },
    };
    this.foo = foo;
    handlers.inner.a();
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 11,
          line: 11,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public foo: string) {
    (async () => {
      await 0;
      this.foo = foo;
    })();
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 8,
          line: 8,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  bar?: () => void;
  constructor(public foo: string) {
    this.bar = () => {
      this.foo = 'x';
    };
    this.foo = foo;
    this.bar();
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 8,
          line: 8,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  bar = () => {
    this.foo = 'x';
  };
  constructor(public foo: string) {
    this.foo = foo;
    this.bar();
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  static foo = '';
  static bar = () => {
    this.foo = 'x';
  };
  constructor(public foo: string) {
    Foo.bar();
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 9,
          line: 9,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
    {
      code: `
class Foo {
  handlers = {
    foo: '',
    a() {
      this.foo = 'x';
    },
  };
  constructor(public foo: string) {
    this.handlers.a();
    this.foo = foo;
  }
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 19,
          endLine: 11,
          line: 11,
          messageId: 'unnecessaryAssign',
        },
      ],
    },
  ],
});
