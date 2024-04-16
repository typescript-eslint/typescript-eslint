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
    `
      class ClassyArray<T> {
        arr: T[];
        constructor(arr: T[]) {
          this.arr = arr;
        }
      }
    `,
    `
      class ClassyArray<T> {
        arr: T[];
        workWith(value: T) {
          this.arr.indexOf(value);
        }
      }
    `,
    `
      class Box<T> {
        val: T | null = null;
        get() {
          return this.val;
        }
      }
    `,
    `
      interface I {
        <T>(value: T): T;
      }
    `,
    `
      interface I {
        new <T>(value: T): T;
      }
    `,
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
      function getProperty<T, K extends keyof T>(obj: T, key: K) {
        return obj[key];
      }
    `,
    `
      function box<T>(val: T) {
        return { val };
      }
    `,
    `
      function doStuff<K, V>(map: Map<K, V>, key: K) {
        let v = map.get(key);
        v = 1;
        map.set(key, v);
        return v;
      }
    `,
    `
      function makeMap<K, V>(ks: K[], vs: V[]) {
        const r = new Map<K, V>();
        ks.forEach((k, i) => {
          r.set(k, vs[i]);
        });
        return r;
      }
    `,
    `
      function arrayOfPairs<T>() {
        return [] as [T, T][];
      }
    `,
    `
      function isNonNull<T>(v: T): v is Exclude<T, null> {
        return v !== null;
      }
    `,
    `
      function both<Args extends unknown[]>(
        fn1: (...args: Args) => void,
        fn2: (...args: Args) => void,
      ): (...args: Args) => void {
        return function (...args: Args) {
          fn1(...args);
          fn2(...args);
        };
      }
    `,
    `
      function getLength<T extends { lenght: number }>(x: T) {
        return x;
      }
    `,
    `
      interface Lengthy {
        length: number;
      }
      function getLength<T extends Lengthy>(x: T) {
        return x;
      }
    `,
    `
      function ListComponent<T>(props: { items: T[]; onSelect: (item: T) => void }) {}
    `,
    `
      interface ItemProps<T> {
        items: readonly T[];
        onSelect: (item: T) => void;
      }
      function ListComponent<T>(props: ItemProps<T>) {}
    `,
    `
      function useFocus<T extends HTMLOrSVGElement>(): [
        React.RefObject<T>,
        () => void,
      ];
    `,
    'declare function get(): void;',
    'declare function get<T>(param: T[]): T;',
    'declare function box<T>(val: T): { val: T };',
    'declare function identity<T>(param: T): T;',
    'declare function compare<T>(param1: T, param2: T): boolean;',
    'declare function example<T>(a: Set<T>): T;',
    'declare function example<T>(a: Set<T>, b: T[]): void;',
    'declare function example<T>(a: Map<T, T>): void;',
    'declare function example<T, U extends T>(t: T, u: U): U;',
    'declare function makeSet<K>(): Set<K>;',
    'declare function makeSet<K>(): [Set<K>];',
    'declare function makeSets<K>(): Set<K>[];',
    'declare function makeSets<K>(): [Set<K>][];',
    'declare function makeMap<K, V>(): Map<K, V>;',
    'declare function makeMap<K, V>(): [Map<K, V>];',
    'declare function arrayOfPairs<T>(): [T, T][];',
    'declare function useFocus<T extends HTMLOrSVGElement>(): [React.RefObject<T>];',
    `
declare function useFocus<T extends HTMLOrSVGElement>(): {
  ref: React.RefObject<T>;
};
    `,

    'type Fn = <T>(value: T) => T;',
    'type Fn = new <T>(value: T) => T;',
    'type Fn = <T>(value: Partial<T>) => value is T;',
    'type Fn = <T>(value: T) => { [K in keyof T]: K };',
  ],

  invalid: [
    {
      code: 'const func = <T,>(param: T) => null;',
      errors: [{ messageId: 'sole' }],
    },
    {
      code: 'const f1 = <T,>(): T => {};',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
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

    {
      code: `
        class Joiner<T extends string | number> {
          join(els: T[]) {
            return els.map(el => '' + el).join(',');
          }
        }
      `,
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
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
        declare class C<V> {
          method<T, U>(param: T): U;
          prop: <P>() => P;
        }
      `,
      errors: [
        { messageId: 'sole', data: { name: 'T' } },
        { messageId: 'sole', data: { name: 'U' } },
        { messageId: 'sole', data: { name: 'P' } },
      ],
    },
    {
      code: `
        declare class Foo {
          prop: string;
          getProp<T>(this: Record<'prop', T>): T;
          compare<T>(this: Record<'prop', T>, other: Record<'prop', T>): number;
          foo<T>(this: T): void;
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
      code: 'function parseYAML<T>(input: string): T {}',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
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
        function both<
          Args extends unknown[],
          CB1 extends (...args: Args) => void,
          CB2 extends (...args: Args) => void,
        >(fn1: CB1, fn2: CB2): (...args: Args) => void {
          return function (...args: Args) {
            fn1(...args);
            fn2(...args);
          };
        }
      `,
      errors: [
        { messageId: 'sole', data: { name: 'CB1' } },
        { messageId: 'sole', data: { name: 'CB2' } },
      ],
    },
    {
      code: `
        interface Lengthy {
          length: number;
        }
        function getLength<T extends { lenght: number }>(x: T) {
          return x.length;
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
    {
      code: 'declare function get<T>(): T;',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: 'declare function get<T extends object>(): T;',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: 'declare function take<T>(param: T): void;',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: 'declare function take<T extends object>(param: T): void;',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: 'declare function take<T, U = T>(param1: T, param2: U): void;',
      errors: [{ messageId: 'sole', data: { name: 'U' } }],
    },
    {
      code: 'declare function take<T, U extends T>(param: T): U;',
      errors: [{ messageId: 'sole', data: { name: 'U' } }],
    },
    {
      code: 'declare function take<T, U extends T>(param: U): U;',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: 'declare function get<T, U = T>(param: U): U;',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: 'declare function get<T, U extends T = T>(param: T): U;',
      errors: [{ messageId: 'sole', data: { name: 'U' } }],
    },
    {
      code: 'declare function compare<T, U extends T>(param1: T, param2: U): boolean;',
      errors: [{ messageId: 'sole', data: { name: 'U' } }],
    },
    // {
    //   code: 'declare function get<T extends string, U>(param: Record<T, U>): boolean;',
    //   errors: [
    //     { messageId: 'sole', data: { name: 'T' } },
    //     { messageId: 'sole', data: { name: 'U' } },
    //   ],
    // },
    {
      code: 'declare function get<T>(param: <T, U>(param: T) => U): T;',
      errors: [
        { messageId: 'sole', data: { name: 'T' } },
        { messageId: 'sole', data: { name: 'T' } },
        { messageId: 'sole', data: { name: 'U' } },
      ],
    },
    {
      code: 'type Fn = <T>() => T;',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: 'type Ctr = new <T>() => T;',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: 'type Fn = <T>() => { [K in keyof T]: K };',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: 'type Fn = <T>(value: unknown) => value is T;',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
  ],
});
