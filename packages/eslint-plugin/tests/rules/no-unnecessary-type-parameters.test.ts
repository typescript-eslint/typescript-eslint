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
  valid: [],

  invalid: [
    {
      code: 'const func = <T,>(param: T) => null;',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
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
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
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
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: `
        declare class C<V> {}
      `,
      errors: [{ messageId: 'sole', data: { name: 'V' } }],
    },
    {
      code: `
        declare class C<T, U> {
          method(param: T): U;
        }
      `,
      errors: [
        { messageId: 'sole', data: { name: 'T' } },
        { messageId: 'sole', data: { name: 'U' } },
      ],
    },
    {
      code: `
        declare class C {
          method<T, U>(param: T): U;
        }
      `,
      errors: [
        { messageId: 'sole', data: { name: 'T' } },
        { messageId: 'sole', data: { name: 'U' } },
      ],
    },
    {
      code: `
        declare class C {
          prop: <P>() => P;
        }
      `,
      errors: [{ messageId: 'sole', data: { name: 'P' } }],
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
          data: { name: 'T' },
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
      code: `
        function parseYAML<T>(input: string): T {
          return input as any as T;
        }
      `,
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
        function getLength<T extends { length: number }>(x: T) {
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
    {
      code: 'declare function get<T>(param: <U, V>(param: U) => V): T;',
      errors: [
        { messageId: 'sole', data: { name: 'T' } },
        { messageId: 'sole', data: { name: 'U' } },
        { messageId: 'sole', data: { name: 'V' } },
      ],
    },
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
      code: 'type Fn = <T>() => [];',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: `
        type Other = 0;
        type Fn = <T>() => Other;
      `,
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: `
        type Other = 0 | 1;
        type Fn = <T>() => Other;
      `,
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: 'type Fn = <U>(param: U) => void;',
      errors: [{ messageId: 'sole', data: { name: 'U' } }],
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
      code: "type Fn = <T>() => { [K in 'a']: T };",
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: 'type Fn = <T>(value: unknown) => value is T;',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: 'type Fn = <T extends string>() => `a${T}b`;',
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: `
        function getLength<T>(array: Array<T>) {
          return array.length;
        }
      `,
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: `
        function getLength<T>(array: ReadonlyArray<T>) {
          return array.length;
        }
      `,
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: `
        function getLength<T>(array: T[]) {
          return array.length;
        }
      `,
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
    {
      code: `
        function getLength<T>(array: readonly T[]) {
          return array.length;
        }
      `,
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
  ],
});
