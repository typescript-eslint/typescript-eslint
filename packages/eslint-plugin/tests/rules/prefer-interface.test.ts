import rule from '../../src/rules/prefer-interface';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('interface-over-type-literal', rule, {
  valid: [
    `var foo = { };`,
    `type U = string;`,
    `type V = { x: number; } | { y: string; };`,
    `
type Record<T, U> = {
    [K in T]: U;
}
        `,
  ],
  invalid: [
    {
      code: `type T = { x: number; }`,
      output: `interface T { x: number; }`,
      errors: [
        {
          messageId: 'interfaceOverType',
          line: 1,
          column: 6,
        },
      ],
    },
    {
      code: `type T={ x: number; }`,
      output: `interface T { x: number; }`,
      errors: [
        {
          messageId: 'interfaceOverType',
          line: 1,
          column: 6,
        },
      ],
    },
    {
      code: `type T=                         { x: number; }`,
      output: `interface T { x: number; }`,
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
      errors: [
        {
          messageId: 'interfaceOverType',
          line: 2,
          column: 13,
        },
      ],
    },
  ],
});
