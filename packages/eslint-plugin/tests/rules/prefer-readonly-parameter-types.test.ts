import type { InvalidTestCase } from '@typescript-eslint/rule-tester';

import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../../src/util';

import rule from '../../src/rules/prefer-readonly-parameter-types';
import { readonlynessOptionsDefaults } from '../../src/util';
import { dedupeTestCases } from '../dedupeTestCases';
import { getFixturesRootDir } from '../RuleTester';

type MessageIds = InferMessageIdsTypeFromRule<typeof rule>;
type Options = InferOptionsTypeFromRule<typeof rule>;

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

const primitives = [
  'boolean',
  'true',
  'string',
  "'a'",
  'number',
  '1',
  'symbol',
  'any',
  'unknown',
  'never',
  'null',
  'undefined',
];
const arrays = [
  'readonly string[]',
  'Readonly<string[]>',
  'ReadonlyArray<string>',
  'readonly [string]',
  'Readonly<[string]>',
];
const objects = [
  '{ foo: "" }',
  '{ foo: readonly string[] }',
  '{ foo(): void }',
];
const weirdIntersections = [
  `
    interface Test {
      (): void
      readonly property: boolean
    }
    function foo(arg: Test) {}
  `,
  `
    type Test = (() => void) & {
      readonly property: boolean
    };
    function foo(arg: Test) {}
  `,
];

ruleTester.run('prefer-readonly-parameter-types', rule, {
  valid: [
    'function foo() {}',

    // primitives
    ...primitives.map(type => `function foo(arg: ${type}) {}`),
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
    ...arrays.map(type => `function foo(arg: ${type}) {}`),
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
    ...objects.map(type => `function foo(arg: Readonly<${type}>) {}`),
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
    ...weirdIntersections.map(code => code),
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
    ...dedupeTestCases(
      arrays.map<InvalidTestCase<MessageIds, Options>>(baseType => {
        const type = baseType
          .replaceAll('readonly ', '')
          .replaceAll(/Readonly<(.+?)>/g, '$1')
          .replaceAll('ReadonlyArray', 'Array');
        return {
          code: `function foo(arg: ${type}) {}`,
          errors: [
            {
              column: 14,
              endColumn: 19 + type.length,
              messageId: 'shouldBeReadonly',
            },
          ],
        };
      }),
    ),
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
    ...objects.map<InvalidTestCase<MessageIds, Options>>(type => {
      return {
        code: `function foo(arg: ${type}) {}`,
        errors: [
          {
            column: 14,
            endColumn: 19 + type.length,
            messageId: 'shouldBeReadonly',
          },
        ],
      };
    }),
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
    ...weirdIntersections.map<InvalidTestCase<MessageIds, Options>>(
      baseCode => {
        const code = baseCode.replaceAll('readonly ', '');
        return {
          code,
          errors: [{ messageId: 'shouldBeReadonly' }],
        };
      },
    ),
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
          allow: [{ from: 'file', name: 'RegExp' }],
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
