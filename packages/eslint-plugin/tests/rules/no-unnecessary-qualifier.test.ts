import rule from '../../src/rules/no-unnecessary-qualifier';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-unnecessary-qualifier', rule, {
  valid: [
    `
namespace X {
  export type T = number;
}

namespace Y {
  export const x: X.T = 3;
}
    `,
    `
namespace A {}
namespace A.B {
  export type Z = 1;
}
    `,
    `
enum A {
  X,
  Y,
}

enum B {
  Z = A.X,
}
    `,
    `
namespace X {
  export type T = number;
  namespace Y {
    type T = string;
    const x: X.T = 0;
  }
}
    `,
    'const x: A.B = 3;',
    `
namespace X {
  const z = X.y;
}
    `,
    `
enum Foo {
  One,
}

namespace Foo {
  export function bar() {
    return Foo.One;
  }
}
    `,
    `
namespace Foo {
  export enum Foo {
    One,
  }
}

namespace Foo {
  export function bar() {
    return Foo.One;
  }
}
    `,
  ],

  invalid: [
    {
      code: `
namespace A {
  export type B = number;
  const x: A.B = 3;
}
      `,
      errors: [
        {
          column: 12,
          endColumn: 13,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryQualifier',
        },
      ],
      output: `
namespace A {
  export type B = number;
  const x: B = 3;
}
      `,
    },
    {
      code: `
namespace A {
  export const x = 3;
  export const y = A.x;
}
      `,
      errors: [
        {
          column: 20,
          endColumn: 21,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryQualifier',
        },
      ],
      output: `
namespace A {
  export const x = 3;
  export const y = x;
}
      `,
    },
    {
      code: `
namespace A {
  export type T = number;
  export namespace B {
    const x: A.T = 3;
  }
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 15,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryQualifier',
        },
      ],
      output: `
namespace A {
  export type T = number;
  export namespace B {
    const x: T = 3;
  }
}
      `,
    },
    {
      code: `
namespace A {
  export namespace B {
    export type T = number;
    const x: A.B.T = 3;
  }
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryQualifier',
        },
      ],
      output: `
namespace A {
  export namespace B {
    export type T = number;
    const x: T = 3;
  }
}
      `,
    },
    {
      code: `
namespace A {
  export namespace B.C {
    export type D = number;
    const x: A.B.C.D = 3;
  }
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 19,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryQualifier',
        },
      ],
      output: `
namespace A {
  export namespace B.C {
    export type D = number;
    const x: D = 3;
  }
}
      `,
    },
    {
      code: `
namespace A {
  export namespace B {
    export const x = 3;
    const y = A.B.x;
  }
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryQualifier',
        },
      ],
      output: `
namespace A {
  export namespace B {
    export const x = 3;
    const y = x;
  }
}
      `,
    },
    {
      code: `
enum A {
  B,
  C = A.B,
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryQualifier',
        },
      ],
      output: `
enum A {
  B,
  C = B,
}
      `,
    },
    {
      code: `
namespace Foo {
  export enum A {
    B,
    C = Foo.A.B,
  }
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 14,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryQualifier',
        },
      ],
      output: `
namespace Foo {
  export enum A {
    B,
    C = B,
  }
}
      `,
    },
    {
      code: `
import * as Foo from './foo';
declare module './foo' {
  const x: Foo.T = 3;
}
      `,
      errors: [
        {
          column: 12,
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryQualifier',
        },
      ],
      output: `
import * as Foo from './foo';
declare module './foo' {
  const x: T = 3;
}
      `,
    },
  ],
});
