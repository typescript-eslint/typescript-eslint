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
    // These tests are adapted from https://effectivetypescript.com/2020/08/12/generics-golden-rule/
    `
      function identity<T>(arg: T): T {
        return arg;
      }
    `,
    `
      function printProperty<T>(obj: T, key: keyof T) {
        console.log(obj[key]);
      }
    `,
    `
      class ClassyArray<T> {
        arr: T[];
        constructor(arr: T[]) {
          this.arr = arr;
        }

        get(): T[] {
          return this.arr;
        }
        add(item: T) {
          this.arr.push(item);
        }
        remove(item: T) {
          this.arr = this.arr.filter(el => el !== item);
        }
      }
    `,
    {
      code: `
        function getProperty<T, K extends keyof T>(obj: T, key: K) {
          return obj[key];
        }
      `,
    },

    // These tests are adapted from eslint-plugin-etc's no-misused-generics
    {
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

    // Tests from DefinitelyTyped-tools / eslint-plugin / no-unnecessary-generics
    'declare function example1(a: string): string;',
    'declare function example2<T>(a: T): T;',
    'declare function example3<T>(a: T[]): T;',
    'declare function example4<T>(a: Set<T>): T;',
    'declare function example5<T>(a: Set<T>, b: T[]): void;',
    'declare function example6<T>(a: Map<T, T>): void;',
    'declare function example7<T, U extends T>(t: T, u: U): U;',

    // These tests are new for the no-unnecessary-type-parameters rule
    // The inferred return type is Map<V, V>, therefore this is valid.
    {
      code: `
        function makeMap<K, V>(ks: K[], vs: V[]) {
          const r = new Map<K, V>();
          ks.forEach((k, i) => {
            r.set(k, vs[i]);
          });
          return r;
        }
      `,
    },
    // The inferred return type is [T, T][], which references T twice.
    `
      function arrayOfPairs<T>() {
        return [] as [T, T][];
      }
    `,
    // Same as above but with an explicit return type.
    `
      declare function arrayOfPairs<T>(): [T, T][];
    `,
    // T appears twice, once as a parameter type and once in the predicate.
    `
      function isNonNull<T>(v: T): v is Exclude<T, null> {
        return v !== null;
      }
    `,
    // T appears in the inferred object return type, so this is OK.
    `
      function box<T>(val: T) {
        return { val };
      }
    `,
    // Same as above but with an explicit return type.
    `
      declare function box<T>(val: T): { val: T };
    `,
    // The second use of the class type parameter is in a method's inferred return type.
    `
      class Box<T> {
        val: T | null = null;
        get() {
          return this.val;
        }
      }
    `,

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
    // These tests are adapted from https://effectivetypescript.com/2020/08/12/generics-golden-rule/
    {
      code: `
        function third<A, B, C>(a: A, b: B, c: C): C {
          return c;
        }
      `,
      errors: [
        { messageId: 'sole', data: { name: 'A' } },
        { messageId: 'sole', data: { name: 'B' } },
      ],
    },
    {
      code: `
        function parseYAML<T>(input: string): T {
          // ...
        }
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        function printProperty<T, K extends keyof T>(obj: T, key: K) {
          console.log(obj[key]);
        }
      `,
      errors: [{ messageId: 'sole', data: { name: 'K' } }],
    },
    {
      code: `
        class Joiner<T extends string | number> {
          join(els: T[]) {
            return els.map(el => '' + el).join(',');
          }
        }
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        class Joiner {
          join<T extends string | number>(els: T[]) {
            return els.map(el => '' + el).join(',');
          }
        }
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        interface Lengthy {
          length: number;
        }
        function getLength<T extends Lengthy>(x: T) {
          return x.length;
        }
      `,
      errors: [{ messageId: 'sole' }],
    },

    // These tests are adapted from eslint-plugin-etc
    {
      code: `
        declare function get<T>(): T;
        get<string>();
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        declare function get<T extends object>(): T;
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        declare function get<T, U = T>(param: U): U;
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        declare function get<T, U extends T = T>(param: T): U;
      `,
      errors: [{ messageId: 'sole' }],
    },

    // These tests are adapted from eslint-plugin-etc's no-misused-generics
    {
      code: `
        // Inferred return type is T, but this is still the sole usage.
        function fn<T>(param: string) {
          let v: T = null!;
          return v;
        }
      `,
      errors: [
        {
          data: { name: 'T' },
          messageId: 'sole',
        },
      ],
    },
    {
      code: `
        declare class C<V> {
          method<T, U>(param: T): U;
          prop: <P>() => P;
        }
      `,
      errors: [
        // V is unused so it's already covered by no-unused-variables
        { messageId: 'sole', data: { name: 'T' } },
        { messageId: 'sole', data: { name: 'U' } },
        { messageId: 'sole', data: { name: 'P' } },
      ],
    },
    {
      // This is considered valid by eslint-plugin-etc but Dan and Josh disagree;
      // U only appears once, therefore it's invalid.
      code: `
        declare function compare<T, U extends T>(param1: T, param2: U): boolean; // this is also valid because T constrains U
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      // The parameter type can be Record<string, unknown>
      code: `
        declare function get<T extends string, U>(param: Record<T, U>): boolean;
      `,
      errors: [
        { messageId: 'sole', data: { name: 'T' } },
        { messageId: 'sole', data: { name: 'U' } },
      ],
    },
    {
      // The outer T is shadowed by the inner T; this is  not a valid use.
      code: `
        declare function get<T>(param: <T, U>(param: T) => U): T;
      `,
      errors: [
        { messageId: 'sole', data: { name: 'T' } },
        { messageId: 'sole', data: { name: 'T' } },
        { messageId: 'sole', data: { name: 'U' } },
      ],
    },
    {
      code: `
        const func = <T,>(param: T) => null;
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        declare function take<T>(param: T): void; // T not used as constraint -> could just be any/unknown
        //                    ~ [canReplace { "name": "T", "replacement": "unknown" }]
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        declare function take<T extends object>(param: T): void; // could just use object
        //                    ~~~~~~~~~~~~~~~~ [canReplace { "name": "T", "replacement": "object" }]
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        declare function take<T, U = T>(param1: T, param2: U): void; // no constraint
        //                    ~ [canReplace { "name": "T", "replacement": "unknown" }]
        //                      ~~~~~ [canReplace { "name": "U", "replacement": "unknown" }]
      `,
      errors: [
        // eslint-plugin-etc flags both type parameters as uninferrable
        // { messageId: 'sole', data: { name: 'T' } },
        { messageId: 'sole', data: { name: 'U' } },
      ],
    },
    {
      code: `
        declare function take<T, U extends T>(param: T): U; // U is only used in the return type
        //                      ~~~~~~~~~~~ [cannotInfer { "name": "U" }]
      `,
      errors: [{ messageId: 'sole', data: { name: 'U' } }],
    },
    {
      code: `
        declare function take<T, U extends T>(param: U): U; // T cannot be inferred
        //                    ~ [cannotInfer { "name": "T" }]
      `,
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: `
        declare class Foo {
          prop: string;
          getProp<T>(this: Record<'prop', T>): T;
          compare<T>(this: Record<'prop', T>, other: Record<'prop', T>): number;
          foo<T>(this: T): void;
          //  ~ [canReplace { "name": "T", "replacement": "unknown" }]
        }
      `,
      errors: [
        {
          messageId: 'sole',
          data: { name: 'T' },
          line: 6,
        },
      ],
    },

    // Tests from DefinitelyTyped-tools / eslint-plugin / no-unnecessary-generics
    {
      code: `
        type Fn = <T>() => T;
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        type Ctr = new <T>() => T;
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        const f1 = <T,>(): T => {};
      `,
      errors: [{ messageId: 'sole' }],
    },
    // This is an error: Type parameters cannot appear on a constructor declaration.
    // `
    //   class C {
    //     constructor<T>(x: T) {}
    //   }
    // `,
    {
      code: `
        function f2<T>(): T {}
      `,
      errors: [{ messageId: 'sole' }],
    },
    // The second "T" here is a property name, not a type.
    // So T is completely unused and this should be caught by no-unused-variables.
    // `
    //   function f3<T>(x: { T: number }): void;
    // `,
    {
      code: `
        function f4<T, U extends T>(u: U): U;
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        const f5 = function <T>(): T {};
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        interface I {
          <T>(value: T): void;
        }
      `,
      errors: [{ messageId: 'sole' }],
    },
    {
      code: `
        interface I {
          m<T>(x: T): void;
        }
      `,
      errors: [{ messageId: 'sole' }],
    },

    // These tests are new for the no-unnecessary-type-parameters rule
    {
      code: `
        // The inferred return type is Map<V, V>, but these are the sole uses
        // of both type parameters, so this is invalid.
        function makeMap<K, V>() {
          return new Map<K, V>();
        }
      `,
      errors: [
        { messageId: 'sole', data: { name: 'K' } },
        { messageId: 'sole', data: { name: 'V' } },
      ],
    },
    {
      code: `
        // Same as the previous test, but with an explicit return type.
        function makeMap<K, V>(): Map<K, V> {
          return new Map<K, V>();
        }
      `,
      errors: [
        { messageId: 'sole', data: { name: 'K' } },
        { messageId: 'sole', data: { name: 'V' } },
      ],
    },
  ],
  /*
    fromFixture(stripIndent`

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
