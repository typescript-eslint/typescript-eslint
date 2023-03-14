import rule from '../../src/rules/no-array-delete';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-array-delete', rule, {
  valid: [
    `
declare const obj: Record<PropertyKey, unknown>;
declare const key: PropertyKey;
delete obj[key];
    `,
    `
declare const arr: unknown[];
delete arr.myprop;
    `,
    `
declare const arr: unknown[];
declare const i: string;
delete arr[i];
    `,
    `
declare const multiDimesnional: Array<unknown>[][][][];
declare const i: number;
delete multiDimesnional[i][i][i][i][i].someProp;
    `,
  ],
  invalid: [
    {
      code: `
declare const arr: unknown[];
declare const i: number;

delete arr[i];
      `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const arr: unknown[];
declare const i: number;

arr.splice(i, 1);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: unknown[];

delete arr[10];
      `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const arr: unknown[];

arr.splice(10, 1);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: unknown[];

enum Enum {
  X,
  Y,
}

delete arr[Enum.X];
      `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const arr: unknown[];

enum Enum {
  X,
  Y,
}

arr.splice(Enum.X, 1);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: Array<unknown>;
declare const i: number;

delete arr[i];
      `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const arr: Array<unknown>;
declare const i: number;

arr.splice(i, 1);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const obj: { prop: { arr: unknown[] } };
declare const indexObj: { i: number };

delete obj.prop.arr[indexObj.i];
      `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const obj: { prop: { arr: unknown[] } };
declare const indexObj: { i: number };

obj.prop.arr.splice(indexObj.i, 1);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const i: number;
declare function getTarget(): unknown[];

delete getTarget()[i];
      `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const i: number;
declare function getTarget(): unknown[];

getTarget().splice(i, 1);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const data: unknown[];
declare function getKey(): number;

delete data[getKey()];
      `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const data: unknown[];
declare function getKey(): number;

data.splice(getKey(), 1);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const mayBeArr: number | number[];
declare const i: number;

delete mayBeArr[i];
      `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const mayBeArr: number | number[];
declare const i: number;

mayBeArr.splice(i, 1);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const multiDimesnional: Array<unknown>[][][][];
declare const i: number;

delete multiDimesnional[i][i][i][i][i];
      `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const multiDimesnional: Array<unknown>[][][][];
declare const i: number;

multiDimesnional[i][i][i][i].splice(i, 1);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const i: number;

function trickyCase<T extends unknown[]>(t: T) {
  delete t[i];
}
      `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const i: number;

function trickyCase<T extends unknown[]>(t: T) {
  t.splice(i, 1);
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const i: number;

function trickyCase1<T extends unknown>(t: T[]) {
  delete t[i];
}
      `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const i: number;

function trickyCase1<T extends unknown>(t: T[]) {
  t.splice(i, 1);
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: unknown[];
delete arr[Math.random() ? 1 : 1];
        `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const arr: unknown[];
arr.splice(Math.random() ? 1 : 1, 1);
        `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: unknown[];
delete arr[Math.random() ? 1 : "prop"];
        `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const arr: unknown[];
arr.splice(Math.random() ? 1 : "prop", 1);
        `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: unknown[];
declare function something(): unknown;

delete arr[something(), 1];
        `,
      errors: [
        {
          messageId: 'arrayDelete',
          suggestions: [
            {
              messageId: 'arrayDelete',
              output: `
declare const arr: unknown[];
declare function something(): unknown;

arr.splice((something(), 1), 1);
        `,
            },
          ],
        },
      ],
    },
  ],
});
