import { noFormat } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';

import rule from '../../src/rules/prefer-readonly-parameter-types';
import { readonlynessOptionsDefaults } from '../../src/util';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('prefer-readonly-parameter-types', rule, {
  valid: [
    'function foo() {}',

    // primitives
    'function foo(arg: boolean) {}',
    'function foo(arg: true) {}',
    'function foo(arg: string) {}',
    "function foo(arg: 'a') {}",
    'function foo(arg: number) {}',
    'function foo(arg: 1) {}',
    'function foo(arg: symbol) {}',
    'function foo(arg: any) {}',
    'function foo(arg: unknown) {}',
    'function foo(arg: never) {}',
    'function foo(arg: null) {}',
    'function foo(arg: undefined) {}',
    `
      const symb = Symbol('a');
      function foo(arg: typeof symb) {}
    `,
    `
      enum Enum {
        a,
        b,
      }
      function foo(arg: Enum) {}
    `,

    // arrays
    'function foo(arg: readonly string[]) {}',
    'function foo(arg: Readonly<string[]>) {}',
    'function foo(arg: ReadonlyArray<string>) {}',
    'function foo(arg: readonly [string]) {}',
    'function foo(arg: Readonly<[string]>) {}',

    // nested arrays
    'function foo(arg: readonly (readonly string[])[]) {}',
    'function foo(arg: Readonly<Readonly<string[]>[]>) {}',
    'function foo(arg: ReadonlyArray<ReadonlyArray<string>>) {}',

    // functions
    'function foo(arg: () => void) {}',

    // unions
    'function foo(arg: string | null) {}',
    'function foo(arg: string | ReadonlyArray<string>) {}',
    'function foo(arg: string | (() => void)) {}',
    'function foo(arg: ReadonlyArray<string> | ReadonlyArray<number>) {}',

    // objects
    "function foo(arg: Readonly<{ foo: '' }>) {}",
    'function foo(arg: Readonly<{ foo: readonly string[] }>) {}',
    'function foo(arg: Readonly<{ foo(): void }>) {}',
    `
      function foo(arg: {
        readonly foo: {
          readonly bar: string;
        };
      }) {}
    `,
    `
      function foo(arg: { readonly [k: string]: string }) {}
    `,
    `
      function foo(arg: { readonly [k: number]: string }) {}
    `,
    `
      interface Empty {}
      function foo(arg: Empty) {}
    `,

    // weird other cases
    `
interface Test {
  (): void;
  readonly property: boolean;
}
function foo(arg: Test) {}
    `,
    `
type Test = (() => void) & {
  readonly property: boolean;
};
function foo(arg: Test) {}
    `,
    `
      interface Test extends ReadonlyArray<string> {
        readonly property: boolean;
      }
      function foo(arg: Readonly<Test>) {}
    `,
    `
      type Test = readonly string[] & {
        readonly property: boolean;
      };
      function foo(arg: Readonly<Test>) {}
    `,
    `
      type Test = string & number;
      function foo(arg: Test) {}
    `,

    // declaration merging
    `
      class Foo {
        readonly bang = 1;
      }
      interface Foo {
        readonly prop: string;
      }
      interface Foo {
        readonly prop2: string;
      }
      function foo(arg: Foo) {}
    `,
    // method made readonly via Readonly<T>
    `
      class Foo {
        method() {}
      }
      function foo(arg: Readonly<Foo>) {}
    `,
    // immutable methods
    `
      type MyType = Readonly<{
        prop: string;
        method(): string;
      }>;
      function foo(arg: MyType) {}
    `,
    `
      type MyType = {
        readonly prop: string;
        readonly method: () => string;
      };
      function bar(arg: MyType) {}
    `,
    // PrivateIdentifier is exempt from this rule
    {
      code: `
        class Foo {
          #privateField = 'foo';
          #privateMember() {}
        }
        function foo(arg: Foo) {}
      `,
    },
    {
      code: `
        class HasText {
          readonly #text: string;
        }

        export function onDone(task: HasText): void {}
      `,
    },
    // methods treated as readonly
    {
      code: `
        type MyType = {
          readonly prop: string;
          method(): string;
        };
        function foo(arg: MyType) {}
      `,
      options: [
        {
          treatMethodsAsReadonly: true,
        },
      ],
    },
    {
      code: `
        class Foo {
          method() {}
        }
        function foo(arg: Foo) {}
      `,
      options: [
        {
          treatMethodsAsReadonly: true,
        },
      ],
    },
    {
      code: `
        interface Foo {
          method(): void;
        }
        function foo(arg: Foo) {}
      `,
      options: [
        {
          treatMethodsAsReadonly: true,
        },
      ],
    },
    // ReadonlySet and ReadonlyMap are seen as readonly when methods are treated as readonly
    {
      code: `
        function foo(arg: ReadonlySet<string>) {}
        function bar(arg: ReadonlyMap<string, string>) {}
      `,
      options: [
        {
          treatMethodsAsReadonly: true,
        },
      ],
    },
    // parameter properties should work fine
    {
      code: `
        class Foo {
          constructor(
            private arg1: readonly string[],
            public arg2: readonly string[],
            protected arg3: readonly string[],
            readonly arg4: readonly string[],
          ) {}
        }
      `,
      options: [{ checkParameterProperties: true }],
    },
    {
      code: `
        class Foo {
          constructor(
            private arg1: string[],
            public arg2: string[],
            protected arg3: string[],
            readonly arg4: string[],
          ) {}
        }
      `,
      options: [{ checkParameterProperties: false }],
    },

    // type functions
    `
      interface Foo {
        (arg: readonly string[]): void;
      }
    `, // TSCallSignatureDeclaration
    `
      interface Foo {
        new (arg: readonly string[]): void;
      }
    `, // TSConstructSignatureDeclaration
    noFormat`class Foo { foo(arg: readonly string[]): void; };`, // TSEmptyBodyFunctionExpression
    'function foo(arg: readonly string[]);', // TSDeclareFunction
    'type Foo = (arg: readonly string[]) => void;', // TSFunctionType
    `
      interface Foo {
        foo(arg: readonly string[]): void;
      }
    `, // TSMethodSignature

    // https://github.com/typescript-eslint/typescript-eslint/issues/1665
    // directly recursive interface
    `
      interface Foo {
        readonly prop: Foo;
      }
      function foo(arg: Foo) {}
    `,

    // https://github.com/typescript-eslint/typescript-eslint/issues/3396
    // directly recursive union type
    `
      type MyType = string | readonly MyType[];

      function foo<A extends MyType[]>(a: A): MyType[] {
        return [];
      }
    `,
    // indirectly recursive
    `
      interface Foo {
        readonly prop: Bar;
      }
      interface Bar {
        readonly prop: Foo;
      }
      function foo(arg: Foo) {}
    `,
    `
      interface Foo {
        prop: Readonly<Bar>;
      }
      interface Bar {
        prop: Readonly<Foo>;
      }
      function foo(arg: Readonly<Foo>) {}
    `,
    `
      const sym = Symbol('sym');

      interface WithSymbol {
        [sym]: number;
      }

      const willNotCrash = (foo: Readonly<WithSymbol>) => {};
    `,
    `
type TaggedBigInt = bigint & {
  readonly __tag: unique symbol;
};
function custom1(arg: TaggedBigInt) {}
    `,
    `
type TaggedNumber = number & {
  readonly __tag: unique symbol;
};
function custom1(arg: TaggedNumber) {}
    `,
    `
type TaggedString = string & {
  readonly __tag: unique symbol;
};
function custom1(arg: TaggedString) {}
    `,
    `
type TaggedString = string & {
  readonly __tagA: unique symbol;
  readonly __tagB: unique symbol;
};
function custom1(arg: TaggedString) {}
    `,
    `
type TaggedString = string & {
  readonly __tag: unique symbol;
};

type OtherSpecialString = string & {
  readonly ' __other_tag': unique symbol;
};

function custom1(arg: TaggedString | OtherSpecialString) {}
    `,
    `
type TaggedTemplateLiteral = \`\${string}-\${string}\` & {
  readonly __tag: unique symbol;
};
function custom1(arg: TaggedTemplateLiteral) {}
    `,
    `
type TaggedNumber = 1 & {
  readonly __tag: unique symbol;
};

function custom1(arg: TaggedNumber) {}
    `,
    `
type TaggedNumber = (1 | 2) & {
  readonly __tag: unique symbol;
};

function custom1(arg: TaggedNumber) {}
    `,
    `
type TaggedString = ('a' | 'b') & {
  readonly __tag: unique symbol;
};

function custom1(arg: TaggedString) {}
    `,
    `
type Strings = 'one' | 'two' | 'three';

type TaggedString = Strings & {
  readonly __tag: unique symbol;
};

function custom1(arg: TaggedString) {}
    `,
    `
type Strings = 'one' | 'two' | 'three';

type TaggedString = Strings & {
  __tag: unique symbol;
};

function custom1(arg: TaggedString) {}
    `,
    `
type TaggedString = string & {
  __tag: unique symbol;
} & {
  __tag: unique symbol;
};
function custom1(arg: TaggedString) {}
    `,
    `
type TaggedString = string & {
  __tagA: unique symbol;
} & {
  __tagB: unique symbol;
};
function custom1(arg: TaggedString) {}
    `,
    `
type TaggedString = string &
  ({ __tag: unique symbol } | { __tag: unique symbol });
function custom1(arg: TaggedString) {}
    `,
    `
type TaggedFunction = (() => void) & {
  readonly __tag: unique symbol;
};
function custom1(arg: TaggedFunction) {}
    `,
    {
      code: `
        type Callback<T> = (options: T) => void;

        declare const acceptsCallback: <T>(callback: Callback<T>) => void;

        interface CallbackOptions {
          prop: string;
        }

        acceptsCallback<CallbackOptions>(options => {});
      `,
      options: [
        {
          ignoreInferredTypes: true,
        },
      ],
    },
    {
      code: `
        interface Obj {
          readonly [K: string]: Obj;
        }

        function foo(event: Obj): void {}
      `,
      name: 'circular readonly types (Bug: #4476)',
      options: [
        {
          checkParameterProperties: true,
          ignoreInferredTypes: false,
          ...readonlynessOptionsDefaults,
        },
      ],
    },
    {
      code: `
        interface Obj1 {
          readonly [K: string]: Obj2;
        }

        interface Obj2 {
          readonly [K: string]: Obj1;
        }

        function foo(event: Obj1): void {}
      `,
      name: 'circular readonly types (Bug: #5875)',
      options: [
        {
          checkParameterProperties: true,
          ignoreInferredTypes: false,
          ...readonlynessOptionsDefaults,
        },
      ],
    },
    // Allowlist
    {
      code: `
        interface Foo {
          readonly prop: RegExp;
        }

        function foo(arg: Foo) {}
      `,
      options: [
        {
          allow: [{ from: 'lib', name: 'RegExp' }],
        },
      ],
    },
    {
      code: `
        interface Foo {
          prop: RegExp;
        }

        function foo(arg: Readonly<Foo>) {}
      `,
      options: [
        {
          allow: [{ from: 'lib', name: 'RegExp' }],
        },
      ],
    },
    {
      code: `
        interface Foo {
          prop: string;
        }

        function foo(arg: Foo) {}
      `,
      options: [
        {
          allow: [{ from: 'file', name: 'Foo' }],
        },
      ],
    },
    {
      code: `
        interface Bar {
          prop: string;
        }
        interface Foo {
          readonly prop: Bar;
        }

        function foo(arg: Foo) {}
      `,
      options: [
        {
          allow: [{ from: 'file', name: 'Foo' }],
        },
      ],
    },
    {
      code: `
        interface Bar {
          prop: string;
        }
        interface Foo {
          readonly prop: Bar;
        }

        function foo(arg: Foo) {}
      `,
      options: [
        {
          allow: [{ from: 'file', name: 'Bar' }],
        },
      ],
    },
  ],
  invalid: [
    // arrays
    // Removing readonly causes duplicates
    {
      code: 'function foo(arg: string[]) {}',
      errors: [
        {
          column: 14,
          endColumn: 27,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: 'function foo(arg: Array<string>) {}',
      errors: [
        {
          column: 14,
          endColumn: 32,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: 'function foo(arg: [string]) {}',
      errors: [
        {
          column: 14,
          endColumn: 27,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    // nested arrays
    {
      code: 'function foo(arg: readonly string[][]) {}',
      errors: [
        {
          column: 14,
          endColumn: 38,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: 'function foo(arg: Readonly<string[][]>) {}',
      errors: [
        {
          column: 14,
          endColumn: 39,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: 'function foo(arg: ReadonlyArray<Array<string>>) {}',
      errors: [
        {
          column: 14,
          endColumn: 47,
          messageId: 'shouldBeReadonly',
        },
      ],
    },

    // objects
    {
      code: "function foo(arg: { foo: '' }) {}",
      errors: [
        {
          column: 14,
          endColumn: 30,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: 'function foo(arg: { foo: readonly string[] }) {}',
      errors: [
        {
          column: 14,
          endColumn: 45,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: 'function foo(arg: { foo(): void }) {}',
      errors: [
        {
          column: 14,
          endColumn: 34,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: `
        function foo(arg: {
          readonly foo: {
            bar: string;
          };
        }) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 10,
          endLine: 6,
          line: 2,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    // object index signatures
    {
      code: `
        function foo(arg: { [key: string]: string }) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 52,
          endLine: 2,
          line: 2,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: `
        function foo(arg: { [key: number]: string }) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 52,
          endLine: 2,
          line: 2,
          messageId: 'shouldBeReadonly',
        },
      ],
    },

    // weird intersections
    {
      code: `
interface Test {
  (): void;
  property: boolean;
}
function foo(arg: Test) {}
      `,
      errors: [
        {
          column: 14,
          endColumn: 23,
          endLine: 6,
          line: 6,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: `
type Test = (() => void) & {
  property: boolean;
};
function foo(arg: Test) {}
      `,
      errors: [
        {
          column: 14,
          endColumn: 23,
          endLine: 5,
          line: 5,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: `
        interface Test extends Array<string> {
          readonly property: boolean;
        }
        function foo(arg: Test) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 31,
          endLine: 5,
          line: 5,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: `
        interface Test extends Array<string> {
          property: boolean;
        }
        function foo(arg: Test) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 31,
          endLine: 5,
          line: 5,
          messageId: 'shouldBeReadonly',
        },
      ],
    },

    // parameter properties should work fine
    {
      code: `
        class Foo {
          constructor(
            private arg1: string[],
            public arg2: string[],
            protected arg3: string[],
            readonly arg4: string[],
          ) {}
        }
      `,
      errors: [
        {
          column: 21,
          endColumn: 35,
          endLine: 4,
          line: 4,
          messageId: 'shouldBeReadonly',
        },
        {
          column: 20,
          endColumn: 34,
          endLine: 5,
          line: 5,
          messageId: 'shouldBeReadonly',
        },
        {
          column: 23,
          endColumn: 37,
          endLine: 6,
          line: 6,
          messageId: 'shouldBeReadonly',
        },
        {
          column: 22,
          endColumn: 36,
          endLine: 7,
          line: 7,
          messageId: 'shouldBeReadonly',
        },
      ],
      options: [{ checkParameterProperties: true }],
    },
    {
      code: `
        class Foo {
          constructor(
            private arg1: readonly string[],
            public arg2: readonly string[],
            protected arg3: readonly string[],
            readonly arg4: readonly string[],
            arg5: string[],
          ) {}
        }
      `,
      errors: [
        {
          column: 13,
          endColumn: 27,
          endLine: 8,
          line: 8,
          messageId: 'shouldBeReadonly',
        },
      ],
      options: [{ checkParameterProperties: false }],
    },

    // type functions
    {
      // TSCallSignatureDeclaration
      code: `
        interface Foo {
          (arg: string[]): void;
        }
      `,
      errors: [
        {
          column: 12,
          endColumn: 25,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      // TSConstructSignatureDeclaration
      code: `
        interface Foo {
          new (arg: string[]): void;
        }
      `,
      errors: [
        {
          column: 16,
          endColumn: 29,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      // TSEmptyBodyFunctionExpression
      code: noFormat`class Foo { foo(arg: string[]): void; };`,
      errors: [
        {
          column: 17,
          endColumn: 30,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      // TSDeclareFunction
      code: 'function foo(arg: string[]);',
      errors: [
        {
          column: 14,
          endColumn: 27,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      // TSFunctionType
      code: 'type Foo = (arg: string[]) => void;',
      errors: [
        {
          column: 13,
          endColumn: 26,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      // TSMethodSignature
      code: `
        interface Foo {
          foo(arg: string[]): void;
        }
      `,
      errors: [
        {
          column: 15,
          endColumn: 28,
          messageId: 'shouldBeReadonly',
        },
      ],
    },

    // https://github.com/typescript-eslint/typescript-eslint/issues/1665
    // directly recursive
    {
      code: `
        interface Foo {
          prop: Foo;
        }
        function foo(arg: Foo) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 30,
          line: 5,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: `
        interface Foo {
          prop: Foo;
        }
        function foo(arg: Readonly<Foo>) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 40,
          line: 5,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    // indirectly recursive
    {
      code: `
        interface Foo {
          prop: Bar;
        }
        interface Bar {
          readonly prop: Foo;
        }
        function foo(arg: Foo) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 30,
          line: 8,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: `
        interface Foo {
          prop: Bar;
        }
        interface Bar {
          readonly prop: Foo;
        }
        function foo(arg: Readonly<Foo>) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 40,
          line: 8,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: `
        interface Foo {
          prop: Readonly<Bar>;
        }
        interface Bar {
          prop: Readonly<Foo>;
        }
        function foo(arg: Foo) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 30,
          line: 8,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: `
class ClassExample {}
type Test = typeof ClassExample & {
  readonly property: boolean;
};
function foo(arg: Test) {}
      `,
      errors: [
        {
          column: 14,
          endColumn: 23,
          line: 6,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: `
        const sym = Symbol('sym');

        interface WithSymbol {
          [sym]: number;
        }

        const willNot = (foo: WithSymbol) => {};
      `,
      errors: [
        {
          column: 26,
          endColumn: 41,
          line: 8,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    {
      code: `
        type Callback<T> = (options: T) => void;

        declare const acceptsCallback: <T>(callback: Callback<T>) => void;

        interface CallbackOptions {
          prop: string;
        }

        acceptsCallback<CallbackOptions>((options: CallbackOptions) => {});
      `,
      errors: [
        {
          column: 43,
          endColumn: 67,
          line: 10,
          messageId: 'shouldBeReadonly',
        },
      ],
      options: [
        {
          ignoreInferredTypes: true,
        },
      ],
    },
    // Mutable methods.
    {
      code: `
        type MyType = {
          readonly prop: string;
          method(): string;
        };
        function foo(arg: MyType) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 33,
          line: 6,
          messageId: 'shouldBeReadonly',
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/3405
    {
      code: `
        type MyType<T> = {
          [K in keyof T]: 'cat' | 'dog' | T[K];
        };

        function method<A extends any[] = string[]>(value: MyType<A>) {
          return value;
        }

        method(['cat', 'dog']);
        method<'mouse'[]>(['cat', 'mouse']);
      `,
      errors: [{ line: 6, messageId: 'shouldBeReadonly' }],
    },
    // Allowlist
    {
      code: `
        function foo(arg: RegExp) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 33,
          line: 2,
          messageId: 'shouldBeReadonly',
        },
      ],
      options: [
        {
          allow: [{ from: 'file', name: 'Foo' }],
        },
      ],
    },
    {
      code: `
        interface Foo {
          readonly prop: RegExp;
        }

        function foo(arg: Foo) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 30,
          line: 6,
          messageId: 'shouldBeReadonly',
        },
      ],
      options: [
        {
          allow: [{ from: 'file', name: 'Bar' }],
        },
      ],
    },
    {
      code: `
        interface Foo {
          readonly prop: RegExp;
        }

        function foo(arg: Foo) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 30,
          line: 6,
          messageId: 'shouldBeReadonly',
        },
      ],
      options: [
        {
          allow: [{ from: 'lib', name: 'Foo' }],
        },
      ],
    },
    {
      code: `
        interface Foo {
          readonly prop: RegExp;
        }

        function foo(arg: Foo) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 30,
          line: 6,
          messageId: 'shouldBeReadonly',
        },
      ],
      options: [
        {
          allow: [{ from: 'package', name: 'Foo', package: 'foo-lib' }],
        },
      ],
    },
    {
      code: `
        function foo(arg: RegExp) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 33,
          line: 2,
          messageId: 'shouldBeReadonly',
        },
      ],
      options: [
        {
          allow: [
            {
              from: 'file',
              name: 'RegExp',
              path: path.posix.join(
                ...path
                  .relative(process.cwd(), path.join(__dirname, '..', '..'))
                  .split(path.sep),
              ),
            },
          ],
        },
      ],
    },
    {
      code: `
        function foo(arg: RegExp) {}
      `,
      errors: [
        {
          column: 22,
          endColumn: 33,
          line: 2,
          messageId: 'shouldBeReadonly',
        },
      ],
      options: [
        {
          allow: [{ from: 'package', name: 'RegExp', package: 'regexp-lib' }],
        },
      ],
    },
  ],
});
