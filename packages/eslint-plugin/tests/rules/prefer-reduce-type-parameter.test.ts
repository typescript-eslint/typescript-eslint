import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-reduce-type-parameter';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

ruleTester.run('prefer-reduce-type-parameter', rule, {
  valid: [
    `
      new (class Mine {
        reduce() {}
      })().reduce(() => {}, 1 as any);
    `,
    `
      class Mine {
        reduce() {}
      }

      new Mine().reduce(() => {}, 1 as any);
    `,
    `
      import { Reducable } from './class';

      new Reducable().reduce(() => {}, 1 as any);
    `,
    "[1, 2, 3]['reduce']((sum, num) => sum + num, 0);",
    '[1, 2, 3][null]((sum, num) => sum + num, 0);',
    '[1, 2, 3]?.[null]((sum, num) => sum + num, 0);',
    '[1, 2, 3].reduce((sum, num) => sum + num, 0);',
    '[1, 2, 3].reduce<number[]>((a, s) => a.concat(s * 2), []);',
    '[1, 2, 3]?.reduce<number[]>((a, s) => a.concat(s * 2), []);',
    `
      declare const tuple: [number, number, number];
      tuple.reduce<number[]>((a, s) => a.concat(s * 2), []);
    `,
    `
      type Reducer = { reduce: (callback: (arg: any) => any, arg: any) => any };
      declare const tuple: [number, number, number] | Reducer;
      tuple.reduce(a => {
        return a.concat(1);
      }, [] as number[]);
    `,
    `
      type Reducer = { reduce: (callback: (arg: any) => any, arg: any) => any };
      declare const arrayOrReducer: number[] & Reducer;
      arrayOrReducer.reduce(a => {
        return a.concat(1);
      }, [] as number[]);
    `,
    `
      ['a', 'b'].reduce(
        (accum, name) => ({
          ...accum,
          [name]: true,
        }),
        {} as Record<'a' | 'b', boolean>,
      );
    `,
    // Object literal may only specify known properties, and 'c' does not exist in
    // type 'Record<"a" | "b", boolean>'.
    `
      ['a', 'b'].reduce(
        (accum, name) => ({
          ...accum,
          [name]: true,
        }),
        { a: true, b: false, c: true } as Record<'a' | 'b', boolean>,
      );
    `,
    // '{}' is assignable to the constraint of type 'T', but 'T' could be
    // instantiated with a different subtype of constraint 'Record<string, boolean>'.
    `
      function f<T extends Record<string, boolean>>() {
        ['a', 'b'].reduce(
          (accum, name) => ({
            ...accum,
            [name]: true,
          }),
          {} as T,
        );
      }
    `,
    `
      function f<T>() {
        ['a', 'b'].reduce(
          (accum, name) => ({
            ...accum,
            [name]: true,
          }),
          {} as T,
        );
      }
    `,
    `
      ['a', 'b'].reduce((accum, name) => \`\${accum} | hello \${name}!\`);
    `,
  ],
  invalid: [
    {
      code: `
declare const arr: string[];
arr.reduce<string | undefined>(acc => acc, arr.shift() as string | undefined);
      `,
      errors: [
        {
          column: 44,
          line: 3,
          messageId: 'preferTypeParameter',
        },
      ],
      output: `
declare const arr: string[];
arr.reduce<string | undefined>(acc => acc, arr.shift());
      `,
    },
    {
      code: '[1, 2, 3].reduce((a, s) => a.concat(s * 2), [] as number[]);',
      errors: [
        {
          column: 45,
          line: 1,
          messageId: 'preferTypeParameter',
        },
      ],
      output: '[1, 2, 3].reduce<number[]>((a, s) => a.concat(s * 2), []);',
    },
    {
      code: '[1, 2, 3].reduce((a, s) => a.concat(s * 2), <number[]>[]);',
      errors: [
        {
          column: 45,
          line: 1,
          messageId: 'preferTypeParameter',
        },
      ],
      output: '[1, 2, 3].reduce<number[]>((a, s) => a.concat(s * 2), []);',
    },
    {
      code: '[1, 2, 3]?.reduce((a, s) => a.concat(s * 2), [] as number[]);',
      errors: [
        {
          column: 46,
          line: 1,
          messageId: 'preferTypeParameter',
        },
      ],
      output: '[1, 2, 3]?.reduce<number[]>((a, s) => a.concat(s * 2), []);',
    },
    {
      code: '[1, 2, 3]?.reduce((a, s) => a.concat(s * 2), <number[]>[]);',
      errors: [
        {
          column: 46,
          line: 1,
          messageId: 'preferTypeParameter',
        },
      ],
      output: '[1, 2, 3]?.reduce<number[]>((a, s) => a.concat(s * 2), []);',
    },
    {
      code: `
const names = ['a', 'b', 'c'];

names.reduce(
  (accum, name) => ({
    ...accum,
    [name]: true,
  }),
  {} as Record<string, boolean>,
);
      `,
      errors: [
        {
          column: 3,
          line: 9,
          messageId: 'preferTypeParameter',
        },
      ],
      output: `
const names = ['a', 'b', 'c'];

names.reduce<Record<string, boolean>>(
  (accum, name) => ({
    ...accum,
    [name]: true,
  }),
  {},
);
      `,
    },
    {
      code: `
['a', 'b'].reduce(
  (accum, name) => ({
    ...accum,
    [name]: true,
  }),
  <Record<string, boolean>>{},
);
      `,
      errors: [
        {
          column: 3,
          line: 7,
          messageId: 'preferTypeParameter',
        },
      ],
      output: `
['a', 'b'].reduce<Record<string, boolean>>(
  (accum, name) => ({
    ...accum,
    [name]: true,
  }),
  {},
);
      `,
    },
    {
      code: `
['a', 'b']['reduce'](
  (accum, name) => ({
    ...accum,
    [name]: true,
  }),
  {} as Record<string, boolean>,
);
      `,
      errors: [
        {
          column: 3,
          line: 7,
          messageId: 'preferTypeParameter',
        },
      ],
      output: `
['a', 'b']['reduce']<Record<string, boolean>>(
  (accum, name) => ({
    ...accum,
    [name]: true,
  }),
  {},
);
      `,
    },
    {
      code: `
function f<T, U extends T[]>(a: U) {
  return a.reduce(() => {}, {} as Record<string, boolean>);
}
      `,
      errors: [
        {
          column: 29,
          line: 3,
          messageId: 'preferTypeParameter',
        },
      ],
      output: `
function f<T, U extends T[]>(a: U) {
  return a.reduce<Record<string, boolean>>(() => {}, {});
}
      `,
    },
    {
      code: `
declare const tuple: [number, number, number];
tuple.reduce((a, s) => a.concat(s * 2), [] as number[]);
      `,
      errors: [
        {
          column: 41,
          line: 3,
          messageId: 'preferTypeParameter',
        },
      ],
      output: `
declare const tuple: [number, number, number];
tuple.reduce<number[]>((a, s) => a.concat(s * 2), []);
      `,
    },
    {
      code: `
declare const tupleOrArray: [number, number, number] | number[];
tupleOrArray.reduce((a, s) => a.concat(s * 2), [] as number[]);
      `,
      errors: [
        {
          column: 48,
          line: 3,
          messageId: 'preferTypeParameter',
        },
      ],
      output: `
declare const tupleOrArray: [number, number, number] | number[];
tupleOrArray.reduce<number[]>((a, s) => a.concat(s * 2), []);
      `,
    },
    {
      code: `
declare const tuple: [number, number, number] & number[];
tuple.reduce((a, s) => a.concat(s * 2), [] as number[]);
      `,
      errors: [
        {
          column: 41,
          line: 3,
          messageId: 'preferTypeParameter',
        },
      ],
      output: `
declare const tuple: [number, number, number] & number[];
tuple.reduce<number[]>((a, s) => a.concat(s * 2), []);
      `,
    },
    {
      code: `
['a', 'b'].reduce(
  (accum, name) => ({
    ...accum,
    [name]: true,
  }),
  {} as Record<string, boolean>,
);
      `,
      errors: [
        {
          column: 3,
          line: 7,
          messageId: 'preferTypeParameter',
        },
      ],
      output: `
['a', 'b'].reduce<Record<string, boolean>>(
  (accum, name) => ({
    ...accum,
    [name]: true,
  }),
  {},
);
      `,
    },
    {
      code: `
function f<T extends Record<string, boolean>>(t: T) {
  ['a', 'b'].reduce(
    (accum, name) => ({
      ...accum,
      [name]: true,
    }),
    t as Record<string, boolean | number>,
  );
}
      `,
      errors: [
        {
          column: 5,
          line: 8,
          messageId: 'preferTypeParameter',
        },
      ],
      output: `
function f<T extends Record<string, boolean>>(t: T) {
  ['a', 'b'].reduce<Record<string, boolean | number>>(
    (accum, name) => ({
      ...accum,
      [name]: true,
    }),
    t,
  );
}
      `,
    },
  ],
});
