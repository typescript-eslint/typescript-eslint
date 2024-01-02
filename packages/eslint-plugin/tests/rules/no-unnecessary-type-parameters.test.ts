import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unnecessary-type-parameters';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-unnecessary-type-parameters', rule, {
  valid: [
    {
      // only: true,
      code: `
        declare function get(): void;
        declare function get<T>(param: T[]): T;
      `,
    },
    {
      code: `
        declare function identity<T>(param: T): T; // this is valid as it constrains the return type to the parameter type
      `,
    },
    {
      code: `
        declare function compare<T>(param1: T, param2: T): boolean; // this is valid because it enforces comparable types for both parameters
      `,
    },
    // Dan and Josh disagree with this; U only appears once, therefore it's invalid.
    // {
    //   code: `
    //     declare function compare<T, U extends T>(param1: T, param2: U): boolean; // this is also valid because T constrains U
    //   `,
    // },
    {
      // only: true,
      code: `
        function getProperty<T, K extends keyof T>(obj: T, key: K) {
          return obj[key];
        }
      `,
    },
    {
      code: `
        // The inferred return type is V, therefore this is valid.
        function doStuff<K, V>(map: Map<K, V>, key: K) {
          let v = map.get(key);
          v = 1; // this error disappears if V is replaced with any/unknown
          map.set(key, v);
          return v; // signature has implicit return type V, but we cannot know that without type information
        }
      `,
    },
    {
      code: `
        // The inferred return type is Map<V, V>, therefore this is valid.
        function makeMap<K, V>(ks: K[], vs: V[]) {
          const r = new Map<K, V>();
          ks.forEach((k, i) => {
            r.set(k, vs[i]);
          });
          return r;
        }
      `,
    },
    // {
    //   code: stripIndent`
    //     // https://github.com/cartant/eslint-plugin-etc/issues/15
    //     /**
    //      * Call two functions with the same args, e.g.
    //      *
    //      * onClick={both(action('click'), setState)}
    //      */
    //     export function both<
    //       Args extends unknown[],
    //       CB1 extends (...args: Args) => void,
    //       CB2 extends (...args: Args) => void
    //     >(fn1: CB1, fn2: CB2): (...args: Args) => void {
    //       // See https://stackoverflow.com/a/62093430/388951
    //       return function (...args: Args) {
    //         fn1(...args);
    //         fn2(...args);
    //       };
    //     }
    //   `,
    // },
  ],
  invalid: [
    {
      code: `
        declare function get<T>(): T;
        //                   ~ [cannotInfer { "name": "T" }]
        get<string>();
      `,
      errors: [
        {
          messageId: 'sole',
        },
      ],
    },
    {
      code: `
        declare function get<T extends object>(): T;
        // ~~~~~~~~~~~~~~~~ [cannotInfer { "name": "T" }]
      `,
      errors: [
        {
          messageId: 'sole',
        },
      ],
    },
    {
      code: `
        declare function get<T, U = T>(param: U): U;
        // ~ [cannotInfer { "name": "T" }]
      `,
      errors: [
        {
          messageId: 'sole',
        },
      ],
    },
    {
      code: `
        declare function get<T, U extends T = T>(param: T): U;
        // ~~~~~~~~~~~~~~~ [cannotInfer { "name": "U" }]
      `,
      errors: [
        {
          messageId: 'sole',
        },
      ],
    },
    {
      // only: true,
      code: `
        function printProperty<T, K extends keyof T>(obj: T, key: K) {
          console.log(obj[key]);
        }
      `,
      errors: [
        {
          messageId: 'sole',
        },
      ],
    },
    {
      code: `
        // The inferred return type is Map<V, V>, but these are the sole uses
        // of both type paramters, so this is invalid.
        function makeMap<K, V>() {
          return new Map<K, V>();
        }
      `,
      errors: [
        {
          data: {
            name: 'K',
          },
          messageId: 'sole',
        },
        {
          data: {
            name: 'V',
          },
          messageId: 'sole',
        },
      ],
    },
    // {
    //   code: ``,
    //   errors: [
    //     {
    //       messageId: 'sole',
    //     }
    //   ]
    // }
  ],
  /*
    }),
    `



      declare function get<T extends string, U>(param: Record<T, U>): boolean;
                           ~~~~~~~~~~~~~~~~ [canReplace { "name": "T", "replacement": "string" }]
                                             ~ [canReplace { "name": "U", "replacement": "unknown" }]
      declare function get<T>(param: <T, U>(param: T) => U): T;
                           ~ [cannotInfer { "name": "T" }]
                                      ~ [canReplace { "name": "T", "replacement": "unknown" }]
                                         ~ [cannotInfer { "name": "U" }]
    `),
    fromFixture(stripIndent`
      function fn<T>(param: string) {
                  ~ [cannotInfer { "name": "T" }]
        let v: T = null!;
        return v;
      }
    `),
    fromFixture(stripIndent`
      declare class C<V> {
        method<T, U>(param: T): U;
               ~ [canReplace { "name": "T", "replacement": "unknown" }]
                  ~ [cannotInfer { "name": "U" }]
        prop: <T>() => T;
               ~ [cannotInfer { "name": "T" }]
      }
    `),
    fromFixture(stripIndent`
      const func = <T,>(param): T => null!;
                    ~ [cannotInfer { "name": "T" }]
    `),
    // This test should fail, but it doesn't because the implementation tests
    // the signature with:
    //
    //   tsutils.isFunctionWithBody(signature)
    //
    // And if that returns true, the implementation assumes that the type
    // parameter is used.
    //
    // fromFixture(stripIndent`
    //   // https://github.com/cartant/eslint-plugin-etc/issues/30
    //   const func = <T,>(param: T) => null;
    //                 ~ [canReplace { "name": "T", "replacement": "unknown" }]
    // `),
    fromFixture(stripIndent`
      declare function take<T>(param: T): void; // T not used as constraint -> could just be any/unknown
                            ~ [canReplace { "name": "T", "replacement": "unknown" }]
      declare function take<T extends object>(param: T): void; // could just use object
                            ~~~~~~~~~~~~~~~~ [canReplace { "name": "T", "replacement": "object" }]
      declare function take<T, U = T>(param1: T, param2: U): void; // no constraint
                            ~ [canReplace { "name": "T", "replacement": "unknown" }]
                               ~~~~~ [canReplace { "name": "U", "replacement": "unknown" }]
      declare function take<T, U extends T>(param: T): U; // U is only used in the return type
                               ~~~~~~~~~~~ [cannotInfer { "name": "U" }]
      declare function take<T, U extends T>(param: U): U; // T cannot be inferred
                            ~ [cannotInfer { "name": "T" }]
    `),
    fromFixture(stripIndent`
      declare class Foo {
        prop: string;
        getProp<T>(this: Record<'prop', T>): T;
        compare<T>(this: Record<'prop', T>, other: Record<'prop', T>): number;
        foo<T>(this: T): void;
            ~ [canReplace { "name": "T", "replacement": "unknown" }]
      }
    `),
  ],
  */
});
