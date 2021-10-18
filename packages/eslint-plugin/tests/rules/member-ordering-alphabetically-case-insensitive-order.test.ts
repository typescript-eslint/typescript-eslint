import rule, {
  defaultOrder,
  MessageIds,
  Options,
} from '../../src/rules/member-ordering';
import { RuleTester } from '../RuleTester';
import { TSESLint } from '@typescript-eslint/experimental-utils';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const sortedCiWithoutGroupingDefaultOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
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

const sortedCiWithoutGroupingClassesOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // classes option + interface + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  a : b;
  B : b;
}
            `,
      options: [
        {
          classes: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // classes option + type literal + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  a : b;
  B : b;
}
            `,
      options: [
        {
          classes: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // classes option + class + lower/upper case
    {
      code: `
class Foo {
  public static a : string;
  public static B : string;
}
            `,
      options: [
        {
          classes: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // classes option + class expression + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  public static B : string;
}
            `,
      options: [
        {
          classes: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },
  ],
  invalid: [
    // classes option + class + wrong order (multiple)
    {
      code: `
class Foo {
  public static c: string;
  public static B: string;
  public static a: string;
}
          `,
      options: [
        {
          classes: {
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
  ],
};

const sortedCiWithoutGroupingClassExpressionsOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // classExpressions option + interface + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  a : b;
  B : b;
}
            `,
      options: [
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // classExpressions option + type literal + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  a : b;
  B : b;
}
            `,
      options: [
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // classExpressions option + class + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  public static B : string;
}
            `,
      options: [
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // classExpressions option + class expression + lower/upper case
    {
      code: `
const foo = class Foo {
  public static a : string;
  public static B : string;
}
            `,
      options: [
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },
  ],
  invalid: [
    // classExpressions option + class expression + wrong order (multiple)
    {
      code: `
const foo = class Foo {
  public static c: string;
  public static B: string;
  public static a: string;
}
          `,
      options: [
        {
          classExpressions: {
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
  ],
};

const sortedCiWithoutGroupingInterfacesOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // interfaces option + interface + lower/upper case
    {
      code: `
interface Foo {
  a : b;
  B : b;
}
            `,
      options: [
        {
          interfaces: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // interfaces option + type literal + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  a : b;
  B : b;
}
            `,
      options: [
        {
          interfaces: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // interfaces option + class + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  public static B : string;
}
            `,
      options: [
        {
          interfaces: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },
    // interfaces option + class expression + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  public static B : string;
}
            `,
      options: [
        {
          interfaces: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },
  ],
  invalid: [
    // interfaces option + interface + wrong order (multiple)
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
          interfaces: {
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
  ],
};

const sortedCiWithoutGroupingTypeLiteralsOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // typeLiterals option + interface + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  a : b;
  B : b;
}
            `,
      options: [
        {
          typeLiterals: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // typeLiterals option + type literal + lower/upper case
    {
      code: `
type Foo = {
  a : b;
  B : b;
}
            `,
      options: [
        {
          typeLiterals: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // typeLiterals option + class + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  public static B : string;
}
            `,
      options: [
        {
          typeLiterals: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // typeLiterals option + class expression + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  public static B : string;
}
            `,
      options: [
        {
          typeLiterals: {
            memberTypes: 'never',
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },
  ],
  invalid: [
    // typeLiterals option + type literal + wrong order (multiple)
    {
      code: `
type Foo = {
  c : string;
  B : string;
  a : string;
}
          `,
      options: [
        {
          typeLiterals: {
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
  ],
};

const sortedCiWithGroupingDefaultOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
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

const sortedCiWithGroupingClassesOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // classes option + interface + alphabetically --> Default order applies
    {
      code: `
interface Foo {
  [a: string] : number;

  () : Baz;

  c : x;
  B : x;
  a : x;

  new () : Bar;

  c() : void;
  B() : void;
  a() : void;
}
            `,
      options: [{ classes: { order: 'alphabetically-case-insensitive' } }],
    },

    // classes option + type literal + alphabetically --> Default order applies
    {
      code: `
type Foo = {
  [a: string] : number;

  () : Baz;

  c : x;
  B : x;
  a : x;

  new () : Bar;

  c() : void;
  B() : void;
  a() : void;
}
            `,
      options: [{ classes: { order: 'alphabetically-case-insensitive' } }],
    },

    // classes option + class + default order + alphabetically
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
          classes: {
            memberTypes: defaultOrder,
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // classes option + class + custom order + alphabetically
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
          classes: {
            memberTypes: ['constructor', 'instance-field', 'static-field'],
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // classes option + class expression + alphabetically --> Default order applies
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
      options: [{ classes: { order: 'alphabetically-case-insensitive' } }],
    },
  ],
  invalid: [
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
  ],
};

const sortedCiWithGroupingClassExpressionsOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // classExpressions option + interface + alphabetically --> Default order applies
    {
      code: `
interface Foo {
  [a: string] : number;

  () : Baz;

  c : x;
  B : x;
  a : x;

  new () : Bar;

  c() : void;
  B() : void;
  a() : void;
}
            `,
      options: [
        { classExpressions: { order: 'alphabetically-case-insensitive' } },
      ],
    },

    // classExpressions option + type literal + alphabetically --> Default order applies
    {
      code: `
type Foo = {
  [a: string] : number;

  () : Baz;

  c : x;
  B : x;
  a : x;

  new () : Bar;

  c() : void;
  B() : void;
  a() : void;
}
            `,
      options: [
        { classExpressions: { order: 'alphabetically-case-insensitive' } },
      ],
    },

    // classExpressions option + class + alphabetically --> Default order applies
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
        { classExpressions: { order: 'alphabetically-case-insensitive' } },
      ],
    },

    // classExpressions option + class expression + default order + alphabetically
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
          classExpressions: {
            memberTypes: defaultOrder,
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // classExpressions option + class expression + custom order + alphabetically
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
          classExpressions: {
            memberTypes: ['constructor', 'instance-field', 'static-field'],
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },
  ],
  invalid: [
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

const sortedCiWithGroupingInterfacesOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // interfaces option + interface + default order + alphabetically
    {
      code: `
interface Foo {
  [a: string] : number;

  a : x;
  B : x;
  c : x;

  a() : void;
  B() : void;
  c() : void;

  new () : Bar;

  () : Baz;
}
            `,
      options: [
        {
          interfaces: {
            memberTypes: ['signature', 'field', 'method', 'constructor'],
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // interfaces option + interface + custom order + alphabetically
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
          interfaces: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // interfaces option + type literal + alphabetically --> Default order applies
    {
      code: `
type Foo = {
  [a: string] : number;

  () : Baz;

  c : x;
  B : x;
  a : x;

  new () : Bar;

  c() : void;
  B() : void;
  a() : void;
}
            `,
      options: [{ interfaces: { order: 'alphabetically-case-insensitive' } }],
    },

    // interfaces option + class + alphabetically --> Default order applies
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
      options: [{ interfaces: { order: 'alphabetically-case-insensitive' } }],
    },

    // interfaces option + class expression + alphabetically --> Default order applies
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
      options: [{ interfaces: { order: 'alphabetically-case-insensitive' } }],
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
  ],
};

const sortedCiWithGroupingTypeLiteralsOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // typeLiterals option + interface + alphabetically --> Default order applies
    {
      code: `
interface Foo {
  [a: string] : number;

  () : Baz;

  c : x;
  B : x;
  a : x;

  new () : Bar;

  c() : void;
  B() : void;
  a() : void;
}
            `,
      options: [{ typeLiterals: { order: 'alphabetically-case-insensitive' } }],
    },

    // typeLiterals option + type literal + default order + alphabetically
    {
      code: `
type Foo = {
  [a: string] : number;

  a : x;
  B : x;
  c : x;

  a() : void;
  B() : void;
  c() : void;

  new () : Bar;

  () : Baz;
}
            `,
      options: [
        {
          typeLiterals: {
            memberTypes: ['signature', 'field', 'method', 'constructor'],
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // typeLiterals option + type literal + custom order + alphabetically
    {
      code: `
type Foo = {
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
          typeLiterals: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
    },

    // typeLiterals option + class + alphabetically --> Default order applies
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
      options: [{ typeLiterals: { order: 'alphabetically-case-insensitive' } }],
    },

    // typeLiterals option + class expression + alphabetically --> Default order applies
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
      options: [{ typeLiterals: { order: 'alphabetically-case-insensitive' } }],
    },
  ],
  invalid: [
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
  ],
};

const sortedCiWithoutGrouping = {
  valid: [
    ...sortedCiWithoutGroupingDefaultOption.valid,
    ...sortedCiWithoutGroupingClassesOption.valid,
    ...sortedCiWithoutGroupingClassExpressionsOption.valid,
    ...sortedCiWithoutGroupingInterfacesOption.valid,
    ...sortedCiWithoutGroupingTypeLiteralsOption.valid,
  ],
  invalid: [
    ...sortedCiWithoutGroupingDefaultOption.invalid,
    ...sortedCiWithoutGroupingClassesOption.invalid,
    ...sortedCiWithoutGroupingClassExpressionsOption.invalid,
    ...sortedCiWithoutGroupingInterfacesOption.invalid,
    ...sortedCiWithoutGroupingTypeLiteralsOption.invalid,
  ],
};

const sortedCiWithGrouping = {
  valid: [
    ...sortedCiWithGroupingDefaultOption.valid,
    ...sortedCiWithGroupingClassesOption.valid,
    ...sortedCiWithGroupingClassExpressionsOption.valid,
    ...sortedCiWithGroupingInterfacesOption.valid,
    ...sortedCiWithGroupingTypeLiteralsOption.valid,
  ],
  invalid: [
    ...sortedCiWithGroupingDefaultOption.invalid,
    ...sortedCiWithGroupingClassesOption.invalid,
    ...sortedCiWithGroupingClassExpressionsOption.invalid,
    ...sortedCiWithGroupingInterfacesOption.invalid,
    ...sortedCiWithGroupingTypeLiteralsOption.invalid,
  ],
};

ruleTester.run('member-ordering-alphabetically-case-insensitive-order', rule, {
  valid: [...sortedCiWithoutGrouping.valid, ...sortedCiWithGrouping.valid],
  invalid: [
    ...sortedCiWithoutGrouping.invalid,
    ...sortedCiWithGrouping.invalid,
  ],
});
