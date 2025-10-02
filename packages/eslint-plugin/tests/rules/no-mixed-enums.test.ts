import rule from '../../src/rules/no-mixed-enums';
import { getTypedRuleTester } from '../RuleTester';

const ruleTester = getTypedRuleTester();

ruleTester.run('no-mixed-enums', rule, {
  valid: [
    `
      enum Fruit {}
    `,
    `
      enum Fruit {
        Apple,
      }
    `,
    `
      enum Fruit {
        Apple = false,
      }
    `,
    `
      enum Fruit {
        Apple,
        Banana,
      }
    `,
    `
      enum Fruit {
        Apple = 0,
        Banana,
      }
    `,
    `
      enum Fruit {
        Apple,
        Banana = 1,
      }
    `,
    `
      enum Fruit {
        Apple = 0,
        Banana = 1,
      }
    `,
    `
      enum Fruit {
        Apple,
        Banana = false,
      }
    `,
    `
      const getValue = () => 0;
      enum Fruit {
        Apple,
        Banana = getValue(),
      }
    `,
    `
      const getValue = () => 0;
      enum Fruit {
        Apple = getValue(),
        Banana = getValue(),
      }
    `,
    `
      const getValue = () => '';
      enum Fruit {
        Apple = '',
        Banana = getValue(),
      }
    `,
    `
      const getValue = () => '';
      enum Fruit {
        Apple = getValue(),
        Banana = '',
      }
    `,
    `
      const getValue = () => '';
      enum Fruit {
        Apple = getValue(),
        Banana = getValue(),
      }
    `,
    `
      enum First {
        A = 1,
      }

      enum Second {
        A = First.A,
        B = 2,
      }
    `,
    `
      enum First {
        A = '',
      }

      enum Second {
        A = First.A,
        B = 'b',
      }
    `,
    `
      enum Foo {
        A,
      }
      enum Foo {
        B,
      }
    `,
    `
      enum Foo {
        A = 0,
      }
      enum Foo {
        B,
      }
    `,
    `
      enum Foo {
        A,
      }
      enum Foo {
        B = 1,
      }
    `,
    `
      enum Foo {
        A = 0,
      }
      enum Foo {
        B = 1,
      }
    `,
    `
      enum Foo {
        A = 'a',
      }
      enum Foo {
        B = 'b',
      }
    `,
    `
      declare const Foo: any;
      enum Foo {
        A,
      }
    `,
    `
enum Foo {
  A = 1,
}
enum Foo {
  B = 2,
}
    `,
    `
enum Foo {
  A = \`A\`,
}
enum Foo {
  B = \`B\`,
}
    `,
    `
enum Foo {
  A = false, // (TS error)
}
enum Foo {
  B = \`B\`,
}
    `,
    `
enum Foo {
  A = 'A',
}
enum Foo {
  B = false, // (TS error)
}
    `,
    `
import { Enum } from './mixed-enums-decl';

declare module './mixed-enums-decl' {
  enum Enum {
    StringLike = 'StringLike',
  }
}
    `,
    `
import { Enum } from "module-that-does't-exist";

declare module "module-that-doesn't-exist" {
  enum Enum {
    StringLike = 'StringLike',
  }
}
    `,
    `
namespace Test {
  export enum Bar {
    A = 1,
  }
}
namespace Test {
  export enum Bar {
    B = 2,
  }
}
    `,
    `
namespace Outer {
  namespace Test {
    export enum Bar {
      A = 1,
    }
  }
}
namespace Outer {
  namespace Test {
    export enum Bar {
      B = 'B',
    }
  }
}
    `,
    `
namespace Outer {
  namespace Test {
    export enum Bar {
      A = 1,
    }
  }
}
namespace Different {
  namespace Test {
    export enum Bar {
      B = 'B',
    }
  }
}
    `,
  ],
  invalid: [
    {
      code: `
        enum Fruit {
          Apple,
          Banana = 'banana',
        }
      `,
      errors: [
        {
          column: 20,
          endColumn: 28,
          line: 4,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
          Banana = 'banana',
          Cherry = 'cherry',
        }
      `,
      errors: [
        {
          column: 20,
          endColumn: 28,
          line: 4,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
          Banana,
          Cherry = 'cherry',
        }
      `,
      errors: [
        {
          column: 20,
          endColumn: 28,
          line: 5,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple = 0,
          Banana = 'banana',
        }
      `,
      errors: [
        {
          column: 20,
          endColumn: 28,
          line: 4,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        const getValue = () => 0;
        enum Fruit {
          Apple = getValue(),
          Banana = 'banana',
        }
      `,
      errors: [
        {
          column: 20,
          endColumn: 28,
          line: 5,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        const getValue = () => '';
        enum Fruit {
          Apple,
          Banana = getValue(),
        }
      `,
      errors: [
        {
          column: 20,
          endColumn: 30,
          line: 5,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        const getValue = () => '';
        enum Fruit {
          Apple = getValue(),
          Banana = 0,
        }
      `,
      errors: [
        {
          column: 20,
          endColumn: 21,
          line: 5,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum First {
          A = 1,
        }

        enum Second {
          A = First.A,
          B = 'b',
        }
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          line: 8,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum First {
          A = 'a',
        }

        enum Second {
          A = First.A,
          B = 1,
        }
      `,
      errors: [
        {
          column: 15,
          endColumn: 16,
          line: 8,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum Foo {
          A,
        }
        enum Foo {
          B = 'b',
        }
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          line: 6,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum Foo {
          A = 1,
        }
        enum Foo {
          B = 'b',
        }
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          line: 6,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum Foo {
          A = 'a',
        }
        enum Foo {
          B,
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 6,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum Foo {
          A = 'a',
        }
        enum Foo {
          B = 0,
        }
      `,
      errors: [
        {
          column: 15,
          endColumn: 16,
          line: 6,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum Foo {
          A,
        }
        enum Foo {
          B = 'b',
        }
        enum Foo {
          C = 'c',
        }
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          line: 6,
          messageId: 'mixed',
        },
        {
          column: 15,
          endColumn: 18,
          line: 9,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum Foo {
          A,
        }
        enum Foo {
          B = 'b',
        }
        enum Foo {
          C,
        }
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          line: 6,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
        enum Foo {
          A,
        }
        enum Foo {
          B,
        }
        enum Foo {
          C = 'c',
        }
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          line: 9,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
import { Enum } from './mixed-enums-decl';

declare module './mixed-enums-decl' {
  enum Enum {
    Numeric = 0,
  }
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 16,
          line: 6,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
enum Foo {
  A = 1,
}
enum Foo {
  B = 'B',
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 10,
          line: 6,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
namespace Test {
  export enum Bar {
    A = 1,
  }
}
namespace Test {
  export enum Bar {
    B = 'B',
  }
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 12,
          line: 9,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
namespace Test {
  export enum Bar {
    A,
  }
}
namespace Test {
  export enum Bar {
    B = 'B',
  }
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 12,
          line: 9,
          messageId: 'mixed',
        },
      ],
    },
    {
      code: `
namespace Outer {
  export namespace Test {
    export enum Bar {
      A = 1,
    }
  }
}
namespace Outer {
  export namespace Test {
    export enum Bar {
      B = 'B',
    }
  }
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          line: 12,
          messageId: 'mixed',
        },
      ],
    },
  ],
});
