import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/non-nullable-type-assertion-style';
import { getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: getFixturesRootDir(),
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('non-nullable-type-assertion-style', rule, {
  valid: [
    `
declare const original: number | string;
const cast = original as string;
    `,
    `
declare const original: number | undefined;
const cast = original as string | number | undefined;
    `,
    `
declare const original: number | any;
const cast = original as string | number | undefined;
    `,
    `
declare const original: number | undefined;
const cast = original as any;
    `,
    `
declare const original: number | null | undefined;
const cast = original as number | null;
    `,
    `
type Type = { value: string };
declare const original: Type | number;
const cast = original as Type;
    `,
    `
type T = string;
declare const x: T | number;

const y = x as NonNullable<T>;
    `,
    `
type T = string | null;
declare const x: T | number;

const y = x as NonNullable<T>;
    `,
    `
const foo = [] as const;
    `,
    `
const x = 1 as 1;
    `,
    `
declare function foo<T = any>(): T;
const bar = foo() as number;
    `,
  ],

  invalid: [
    {
      code: `
declare const maybe: string | undefined;
const bar = maybe as string;
      `,
      errors: [
        {
          column: 13,
          line: 3,
          messageId: 'preferNonNullAssertion',
        },
      ],
      output: `
declare const maybe: string | undefined;
const bar = maybe!;
      `,
    },
    {
      code: `
declare const maybe: string | null;
const bar = maybe as string;
      `,
      errors: [
        {
          column: 13,
          line: 3,
          messageId: 'preferNonNullAssertion',
        },
      ],
      output: `
declare const maybe: string | null;
const bar = maybe!;
      `,
    },
    {
      code: `
declare const maybe: string | null | undefined;
const bar = maybe as string;
      `,
      errors: [
        {
          column: 13,
          line: 3,
          messageId: 'preferNonNullAssertion',
        },
      ],
      output: `
declare const maybe: string | null | undefined;
const bar = maybe!;
      `,
    },
    {
      code: `
type Type = { value: string };
declare const maybe: Type | undefined;
const bar = maybe as Type;
      `,
      errors: [
        {
          column: 13,
          line: 4,
          messageId: 'preferNonNullAssertion',
        },
      ],
      output: `
type Type = { value: string };
declare const maybe: Type | undefined;
const bar = maybe!;
      `,
    },
    {
      code: `
interface Interface {
  value: string;
}
declare const maybe: Interface | undefined;
const bar = maybe as Interface;
      `,
      errors: [
        {
          column: 13,
          line: 6,
          messageId: 'preferNonNullAssertion',
        },
      ],
      output: `
interface Interface {
  value: string;
}
declare const maybe: Interface | undefined;
const bar = maybe!;
      `,
    },
    {
      code: `
type T = string | null;
declare const x: T;

const y = x as NonNullable<T>;
      `,
      errors: [
        {
          column: 11,
          line: 5,
          messageId: 'preferNonNullAssertion',
        },
      ],
      output: `
type T = string | null;
declare const x: T;

const y = x!;
      `,
    },
    {
      code: `
type T = string | null | undefined;
declare const x: T;

const y = x as NonNullable<T>;
      `,
      errors: [
        {
          column: 11,
          line: 5,
          messageId: 'preferNonNullAssertion',
        },
      ],
      output: `
type T = string | null | undefined;
declare const x: T;

const y = x!;
      `,
    },
  ],
});

const ruleTesterWithNoUncheckedIndexAccess = new RuleTester({
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: getFixturesRootDir(),
    project: './tsconfig.noUncheckedIndexedAccess.json',
  },
  parser: '@typescript-eslint/parser',
  dependencyConstraints: {
    typescript: '4.1',
  },
});

ruleTesterWithNoUncheckedIndexAccess.run(
  'non-nullable-type-assertion-style - noUncheckedIndexedAccess',
  rule,
  {
    valid: [
      `
function first<T>(array: ArrayLike<T>): T | null {
  return array.length > 0 ? (array[0] as T) : null;
}
      `,
      `
function first<T extends string | null>(array: ArrayLike<T>): T | null {
  return array.length > 0 ? (array[0] as T) : null;
}
      `,
      `
function first<T extends string | undefined>(array: ArrayLike<T>): T | null {
  return array.length > 0 ? (array[0] as T) : null;
}
      `,
      `
function first<T extends string | null | undefined>(
  array: ArrayLike<T>,
): T | null {
  return array.length > 0 ? (array[0] as T) : null;
}
      `,
      `
type A = 'a' | 'A';
type B = 'b' | 'B';
function first<T extends A | B | null>(array: ArrayLike<T>): T | null {
  return array.length > 0 ? (array[0] as T) : null;
}
      `,
    ],
    invalid: [
      {
        code: `
function first<T extends string | number>(array: ArrayLike<T>): T | null {
  return array.length > 0 ? (array[0] as T) : null;
}
        `,
        errors: [
          {
            column: 30,
            line: 3,
            messageId: 'preferNonNullAssertion',
          },
        ],
        output: `
function first<T extends string | number>(array: ArrayLike<T>): T | null {
  return array.length > 0 ? (array[0]!) : null;
}
        `,
      },
    ],
  },
);
