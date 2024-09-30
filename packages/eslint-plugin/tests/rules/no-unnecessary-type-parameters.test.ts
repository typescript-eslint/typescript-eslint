import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unnecessary-type-parameters';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: rootPath,
      project: './tsconfig.json',
    },
  },
});

ruleTester.run('no-unnecessary-type-parameters', rule, {
  valid: [
    `
      class ClassyArray<T> {
        arr: T[];
      }
    `,
    `
      class ClassyArray<T> {
        value1: T;
        value2: T;
      }
    `,
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
      abstract class ClassyArray<T> {
        arr: T[];
        abstract workWith(value: T): void;
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
      class Joiner<T extends string | number> {
        join(els: T[]) {
          return els.map(el => '' + el).join(',');
        }
      }
    `,
    `
      class Joiner {
        join<T extends string | number>(els: T[]) {
          return els.map(el => '' + el).join(',');
        }
      }
    `,
    `
      declare class Foo {
        getProp<T>(this: Record<'prop', T>): T;
      }
    `,
    'type Fn = <T>(input: T) => T;',
    'type Fn = <T extends string>(input: T) => T;',
    'type Fn = <T extends string>(input: T) => `a${T}b`;',
    'type Fn = new <T>(input: T) => T;',
    'type Fn = <T>(input: T) => typeof input;',
    'type Fn = <T>(input: T) => keyof typeof input;',
    'type Fn = <T>(input: Partial<T>) => typeof input;',
    'type Fn = <T>(input: Partial<T>) => input is T;',
    'type Fn = <T>(input: T) => { [K in keyof T]: K };',
    'type Fn = <T>(input: T) => { [K in keyof T as K]: string };',
    'type Fn = <T>(input: T) => { [K in keyof T as `${K & string}`]: string };',
    'type Fn = <T>(input: T) => Partial<T>;',
    'type Fn = <T>(input: { [i: number]: T }) => T;',
    'type Fn = <T>(input: { [i: number]: T }) => Partial<T>;',
    'type Fn = <T>(input: { [i: string]: T }) => Partial<T>;',
    'type Fn = <T>(input: T) => { [i: number]: T };',
    'type Fn = <T>(input: T) => { [i: string]: T };',
    "type Fn = <T extends unknown[]>(input: T) => Omit<T, 'length'>;",
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
      function makeMap<K, V>() {
        return new Map<K, V>();
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
      function lengthyIdentity<T extends { length: number }>(x: T) {
        return x;
      }
    `,
    `
      interface Lengthy {
        length: number;
      }
      function lengthyIdentity<T extends Lengthy>(x: T) {
        return x;
      }
    `,
    `
      function ItemComponent<T>(props: { item: T; onSelect: (item: T) => void }) {}
    `,
    `
      interface ItemProps<T> {
        item: readonly T;
        onSelect: (item: T) => void;
      }
      function ItemComponent<T>(props: ItemProps<T>) {}
    `,
    `
      function useFocus<T extends HTMLOrSVGElement>(): [
        React.RefObject<T>,
        () => void,
      ];
    `,
    `
      function findFirstResult<U>(
        inputs: unknown[],
        getResult: (t: unknown) => U | undefined,
      ): U | undefined;
    `,
    `
      function findFirstResult<T, U>(
        inputs: T[],
        getResult: (t: T) => () => [U | undefined],
      ): () => [U | undefined];
    `,
    `
      function getData<T>(url: string): Promise<T | null> {
        return Promise.resolve(null);
      }
    `,
    `
      function getData<T>(url: string): Promise<T extends null ? T : null> {
        return Promise.resolve(null);
      }
    `,
    `
      function getData<T extends string>(url: string): Promise<\`a\${T}b\`> {
        return Promise.resolve(null);
      }
    `,
    `
      async function getData<T>(url: string): Promise<T | null> {
        return null;
      }
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
    'declare function fetchJson<T>(url: string): Promise<T>;',
    'declare function fn<T>(input: T): 0 extends 0 ? T : never;',
    'declare function useFocus<T extends HTMLOrSVGElement>(): [React.RefObject<T>];',
    `
      declare function useFocus<T extends HTMLOrSVGElement>(): {
        ref: React.RefObject<T>;
      };
    `,
    `
      interface TwoMethods<T> {
        a(x: T): void;
        b(x: T): void;
      }

      declare function two<T>(props: TwoMethods<T>): void;
    `,
    `
      type Obj = { a: string };

      declare function hasOwnProperty<K extends keyof Obj>(
        obj: Obj,
        key: K,
      ): obj is Obj & { [key in K]-?: Obj[key] };
    `,
    `
      type AsMutable<T extends readonly unknown[]> = {
        -readonly [Key in keyof T]: T[Key];
      };

      declare function makeMutable<T>(input: T): MakeMutable<T>;
    `,
    `
      type AsMutable<T extends readonly unknown[]> = {
        -readonly [Key in keyof T]: T[Key];
      };

      declare function makeMutable<T>(input: T): MakeMutable<typeof input>;
    `,
    `
      type ValueNulls<U extends string> = {} & {
        [P in U]: null;
      };

      declare function invert<T extends string>(obj: T): ValueNulls<T>;
    `,
    `
      interface Middle {
        inner: boolean;
      }

      type Conditional<T extends Middle> = {} & (T['inner'] extends true ? {} : {});

      function withMiddle<T extends Middle = Middle>(options: T): Conditional<T> {
        return options;
      }
    `,
    `
      import * as ts from 'typescript';

      declare function forEachReturnStatement<T>(
        body: ts.Block,
        visitor: (stmt: ts.ReturnStatement) => T,
      ): T | undefined;
    `,
    `
      import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';

      declare const isNodeOfType: <NodeType extends AST_NODE_TYPES>(
        nodeType: NodeType,
      ) => node is Extract<TSESTree.Node, { type: NodeType }>;
    `,
    `
      import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';

      const isNodeOfType =
        <NodeType extends AST_NODE_TYPES>(nodeType: NodeType) =>
        (
          node: TSESTree.Node | null,
        ): node is Extract<TSESTree.Node, { type: NodeType }> =>
          node?.type === nodeType;
    `,
    `
      import type { AST_TOKEN_TYPES, TSESTree } from '@typescript-eslint/types';

      export const isNotTokenOfTypeWithConditions =
        <
          TokenType extends AST_TOKEN_TYPES,
          ExtractedToken extends Extract<TSESTree.Token, { type: TokenType }>,
          Conditions extends Partial<ExtractedToken>,
        >(
          tokenType: TokenType,
          conditions: Conditions,
        ): ((
          token: TSESTree.Token | null | undefined,
        ) => token is Exclude<TSESTree.Token, Conditions & ExtractedToken>) =>
        (token): token is Exclude<TSESTree.Token, Conditions & ExtractedToken> =>
          tokenType in conditions;
    `,
    `
      type Foo<T, S> = S extends 'somebody'
        ? T extends 'once'
          ? 'told'
          : 'me'
        : never;

      declare function foo<T>(data: T): <S>(other: S) => Foo<T, S>;
    `,
    `
      type Foo<T, S> = S extends 'somebody'
        ? T extends 'once'
          ? 'told'
          : 'me'
        : never;

      declare function foo<T>(data: T): <S>(other: S) => Foo<S, T>;
    `,
    `
      declare function mapObj<K extends string, V>(
        obj: { [key in K]?: V },
        fn: (key: K, val: V) => number,
      ): number[];
    `,
    `
      declare function mappedReturnType<T extends string>(
        x: T,
      ): { [K in T]: Capitalize<K> };

      function inferredMappedReturnType<T extends string>(x: T) {
        return mappedReturnType(x);
      }
    `,
    `
      declare function mappedReturnType<T extends string>(
        x: T,
      ): { [K in T]: Capitalize<K> };

      function inferredMappedReturnType<T extends string>(x: T) {
        return () => mappedReturnType(x);
      }
    `,
    `
      declare function mappedReturnType<T extends string>(
        x: T,
      ): { [K in T]: Capitalize<K> };

      function inferredMappedReturnType<T extends string>(x: T) {
        return [{ value: () => mappedReturnType(x) }];
      }
    `,
    `
type Identity<T> = T;

type Mapped<T, Value> = Identity<{ [P in keyof T]: Value }>;

declare function sillyFoo<Data, Value>(
  c: Value,
): (data: Data) => Mapped<Data, Value>;
    `,
    `
type Silly<T> = { [P in keyof T]: T[P] };

type SillyFoo<T, Value> = Silly<{ [P in keyof T]: Value }>;

type Foo<T, Value> = { [P in keyof T]: Value };

declare function foo<T, Constant>(data: T, c: Constant): Foo<T, Constant>;
declare function foo<T, Constant>(c: Constant): (data: T) => Foo<T, Constant>;

declare function sillyFoo<T, Constant>(
  data: T,
  c: Constant,
): SillyFoo<T, Constant>;
declare function sillyFoo<T, Constant>(
  c: Constant,
): (data: T) => SillyFoo<T, Constant>;
    `,
    `
const f = <T,>(setValue: (v: T) => void, getValue: () => NoInfer<T>) => {};
    `,
    `
const f = <T,>(
  setValue: (v: T) => NoInfer<T>,
  getValue: (v: NoInfer<T>) => NoInfer<T>,
) => {};
    `,
  ],

  invalid: [
    {
      code: 'const func = <T,>(param: T) => null;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'const f1 = <T,>(): T => {};',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: `
        interface I {
          <T>(value: T): void;
        }
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
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
          join(el: T, other: string) {
            return [el, other].join(',');
          }
        }
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'class', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: `
        declare class C<V> {}
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'class', name: 'V', uses: 'never used' },
        },
      ],
    },
    {
      code: `
        declare class C<T, U> {
          method(param: T): U;
        }
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'class', name: 'T', uses: 'used only once' },
        },
        {
          messageId: 'sole',
          data: { descriptor: 'class', name: 'U', uses: 'used only once' },
        },
      ],
    },
    {
      code: `
        declare class C {
          method<T, U>(param: T): U;
        }
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'U', uses: 'used only once' },
        },
      ],
    },
    {
      code: `
        declare class C {
          prop: <P>() => P;
        }
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'P', uses: 'used only once' },
        },
      ],
    },
    {
      code: `
        declare class Foo {
          foo<T>(this: T): void;
        }
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
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
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'A', uses: 'used only once' },
        },
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'B', uses: 'used only once' },
        },
      ],
    },
    {
      code: `
        function foo<T>(_: T) {
          const x: T = null!;
          const y: T = null!;
        }
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: `
        function foo<T>(_: T): void {
          const x: T = null!;
          const y: T = null!;
        }
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: `
        function foo<T>(_: T): <T>(input: T) => T {
          const x: T = null!;
          const y: T = null!;
        }
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: `
        function foo<T>(_: T) {
          function withX(): T {
            return null!;
          }
          function withY(): T {
            return null!;
          }
        }
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: `
        function parseYAML<T>(input: string): T {
          return input as any as T;
        }
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: `
        function printProperty<T, K extends keyof T>(obj: T, key: K) {
          console.log(obj[key]);
        }
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'K', uses: 'used only once' },
        },
      ],
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
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
          messageId: 'sole',
        },
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
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'CB1', uses: 'used only once' },
        },
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'CB2', uses: 'used only once' },
        },
      ],
    },
    {
      code: `
        function getLength<T extends { length: number }>(x: T) {
          return x.length;
        }
      `,
      errors: [
        {
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
          messageId: 'sole',
        },
      ],
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
      errors: [
        {
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
          messageId: 'sole',
        },
      ],
    },
    {
      code: 'declare function get<T>(): unknown;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'never used' },
        },
      ],
    },
    {
      code: 'declare function get<T>(): T;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'declare function get<T extends object>(): T;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'declare function take<T>(param: T): void;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'declare function take<T extends object>(param: T): void;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'declare function take<T, U = T>(param1: T, param2: U): void;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'U', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'declare function take<T, U extends T>(param: T): U;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'U', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'declare function take<T, U extends T>(param: U): U;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'declare function get<T, U = T>(param: U): U;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'declare function get<T, U extends T = T>(param: T): U;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'U', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'declare function compare<T, U extends T>(param1: T, param2: U): boolean;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'U', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'declare function get<T>(param: <U, V>(param: U) => V): T;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'U', uses: 'used only once' },
        },
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'V', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'declare function get<T>(param: <T, U>(param: T) => U): T;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'U', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'type Fn = <T>() => T;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'type Fn = <T>() => [];',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'never used' },
        },
      ],
    },
    {
      code: `
        type Other = 0;
        type Fn = <T>() => Other;
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'never used' },
        },
      ],
    },
    {
      code: `
        type Other = 0 | 1;
        type Fn = <T>() => Other;
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'never used' },
        },
      ],
    },
    {
      code: 'type Fn = <U>(param: U) => void;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'U', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'type Ctr = new <T>() => T;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'type Fn = <T>() => { [K in keyof T]: K };',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: "type Fn = <T>() => { [K in 'a']: T };",
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'type Fn = <T>(value: unknown) => value is T;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: 'type Fn = <T extends string>() => `a${T}b`;',
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T', uses: 'used only once' },
        },
      ],
    },
    {
      code: `
        declare function mapObj<K extends string, V>(
          obj: { [key in K]?: V },
          fn: (key: K) => number,
        ): number[];
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'V', uses: 'used only once' },
        },
      ],
    },
    {
      // This isn't actually an important test case.
      // However, we use it as an example in the docs of code that is flagged,
      // but shouldn't necessarily be. So, if you make a change to the rule logic
      // that resolves this sort-of-false-positive, please update the docs
      // accordingly.
      // Original discussion in https://github.com/typescript-eslint/typescript-eslint/issues/9709
      code: noFormat`
type Compute<A> = A extends Function ? A : { [K in keyof A]: Compute<A[K]> };
type Equal<X, Y> =
  (<T1>() => T1 extends Compute<X> ? 1 : 2) extends
    (<T2>() => T2 extends Compute<Y> ? 1 : 2)
  ? true
  : false;
      `,
      errors: [
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T1', uses: 'used only once' },
        },
        {
          messageId: 'sole',
          data: { descriptor: 'function', name: 'T2', uses: 'used only once' },
        },
      ],
    },
  ],
});
