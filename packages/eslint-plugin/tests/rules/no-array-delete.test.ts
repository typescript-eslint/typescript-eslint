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
  ],

  invalid: [
    {
      code: `
        declare const arr: number[];
        delete arr[0];
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 22,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: '0',
                target: 'arr',
              },
              output: `
        declare const arr: number[];
        arr.splice(0, 1);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
        declare const arr: number[];
        declare const key: number;
        delete arr[key];
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 4,
          column: 9,
          endColumn: 24,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: 'key',
                target: 'arr',
              },
              output: `
        declare const arr: number[];
        declare const key: number;
        arr.splice(key, 1);
      `,
            },
          ],
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
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 9,
          column: 9,
          endColumn: 27,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: 'Keys.A',
                target: 'arr',
              },
              output: `
        declare const arr: number[];

        enum Keys {
          A,
          B,
        }

        arr.splice(Keys.A, 1);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
        declare const arr: number[];
        declare function doWork(): void;
        delete arr[(doWork(), 1)];
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 4,
          column: 9,
          endColumn: 34,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: '(doWork(), 1)',
                target: 'arr',
              },
              output: `
        declare const arr: number[];
        declare function doWork(): void;
        arr.splice((doWork(), 1), 1);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
        declare const arr: Array<number>;
        delete arr[0];
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 22,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: '0',
                target: 'arr',
              },
              output: `
        declare const arr: Array<number>;
        arr.splice(0, 1);
      `,
            },
          ],
        },
      ],
    },

    {
      code: 'delete [1, 2, 3][0];',
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 1,
          column: 1,
          endColumn: 20,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: '0',
                target: '[1, 2, 3]',
              },
              output: '[1, 2, 3].splice(0, 1);',
            },
          ],
        },
      ],
    },

    {
      code: `
        declare const arr: unknown[];
        delete arr[Math.random() ? 0 : 1];
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 42,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: 'Math.random() ? 0 : 1',
                target: 'arr',
              },
              output: `
        declare const arr: unknown[];
        arr.splice(Math.random() ? 0 : 1, 1);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
        declare const arr: number[] | string[] | boolean[];
        delete arr[0];
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 22,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: '0',
                target: 'arr',
              },
              output: `
        declare const arr: number[] | string[] | boolean[];
        arr.splice(0, 1);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
        declare const arr: number[] & unknown;
        delete arr[0];
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 22,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: '0',
                target: 'arr',
              },
              output: `
        declare const arr: number[] & unknown;
        arr.splice(0, 1);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
        declare const arr: (number | string)[];
        delete arr[0];
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 22,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: '0',
                target: 'arr',
              },
              output: `
        declare const arr: (number | string)[];
        arr.splice(0, 1);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
        declare const obj: { a: { b: { c: number[] } } };
        delete obj.a.b.c[0];
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 28,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: '0',
                target: 'obj.a.b.c',
              },
              output: `
        declare const obj: { a: { b: { c: number[] } } };
        obj.a.b.c.splice(0, 1);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
        declare function getArray<T extends number[]>(): T;
        delete getArray()[0];
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 29,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: '0',
                target: 'getArray()',
              },
              output: `
        declare function getArray<T extends number[]>(): T;
        getArray().splice(0, 1);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
        declare function getArray<T extends number>(): T[];
        delete getArray()[0];
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 9,
          endColumn: 29,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: '0',
                target: 'getArray()',
              },
              output: `
        declare function getArray<T extends number>(): T[];
        getArray().splice(0, 1);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
        function deleteFromArray(a: number[]) {
          delete a[0];
        }
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 11,
          endColumn: 22,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: '0',
                target: 'a',
              },
              output: `
        function deleteFromArray(a: number[]) {
          a.splice(0, 1);
        }
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
        function deleteFromArray<T extends number>(a: T[]) {
          delete a[0];
        }
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 11,
          endColumn: 22,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: '0',
                target: 'a',
              },
              output: `
        function deleteFromArray<T extends number>(a: T[]) {
          a.splice(0, 1);
        }
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
        function deleteFromArray<T extends number[]>(a: T) {
          delete a[0];
        }
      `,
      errors: [
        {
          messageId: 'noArrayDelete',
          line: 3,
          column: 11,
          endColumn: 22,
          suggestions: [
            {
              messageId: 'useSplice',
              data: {
                key: '0',
                target: 'a',
              },
              output: `
        function deleteFromArray<T extends number[]>(a: T) {
          a.splice(0, 1);
        }
      `,
            },
          ],
        },
      ],
    },
  ],
});
