import rule from '../../src/rules/safe-array-destructuring';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('safe-array-destructuring', rule, {
  valid: [
    `
      const tuple: [number, number] = [1, 2];
      const [first, second] = tuple;
    `,
    `
      function some([first]: [number, string]) {}
    `,
    `
      const restTuple: [number, ...number[]] = [3];
      const [first] = restTuple;
    `,
    `
      type SemiTuple = [string, ...number[]]
      const inner: { a: SemiTuple } = { a: ['test'] };
      const { a: [value] } = inner;
    `,
    `
      const restTuple: [number, ...number[]] = [3];
      const [first, ...rest] = restTuple;
    `,
    `
      type SomeObj = { bbb: string };
      declare const complex: { something: [SomeObj, ...SomeObj[]] };
      const { something: [{bbb: firstBbb}, ...others] } = complex;
    `,
    `const [] = []`,
    `const [] = [1, 2]`,
  ],
  invalid: [
    {
      code: `
        const array: number[] = [];
        const [first] = array`,
      errors: [
        {
          column: 15,
          messageId: 'unsafeArrayDestructuring',
        },
      ],
    },
    {
      code: `
        const inner: { a: number[] } = { a: [] };
        const { a: [value] } = inner;
      `,
      errors: [
        {
          column: 20,
          messageId: 'unsafeArrayDestructuring',
        },
      ],
    },
    {
      code: `
        type MyArray<T> = T[];
        type SemiTuple = [string, ...MyArray<number>];
        const inner: { a: SemiTuple } = { a: ['test'] };
        const { a: [value, num, ...other] } = inner;
      `,
      errors: [{ column: 28, messageId: 'unsafeDestructuringOfRestTuple' }],
    },
    {
      code: `
      type SomeObj = { bbb: string };
      declare const complex: { something: [SomeObj, ...SomeObj[]] };
      const { something: [{bbb: firstBbb}, { bbb: secondBbb }] } = complex;
    `,
      errors: [{ column: 44, messageId: 'unsafeDestructuringOfRestTuple' }],
    },
    {
      code: `
        function some([first]: number[]) {}
      `,
      errors: [
        {
          column: 23,
          messageId: 'unsafeArrayDestructuring',
        },
      ],
    },
    {
      code: `
      const restTuple: [number, ...number[]] = [3];
      const [first, second] = restTuple;
    `,
      errors: [
        {
          column: 21,
          messageId: 'unsafeDestructuringOfRestTuple',
        },
      ],
    },
  ],
});
