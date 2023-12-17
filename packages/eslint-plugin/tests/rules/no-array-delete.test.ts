import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-array-delete';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-array-delete', rule, {
  valid: [
    `
      declare const obj: { a: 1; b: 2 };
      delete obj.a;
    `,

    `
      declare const obj: { a: 1; b: 2 };
      delete obj['a'];
    `,

    `
      declare const arr: { a: 1; b: 2 }[][][][];
      delete arr[0][0][0][0].a;
    `,

    `
      declare const maybeArray: any;
      delete maybeArray[0];
    `,

    `
      declare const maybeArray: unknown;
      delete maybeArray[0];
    `,

    `
      declare function getObject<T extends { a: 1; b: 2 }>(): T;
      delete getObject().a;
    `,

    `
      declare function getObject<T extends number>(): { a: T; b: 2 };
      delete getObject().a;
    `,

    `
      declare const test: never;
      delete test[0];
    `,
  ],

  invalid: [
    {
      code: `
        declare const arr: number[];
        delete arr[0];
      `,
      output: `
        declare const arr: number[];
        arr.splice(0, 1);
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 22,
        },
      ],
    },

    {
      code: `
        declare const arr: number[];
        declare const key: number;
        delete arr[key];
      `,
      output: `
        declare const arr: number[];
        declare const key: number;
        arr.splice(key, 1);
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 4,
          column: 9,
          endColumn: 24,
        },
      ],
    },

    {
      code: `
        declare const arr: number[];

        enum Keys {
          A,
          B,
        }

        delete arr[Keys.A];
      `,
      output: `
        declare const arr: number[];

        enum Keys {
          A,
          B,
        }

        arr.splice(Keys.A, 1);
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 9,
          column: 9,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const arr: number[];
        declare function doWork(): void;
        delete arr[(doWork(), 1)];
      `,
      output: `
        declare const arr: number[];
        declare function doWork(): void;
        arr.splice((doWork(), 1), 1);
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 4,
          column: 9,
          endColumn: 34,
        },
      ],
    },

    {
      code: `
        declare const arr: Array<number>;
        delete arr[0];
      `,
      output: `
        declare const arr: Array<number>;
        arr.splice(0, 1);
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 22,
        },
      ],
    },

    {
      code: 'delete [1, 2, 3][0];',
      output: '[1, 2, 3].splice(0, 1);',
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 1,
          column: 1,
          endColumn: 20,
        },
      ],
    },

    {
      code: `
        declare const arr: unknown[];
        delete arr[Math.random() ? 0 : 1];
      `,
      output: `
        declare const arr: unknown[];
        arr.splice(Math.random() ? 0 : 1, 1);
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 42,
        },
      ],
    },

    {
      code: `
        declare const arr: number[] | string[] | boolean[];
        delete arr[0];
      `,
      output: `
        declare const arr: number[] | string[] | boolean[];
        arr.splice(0, 1);
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 22,
        },
      ],
    },

    {
      code: `
        declare const arr: number[] & unknown;
        delete arr[0];
      `,
      output: `
        declare const arr: number[] & unknown;
        arr.splice(0, 1);
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 22,
        },
      ],
    },

    {
      code: `
        declare const arr: (number | string)[];
        delete arr[0];
      `,
      output: `
        declare const arr: (number | string)[];
        arr.splice(0, 1);
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 22,
        },
      ],
    },

    {
      code: `
        declare const obj: { a: { b: { c: number[] } } };
        delete obj.a.b.c[0];
      `,
      output: `
        declare const obj: { a: { b: { c: number[] } } };
        obj.a.b.c.splice(0, 1);
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 28,
        },
      ],
    },

    {
      code: `
        declare function getArray<T extends number[]>(): T;
        delete getArray()[0];
      `,
      output: `
        declare function getArray<T extends number[]>(): T;
        getArray().splice(0, 1);
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 29,
        },
      ],
    },

    {
      code: `
        declare function getArray<T extends number>(): T[];
        delete getArray()[0];
      `,
      output: `
        declare function getArray<T extends number>(): T[];
        getArray().splice(0, 1);
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 29,
        },
      ],
    },

    {
      code: `
        function deleteFromArray(a: number[]) {
          delete a[0];
        }
      `,
      output: `
        function deleteFromArray(a: number[]) {
          a.splice(0, 1);
        }
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 11,
          endColumn: 22,
        },
      ],
    },

    {
      code: `
        function deleteFromArray<T extends number>(a: T[]) {
          delete a[0];
        }
      `,
      output: `
        function deleteFromArray<T extends number>(a: T[]) {
          a.splice(0, 1);
        }
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 11,
          endColumn: 22,
        },
      ],
    },

    {
      code: `
        function deleteFromArray<T extends number[]>(a: T) {
          delete a[0];
        }
      `,
      output: `
        function deleteFromArray<T extends number[]>(a: T) {
          a.splice(0, 1);
        }
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 11,
          endColumn: 22,
        },
      ],
    },

    {
      code: `
        declare const tuple: [number, string];
        delete tuple[0];
      `,
      output: `
        declare const tuple: [number, string];
        tuple.splice(0, 1);
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 24,
        },
      ],
    },
  ],
});
