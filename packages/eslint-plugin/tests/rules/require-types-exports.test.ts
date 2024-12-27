import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/require-types-exports';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig-with-dom.json',
      tsconfigRootDir: rootPath,
    },
  },
});

ruleTester.run('require-types-exports', rule, {
  valid: [
    'export function f(): void {}',
    'export const f = (): void => {};',

    'export function f(a: number): void {}',
    'export const f = (a: number): void => {};',

    'export function f(a: any): void {}',
    'export const f = (a: any): void => {};',

    'export function f(a: null): void {}',
    'export const f = (a: null): void => {};',

    'export function f(a: string | number): void {}',
    'export const f = (a: string | number): void => {};',

    'export function f(a?: string | number): void {}',
    'export const f = (a?: string | number): void => {};',

    'export function f(a: number): string {}',
    'export const f = (a: number): string => {};',

    'export function f(...args: any[]): void {}',
    'export const f = (...args: any[]): void => {};',

    'export function f(...args: unknown[]): void {}',
    'export const f = (...args: unknown[]): void => {};',

    'export default function f(): void {}',
    'export default (): void => {};',

    `
      type A = number;
      function f(a: A): A {
        return a;
      }
    `,
    `
      type A = number;
      const f = (a: A): A => a;
    `,
    `
      type A = number;
      type B = string;
      function f(a: A | B): any {
        return a;
      }
    `,
    `
      type A = number;
      type B = string;
      const f = (a: A | B): any => a;
    `,
    `
      type A = number;
      declare function f(a: A): void;
    `,
    `
      type A = number;
      function f({ a }: { a: A }): A {}
    `,
    `
      type A = number;
      const f = ({ a }: { a: A }): A => {};
    `,
    `
      type A = number;
      type B = string;
      function f([a, b]: [A, B]): void {}
    `,
    `
      type A = number;
      type B = string;
      const f = ([a, b]: [A, B]): void => {};
    `,
    `
      type A = number;
      function f<T extends A>(a: A): void {}
    `,
    `
      type A = number;
      const f = <T extends A>(a: A): void => {};
    `,
    `
      interface A {
        a: number;
      }

      function f(a: A): A {
        return a;
      }
    `,
    `
      interface A {
        a: number;
      }

      const f = (a: A): A => a;
    `,
    `
      export type A = number;
      export function f(a: A): void {}
    `,
    `
      export type A = number;
      export const f = (a: A): void => {};
    `,
    `
      export type A = number;
      export type B = string;
      export function f(a: A | B): void {}
    `,
    `
      export type A = number;
      export type B = string;
      export const f = (a: A | B): void => {};
    `,
    `
      export type A = number;
      export type B = string;
      export function f(a: A & B): void {}
    `,
    `
      export type A = number;
      export type B = string;
      export const f = (a: A & B): void => {};
    `,
    `
      export type A = number;
      export function f(...args: A[]): void {}
    `,
    `
      export type A = number;
      export const f = (...args: A[]): void => {};
    `,
    `
      export type A = number;
      export type B = string;
      export function f(args: { a: A; b: B; c: number }): void {}
    `,
    `
      export type A = number;
      export type B = string;
      export const f = (args: { a: A; b: B; c: number }): void => {};
    `,
    `
      export type A = number;
      export type B = string;
      export function f(args: [A, B]): void {}
    `,
    `
      export type A = number;
      export type B = string;
      export const f = (args: [A, B]): void => {};
    `,
    `
      export type A = number;
      export function f(a: A = 1): void {}
    `,
    `
      export type A = number;
      export const f = (a: A = 1): void => {};
    `,
    `
      export type A = number;
      export function f(): A {}
    `,
    `
      export type A = number;
      export const f = (): A => {};
    `,
    `
      export type A = number;
      export type B = string;
      export function f(): A | B {}
    `,
    `
      export type A = number;
      export type B = string;
      export const f = (): A | B => {};
    `,
    `
      export type A = number;
      export type B = string;
      export function f(): A & B {}
    `,
    `
      export type A = number;
      export type B = string;
      export const f = (): A & B => {};
    `,
    `
      export type A = number;
      export type B = string;
      export function f(): [A, B] {}
    `,
    `
      export type A = number;
      export type B = string;
      export const f = (): [A, B] => {};
    `,
    `
      export type A = number;
      export type B = string;
      export function f(): { a: A; b: B } {}
    `,
    `
      export type A = number;
      export type B = string;
      export const f = (): { a: A; b: B } => {};
    `,
    `
      import { testFunction, type Arg } from './module';

      export function f(a: Arg): void {}
    `,
    `
      import { Arg } from './types';

      export function f(a: Arg): void {}
    `,
    `
      import type { Arg } from './types';

      export function f(a: Arg): void {}
    `,
    `
      import type { ImportedArg as Arg } from './types';

      export function f(a: Arg): void {}
    `,
    `
      import type { Arg } from './types';

      export function f<T extends Arg>(a: T): void {}
    `,
    `
      export type R = number;

      export function f() {
        const value: { num: R } = {
          num: 1,
        };

        return value;
      }
    `,
    `
      import type { A } from './types';

      export type T1 = number;

      export interface T2 {
        key: number;
      }

      export const value: { a: { b: { c: T1 } } } | [string, T2 | A] = {
        a: {
          b: {
            c: 1,
          },
        },
      };
    `,
    `
      import type { A } from './types';

      export type T1 = number;

      export interface T2 {
        key: number;
      }

      const value: { a: { b: { c: T1 } } } | [string, T2 | A] = {
        a: {
          b: {
            c: 1,
          },
        },
      };

      export default value;
    `,
    `
      export enum Fruit {
        Apple,
        Banana,
        Cherry,
      }

      export function f(a: Fruit): void {}
    `,
    `
      export function f(arg: Record<PropertyKey, Promise<string>>) {
        return arg;
      }
    `,
    `
      export function f<T extends Record<PropertyKey, Promise<string>>>(arg: T) {
        return arg;
      }
    `,
    `
      export function f<T extends ReturnType<() => string>>(arg: T) {
        return arg;
      }
    `,
    `
      export class Wrapper {
        work(other: this) {}
      }
    `,
    `
      export namespace A {
        export namespace B {
          export type C = number;
        }
      }

      export function a(arg: A.B.C) {
        return arg;
      }
    `,
    `
      import * as ts from 'typescript';

      export function a(arg: ts.Type) {
        return arg;
      }
    `,
    `
      import ts from 'typescript';

      export function a(arg: ts.Type) {
        return arg;
      }
    `,
    `
      declare const element: HTMLElement;

      export default element;
    `,
    `
      export const date: Date = new Date();
    `,
    `
      import ts from 'typescript';

      export enum Fruit {
        Apple,
        Banana,
        Cherry,
      }

      declare const apple: Fruit.Apple;

      export type A = number;
      export type B = string;
      export type C = boolean;

      export interface D {
        key: string;
      }

      function func<T extends Record<string, [A, B] | { key: C & D }>>(
        arg: T,
      ): T | ts.Type {
        return arg;
      }

      export const value = {
        apple,
        func,
      };
    `,
    `
      export function func1() {
        return func2(1);
      }

      export type A = number;

      export function func2(arg: A) {
        return 1;
      }
    `,
    'export type ValueOf<T> = T[keyof T];',

    `
      const fruits = { apple: 'apple' };
      export type Fruits = typeof fruits;

      export function getFruit<Key extends keyof Fruits>(key: Key): Fruits[Key] {
        return fruits[key];
      }
    `,
    `
      const fruits = { apple: 'apple' };

      export function doWork(): number {
        const fruit: keyof typeof fruits = 'apple';

        return 1;
      }
    `,
    `
declare function wrap(listeners: unknown): unknown;

type Abc = 'abc';

export default wrap({
  abc(input: Abc) {
    //
  },
});
    `,
    'export function example(config: string): typeof config {}',
    'export function example(config: string): typeof config.length {}',
    "export function example(config: string): (typeof config)['length'] {}",
    "export function example(config: string): typeof import('config') {}",
    'export function example(config: ExternalGlobal) {}',
    'export function example(config: typeof ExternalGlobal) {}',
    'export function example(config: typeof ExternalGlobal.length) {}',
    "export function example(config: (typeof ExternalGlobal)['length']) {}",
    `
export namespace Values {
  export type Fruit = 'apple';

  export function logFruit(fruit: Fruit) {
    console.log(fruit);
  }
}
    `,
    `
declare module '@babel/eslint-parser' {
  export interface Options {}
  export function parse(options: Options): void;
}
    `,
    `
export const pairs = { KEY: 'value' } as const;

export function emitDeprecationWarning(akey: keyof typeof pairs) {
  console.log(key);
}
    `,
  ],
  invalid: [
    {
      code: `
        type Arg = number;

        export function f(a: Arg): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        export const f = (a: Arg): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        export default function (a: Arg): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        export default (a: Arg): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        export function f(a: Arg, b: Arg): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        export const f = (a: Arg, b: Arg): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export function f(a: Arg1, b: Arg2): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export const f = (a: Arg1, b: Arg2): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;

        interface Arg2 {
          a: string;
        }

        export function f(a: Arg1, b: Arg2): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 19,
          data: {
            name: 'Arg2',
          },
          endColumn: 23,
          line: 4,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;

        interface Arg2 {
          a: string;
        }

        export const f = (a: Arg1, b: Arg2): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 19,
          data: {
            name: 'Arg2',
          },
          endColumn: 23,
          line: 4,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export function f(a: Arg1 | Arg2): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export const f = (a: Arg1 | Arg2): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export function f(a: Arg1 & Arg2): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export const f = (a: Arg1 & Arg2): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export function f([a, b]: [Arg1, Arg2, number]): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;
        type Arg3 = boolean;

        export function f([a, b]: [Arg1, Arg2, number], c: Arg3): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg3',
          },
          endColumn: 18,
          line: 4,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export const f = ([a, b]: [Arg1, Arg2, number]): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export function f({ a, b }: { a: Arg1; b: Arg2; c: number }): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export const f = ({ a, b }: { a: Arg1; b: Arg2; c: number }): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        export function f(...args: Arg[]): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        export const f = (...args: Arg[]): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        export function f(a: Arg = 1): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        export const f = (a: Arg = 1): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
          Banana,
          Cherry,
        }

        export function f(a: Fruit): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Fruit',
          },
          endColumn: 19,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
          Banana,
          Cherry,
        }

        export const f = (a: Fruit): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Fruit',
          },
          endColumn: 19,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        export function f<T extends Arg>(a: T): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export function f<T extends Arg1 | Arg2>(a: T): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export function f<T extends Arg1 | Arg2 | number>(a: T): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export function f<T extends Arg1 & Arg2>(a: T): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export const f = <T extends Arg1 & Arg2 & string>(a: T): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = string;

        export function f<T extends [Arg, number]>(a: T): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = string;

        export function f<T extends { a: Arg; b: number; c: Arg }>(a: T): void {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret = string;

        export function f(): Ret {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret = string;

        export const f = (): Ret => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret1 = string;
        type Ret2 = number;

        export function f(): Ret1 | Ret2 {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Ret2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret1 = string;
        type Ret2 = number;

        export const f = (): Ret1 | Ret2 => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Ret2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret1 = string;
        type Ret2 = number;

        export function f(): Ret1 & Ret2 {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Ret2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret1 = string;
        type Ret2 = number;

        export const f = (): Ret1 & Ret2 => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Ret2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret1 = string;
        type Ret2 = number;

        export function f(): [Ret1, Ret2, number, Ret1] {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Ret2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret1 = string;
        type Ret2 = number;

        export const f = (): [Ret1, Ret2, number, Ret1] => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Ret2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret1 = string;
        type Ret2 = number;

        export function f(): { a: Ret1; b: Ret2; c: number; d: Ret1 } {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Ret2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret1 = string;
        type Ret2 = number;

        export const f = (): { a: Ret1; b: Ret2; c: number; d: Ret1 } => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Ret2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret = string;

        export function f<T extends Ret>(): T {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret1 = string;
        type Ret2 = number;

        export function f<T extends Ret1 | Ret2>(): T {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Ret2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret1 = string;
        type Ret2 = number;

        export function f<T extends Ret1 | Ret2 | number>(): T {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Ret2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret1 = string;
        type Ret2 = number;

        export function f<T extends Ret1 & Ret2>(): T {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Ret2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret1 = string;
        type Ret2 = number;

        export function f<T extends Ret1 & Ret2 & number>(): T {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Ret2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Ret = string;

        export function f<T extends [Ret, number]>(): T {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Ret',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        const a = (a: Arg): void => {};

        export default a;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        const a = function (a: Arg): void {};

        export default a;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        export declare function f(a: Arg): void;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg = number;

        export declare function f(a: Arg): Arg;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg',
          },
          endColumn: 17,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type R = number;

        export function f() {
          const value: { num: R } = {
            num: 1,
          };

          return value;
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'R',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = boolean;
        type Ret = string;

        export declare function f<T extends Arg2>(
          a: { b: { c: Arg1 | number | { d: T } } },
          e: Arg1,
        ): { a: { b: T | Ret } };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Ret',
          },
          endColumn: 17,
          line: 4,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export declare function f(a: Arg1): true;
        export declare function f(a: Arg2): false;
        export declare function f(a: Arg1 | Arg2): boolean;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Arg1 = number;
        type Arg2 = string;

        export const f1 = (a: Arg1): void => {},
          f2 = (a: Arg2): void => {};
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Arg1',
          },
          endColumn: 18,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Arg2',
          },
          endColumn: 18,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        namespace A {
          export namespace B {
            export type C = number;
          }
        }

        export function a(arg: A.B.C) {
          return arg;
        }
      `,
      errors: [
        {
          column: 19,
          data: {
            name: 'A',
          },
          endColumn: 20,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        namespace A {
          export type B = number;
        }

        type B = string;

        export function a(arg: B) {
          return arg;
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 6,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        namespace A {
          export interface B {
            value: number;
          }
        }

        type B = string;

        export function a(arg: B) {
          return arg;
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 8,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        namespace A {
          export enum B {
            Value1,
            Value2,
          }
        }

        type B = string;

        export function a(arg: B) {
          return arg;
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 9,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        namespace A {
          export namespace B {
            export type C = number;
          }
        }

        type B = string;

        export function a(arg: B) {
          return arg;
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 8,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        import type { A } from './types';

        type T1 = number;

        interface T2 {
          key: number;
        }

        export const value: { a: { b: { c: T1 } } } | [string, T2 | A] = {
          a: {
            b: {
              c: 1,
            },
          },
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'T1',
          },
          endColumn: 16,
          line: 4,
          messageId: 'requireTypeExport',
        },
        {
          column: 19,
          data: {
            name: 'T2',
          },
          endColumn: 21,
          line: 6,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        import type { A } from './types';

        type T1 = number;

        interface T2 {
          key: number;
        }

        const value: { a: { b: { c: T1 } } } | [string, T2 | A] = {
          a: {
            b: {
              c: 1,
            },
          },
        };

        export default value;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'T1',
          },
          endColumn: 16,
          line: 4,
          messageId: 'requireTypeExport',
        },
        {
          column: 19,
          data: {
            name: 'T2',
          },
          endColumn: 21,
          line: 6,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type T1 = number;

        interface T2 {
          key: number;
        }

        type T3 = boolean;

        export const value:
          | {
              a: T1;
              b: {
                c: T2;
              };
            }
          | T3[] = {
          a: 1,
          b: {
            c: {
              key: 1,
            },
          },
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'T1',
          },
          endColumn: 16,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 19,
          data: {
            name: 'T2',
          },
          endColumn: 21,
          line: 4,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'T3',
          },
          endColumn: 16,
          line: 8,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = string;
        type B = string;

        const apple: A = 'apple';
        const banana: B = 'banana';

        export const value = {
          path: {
            to: {
              apple,
              and: {
                banana,
              },
            },
          },
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = string;
        type B = string;

        const apple: A = 'apple';
        const banana: B = 'banana';

        const value = {
          path: {
            to: {
              apple,
              and: {
                banana,
              },
            },
          },
        };

        export default value;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = string;
        type B = string;

        const apple: A = 'apple';
        const banana: B = 'banana';

        const value = {
          spreadObject: { ...{ apple } },
          spreadArray: [...[banana]],
        };

        export default value;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Fruit = 'apple' | 'banana';

        const apple: Fruit = 'apple';
        const banana: Fruit = 'banana';

        export const value = {
          path: {
            to: [apple, banana],
          },
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Fruit',
          },
          endColumn: 19,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Fruit = 'apple' | 'banana';

        const apple: Fruit = 'apple';
        const banana: Fruit = 'banana';

        export const value = {
          path: {
            to: [apple, banana] as const,
          },
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Fruit',
          },
          endColumn: 19,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Fruit = 'apple' | 'banana';

        const apple: Fruit = 'apple';
        const banana: Fruit = 'banana';

        export const value = {
          path: {
            to: [apple, banana] as any,
          },
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Fruit',
          },
          endColumn: 19,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Fruit = 'apple' | 'banana';

        const apple = 'apple';
        const banana = 'banana';

        export const value = {
          path: {
            to: [apple, banana] as [Fruit, Fruit],
          },
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Fruit',
          },
          endColumn: 19,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Fruit = 'apple' | 'banana';

        const apple = 'apple';
        const banana = 'banana';

        export const value = {
          path: {
            to: [apple, banana] as Fruit | number,
          },
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Fruit',
          },
          endColumn: 19,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;
        type B = string;
        type C = boolean;
        type D = symbol;

        declare const a: [A, B] | ([Array<C>, Set<D>] & Exclude<A, B>);

        export const value = { a };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 3,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'C',
          },
          endColumn: 15,
          line: 4,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'D',
          },
          endColumn: 15,
          line: 5,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;
        type B = string;

        export const value = {
          func: (arg: A): B => 'apple',
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;
        type B = string;

        export const value = {
          func: function (arg: A): B {
            return 'apple';
          },
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;
        type B = string;

        const func = (arg: A): B => 'apple';

        export const value = {
          func,
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;
        type B = string;

        const func = function (arg: A): B {
          return 'apple';
        };

        export const value = {
          func,
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        const func = <T extends A>(arg: T): T => 'apple';

        export const value = {
          func,
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        const func = function <T extends A>(arg: T): T {
          return 'apple';
        };

        export const value = {
          func,
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        export const value = {
          func: <T extends A>(arg: T): T => 'apple',
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        export const value = {
          func: function <T extends A>(arg: T): T {
            return 'apple';
          },
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        declare function func<T extends A>(arg: T): T;

        export const value = {
          func,
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
          Banana,
          Cherry,
        }

        declare function func<T extends Fruit>(arg: T): T;

        export const value = {
          func,
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Fruit',
          },
          endColumn: 19,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
          Banana,
          Cherry,
        }

        declare const a: Fruit.Apple;

        export const value = {
          a,
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Fruit',
          },
          endColumn: 19,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
          Banana,
          Cherry,
        }

        declare const a: Fruit.Apple;

        export const value = {
          key: () => a,
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Fruit',
          },
          endColumn: 19,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
          Banana,
          Cherry,
        }

        declare const a: Fruit.Apple;

        export const value = {
          key: function () {
            return a;
          },
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Fruit',
          },
          endColumn: 19,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Item = {
          key: string;
          value: number;
        };

        type ItemKey = Item['key'];

        const item: Item = { key: 'apple', value: 1 };

        const map = new Map<ItemKey, Item>([['apple', item]]);

        export const value = {
          map,
        };
      `,
      errors: [
        {
          column: 14,
          data: { name: 'Item' },
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: { name: 'ItemKey' },
          line: 7,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        const item: A = 1;

        export const value = {
          key: (() => item)(),
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        const item: A = 1;

        export const value = {
          key: ((a: A) => a)(item),
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        const item: A = 1;

        export const value = {
          key: (<T extends A>(a: T) => a)(item),
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        const item: A = 1;

        export const value = {
          key: ((a: A) => [a])(item),
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        const item: A = 1;

        export const value = {
          key: ((a: A) => ({ a }))(item),
        };
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        export function func1<R extends A>(arg: R): R {
          return func2<R>(arg);
        }

        declare function func2<T extends A>(arg: T): T;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;
        type B = string;

        export function func1<R extends A>(arg: R): R {
          doWork(String(arg));

          return arg;
        }

        declare function doWork(arg: B): void;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;
        type B = number;

        export function func1<R extends A>(arg: R) {
          return func2(arg);
        }

        declare function func2(arg: B): B;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;
        type B = number;
        type C = number;

        export function func1<R extends A>(arg: R) {
          if (Math.random() > 0.5) {
            return func2(arg);
          } else {
            return func3(arg);
          }
        }

        declare function func2(arg: B): B;
        declare function func3(arg: C): C;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 3,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'C',
          },
          endColumn: 15,
          line: 4,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;
        type B = number;

        export function func1<R extends A>(arg: R) {
          const a = (() => {
            return func2(arg);
          })();

          return arg;
        }

        declare function func2(arg: B): B;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;
        type B = number;

        export function func1<R extends A>(arg: R) {
          return arg as B;
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;
        type B = string;

        export function func1<R extends A>(arg: R): R {
          function doWork(arg2: B): void {}

          doWork(String(arg));

          return arg;
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type ItemsMap = Record<string, number>;
        type Key = keyof ItemsMap;

        export function get<K extends Key>(key: K): ItemsMap[K] {
          return key as never;
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'ItemsMap',
          },
          endColumn: 22,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Key',
          },
          endColumn: 17,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        const value: A = 1;

        export function func() {
          return Math.random() > 0.5 && value;
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;
        type B = string;

        const valueA: A = 1;
        const valueB: B = 'test';

        export function func() {
          return Math.random() > 0.5 ? valueA : valueB;
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'B',
          },
          endColumn: 15,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        declare function func<T>(): string;

        type A = string;

        export default func<A>();
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 4,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type Apple = 'apple';
        type Banana = 'banana';

        export type Fruits = Apple | Banana;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'Apple',
          },
          endColumn: 19,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 14,
          data: {
            name: 'Banana',
          },
          endColumn: 20,
          line: 3,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        export interface B {
          a: A;
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = number;

        interface B {
          b: string;
        }

        export namespace C {
          export type D = A;
          export type E = B;
        }
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
        {
          column: 19,
          data: {
            name: 'B',
          },
          endColumn: 20,
          line: 4,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        type A = 'test';
        export type B = \`test-\${A}\`;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'A',
          },
          endColumn: 15,
          line: 2,
          messageId: 'requireTypeExport',
        },
      ],
    },
    {
      code: `
        const fruits = { apple: 'apple' };

        export function getFruit<Key extends keyof typeof fruits>(
          key: Key,
        ): (typeof fruits)[Key] {
          return fruits[key];
        }
      `,
      errors: [
        {
          column: 15,
          data: {
            name: 'fruits',
          },
          endColumn: 21,
          line: 2,
          messageId: 'requireTypeQueryExport',
        },
      ],
    },
    {
      code: `
        const fruits = { apple: 'apple' };

        export declare function processFruit<F extends typeof fruits.apple>(
          fruit: F,
        ): void;
      `,
      errors: [
        {
          column: 15,
          data: {
            name: 'fruits',
          },
          endColumn: 21,
          line: 2,
          messageId: 'requireTypeQueryExport',
        },
      ],
    },
    {
      code: `
        const fruits = { apple: 'apple' };

        export declare function processFruit<
          F extends Record<keyof typeof fruits, string>,
        >(fruit: F): void;
      `,
      errors: [
        {
          column: 15,
          data: {
            name: 'fruits',
          },
          endColumn: 21,
          line: 2,
          messageId: 'requireTypeQueryExport',
        },
      ],
    },
  ],
});
