import rule from '../../src/rules/consistent-type-definitions';
import { noFormat, RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('consistent-type-definitions', rule, {
  valid: [
    {
      code: 'var foo = {};',
      options: ['interface'],
    },
    {
      code: 'interface A {}',
      options: ['interface'],
    },
    {
      code: `
interface A extends B {
  x: number;
}
      `,
      options: ['interface'],
    },
    {
      code: 'type U = string;',
      options: ['interface'],
    },
    {
      code: 'type V = { x: number } | { y: string };',
      options: ['interface'],
    },
    {
      code: `
type Record<T, U> = {
  [K in T]: U;
};
      `,
      options: ['interface'],
    },
    {
      code: 'type T = { x: number };',
      options: ['type'],
    },
    {
      code: 'type A = { x: number } & B & C;',
      options: ['type'],
    },
    {
      code: 'type A = { x: number } & B<T1> & C<T2>;',
      options: ['type'],
    },
    {
      code: `
export type W<T> = {
  x: T;
};
      `,
      options: ['type'],
    },
  ],
  invalid: [
    {
      code: noFormat`type T = { x: number; };`,
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
      code: noFormat`type T={ x: number; };`,
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
      code: noFormat`type T=                         { x: number; };`,
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
  x: T;
};
      `,
      output: `
export interface W<T> {
  x: T;
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
      code: noFormat`interface T { x: number; }`,
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
      code: noFormat`interface T{ x: number; }`,
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
      code: noFormat`interface T                          { x: number; }`,
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
      code: noFormat`interface A extends B, C { x: number; };`,
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
      code: noFormat`interface A extends B<T1>, C<T2> { x: number; };`,
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
  x: T;
}
      `,
      output: `
export type W<T> = {
  x: T;
}
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
    {
      code: `
namespace JSX {
  interface Array<T> {
    foo(x: (x: number) => T): T[];
  }
}
      `,
      output: `
namespace JSX {
  type Array<T> = {
    foo(x: (x: number) => T): T[];
  }
}
      `,
      options: ['type'],
      errors: [
        {
          messageId: 'typeOverInterface',
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
global {
  interface Array<T> {
    foo(x: (x: number) => T): T[];
  }
}
      `,
      output: `
global {
  type Array<T> = {
    foo(x: (x: number) => T): T[];
  }
}
      `,
      options: ['type'],
      errors: [
        {
          messageId: 'typeOverInterface',
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
declare global {
  interface Array<T> {
    foo(x: (x: number) => T): T[];
  }
}
      `,
      output: null,
      options: ['type'],
      errors: [
        {
          messageId: 'typeOverInterface',
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
declare global {
  namespace Foo {
    interface Bar {}
  }
}
      `,
      output: null,
      options: ['type'],
      errors: [
        {
          messageId: 'typeOverInterface',
          line: 4,
          column: 15,
        },
      ],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/3894
      code: `
export default interface Test {
  bar(): string;
  foo(): number;
}
      `,
      output: `
type Test = {
  bar(): string;
  foo(): number;
}
export default Test
      `,
      options: ['type'],
      errors: [
        {
          messageId: 'typeOverInterface',
          line: 2,
          column: 26,
        },
      ],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/4333
      code: `
export declare type Test = {
  foo: string;
  bar: string;
};
      `,
      output: `
export declare interface Test {
  foo: string;
  bar: string;
}
      `,
      options: ['interface'],
      errors: [
        {
          messageId: 'interfaceOverType',
          line: 2,
          column: 21,
        },
      ],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/4333
      code: `
export declare interface Test {
  foo: string;
  bar: string;
}
      `,
      output: `
export declare type Test = {
  foo: string;
  bar: string;
}
      `,
      options: ['type'],
      errors: [
        {
          messageId: 'typeOverInterface',
          line: 2,
          column: 26,
        },
      ],
    },
  ],
});
