import path from 'path';
import rule from '../../src/rules/non-nullable-type-assertion-style';
import { RuleTester } from '../RuleTester';

const rootDir = path.resolve(__dirname, '../fixtures/');
const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootDir,
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
