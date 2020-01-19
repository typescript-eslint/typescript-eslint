import rule from '../../src/rules/consistent-type-definitions';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('consistent-type-definitions', rule, {
  valid: [
    {
      code: `var foo = { };`,
      options: ['interface'],
    },
    {
      code: `interface A {}`,
      options: ['interface'],
    },
    {
      code: `interface A extends B { x: number; }`,
      options: ['interface'],
    },
    {
      code: `type U = string;`,
      options: ['interface'],
    },
    {
      code: `type V = { x: number; } | { y: string; };`,
      options: ['interface'],
    },
    {
      code: `
type Record<T, U> = {
    [K in T]: U;
}
`,
      options: ['interface'],
    },
    {
      code: `type T = { x: number; }`,
      options: ['type'],
    },
    {
      code: `type A = { x: number; } & B & C;`,
      options: ['type'],
    },
    {
      code: `type A = { x: number; } & B<T1> & C<T2>;`,
      options: ['type'],
    },
    {
      code: `
export type W<T> = {
    x: T,
};
`,
      options: ['type'],
    },
  ],
  invalid: [
    {
      code: `type T = { x: number; };`,
      output: `interface T { x: number; }`,
      options: ['interface'],
      errors: [
        {
          messageId: 'interfaceOverType',
          line: 1,
          column: 6,
        },
      ],
    },
    {
      code: `type T={ x: number; };`,
      output: `interface T { x: number; }`,
      options: ['interface'],
      errors: [
        {
          messageId: 'interfaceOverType',
          line: 1,
          column: 6,
        },
      ],
    },
    {
      code: `type T=                         { x: number; };`,
      output: `interface T { x: number; }`,
      options: ['interface'],
      errors: [
        {
          messageId: 'interfaceOverType',
          line: 1,
          column: 6,
        },
      ],
    },
    {
      code: `
export type W<T> = {
    x: T,
};
`,
      output: `
export interface W<T> {
    x: T,
}
`,
      options: ['interface'],
      errors: [
        {
          messageId: 'interfaceOverType',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: `interface T { x: number; }`,
      output: `type T = { x: number; }`,
      options: ['type'],
      errors: [
        {
          messageId: 'typeOverInterface',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `interface T{ x: number; }`,
      output: `type T = { x: number; }`,
      options: ['type'],
      errors: [
        {
          messageId: 'typeOverInterface',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `interface T                          { x: number; }`,
      output: `type T = { x: number; }`,
      options: ['type'],
      errors: [
        {
          messageId: 'typeOverInterface',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `interface A extends B, C { x: number; };`,
      output: `type A = { x: number; } & B & C;`,
      options: ['type'],
      errors: [
        {
          messageId: 'typeOverInterface',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `interface A extends B<T1>, C<T2> { x: number; };`,
      output: `type A = { x: number; } & B<T1> & C<T2>;`,
      options: ['type'],
      errors: [
        {
          messageId: 'typeOverInterface',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `
export interface W<T> {
    x: T,
};
`,
      output: `
export type W<T> = {
    x: T,
};
`,
      options: ['type'],
      errors: [
        {
          messageId: 'typeOverInterface',
          line: 2,
          column: 18,
        },
      ],
    },
  ],
});
