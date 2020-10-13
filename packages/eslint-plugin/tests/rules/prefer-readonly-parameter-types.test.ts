import { TSESLint } from '@typescript-eslint/experimental-utils';
import { RuleTester, getFixturesRootDir } from '../RuleTester';
import rule from '../../src/rules/prefer-readonly-parameter-types';
import {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../../src/util';

type MessageIds = InferMessageIdsTypeFromRule<typeof rule>;
type Options = InferOptionsTypeFromRule<typeof rule>;

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
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
      options: [
        {
          checkParameterProperties: true,
        },
      ],
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
      options: [
        {
          checkParameterProperties: false,
        },
      ],
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
    'const x = { foo(arg: readonly string[]): void; };', // TSEmptyBodyFunctionExpression
    'function foo(arg: readonly string[]);', // TSDeclareFunction
    'type Foo = (arg: readonly string[]) => void;', // TSFunctionType
    `
      interface Foo {
        foo(arg: readonly string[]): void;
      }
    `, // TSMethodSignature

    // https://github.com/typescript-eslint/typescript-eslint/issues/1665
    // directly recursive
    `
      interface Foo {
        readonly prop: Foo;
      }
      function foo(arg: Foo) {}
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
  ],
  invalid: [
    // arrays
    ...arrays.map<TSESLint.InvalidTestCase<MessageIds, Options>>(baseType => {
      const type = baseType
        .replace(/readonly /g, '')
        .replace(/Readonly<(.+?)>/g, '$1')
        .replace(/ReadonlyArray/g, 'Array');
      return {
        code: `function foo(arg: ${type}) {}`,
        errors: [
          {
            messageId: 'shouldBeReadonly',
            column: 14,
            endColumn: 19 + type.length,
          },
        ],
      };
    }),
    // nested arrays
    {
      code: 'function foo(arg: readonly string[][]) {}',
      errors: [
        {
          messageId: 'shouldBeReadonly',
          column: 14,
          endColumn: 38,
        },
      ],
    },
    {
      code: 'function foo(arg: Readonly<string[][]>) {}',
      errors: [
        {
          messageId: 'shouldBeReadonly',
          column: 14,
          endColumn: 39,
        },
      ],
    },
    {
      code: 'function foo(arg: ReadonlyArray<Array<string>>) {}',
      errors: [
        {
          messageId: 'shouldBeReadonly',
          column: 14,
          endColumn: 47,
        },
      ],
    },

    // objects
    ...objects.map<TSESLint.InvalidTestCase<MessageIds, Options>>(type => {
      return {
        code: `function foo(arg: ${type}) {}`,
        errors: [
          {
            messageId: 'shouldBeReadonly',
            column: 14,
            endColumn: 19 + type.length,
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
          messageId: 'shouldBeReadonly',
          line: 2,
          column: 22,
          endLine: 6,
          endColumn: 10,
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
          messageId: 'shouldBeReadonly',
          line: 2,
          column: 22,
          endLine: 2,
          endColumn: 52,
        },
      ],
    },
    {
      code: `
        function foo(arg: { [key: number]: string }) {}
      `,
      errors: [
        {
          messageId: 'shouldBeReadonly',
          line: 2,
          column: 22,
          endLine: 2,
          endColumn: 52,
        },
      ],
    },

    // weird intersections
    ...weirdIntersections.map<TSESLint.InvalidTestCase<MessageIds, Options>>(
      baseCode => {
        const code = baseCode.replace(/readonly /g, '');
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
          messageId: 'shouldBeReadonly',
          line: 5,
          column: 22,
          endLine: 5,
          endColumn: 31,
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
          messageId: 'shouldBeReadonly',
          line: 5,
          column: 22,
          endLine: 5,
          endColumn: 31,
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
      options: [
        {
          checkParameterProperties: true,
        },
      ],
      errors: [
        {
          messageId: 'shouldBeReadonly',
          line: 4,
          column: 21,
          endLine: 4,
          endColumn: 35,
        },
        {
          messageId: 'shouldBeReadonly',
          line: 5,
          column: 20,
          endLine: 5,
          endColumn: 34,
        },
        {
          messageId: 'shouldBeReadonly',
          line: 6,
          column: 23,
          endLine: 6,
          endColumn: 37,
        },
        {
          messageId: 'shouldBeReadonly',
          line: 7,
          column: 22,
          endLine: 7,
          endColumn: 36,
        },
      ],
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
      options: [
        {
          checkParameterProperties: false,
        },
      ],
      errors: [
        {
          messageId: 'shouldBeReadonly',
          line: 8,
          column: 13,
          endLine: 8,
          endColumn: 27,
        },
      ],
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
          messageId: 'shouldBeReadonly',
          column: 12,
          endColumn: 25,
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
          messageId: 'shouldBeReadonly',
          column: 16,
          endColumn: 29,
        },
      ],
    },
    {
      // TSEmptyBodyFunctionExpression
      code: 'const x = { foo(arg: string[]): void; };',
      errors: [
        {
          messageId: 'shouldBeReadonly',
          column: 17,
          endColumn: 30,
        },
      ],
    },
    {
      // TSDeclareFunction
      code: 'function foo(arg: string[]);',
      errors: [
        {
          messageId: 'shouldBeReadonly',
          column: 14,
          endColumn: 27,
        },
      ],
    },
    {
      // TSFunctionType
      code: 'type Foo = (arg: string[]) => void;',
      errors: [
        {
          messageId: 'shouldBeReadonly',
          column: 13,
          endColumn: 26,
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
          messageId: 'shouldBeReadonly',
          column: 15,
          endColumn: 28,
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
          messageId: 'shouldBeReadonly',
          line: 5,
          column: 22,
          endColumn: 30,
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
          messageId: 'shouldBeReadonly',
          line: 5,
          column: 22,
          endColumn: 40,
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
          messageId: 'shouldBeReadonly',
          line: 8,
          column: 22,
          endColumn: 30,
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
          messageId: 'shouldBeReadonly',
          line: 8,
          column: 22,
          endColumn: 40,
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
          messageId: 'shouldBeReadonly',
          line: 8,
          column: 22,
          endColumn: 30,
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
          messageId: 'shouldBeReadonly',
          line: 8,
          column: 26,
          endColumn: 41,
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
      options: [
        {
          ignoreInferredTypes: true,
        },
      ],
      errors: [
        {
          messageId: 'shouldBeReadonly',
          line: 10,
          column: 43,
          endColumn: 67,
        },
      ],
    },
  ],
});
