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

const sortedWithoutGroupingDefaultOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // default option + interface + multiple types
    {
      code: `
interface Foo {
  (): Foo;
  a(): Foo;
  b(): Foo;
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
    },

    // default option + interface + lower/upper case
    {
      code: `
interface Foo {
  A : b;
  a : b;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + interface + numbers
    {
      code: `
interface Foo {
  a1 : b;
  aa : b;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + interface + literal properties
    {
      code: `
interface Foo {
  a : Foo;
  'b.c' : Foo;
  "b.d" : Foo;
}
            `,
      options: [{ default: { order: 'alphabetically' } }],
    },

    // default option + enum + lower/upper case
    {
      code: `
enum Foo {
  A,
  a,
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + type literal + multiple types
    {
      code: `
type Foo = {
  a : b;
  [a: string] : number;
  b() : void;
  () : Baz;
  new () : Bar;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + type literal + lower/upper case
    {
      code: `
type Foo = {
  A : b;
  a : b;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + type literal + numbers
    {
      code: `
type Foo = {
  a1 : b;
  aa : b;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + type + literal properties
    {
      code: `
type Foo = {
  a : Foo;
  'b.c' : Foo;
  "b.d" : Foo;
}
            `,
      options: [{ default: { order: 'alphabetically' } }],
    },

    // default option + class + multiple types
    {
      code: `
class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  constructor() {}
  @Dec() d: string;
  public e : string = "";
  @Dec() f : string = "";
  protected g : string = "";
  private h : string = "";
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + class + lower/upper case
    {
      code: `
class Foo {
  public static A : string;
  public static a : string;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + class + numbers
    {
      code: `
class Foo {
  public static a1 : string;
  public static aa : string;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + class expression + multiple types
    {
      code: `
const foo = class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  private f : string = "";
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + class expression + lower/upper case
    {
      code: `
const foo = class Foo {
  public static A : string;
  public static a : string;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + class expression + numbers
    {
      code: `
const foo = class Foo {
  public static a1 : string;
  public static aa : string;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + class + decorators
    {
      code: `
class Foo {
  public static a : string;
  @Dec() static b : string;
  public static c : string;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + private identifiers
    {
      code: `
class Foo {
  #a = 1;
  #b = 2;
  #c = 3;
}
      `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
    },

    // default option + enum with specified values + lower/upper case
    {
      code: `
enum Foo {
  a = 0,
  A = 1,
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },
  ],
  invalid: [
    // default option + interface + wrong order
    {
      code: `
interface Foo {
  b() : void;
  a : b;
  [a: string] : number;
  new () : Bar;
  () : Baz;
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'call',
            beforeMember: 'new',
          },
        },
      ],
    },

    // default option + interface + literal properties
    {
      code: `
interface Foo {
  "b.d" : Foo;
  'b.c' : Foo;
  a : Foo;
}
            `,
      options: [{ default: { order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b.c',
            beforeMember: 'b.d',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b.c',
          },
        },
      ],
    },

    // default option + interface + wrong order (multiple)
    {
      code: `
interface Foo {
  c : string;
  b : string;
  a : string;
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // default option + type literal + wrong order
    {
      code: `
type Foo = {
  b() : void;
  a : b;
  [a: string] : number;
  new () : Bar;
  () : Baz;
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'call',
            beforeMember: 'new',
          },
        },
      ],
    },

    // default option + type + literal properties
    {
      code: `
type Foo = {
  "b.d" : Foo;
  'b.c' : Foo;
  a : Foo;
}
            `,
      options: [{ default: { order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b.c',
            beforeMember: 'b.d',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b.c',
          },
        },
      ],
    },

    // default option + type literal + wrong order (multiple)
    {
      code: `
type Foo = {
  c : string;
  b : string;
  a : string;
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // default option + class + wrong order
    {
      code: `
class Foo {
  protected static b : string = "";
  public static a : string;
  private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  private f : string = "";
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // default option + class + wrong order (multiple)
    {
      code: `
class Foo {
  public static c: string;
  public static b: string;
  public static a: string;
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // default option + class expression + wrong order
    {
      code: `
const foo = class Foo {
  protected static b : string = "";
  public static a : string;
  private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  private f : string = "";
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // default option + class expression + wrong order (multiple)
    {
      code: `
const foo = class Foo {
  public static c: string;
  public static b: string;
  public static a: string;
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },
  ],
};

const sortedWithoutGroupingClassesOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // classes option + interface + multiple types --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  [a: string] : number;
  () : Baz;
  c : b;
  new () : Bar;
  b() : void;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + interface + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  a : b;
  A : b;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + interface + numbers --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  aa : b;
  a1 : b;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + type literal + multiple types --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  [a: string] : number;
  () : Baz;
  c : b;
  new () : Bar;
  b() : void;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + type literal + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  a : b;
  A : b;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + type literal + numbers --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  aa : b;
  a1 : b;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + class + multiple types
    {
      code: `
class Foo {
  public static a : string;
  protected static b : string = "";
  @Dec() private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  @Dec()
  private f : string = "";
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + class + lower/upper case
    {
      code: `
class Foo {
  public static A : string;
  public static a : string;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + class + numbers
    {
      code: `
class Foo {
  public static a1 : string;
  public static aa : string;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + class expression + multiple types --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  public d : string = "";
  protected e : string = "";
  private f : string = "";
  constructor() {}
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + class expression + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  public static A : string;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + class expression + numbers --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static aa : string;
  public static a1 : string;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },
  ],
  invalid: [
    // classes option + class + wrong order
    {
      code: `
class Foo {
  protected static b : string = "";
  public static a : string;
  private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  private f : string = "";
}
          `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // classes option + class + wrong order (multiple)
    {
      code: `
class Foo {
  public static c: string;
  public static b: string;
  public static a: string;
}
          `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },
  ],
};

const sortedWithoutGroupingClassExpressionsOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // classExpressions option + interface + multiple types --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  [a: string] : number;
  () : Baz;
  c : b;
  new () : Bar;
  b() : void;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + interface + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  a : b;
  A : b;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + interface + numbers --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  aa : b;
  a1 : b;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + type literal + multiple types --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  [a: string] : number;
  () : Baz;
  c : b;
  new () : Bar;
  b() : void;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + type literal + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  a : b;
  A : b;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + type literal + numbers --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  aa : b;
  a1 : b;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + class + multiple types --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  public d : string = "";
  protected e : string = "";
  private f : string = "";
  constructor() {}
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + class + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  public static A : string;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + class + numbers --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static aa : string;
  public static a1 : string;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + class expression + multiple types
    {
      code: `
const foo = class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  private f : string = "";
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + class expression + lower/upper case
    {
      code: `
const foo = class Foo {
  public static A : string;
  public static a : string;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + class expression + numbers
    {
      code: `
const foo = class Foo {
  public static a1 : string;
  public static aa : string;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },
  ],
  invalid: [
    // classExpressions option + class expression + wrong order
    {
      code: `
const foo = class Foo {
  protected static b : string = "";
  public static a : string;
  private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  private f : string = "";
}
          `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // classExpressions option + class expression + wrong order (multiple)
    {
      code: `
const foo = class Foo {
  public static c: string;
  public static b: string;
  public static a: string;
}
          `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },
  ],
};

const sortedWithoutGroupingInterfacesOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // interfaces option + interface + multiple types
    {
      code: `
interface Foo {
  [a: string] : number;
  a : b;
  b() : void;
  () : Baz;
  new () : Bar;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + interface + lower/upper case
    {
      code: `
interface Foo {
  A : b;
  a : b;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + interface + numbers
    {
      code: `
interface Foo {
  a1 : b;
  aa : b;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + type literal + multiple types --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  [a: string] : number;
  () : Baz;
  c : b;
  new () : Bar;
  b() : void;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + type literal + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  a : b;
  A : b;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + type literal + numbers --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  aa : b;
  a1 : b;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + class + multiple types --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  public d : string = "";
  protected e : string = "";
  private f : string = "";
  constructor() {}
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + class + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  public static A : string;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + class + numbers --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static aa : string;
  public static a1 : string;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + class expression + multiple types --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  public d : string = "";
  protected e : string = "";
  private f : string = "";
  constructor() {}
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + class expression + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  public static A : string;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + class expression + numbers --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static aa : string;
  public static a1 : string;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },
  ],
  invalid: [
    // interfaces option + interface + wrong order
    {
      code: `
interface Foo {
  b() : void;
  a : b;
  [a: string] : number;
  new () : Bar;
  () : Baz;
}
          `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'call',
            beforeMember: 'new',
          },
        },
      ],
    },

    // interfaces option + interface + wrong order (multiple)
    {
      code: `
interface Foo {
  c : string;
  b : string;
  a : string;
}
          `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },
  ],
};

const sortedWithoutGroupingTypeLiteralsOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // typeLiterals option + interface + multiple types --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  [a: string] : number;
  () : Baz;
  c : b;
  new () : Bar;
  b() : void;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + interface + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  a : b;
  A : b;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + interface + numbers --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  aa : b;
  a1 : b;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + type literal + multiple types
    {
      code: `
type Foo = {
  [a: string] : number;
  a : b;
  b() : void;
  () : Baz;
  new () : Bar;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + type literal + lower/upper case
    {
      code: `
type Foo = {
  A : b;
  a : b;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + type literal + numbers
    {
      code: `
type Foo = {
  a1 : b;
  aa : b;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + class + multiple types --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  public d : string = "";
  protected e : string = "";
  private f : string = "";
  constructor() {}
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + class + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  public static A : string;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + class + numbers --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static aa : string;
  public static a1 : string;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + class expression + multiple types --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  public d : string = "";
  protected e : string = "";
  private f : string = "";
  constructor() {}
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + class expression + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  public static A : string;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + class expression + numbers --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static aa : string;
  public static a1 : string;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },
  ],
  invalid: [
    // typeLiterals option + type literal + wrong order
    {
      code: `
type Foo = {
  b() : void;
  a : b;
  [a: string] : number;
  new () : Bar;
  () : Baz;
}
          `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'call',
            beforeMember: 'new',
          },
        },
      ],
    },

    // typeLiterals option + type literal + wrong order (multiple)
    {
      code: `
type Foo = {
  c : string;
  b : string;
  a : string;
}
          `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },
  ],
};

const sortedWithGroupingDefaultOption: TSESLint.RunTests<MessageIds, Options> =
  {
    valid: [
      // default option + interface + default order + alphabetically
      {
        code: `
interface Foo {
  [a: string] : number;

  () : Baz;

  a : x;
  b : x;
  c : x;

  new () : Bar;

  a() : void;
  b() : void;
  c() : void;
}
            `,
        options: [
          { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
        ],
      },

      // default option + interface + custom order + alphabetically
      {
        code: `
interface Foo {
  new () : Bar;

  a() : void;
  b() : void;
  c() : void;

  a : x;
  b : x;
  c : x;

  [a: string] : number;
  () : Baz;
}
            `,
        options: [
          {
            default: {
              memberTypes: ['constructor', 'method', 'field'],
              order: 'alphabetically',
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
  b : x;
  c : x;

  new () : Bar;

  a() : void;
  b() : void;
  c() : void;
}
            `,
        options: [
          { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
        ],
      },

      // default option + type literal + custom order + alphabetically
      {
        code: `
type Foo = {
  [a: string] : number;

  new () : Bar;

  a() : void;
  b() : void;
  c() : void;

  a : x;
  b : x;
  c : x;

  () : Baz;
}
            `,
        options: [
          {
            default: {
              memberTypes: ['constructor', 'method', 'field'],
              order: 'alphabetically',
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
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
        options: [
          { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
        ],
      },

      // default option + class + defaultOrder + alphabetically
      {
        code: `
class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}

  get h() {}

  set g() {}
}
            `,
        options: [
          {
            default: {
              memberTypes: defaultOrder,
              order: 'alphabetically',
            },
          },
        ],
      },

      // default option + class + custom + alphabetically
      {
        code: `
class Foo {
  get a() {}

  @Bar
  get b() {}

  set c() {}

  @Bar
  set d() {}
}
            `,
        options: [
          {
            default: {
              memberTypes: ['get', 'decorated-get', 'set', 'decorated-set'],
              order: 'alphabetically',
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
  @Dec() protected e: string;
  @Dec() private f: string;

  public g: string = "";
  protected h: string = "";
  private i: string = "";

  constructor() {}
}
            `,
        options: [
          { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
        ],
      },

      // default option + class + custom order + alphabetically
      {
        code: `
class Foo {
  constructor() {}

  public d: string = "";
  protected e: string = "";
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
              order: 'alphabetically',
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
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
        options: [
          { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
        ],
      },

      // default option + class expression + custom order + alphabetically
      {
        code: `
const foo = class Foo {
  constructor() {}

  public d: string = "";
  protected e: string = "";
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
              order: 'alphabetically',
            },
          },
        ],
      },
    ],
    invalid: [
      // default option + class + wrong order within group and wrong group order + alphabetically
      {
        code: `
class FooTestGetter {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  get h() {}

  set g() {}

  constructor() {}
}
            `,
        options: [
          {
            default: {
              memberTypes: defaultOrder,
              order: 'alphabetically',
            },
          },
        ],
        errors: [
          {
            messageId: 'incorrectGroupOrder',
            data: {
              name: 'constructor',
              rank: 'public instance get',
            },
          },
        ],
      },

      // default option + class + custom + alphabetically
      {
        code: `
class Foo {
  @Bar
  get a() {}

  get b() {}

  @Bar
  set c() {}

  set d() {}
}
                  `,
        options: [
          {
            default: {
              memberTypes: ['get', 'decorated-get', 'set', 'decorated-set'],
              order: 'alphabetically',
            },
          },
        ],
        errors: [
          {
            messageId: 'incorrectGroupOrder',
            data: {
              name: 'b',
              rank: 'decorated get',
            },
          },
          {
            messageId: 'incorrectGroupOrder',
            data: {
              name: 'd',
              rank: 'decorated set',
            },
          },
        ],
      },

      // default option + class + wrong order within group and wrong group order + alphabetically
      {
        code: `
class FooTestGetter {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  set g() {}

  constructor() {}

  get h() {}
}
            `,
        options: [
          {
            default: {
              memberTypes: defaultOrder,
              order: 'alphabetically',
            },
          },
        ],
        errors: [
          {
            messageId: 'incorrectGroupOrder',
            data: {
              name: 'constructor',
              rank: 'public instance set',
            },
          },
          {
            messageId: 'incorrectGroupOrder',
            data: {
              name: 'h',
              rank: 'public instance set',
            },
          },
        ],
      },

      // default option + interface + wrong order within group and wrong group order + alphabetically
      {
        code: `
interface Foo {
  [a: string] : number;

  a : x;
  b : x;
  c : x;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;

  new () : Bar;
}
            `,
        options: [
          { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
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
  b : x;
  c : x;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;

  new () : Bar;
}
            `,
        options: [
          { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
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
  public static b: string = "";
  public static a: string;

  constructor() {}

  public d: string = "";
}
            `,
        options: [
          { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
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
  public static b: string = "";
  public static a: string;

  constructor() {}

  public d: string = "";
}
            `,
        options: [
          { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
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
      // default option + class + decorators + custom order + wrong order within group and wrong group order + alphabetically
      {
        code: `
class Foo {
  @Dec() a1: string;
  @Dec()
  a3: string;
  @Dec()
  a2: string;

  constructor() {}

  b1: string;
  b2: string;

  public c(): void;
  @Dec() d(): void
}
            `,
        options: [
          {
            default: {
              memberTypes: [
                'decorated-field',
                'field',
                'constructor',
                'decorated-method',
              ],
              order: 'alphabetically',
            },
          },
        ],
        errors: [
          {
            messageId: 'incorrectGroupOrder',
            data: {
              name: 'b1',
              rank: 'constructor',
            },
          },
          {
            messageId: 'incorrectGroupOrder',
            data: {
              name: 'b2',
              rank: 'constructor',
            },
          },
        ],
      },
    ],
  };

const sortedWithGroupingClassesOption: TSESLint.RunTests<MessageIds, Options> =
  {
    valid: [
      // classes option + interface + alphabetically --> Default order applies
      {
        code: `
interface Foo {
  [a: string] : number;

  () : Baz;

  c : x;
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;
}
            `,
        options: [{ classes: { order: 'alphabetically' } }],
      },

      // classes option + type literal + alphabetically --> Default order applies
      {
        code: `
type Foo = {
  [a: string] : number;

  () : Baz;

  c : x;
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;
}
            `,
        options: [{ classes: { order: 'alphabetically' } }],
      },

      // classes option + class + default order + alphabetically
      {
        code: `
class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
        options: [
          { classes: { memberTypes: defaultOrder, order: 'alphabetically' } },
        ],
      },

      // classes option + class + custom order + alphabetically
      {
        code: `
class Foo {
  constructor() {}

  public d: string = "";
  protected e: string = "";
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
              order: 'alphabetically',
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
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
        options: [{ classes: { order: 'alphabetically' } }],
      },
    ],
    invalid: [
      // default option + class + wrong order within group and wrong group order + alphabetically
      {
        code: `
class Foo {
  public static c: string = "";
  public static b: string = "";
  public static a: string;

  constructor() {}

  public d: string = "";
}
            `,
        options: [
          { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
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

const sortedWithGroupingClassExpressionsOption: TSESLint.RunTests<
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
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;
}
            `,
      options: [{ classExpressions: { order: 'alphabetically' } }],
    },

    // classExpressions option + type literal + alphabetically --> Default order applies
    {
      code: `
type Foo = {
  [a: string] : number;

  () : Baz;

  c : x;
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;
}
            `,
      options: [{ classExpressions: { order: 'alphabetically' } }],
    },

    // classExpressions option + class + alphabetically --> Default order applies
    {
      code: `
class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [{ classExpressions: { order: 'alphabetically' } }],
    },

    // classExpressions option + class expression + default order + alphabetically
    {
      code: `
const foo = class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [
        {
          classExpressions: {
            memberTypes: defaultOrder,
            order: 'alphabetically',
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
  protected e: string = "";
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
            order: 'alphabetically',
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
  public static b: string = "";
  public static a: string;

  constructor() {}

  public d: string = "";
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
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

const sortedWithGroupingInterfacesOption: TSESLint.RunTests<
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
  b : x;
  c : x;

  a() : void;
  b() : void;
  c() : void;

  new () : Bar;

  () : Baz;
}
            `,
      options: [
        {
          interfaces: {
            memberTypes: ['signature', 'field', 'method', 'constructor'],
            order: 'alphabetically',
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
  b() : void;
  c() : void;

  a : x;
  b : x;
  c : x;

  [a: string] : number;
  () : Baz;
}
            `,
      options: [
        {
          interfaces: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'alphabetically',
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
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;
}
            `,
      options: [{ interfaces: { order: 'alphabetically' } }],
    },

    // interfaces option + class + alphabetically --> Default order applies
    {
      code: `
class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [{ interfaces: { order: 'alphabetically' } }],
    },

    // interfaces option + class expression + alphabetically --> Default order applies
    {
      code: `
const foo = class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [{ interfaces: { order: 'alphabetically' } }],
    },
  ],
  invalid: [
    // default option + interface + wrong order within group and wrong group order + alphabetically
    {
      code: `
interface Foo {
  [a: string] : number;

  a : x;
  b : x;
  c : x;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;

  new () : Bar;
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
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

const sortedWithGroupingTypeLiteralsOption: TSESLint.RunTests<
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
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;
}
            `,
      options: [{ typeLiterals: { order: 'alphabetically' } }],
    },

    // typeLiterals option + type literal + default order + alphabetically
    {
      code: `
type Foo = {
  [a: string] : number;

  a : x;
  b : x;
  c : x;

  a() : void;
  b() : void;
  c() : void;

  new () : Bar;

  () : Baz;
}
            `,
      options: [
        {
          typeLiterals: {
            memberTypes: ['signature', 'field', 'method', 'constructor'],
            order: 'alphabetically',
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
  b() : void;
  c() : void;

  a : x;
  b : x;
  c : x;

  [a: string] : number;
  () : Baz;
}
            `,
      options: [
        {
          typeLiterals: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'alphabetically',
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
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [{ typeLiterals: { order: 'alphabetically' } }],
    },

    // typeLiterals option + class expression + alphabetically --> Default order applies
    {
      code: `
const foo = class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [{ typeLiterals: { order: 'alphabetically' } }],
    },
  ],
  invalid: [
    // default option + type literal + wrong order within group and wrong group order + alphabetically
    {
      code: `
type Foo = {
  [a: string] : number;

  a : x;
  b : x;
  c : x;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;

  new () : Bar;
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
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

    // default option + private identifiers
    {
      code: `
class Foo {
  #c = 3;
  #b = 2;
  #a = 1;
}
      `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          line: 4,
          column: 3,
        },
        {
          messageId: 'incorrectOrder',
          line: 5,
          column: 3,
        },
      ],
    },
  ],
};

const sortedWithoutGrouping = {
  valid: [
    ...sortedWithoutGroupingDefaultOption.valid,
    ...sortedWithoutGroupingClassesOption.valid,
    ...sortedWithoutGroupingClassExpressionsOption.valid,
    ...sortedWithoutGroupingInterfacesOption.valid,
    ...sortedWithoutGroupingTypeLiteralsOption.valid,
  ],
  invalid: [
    ...sortedWithoutGroupingDefaultOption.invalid,
    ...sortedWithoutGroupingClassesOption.invalid,
    ...sortedWithoutGroupingClassExpressionsOption.invalid,
    ...sortedWithoutGroupingInterfacesOption.invalid,
    ...sortedWithoutGroupingTypeLiteralsOption.invalid,
  ],
};

const sortedWithGrouping = {
  valid: [
    ...sortedWithGroupingDefaultOption.valid,
    ...sortedWithGroupingClassesOption.valid,
    ...sortedWithGroupingClassExpressionsOption.valid,
    ...sortedWithGroupingInterfacesOption.valid,
    ...sortedWithGroupingTypeLiteralsOption.valid,
  ],
  invalid: [
    ...sortedWithGroupingDefaultOption.invalid,
    ...sortedWithGroupingClassesOption.invalid,
    ...sortedWithGroupingClassExpressionsOption.invalid,
    ...sortedWithGroupingInterfacesOption.invalid,
    ...sortedWithGroupingTypeLiteralsOption.invalid,
  ],
};

ruleTester.run('member-ordering-alphabetically-order', rule, {
  valid: [...sortedWithoutGrouping.valid, ...sortedWithGrouping.valid],
  invalid: [...sortedWithoutGrouping.invalid, ...sortedWithGrouping.invalid],
});
