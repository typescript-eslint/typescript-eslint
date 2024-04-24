import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/require-types-exports';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
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
  ],
});
