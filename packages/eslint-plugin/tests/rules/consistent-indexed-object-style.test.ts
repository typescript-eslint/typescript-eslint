import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/consistent-indexed-object-style';

const ruleTester = new RuleTester();

ruleTester.run('consistent-indexed-object-style', rule, {
  valid: [
    // 'record' (default)
    // Record
    'type Foo = Record<string, any>;',

    // Interface
    'interface Foo {}',
    `
interface Foo {
  bar: string;
}
    `,
    `
interface Foo {
  bar: string;
  [key: string]: any;
}
    `,
    `
interface Foo {
  [key: string]: any;
  bar: string;
}
    `,
    // circular
    'type Foo = { [key: string]: string | Foo };',
    'type Foo = { [key: string]: Foo };',
    'type Foo = { [key: string]: Foo } | Foo;',
    'type Foo = { [key in string]: Foo };',
    `
interface Foo {
  [key: string]: Foo;
}
    `,
    `
interface Foo<T> {
  [key: string]: Foo<T>;
}
    `,
    `
interface Foo<T> {
  [key: string]: Foo<T> | string;
}
    `,
    // Type literal
    'type Foo = {};',
    `
type Foo = {
  bar: string;
  [key: string]: any;
};
    `,
    `
type Foo = {
  bar: string;
};
    `,
    `
type Foo = {
  [key: string]: any;
  bar: string;
};
    `,

    // Generic
    `
type Foo = Generic<{
  [key: string]: any;
  bar: string;
}>;
    `,

    // Function types
    'function foo(arg: { [key: string]: any; bar: string }) {}',
    'function foo(): { [key: string]: any; bar: string } {}',

    // Invalid syntax allowed by the parser
    'type Foo = { [key: string] };',
    'type Foo = { [] };',
    `
interface Foo {
  [key: string];
}
    `,
    `
interface Foo {
  [];
}
    `,
    // 'index-signature'
    // Unhandled type
    {
      code: 'type Foo = Misc<string, unknown>;',
      options: ['index-signature'],
    },

    // Invalid record
    {
      code: 'type Foo = Record;',
      options: ['index-signature'],
    },
    {
      code: 'type Foo = Record<string>;',
      options: ['index-signature'],
    },
    {
      code: 'type Foo = Record<string, number, unknown>;',
      options: ['index-signature'],
    },

    // Type literal
    {
      code: 'type Foo = { [key: string]: any };',
      options: ['index-signature'],
    },

    // Generic
    {
      code: 'type Foo = Generic<{ [key: string]: any }>;',
      options: ['index-signature'],
    },

    // Function types
    {
      code: 'function foo(arg: { [key: string]: any }) {}',
      options: ['index-signature'],
    },
    {
      code: 'function foo(): { [key: string]: any } {}',
      options: ['index-signature'],
    },

    // Namespace
    {
      code: 'type T = A.B;',
      options: ['index-signature'],
    },

    {
      // mapped type that uses the key cannot be converted to record
      code: 'type T = { [key in Foo]: key | number };',
    },
    {
      code: `
function foo(e: { readonly [key in PropertyKey]-?: key }) {}
      `,
    },

    {
      // `in keyof` mapped types are not convertible to Record.
      code: `
function f(): {
  // intentionally not using a Record to preserve optionals
  [k in keyof ParseResult]: unknown;
} {
  return {};
}
      `,
    },
  ],
  invalid: [
    // Interface
    {
      code: `
interface Foo {
  [key: string]: any;
}
      `,
      errors: [{ column: 1, line: 2, messageId: 'preferRecord' }],
      output: `
type Foo = Record<string, any>;
      `,
    },

    // Readonly interface
    {
      code: `
interface Foo {
  readonly [key: string]: any;
}
      `,
      errors: [{ column: 1, line: 2, messageId: 'preferRecord' }],
      output: `
type Foo = Readonly<Record<string, any>>;
      `,
    },

    // Interface with generic parameter
    {
      code: `
interface Foo<A> {
  [key: string]: A;
}
      `,
      errors: [{ column: 1, line: 2, messageId: 'preferRecord' }],
      output: `
type Foo<A> = Record<string, A>;
      `,
    },

    // Interface with generic parameter and default value
    {
      code: `
interface Foo<A = any> {
  [key: string]: A;
}
      `,
      errors: [{ column: 1, line: 2, messageId: 'preferRecord' }],
      output: `
type Foo<A = any> = Record<string, A>;
      `,
    },

    // Interface with extends
    {
      code: `
interface B extends A {
  [index: number]: unknown;
}
      `,
      errors: [{ column: 1, line: 2, messageId: 'preferRecord' }],
      output: null,
    },
    // Readonly interface with generic parameter
    {
      code: `
interface Foo<A> {
  readonly [key: string]: A;
}
      `,
      errors: [{ column: 1, line: 2, messageId: 'preferRecord' }],
      output: `
type Foo<A> = Readonly<Record<string, A>>;
      `,
    },

    // Interface with multiple generic parameters
    {
      code: `
interface Foo<A, B> {
  [key: A]: B;
}
      `,
      errors: [{ column: 1, line: 2, messageId: 'preferRecord' }],
      output: `
type Foo<A, B> = Record<A, B>;
      `,
    },

    // Readonly interface with multiple generic parameters
    {
      code: `
interface Foo<A, B> {
  readonly [key: A]: B;
}
      `,
      errors: [{ column: 1, line: 2, messageId: 'preferRecord' }],
      output: `
type Foo<A, B> = Readonly<Record<A, B>>;
      `,
    },

    // Type literal
    {
      code: 'type Foo = { [key: string]: any };',
      errors: [{ column: 12, line: 1, messageId: 'preferRecord' }],
      output: 'type Foo = Record<string, any>;',
    },

    // Readonly type literal
    {
      code: 'type Foo = { readonly [key: string]: any };',
      errors: [{ column: 12, line: 1, messageId: 'preferRecord' }],
      output: 'type Foo = Readonly<Record<string, any>>;',
    },

    // Generic
    {
      code: 'type Foo = Generic<{ [key: string]: any }>;',
      errors: [{ column: 20, line: 1, messageId: 'preferRecord' }],
      output: 'type Foo = Generic<Record<string, any>>;',
    },

    // Readonly Generic
    {
      code: 'type Foo = Generic<{ readonly [key: string]: any }>;',
      errors: [{ column: 20, line: 1, messageId: 'preferRecord' }],
      output: 'type Foo = Generic<Readonly<Record<string, any>>>;',
    },

    // Function types
    {
      code: 'function foo(arg: { [key: string]: any }) {}',
      errors: [{ column: 19, line: 1, messageId: 'preferRecord' }],
      output: 'function foo(arg: Record<string, any>) {}',
    },
    {
      code: 'function foo(): { [key: string]: any } {}',
      errors: [{ column: 17, line: 1, messageId: 'preferRecord' }],
      output: 'function foo(): Record<string, any> {}',
    },

    // Readonly function types
    {
      code: 'function foo(arg: { readonly [key: string]: any }) {}',
      errors: [{ column: 19, line: 1, messageId: 'preferRecord' }],
      output: 'function foo(arg: Readonly<Record<string, any>>) {}',
    },
    {
      code: 'function foo(): { readonly [key: string]: any } {}',
      errors: [{ column: 17, line: 1, messageId: 'preferRecord' }],
      output: 'function foo(): Readonly<Record<string, any>> {}',
    },

    // Never
    // Type literal
    {
      code: 'type Foo = Record<string, any>;',
      errors: [{ column: 12, line: 1, messageId: 'preferIndexSignature' }],
      options: ['index-signature'],
      output: 'type Foo = { [key: string]: any };',
    },

    // Type literal with generic parameter
    {
      code: 'type Foo<T> = Record<string, T>;',
      errors: [{ column: 15, line: 1, messageId: 'preferIndexSignature' }],
      options: ['index-signature'],
      output: 'type Foo<T> = { [key: string]: T };',
    },

    // Circular
    {
      code: 'type Foo = { [k: string]: A.Foo };',
      errors: [{ column: 12, line: 1, messageId: 'preferRecord' }],
      output: 'type Foo = Record<string, A.Foo>;',
    },
    {
      code: 'type Foo = { [key: string]: AnotherFoo };',
      errors: [{ column: 12, line: 1, messageId: 'preferRecord' }],
      output: 'type Foo = Record<string, AnotherFoo>;',
    },
    {
      code: 'type Foo = { [key: string]: { [key: string]: Foo } };',
      errors: [{ column: 29, line: 1, messageId: 'preferRecord' }],
      output: 'type Foo = { [key: string]: Record<string, Foo> };',
    },
    {
      code: 'type Foo = { [key: string]: string } | Foo;',
      errors: [{ column: 12, line: 1, messageId: 'preferRecord' }],
      output: 'type Foo = Record<string, string> | Foo;',
    },
    {
      code: `
interface Foo<T> {
  [k: string]: T;
}
      `,
      errors: [{ column: 1, line: 2, messageId: 'preferRecord' }],
      output: `
type Foo<T> = Record<string, T>;
      `,
    },
    {
      code: `
interface Foo {
  [k: string]: A.Foo;
}
      `,
      errors: [{ column: 1, line: 2, messageId: 'preferRecord' }],
      output: `
type Foo = Record<string, A.Foo>;
      `,
    },
    {
      code: `
interface Foo {
  [k: string]: { [key: string]: Foo };
}
      `,
      errors: [{ column: 16, line: 3, messageId: 'preferRecord' }],
      output: `
interface Foo {
  [k: string]: Record<string, Foo>;
}
      `,
    },

    // Generic
    {
      code: 'type Foo = Generic<Record<string, any>>;',
      errors: [{ column: 20, line: 1, messageId: 'preferIndexSignature' }],
      options: ['index-signature'],
      output: 'type Foo = Generic<{ [key: string]: any }>;',
    },

    // Function types
    {
      code: 'function foo(arg: Record<string, any>) {}',
      errors: [{ column: 19, line: 1, messageId: 'preferIndexSignature' }],
      options: ['index-signature'],
      output: 'function foo(arg: { [key: string]: any }) {}',
    },
    {
      code: 'function foo(): Record<string, any> {}',
      errors: [{ column: 17, line: 1, messageId: 'preferIndexSignature' }],
      options: ['index-signature'],
      output: 'function foo(): { [key: string]: any } {}',
    },
    {
      code: 'type T = { readonly [key in string]: number };',
      errors: [{ column: 10, messageId: 'preferRecord' }],
      output: `type T = Readonly<Record<string, number>>;`,
    },
    {
      code: 'type T = { +readonly [key in string]: number };',
      errors: [{ column: 10, messageId: 'preferRecord' }],
      output: `type T = Readonly<Record<string, number>>;`,
    },
    {
      // There is no fix, since there isn't a builtin Mutable<T> :(
      code: 'type T = { -readonly [key in string]: number };',
      errors: [{ column: 10, messageId: 'preferRecord' }],
    },
    {
      code: 'type T = { [key in string]: number };',
      errors: [{ column: 10, messageId: 'preferRecord' }],
      output: `type T = Record<string, number>;`,
    },
    {
      code: `
function foo(e: { [key in PropertyKey]?: string }) {}
      `,
      errors: [
        {
          column: 17,
          endColumn: 50,
          endLine: 2,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
function foo(e: Partial<Record<PropertyKey, string>>) {}
      `,
    },
    {
      code: `
function foo(e: { [key in PropertyKey]+?: string }) {}
      `,
      errors: [
        {
          column: 17,
          endColumn: 51,
          endLine: 2,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
function foo(e: Partial<Record<PropertyKey, string>>) {}
      `,
    },
    {
      code: `
function foo(e: { [key in PropertyKey]-?: string }) {}
      `,
      errors: [
        {
          column: 17,
          endColumn: 51,
          endLine: 2,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
function foo(e: Required<Record<PropertyKey, string>>) {}
      `,
    },
    {
      code: `
function foo(e: { readonly [key in PropertyKey]-?: string }) {}
      `,
      errors: [
        {
          column: 17,
          endColumn: 60,
          endLine: 2,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
function foo(e: Readonly<Required<Record<PropertyKey, string>>>) {}
      `,
    },
    {
      code: `
type Options = [
  { [Type in (typeof optionTesters)[number]['option']]?: boolean } & {
    allow?: TypeOrValueSpecifier[];
  },
];
      `,
      errors: [
        {
          column: 3,
          endColumn: 67,
          endLine: 3,
          line: 3,
          messageId: 'preferRecord',
        },
      ],
      output: `
type Options = [
  Partial<Record<(typeof optionTesters)[number]['option'], boolean>> & {
    allow?: TypeOrValueSpecifier[];
  },
];
      `,
    },
    {
      code: `
export type MakeRequired<Base, Key extends keyof Base> = {
  [K in Key]-?: NonNullable<Base[Key]>;
} & Omit<Base, Key>;
      `,
      errors: [
        {
          column: 58,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
export type MakeRequired<Base, Key extends keyof Base> = Required<Record<Key, NonNullable<Base[Key]>>> & Omit<Base, Key>;
      `,
    },
    {
      // in parenthesized expression is convertible to Record
      code: noFormat`
function f(): {
  [k in (keyof ParseResult)]: unknown;
} {
  return {};
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferRecord',
        },
      ],
      output: `
function f(): Record<keyof ParseResult, unknown> {
  return {};
}
      `,
    },
  ],
});
