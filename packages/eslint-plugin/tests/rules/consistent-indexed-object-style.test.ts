import rule from '../../src/rules/consistent-indexed-object-style';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
    `
interface Foo {
  [key: string]: Foo;
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
  ],
  invalid: [
    // Interface
    {
      code: `
interface Foo {
  [key: string]: any;
}
      `,
      output: `
type Foo = Record<string, any>;
      `,
      errors: [{ messageId: 'preferRecord', line: 2, column: 1 }],
    },

    // Readonly interface
    {
      code: `
interface Foo {
  readonly [key: string]: any;
}
      `,
      output: `
type Foo = Readonly<Record<string, any>>;
      `,
      errors: [{ messageId: 'preferRecord', line: 2, column: 1 }],
    },

    // Interface with generic parameter
    {
      code: `
interface Foo<A> {
  [key: string]: A;
}
      `,
      output: `
type Foo<A> = Record<string, A>;
      `,
      errors: [{ messageId: 'preferRecord', line: 2, column: 1 }],
    },

    // Interface with generic parameter and default value
    {
      code: `
interface Foo<A = any> {
  [key: string]: A;
}
      `,
      output: `
type Foo<A = any> = Record<string, A>;
      `,
      errors: [{ messageId: 'preferRecord', line: 2, column: 1 }],
    },

    // Interface with extends
    {
      code: `
interface B extends A {
  [index: number]: unknown;
}
      `,
      output: null,
      errors: [{ messageId: 'preferRecord', line: 2, column: 1 }],
    },
    // Readonly interface with generic parameter
    {
      code: `
interface Foo<A> {
  readonly [key: string]: A;
}
      `,
      output: `
type Foo<A> = Readonly<Record<string, A>>;
      `,
      errors: [{ messageId: 'preferRecord', line: 2, column: 1 }],
    },

    // Interface with multiple generic parameters
    {
      code: `
interface Foo<A, B> {
  [key: A]: B;
}
      `,
      output: `
type Foo<A, B> = Record<A, B>;
      `,
      errors: [{ messageId: 'preferRecord', line: 2, column: 1 }],
    },

    // Readonly interface with multiple generic parameters
    {
      code: `
interface Foo<A, B> {
  readonly [key: A]: B;
}
      `,
      output: `
type Foo<A, B> = Readonly<Record<A, B>>;
      `,
      errors: [{ messageId: 'preferRecord', line: 2, column: 1 }],
    },

    // Type literal
    {
      code: 'type Foo = { [key: string]: any };',
      output: 'type Foo = Record<string, any>;',
      errors: [{ messageId: 'preferRecord', line: 1, column: 12 }],
    },

    // Readonly type literal
    {
      code: 'type Foo = { readonly [key: string]: any };',
      output: 'type Foo = Readonly<Record<string, any>>;',
      errors: [{ messageId: 'preferRecord', line: 1, column: 12 }],
    },

    // Generic
    {
      code: 'type Foo = Generic<{ [key: string]: any }>;',
      output: 'type Foo = Generic<Record<string, any>>;',
      errors: [{ messageId: 'preferRecord', line: 1, column: 20 }],
    },

    // Readonly Generic
    {
      code: 'type Foo = Generic<{ readonly [key: string]: any }>;',
      output: 'type Foo = Generic<Readonly<Record<string, any>>>;',
      errors: [{ messageId: 'preferRecord', line: 1, column: 20 }],
    },

    // Function types
    {
      code: 'function foo(arg: { [key: string]: any }) {}',
      output: 'function foo(arg: Record<string, any>) {}',
      errors: [{ messageId: 'preferRecord', line: 1, column: 19 }],
    },
    {
      code: 'function foo(): { [key: string]: any } {}',
      output: 'function foo(): Record<string, any> {}',
      errors: [{ messageId: 'preferRecord', line: 1, column: 17 }],
    },

    // Readonly function types
    {
      code: 'function foo(arg: { readonly [key: string]: any }) {}',
      output: 'function foo(arg: Readonly<Record<string, any>>) {}',
      errors: [{ messageId: 'preferRecord', line: 1, column: 19 }],
    },
    {
      code: 'function foo(): { readonly [key: string]: any } {}',
      output: 'function foo(): Readonly<Record<string, any>> {}',
      errors: [{ messageId: 'preferRecord', line: 1, column: 17 }],
    },

    // Never
    // Type literal
    {
      code: 'type Foo = Record<string, any>;',
      options: ['index-signature'],
      output: 'type Foo = { [key: string]: any };',
      errors: [{ messageId: 'preferIndexSignature', line: 1, column: 12 }],
    },

    // Type literal with generic parameter
    {
      code: 'type Foo<T> = Record<string, T>;',
      options: ['index-signature'],
      output: 'type Foo<T> = { [key: string]: T };',
      errors: [{ messageId: 'preferIndexSignature', line: 1, column: 15 }],
    },

    // Circular
    {
      code: 'type Foo = { [k: string]: A.Foo };',
      output: 'type Foo = Record<string, A.Foo>;',
      errors: [{ messageId: 'preferRecord', line: 1, column: 12 }],
    },
    {
      code: 'type Foo = { [key: string]: AnotherFoo };',
      output: 'type Foo = Record<string, AnotherFoo>;',
      errors: [{ messageId: 'preferRecord', line: 1, column: 12 }],
    },
    {
      code: 'type Foo = { [key: string]: { [key: string]: Foo } };',
      output: 'type Foo = { [key: string]: Record<string, Foo> };',
      errors: [{ messageId: 'preferRecord', line: 1, column: 29 }],
    },
    {
      code: 'type Foo = { [key: string]: string } | Foo;',
      output: 'type Foo = Record<string, string> | Foo;',
      errors: [{ messageId: 'preferRecord', line: 1, column: 12 }],
    },
    {
      code: `
interface Foo {
  [k: string]: A.Foo;
}
      `,
      output: `
type Foo = Record<string, A.Foo>;
      `,
      errors: [{ messageId: 'preferRecord', line: 2, column: 1 }],
    },
    {
      code: `
interface Foo {
  [k: string]: { [key: string]: Foo };
}
      `,
      output: `
interface Foo {
  [k: string]: Record<string, Foo>;
}
      `,
      errors: [{ messageId: 'preferRecord', line: 3, column: 16 }],
    },

    // Generic
    {
      code: 'type Foo = Generic<Record<string, any>>;',
      options: ['index-signature'],
      output: 'type Foo = Generic<{ [key: string]: any }>;',
      errors: [{ messageId: 'preferIndexSignature', line: 1, column: 20 }],
    },

    // Function types
    {
      code: 'function foo(arg: Record<string, any>) {}',
      options: ['index-signature'],
      output: 'function foo(arg: { [key: string]: any }) {}',
      errors: [{ messageId: 'preferIndexSignature', line: 1, column: 19 }],
    },
    {
      code: 'function foo(): Record<string, any> {}',
      options: ['index-signature'],
      output: 'function foo(): { [key: string]: any } {}',
      errors: [{ messageId: 'preferIndexSignature', line: 1, column: 17 }],
    },
  ],
});
