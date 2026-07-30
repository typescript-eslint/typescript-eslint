/* eslint-disable @typescript-eslint/internal/no-multiple-lines-of-errors */
import { RuleTester } from '@typescript-eslint/rule-tester';

import rule, { defaultOrder } from '../../../src/rules/member-ordering';

const ruleTester = new RuleTester();

ruleTester.run('member-ordering-alphabetically-case-insensitive-order', rule, {
  invalid: [
    // default option + interface + wrong order (multiple)
    {
      code: `
interface Foo {
  c: string;
  B: string;
  a: string;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            beforeMember: 'c',
            member: 'B',
          },
          endColumn: 13,
          endLine: 4,
          line: 4,
          messageId: 'incorrectOrder',
        },
        {
          column: 3,
          data: {
            beforeMember: 'B',
            member: 'a',
          },
          endColumn: 13,
          endLine: 5,
          line: 5,
          messageId: 'incorrectOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + interface + lower/upper case wrong order
    {
      code: `
interface Foo {
  B: b;
  a: b;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            beforeMember: 'B',
            member: 'a',
          },
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'incorrectOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + type literal + lower/upper case wrong order
    {
      code: `
type Foo = {
  B: b;
  a: b;
};
      `,
      errors: [
        {
          column: 3,
          data: {
            beforeMember: 'B',
            member: 'a',
          },
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'incorrectOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + class + lower/upper case wrong order
    {
      code: `
class Foo {
  public static B: string;
  public static a: string;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            beforeMember: 'B',
            member: 'a',
          },
          endColumn: 27,
          endLine: 4,
          line: 4,
          messageId: 'incorrectOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + class expression + lower/upper case wrong order
    {
      code: `
const foo = class Foo {
  public static B: string;
  public static a: string;
};
      `,
      errors: [
        {
          column: 3,
          data: {
            beforeMember: 'B',
            member: 'a',
          },
          endColumn: 27,
          endLine: 4,
          line: 4,
          messageId: 'incorrectOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },
    // default option + interface + wrong order within group and wrong group order + alphabetically
    {
      code: `
interface Foo {
  [a: string]: number;

  a: x;
  B: x;
  c: x;

  c(): void;
  B(): void;
  a(): void;

  (): Baz;

  new (): Bar;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            beforeMember: 'c',
            member: 'B',
          },
          endColumn: 13,
          endLine: 10,
          line: 10,
          messageId: 'incorrectOrder',
        },
        {
          column: 3,
          data: {
            beforeMember: 'B',
            member: 'a',
          },
          endColumn: 13,
          endLine: 11,
          line: 11,
          messageId: 'incorrectOrder',
        },
        {
          column: 3,
          data: {
            name: 'call',
            rank: 'field',
          },
          endColumn: 11,
          endLine: 13,
          line: 13,
          messageId: 'incorrectGroupOrder',
        },
        {
          column: 3,
          data: {
            name: 'new',
            rank: 'method',
          },
          endColumn: 15,
          endLine: 15,
          line: 15,
          messageId: 'incorrectGroupOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: defaultOrder,
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + type literal + wrong order within group and wrong group order + alphabetically
    {
      code: `
type Foo = {
  [a: string]: number;

  a: x;
  B: x;
  c: x;

  c(): void;
  B(): void;
  a(): void;

  (): Baz;

  new (): Bar;
};
      `,
      errors: [
        {
          column: 3,
          data: {
            beforeMember: 'c',
            member: 'B',
          },
          endColumn: 13,
          endLine: 10,
          line: 10,
          messageId: 'incorrectOrder',
        },
        {
          column: 3,
          data: {
            beforeMember: 'B',
            member: 'a',
          },
          endColumn: 13,
          endLine: 11,
          line: 11,
          messageId: 'incorrectOrder',
        },
        {
          column: 3,
          data: {
            name: 'call',
            rank: 'field',
          },
          endColumn: 11,
          endLine: 13,
          line: 13,
          messageId: 'incorrectGroupOrder',
        },
        {
          column: 3,
          data: {
            name: 'new',
            rank: 'method',
          },
          endColumn: 15,
          endLine: 15,
          line: 15,
          messageId: 'incorrectGroupOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: defaultOrder,
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + class + wrong order within group and wrong group order + alphabetically
    {
      code: `
class Foo {
  public static c: string = '';
  public static B: string = '';
  public static a: string;

  constructor() {}

  public d: string = '';
}
      `,
      errors: [
        {
          column: 3,
          data: {
            beforeMember: 'c',
            member: 'B',
          },
          endColumn: 32,
          endLine: 4,
          line: 4,
          messageId: 'incorrectOrder',
        },
        {
          column: 3,
          data: {
            beforeMember: 'B',
            member: 'a',
          },
          endColumn: 27,
          endLine: 5,
          line: 5,
          messageId: 'incorrectOrder',
        },
        {
          column: 3,
          data: {
            name: 'd',
            rank: 'public constructor',
          },
          endColumn: 25,
          endLine: 9,
          line: 9,
          messageId: 'incorrectGroupOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: defaultOrder,
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + class expression + wrong order within group and wrong group order + alphabetically
    {
      code: `
const foo = class Foo {
  public static c: string = '';
  public static B: string = '';
  public static a: string;

  constructor() {}

  public d: string = '';
};
      `,
      errors: [
        {
          column: 3,
          data: {
            beforeMember: 'c',
            member: 'B',
          },
          endColumn: 32,
          endLine: 4,
          line: 4,
          messageId: 'incorrectOrder',
        },
        {
          column: 3,
          data: {
            beforeMember: 'B',
            member: 'a',
          },
          endColumn: 27,
          endLine: 5,
          line: 5,
          messageId: 'incorrectOrder',
        },
        {
          column: 3,
          data: {
            name: 'd',
            rank: 'public constructor',
          },
          endColumn: 25,
          endLine: 9,
          line: 9,
          messageId: 'incorrectGroupOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: defaultOrder,
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },
  ],
  valid: [
    // default option + interface + lower/upper case
    {
      code: `
interface Foo {
  a: b;
  B: b;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + type literal + lower/upper case
    {
      code: `
type Foo = {
  a: b;
  B: b;
};
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + class + lower/upper case
    {
      code: `
class Foo {
  public static a: string;
  public static B: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + class expression + lower/upper case
    {
      code: `
const foo = class Foo {
  public static a: string;
  public static B: string;
};
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + class + decorators
    {
      code: `
class Foo {
  public static a: string;
  @Dec() static B: string;
  public static c: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },
    // default option + interface + default order + alphabetically
    {
      code: `
interface Foo {
  [a: string]: number;

  (): Baz;

  a: x;
  B: x;
  c: x;

  new (): Bar;

  a(): void;
  B(): void;
  c(): void;
}
      `,
      options: [
        {
          default: {
            memberTypes: defaultOrder,
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + interface + custom order + alphabetically
    {
      code: `
interface Foo {
  new (): Bar;

  a(): void;
  B(): void;
  c(): void;

  a: x;
  B: x;
  c: x;

  [a: string]: number;
  (): Baz;
}
      `,
      options: [
        {
          default: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + type literal + default order + alphabetically
    {
      code: `
type Foo = {
  [a: string]: number;

  (): Baz;

  a: x;
  B: x;
  c: x;

  new (): Bar;

  a(): void;
  B(): void;
  c(): void;
};
      `,
      options: [
        {
          default: {
            memberTypes: defaultOrder,
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + type literal + custom order + alphabetically
    {
      code: `
type Foo = {
  [a: string]: number;

  new (): Bar;

  a(): void;
  B(): void;
  c(): void;

  a: x;
  B: x;
  c: x;

  (): Baz;
};
      `,
      options: [
        {
          default: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + class + default order + alphabetically
    {
      code: `
class Foo {
  public static a: string;
  protected static b: string = '';
  private static c: string = '';

  public d: string = '';
  protected E: string = '';
  private f: string = '';

  constructor() {}
}
      `,
      options: [
        {
          default: {
            memberTypes: defaultOrder,
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },
    // default option + class + decorators + default order + alphabetically
    {
      code: `
class Foo {
  public static a: string;
  protected static b: string = '';
  private static c: string = '';

  @Dec() public d: string;
  @Dec() protected E: string;
  @Dec() private f: string;

  public g: string = '';
  protected h: string = '';
  private i: string = '';

  constructor() {}
}
      `,
      options: [
        {
          default: {
            memberTypes: defaultOrder,
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + class + custom order + alphabetically
    {
      code: `
class Foo {
  constructor() {}

  public d: string = '';
  protected E: string = '';
  private f: string = '';

  public static a: string;
  protected static b: string = '';
  private static c: string = '';
}
      `,
      options: [
        {
          default: {
            memberTypes: ['constructor', 'instance-field', 'static-field'],
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + class expression + default order + alphabetically
    {
      code: `
const foo = class Foo {
  public static a: string;
  protected static b: string = '';
  private static c: string = '';

  public d: string = '';
  protected E: string = '';
  private f: string = '';

  constructor() {}
};
      `,
      options: [
        {
          default: {
            memberTypes: defaultOrder,
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + class expression + custom order + alphabetically
    {
      code: `
const foo = class Foo {
  constructor() {}

  public d: string = '';
  protected E: string = '';
  private f: string = '';

  public static a: string;
  protected static b: string = '';
  private static c: string = '';
};
      `,
      options: [
        {
          default: {
            memberTypes: ['constructor', 'instance-field', 'static-field'],
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // default option + static blocks; should always be valid
    {
      code: `
class Foo {
  static {}
  static {}
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },
  ],
});
