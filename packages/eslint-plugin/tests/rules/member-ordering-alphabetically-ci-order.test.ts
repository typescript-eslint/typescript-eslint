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
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
      ],
    },

    // default option + interface + lower/upper case
    {
      code: `
interface Foo {
  a : b;
  B : b;
}
            `,
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
    },

    // default option + interface + numbers
    {
      code: `
interface Foo {
  a1 : b;
  aa : b;
}
            `,
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
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
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
    },

    // default option + type literal + numbers
    {
      code: `
type Foo = {
  a1 : b;
  aa : b;
}
            `,
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
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
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
    },

    // default option + class + numbers
    {
      code: `
class Foo {
  public static a1 : string;
  public static aa : string;
}
            `,
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
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
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
    },

    // default option + class expression + numbers
    {
      code: `
const foo = class Foo {
  public static a1 : string;
  public static aa : string;
}
            `,
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
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
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
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
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
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

    // default option + interface + wrong order (multiple)
    {
      code: `
interface Foo {
  c : string;
  b : string;
  a : string;
}
          `,
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
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

    // default option + type literal + wrong order (multiple)
    {
      code: `
type Foo = {
  c : string;
  b : string;
  a : string;
}
          `,
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
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

    // default option + class + wrong order (multiple)
    {
      code: `
class Foo {
  public static c: string;
  public static b: string;
  public static a: string;
}
          `,
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
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

    // default option + class expression + wrong order (multiple)
    {
      code: `
const foo = class Foo {
  public static c: string;
  public static b: string;
  public static a: string;
}
          `,
      options: [
        { default: { memberTypes: 'never', order: 'alphabetically-ci' } },
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

const sortedCiWithoutGroupingClassesOption: TSESLint.RunTests<
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
      options: [
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
    },

    // classes option + interface + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  a : b;
  B : b;
}
            `,
      options: [
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
    },

    // classes option + interface + numbers --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  aa : b;
  a1 : b;
}
            `,
      options: [
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
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
      options: [
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
    },

    // classes option + type literal + numbers --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  aa : b;
  a1 : b;
}
            `,
      options: [
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
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
      options: [
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
    },

    // classes option + class + numbers
    {
      code: `
class Foo {
  public static a1 : string;
  public static aa : string;
}
            `,
      options: [
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
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
      options: [
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
    },

    // classes option + class expression + numbers --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static aa : string;
  public static a1 : string;
}
            `,
      options: [
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
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
      options: [
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
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

    // classes option + class + wrong order (multiple)
    {
      code: `
class Foo {
  public static c: string;
  public static b: string;
  public static a: string;
}
          `,
      options: [
        { classes: { memberTypes: 'never', order: 'alphabetically-ci' } },
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

const sortedCiWithoutGroupingClassExpressionsOption: TSESLint.RunTests<
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
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-ci',
          },
        },
      ],
    },

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
            order: 'alphabetically-ci',
          },
        },
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
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-ci',
          },
        },
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
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-ci',
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
            order: 'alphabetically-ci',
          },
        },
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
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-ci',
          },
        },
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
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-ci',
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
            order: 'alphabetically-ci',
          },
        },
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
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-ci',
          },
        },
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
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-ci',
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
            order: 'alphabetically-ci',
          },
        },
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
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-ci',
          },
        },
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
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-ci',
          },
        },
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
        {
          classExpressions: {
            memberTypes: 'never',
            order: 'alphabetically-ci',
          },
        },
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

const sortedCiWithoutGroupingInterfacesOption: TSESLint.RunTests<
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
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
    },

    // interfaces option + interface + lower/upper case
    {
      code: `
interface Foo {
  a : b;
  B : b;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { interfaces: { memberTypes: 'never', order: 'alphabetically-ci' } },
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

const sortedCiWithoutGroupingTypeLiteralsOption: TSESLint.RunTests<
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
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
      ],
    },

    // typeLiterals option + interface + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  a : b;
  B : b;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically-ci' } },
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
  b : x;
  c : x;

  new () : Bar;

  a() : void;
  b() : void;
  c() : void;
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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
            order: 'alphabetically-ci',
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
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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
            order: 'alphabetically-ci',
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
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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
            order: 'alphabetically-ci',
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
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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
            order: 'alphabetically-ci',
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
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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
            order: 'alphabetically-ci',
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
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;
}
            `,
      options: [{ classes: { order: 'alphabetically-ci' } }],
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
      options: [{ classes: { order: 'alphabetically-ci' } }],
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
        { classes: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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
            order: 'alphabetically-ci',
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
      options: [{ classes: { order: 'alphabetically-ci' } }],
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
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;
}
            `,
      options: [{ classExpressions: { order: 'alphabetically-ci' } }],
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
      options: [{ classExpressions: { order: 'alphabetically-ci' } }],
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
      options: [{ classExpressions: { order: 'alphabetically-ci' } }],
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
            order: 'alphabetically-ci',
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
            order: 'alphabetically-ci',
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
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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
            order: 'alphabetically-ci',
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
            order: 'alphabetically-ci',
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
      options: [{ interfaces: { order: 'alphabetically-ci' } }],
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
      options: [{ interfaces: { order: 'alphabetically-ci' } }],
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
      options: [{ interfaces: { order: 'alphabetically-ci' } }],
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
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;
}
            `,
      options: [{ typeLiterals: { order: 'alphabetically-ci' } }],
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
            order: 'alphabetically-ci',
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
            order: 'alphabetically-ci',
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
      options: [{ typeLiterals: { order: 'alphabetically-ci' } }],
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
      options: [{ typeLiterals: { order: 'alphabetically-ci' } }],
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
        { default: { memberTypes: defaultOrder, order: 'alphabetically-ci' } },
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

ruleTester.run('member-ordering-alphabetically-ci-order', rule, {
  valid: [...sortedCiWithoutGrouping.valid, ...sortedCiWithGrouping.valid],
  invalid: [
    ...sortedCiWithoutGrouping.invalid,
    ...sortedCiWithGrouping.invalid,
  ],
});
