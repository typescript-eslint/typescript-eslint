import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/require-types-exports';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig-with-dom.json',
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
  ],

  invalid: [
    {
      code: `
        type Arg = number;

        export function f(a: Arg): void {}
      `,
      errors: [
        {
          messageId: 'requireTypeExport',
          line: 4,
          column: 30,
          endColumn: 33,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 30,
          endColumn: 33,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 37,
          endColumn: 40,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 28,
          endColumn: 31,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 30,
          endColumn: 33,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 30,
          endColumn: 33,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 30,
          endColumn: 34,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 39,
          endColumn: 43,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 30,
          endColumn: 34,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 39,
          endColumn: 43,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 8,
          column: 30,
          endColumn: 34,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 8,
          column: 39,
          endColumn: 43,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 8,
          column: 30,
          endColumn: 34,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 8,
          column: 39,
          endColumn: 43,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 30,
          endColumn: 34,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 30,
          endColumn: 34,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 30,
          endColumn: 34,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 30,
          endColumn: 34,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 36,
          endColumn: 40,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 42,
          endColumn: 46,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 6,
          column: 36,
          endColumn: 40,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 6,
          column: 42,
          endColumn: 46,
          data: {
            name: 'Arg2',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 6,
          column: 60,
          endColumn: 64,
          data: {
            name: 'Arg3',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 36,
          endColumn: 40,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 42,
          endColumn: 46,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 42,
          endColumn: 46,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 51,
          endColumn: 55,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 42,
          endColumn: 46,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 51,
          endColumn: 55,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 36,
          endColumn: 39,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 36,
          endColumn: 39,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 30,
          endColumn: 33,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 30,
          endColumn: 33,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 8,
          column: 30,
          endColumn: 35,
          data: {
            name: 'Fruit',
          },
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
          messageId: 'requireTypeExport',
          line: 8,
          column: 30,
          endColumn: 35,
          data: {
            name: 'Fruit',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 37,
          endColumn: 40,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 44,
          endColumn: 48,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 44,
          endColumn: 48,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 44,
          endColumn: 48,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 44,
          endColumn: 48,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 38,
          endColumn: 41,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 42,
          endColumn: 45,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 30,
          endColumn: 33,
          data: {
            name: 'Ret',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 30,
          endColumn: 33,
          data: {
            name: 'Ret',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 30,
          endColumn: 34,
          data: {
            name: 'Ret1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Ret2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 30,
          endColumn: 34,
          data: {
            name: 'Ret1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Ret2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 30,
          endColumn: 34,
          data: {
            name: 'Ret1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Ret2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 30,
          endColumn: 34,
          data: {
            name: 'Ret1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Ret2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 31,
          endColumn: 35,
          data: {
            name: 'Ret1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Ret2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 31,
          endColumn: 35,
          data: {
            name: 'Ret1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Ret2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 35,
          endColumn: 39,
          data: {
            name: 'Ret1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 44,
          endColumn: 48,
          data: {
            name: 'Ret2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 35,
          endColumn: 39,
          data: {
            name: 'Ret1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 44,
          endColumn: 48,
          data: {
            name: 'Ret2',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 37,
          endColumn: 40,
          data: {
            name: 'Ret',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Ret1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 44,
          endColumn: 48,
          data: {
            name: 'Ret2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Ret1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 44,
          endColumn: 48,
          data: {
            name: 'Ret2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Ret1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 44,
          endColumn: 48,
          data: {
            name: 'Ret2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 41,
          data: {
            name: 'Ret1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 44,
          endColumn: 48,
          data: {
            name: 'Ret2',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 38,
          endColumn: 41,
          data: {
            name: 'Ret',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 23,
          endColumn: 26,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 32,
          endColumn: 35,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 38,
          endColumn: 41,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 38,
          endColumn: 41,
          data: {
            name: 'Arg',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 31,
          endColumn: 32,
          data: {
            name: 'R',
          },
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
          messageId: 'requireTypeExport',
          line: 6,
          column: 45,
          endColumn: 49,
          data: {
            name: 'Arg2',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 7,
          column: 24,
          endColumn: 28,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 9,
          column: 26,
          endColumn: 29,
          data: {
            name: 'Ret',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 38,
          endColumn: 42,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 6,
          column: 38,
          endColumn: 42,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 31,
          endColumn: 35,
          data: {
            name: 'Arg1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 6,
          column: 20,
          endColumn: 24,
          data: {
            name: 'Arg2',
          },
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
          messageId: 'requireTypeExport',
          line: 8,
          column: 32,
          endColumn: 37,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 8,
          column: 32,
          endColumn: 33,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 10,
          column: 32,
          endColumn: 33,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 11,
          column: 32,
          endColumn: 33,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 10,
          column: 32,
          endColumn: 33,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 10,
          column: 44,
          endColumn: 46,
          data: {
            name: 'T1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 10,
          column: 64,
          endColumn: 66,
          data: {
            name: 'T2',
          },
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
          messageId: 'requireTypeExport',
          line: 10,
          column: 37,
          endColumn: 39,
          data: {
            name: 'T1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 10,
          column: 57,
          endColumn: 59,
          data: {
            name: 'T2',
          },
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
          messageId: 'requireTypeExport',
          line: 12,
          column: 18,
          endColumn: 20,
          data: {
            name: 'T1',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 14,
          column: 20,
          endColumn: 22,
          data: {
            name: 'T2',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 17,
          column: 13,
          endColumn: 15,
          data: {
            name: 'T3',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 22,
          endColumn: 23,
          data: {
            name: 'A',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 6,
          column: 23,
          endColumn: 24,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 22,
          endColumn: 23,
          data: {
            name: 'A',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 6,
          column: 23,
          endColumn: 24,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 22,
          endColumn: 23,
          data: {
            name: 'A',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 6,
          column: 23,
          endColumn: 24,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 22,
          endColumn: 27,
          data: {
            name: 'Fruit',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 22,
          endColumn: 27,
          data: {
            name: 'Fruit',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 22,
          endColumn: 27,
          data: {
            name: 'Fruit',
          },
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
          messageId: 'requireTypeExport',
          line: 9,
          column: 37,
          endColumn: 42,
          data: {
            name: 'Fruit',
          },
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
          messageId: 'requireTypeExport',
          line: 9,
          column: 36,
          endColumn: 41,
          data: {
            name: 'Fruit',
          },
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
          messageId: 'requireTypeExport',
          line: 7,
          column: 27,
          endColumn: 28,
          data: {
            name: 'A',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 7,
          column: 30,
          endColumn: 31,
          data: {
            name: 'B',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 7,
          column: 43,
          endColumn: 44,
          data: {
            name: 'C',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 7,
          column: 51,
          endColumn: 52,
          data: {
            name: 'D',
          },
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
          messageId: 'requireTypeExport',
          line: 6,
          column: 23,
          endColumn: 24,
          data: {
            name: 'A',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 6,
          column: 27,
          endColumn: 28,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 6,
          column: 32,
          endColumn: 33,
          data: {
            name: 'A',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 6,
          column: 36,
          endColumn: 37,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 28,
          endColumn: 29,
          data: {
            name: 'A',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 32,
          endColumn: 33,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 38,
          data: {
            name: 'A',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 41,
          endColumn: 42,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 33,
          endColumn: 34,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 42,
          endColumn: 43,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 28,
          endColumn: 29,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 37,
          endColumn: 38,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 41,
          endColumn: 42,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 8,
          column: 41,
          endColumn: 46,
          data: {
            name: 'Fruit',
          },
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
          messageId: 'requireTypeExport',
          line: 8,
          column: 26,
          endColumn: 37,
          data: {
            name: 'Fruit',
          },
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
          messageId: 'requireTypeExport',
          line: 8,
          column: 26,
          endColumn: 37,
          data: {
            name: 'Fruit',
          },
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
          messageId: 'requireTypeExport',
          line: 8,
          column: 26,
          endColumn: 37,
          data: {
            name: 'Fruit',
          },
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
          messageId: 'requireTypeExport',
          line: 9,
          column: 21,
          endColumn: 25,
          data: {
            name: 'Item',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 11,
          column: 29,
          endColumn: 36,
          data: {
            name: 'ItemKey',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 21,
          endColumn: 22,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 7,
          column: 21,
          endColumn: 22,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 7,
          column: 28,
          endColumn: 29,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 7,
          column: 21,
          endColumn: 22,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 7,
          column: 21,
          endColumn: 22,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 41,
          endColumn: 42,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 41,
          endColumn: 42,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 41,
          endColumn: 42,
          data: {
            name: 'A',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 9,
          column: 37,
          endColumn: 38,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 6,
          column: 41,
          endColumn: 42,
          data: {
            name: 'A',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 14,
          column: 37,
          endColumn: 38,
          data: {
            name: 'B',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 15,
          column: 37,
          endColumn: 38,
          data: {
            name: 'C',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 41,
          endColumn: 42,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 41,
          endColumn: 42,
          data: {
            name: 'A',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 6,
          column: 25,
          endColumn: 26,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 41,
          endColumn: 42,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 39,
          endColumn: 42,
          data: {
            name: 'Key',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 53,
          endColumn: 61,
          data: {
            name: 'ItemsMap',
          },
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
          messageId: 'requireTypeExport',
          line: 4,
          column: 22,
          endColumn: 23,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 23,
          endColumn: 24,
          data: {
            name: 'A',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 6,
          column: 23,
          endColumn: 24,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 6,
          column: 29,
          endColumn: 30,
          data: {
            name: 'A',
          },
        },
      ],
    },

    {
      code: `
        type Apple = 'apple';
        type Banana = 'banana';

        export type Fruites = Apple | Banana;
      `,
      errors: [
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 31,
          endColumn: 36,
          data: {
            name: 'Apple',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 5,
          column: 39,
          endColumn: 45,
          data: {
            name: 'Banana',
          },
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
          messageId: 'requireTypeExport',
          line: 5,
          column: 14,
          endColumn: 15,
          data: {
            name: 'A',
          },
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
          messageId: 'requireTypeExport',
          line: 9,
          column: 27,
          endColumn: 28,
          data: {
            name: 'A',
          },
        },
        {
          messageId: 'requireTypeExport',
          line: 10,
          column: 27,
          endColumn: 28,
          data: {
            name: 'B',
          },
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
          messageId: 'requireTypeExport',
          line: 3,
          column: 33,
          endColumn: 34,
          data: {
            name: 'A',
          },
        },
      ],
    },
  ],
});
