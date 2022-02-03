import rule, {
  defaultOrder,
  MessageIds,
  Options,
} from '../../src/rules/member-ordering';
import { RuleTester } from '../RuleTester';
import { TSESLint } from '@typescript-eslint/utils';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const sortedCiWithoutGrouping: TSESLint.RunTests<MessageIds, Options> = {
  valid: [
    // default option + interface + lower/upper case
    {
      code: `
interface Foo {
  a : b;
  B : b;
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
  a : b;
  B : b;
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

    // default option + class + lower/upper case
    {
      code: `
class Foo {
  public static a : string;
  public static B : string;
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
  public static a : string;
  public static B : string;
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

    // default option + class + decorators
    {
      code: `
class Foo {
  public static a : string;
  @Dec() static B : string;
  public static c : string;
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
  invalid: [
    // default option + interface + wrong order (multiple)
    {
      code: `
interface Foo {
  c : string;
  B : string;
  a : string;
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
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'B',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'B',
          },
        },
      ],
    },

    // default option + interface + lower/upper case wrong order
    {
      code: `
interface Foo {
  B : b;
  a : b;
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
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'B',
          },
        },
      ],
    },

    // default option + type literal + lower/upper case wrong order
    {
      code: `
type Foo = {
  B : b;
  a : b;
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
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'B',
          },
        },
      ],
    },

    // default option + class + lower/upper case wrong order
    {
      code: `
class Foo {
  public static B : string;
  public static a : string;
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
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'B',
          },
        },
      ],
    },

    // default option + class expression + lower/upper case wrong order
    {
      code: `
const foo = class Foo {
  public static B : string;
  public static a : string;
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
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'B',
          },
        },
      ],
    },
  ],
};

const sortedCiWithGrouping: TSESLint.RunTests<MessageIds, Options> = {
  valid: [
    // default option + interface + default order + alphabetically
    {
      code: `
interface Foo {
  [a: string] : number;

  () : Baz;

  a : x;
  B : x;
  c : x;

  new () : Bar;

  a() : void;
  B() : void;
  c() : void;
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
  new () : Bar;

  a() : void;
  B() : void;
  c() : void;

  a : x;
  B : x;
  c : x;

  [a: string] : number;
  () : Baz;
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
  [a: string] : number;

  () : Baz;

  a : x;
  B : x;
  c : x;

  new () : Bar;

  a() : void;
  B() : void;
  c() : void;
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

    // default option + type literal + custom order + alphabetically
    {
      code: `
type Foo = {
  [a: string] : number;

  new () : Bar;

  a() : void;
  B() : void;
  c() : void;

  a : x;
  B : x;
  c : x;

  () : Baz;
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

    // default option + class + default order + alphabetically
    {
      code: `
class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected E: string = "";
  private f: string = "";

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
  protected static b: string = "";
  private static c: string = "";

  @Dec() public d: string;
  @Dec() protected E: string;
  @Dec() private f: string;

  public g: string = "";
  protected h: string = "";
  private i: string = "";

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

  public d: string = "";
  protected E: string = "";
  private f: string = "";

  public static a: string;
  protected static b: string = "";
  private static c: string = "";
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
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected E: string = "";
  private f: string = "";

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

    // default option + class expression + custom order + alphabetically
    {
      code: `
const foo = class Foo {
  constructor() {}

  public d: string = "";
  protected E: string = "";
  private f: string = "";

  public static a: string;
  protected static b: string = "";
  private static c: string = "";
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
  ],
  invalid: [
    // default option + interface + wrong order within group and wrong group order + alphabetically
    {
      code: `
interface Foo {
  [a: string] : number;

  a : x;
  B : x;
  c : x;

  c() : void;
  B() : void;
  a() : void;

  () : Baz;

  new () : Bar;
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
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'call',
            rank: 'field',
          },
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'method',
          },
        },
      ],
    },

    // default option + type literal + wrong order within group and wrong group order + alphabetically
    {
      code: `
type Foo = {
  [a: string] : number;

  a : x;
  B : x;
  c : x;

  c() : void;
  B() : void;
  a() : void;

  () : Baz;

  new () : Bar;
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
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'call',
            rank: 'field',
          },
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'method',
          },
        },
      ],
    },

    // default option + class + wrong order within group and wrong group order + alphabetically
    {
      code: `
class Foo {
  public static c: string = "";
  public static B: string = "";
  public static a: string;

  constructor() {}

  public d: string = "";
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
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'd',
            rank: 'public constructor',
          },
        },
      ],
    },

    // default option + class expression + wrong order within group and wrong group order + alphabetically
    {
      code: `
const foo = class Foo {
  public static c: string = "";
  public static B: string = "";
  public static a: string;

  constructor() {}

  public d: string = "";
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
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'd',
            rank: 'public constructor',
          },
        },
      ],
    },
  ],
};

ruleTester.run('member-ordering-alphabetically-case-insensitive-order', rule, {
  valid: [...sortedCiWithoutGrouping.valid, ...sortedCiWithGrouping.valid],
  invalid: [
    ...sortedCiWithoutGrouping.invalid,
    ...sortedCiWithGrouping.invalid,
  ],
});
