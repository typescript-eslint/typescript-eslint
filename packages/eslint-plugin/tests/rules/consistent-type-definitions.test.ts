import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/consistent-type-definitions';

const ruleTester = new RuleTester();

ruleTester.run('consistent-type-definitions', rule, {
  invalid: [
    {
      code: noFormat`type T = { x: number; };`,
      errors: [
        {
          column: 6,
          line: 1,
          messageId: 'interfaceOverType',
        },
      ],
      options: ['interface'],
      output: `interface T { x: number; }`,
    },
    {
      code: noFormat`type T={ x: number; };`,
      errors: [
        {
          column: 6,
          line: 1,
          messageId: 'interfaceOverType',
        },
      ],
      options: ['interface'],
      output: `interface T { x: number; }`,
    },
    {
      code: noFormat`type T=                         { x: number; };`,
      errors: [
        {
          column: 6,
          line: 1,
          messageId: 'interfaceOverType',
        },
      ],
      options: ['interface'],
      output: `interface T { x: number; }`,
    },
    {
      code: noFormat`type T /* comment */={ x: number; };`,
      errors: [
        {
          column: 6,
          line: 1,
          messageId: 'interfaceOverType',
        },
      ],
      options: ['interface'],
      output: `interface T /* comment */ { x: number; }`,
    },
    {
      code: `
export type W<T> = {
  x: T;
};
      `,
      errors: [
        {
          column: 13,
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      options: ['interface'],
      output: `
export interface W<T> {
  x: T;
}
      `,
    },
    {
      code: noFormat`interface T { x: number; }`,
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `type T = { x: number; }`,
    },
    {
      code: noFormat`interface T{ x: number; }`,
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `type T = { x: number; }`,
    },
    {
      code: noFormat`interface T                          { x: number; }`,
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `type T = { x: number; }`,
    },
    {
      code: noFormat`interface A extends B, C { x: number; };`,
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `type A = { x: number; } & B & C;`,
    },
    {
      code: noFormat`interface A extends B<T1>, C<T2> { x: number; };`,
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `type A = { x: number; } & B<T1> & C<T2>;`,
    },
    {
      code: `
export interface W<T> {
  x: T;
}
      `,
      errors: [
        {
          column: 18,
          line: 2,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
export type W<T> = {
  x: T;
}
      `,
    },
    {
      code: `
namespace JSX {
  interface Array<T> {
    foo(x: (x: number) => T): T[];
  }
}
      `,
      errors: [
        {
          column: 13,
          line: 3,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
namespace JSX {
  type Array<T> = {
    foo(x: (x: number) => T): T[];
  }
}
      `,
    },
    {
      code: `
global {
  interface Array<T> {
    foo(x: (x: number) => T): T[];
  }
}
      `,
      errors: [
        {
          column: 13,
          line: 3,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
global {
  type Array<T> = {
    foo(x: (x: number) => T): T[];
  }
}
      `,
    },
    {
      code: `
declare global {
  interface Array<T> {
    foo(x: (x: number) => T): T[];
  }
}
      `,
      errors: [
        {
          column: 13,
          line: 3,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      code: `
declare global {
  namespace Foo {
    interface Bar {}
  }
}
      `,
      errors: [
        {
          column: 15,
          line: 4,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: null,
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/3894
      code: `
export default interface Test {
  bar(): string;
  foo(): number;
}
      `,
      errors: [
        {
          column: 26,
          line: 2,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
type Test = {
  bar(): string;
  foo(): number;
}
export default Test
      `,
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/4333
      code: `
export declare type Test = {
  foo: string;
  bar: string;
};
      `,
      errors: [
        {
          column: 21,
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      options: ['interface'],
      output: `
export declare interface Test {
  foo: string;
  bar: string;
}
      `,
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/4333
      code: `
export declare interface Test {
  foo: string;
  bar: string;
}
      `,
      errors: [
        {
          column: 26,
          line: 2,
          messageId: 'typeOverInterface',
        },
      ],
      options: ['type'],
      output: `
export declare type Test = {
  foo: string;
  bar: string;
}
      `,
    },
    {
      code: noFormat`
type Foo = ({
  a: string;
});
      `,
      errors: [
        {
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      output: `
interface Foo {
  a: string;
}
      `,
    },
    {
      code: noFormat`
type Foo = ((((((((({
  a: string;
})))))))));
      `,
      errors: [
        {
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      output: `
interface Foo {
  a: string;
}
      `,
    },
    {
      // no closing semicolon
      code: noFormat`
type Foo = {
  a: string;
}
      `,
      errors: [
        {
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      output: `
interface Foo {
  a: string;
}
      `,
    },
    {
      // no closing semicolon; ensure we don't erase subsequent code.
      code: noFormat`
type Foo = {
  a: string;
}
type Bar = string;
      `,
      errors: [
        {
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      output: `
interface Foo {
  a: string;
}
type Bar = string;
      `,
    },
    {
      // no closing semicolon; ensure we don't erase subsequent code.
      code: noFormat`
type Foo = ((({
  a: string;
})))

const bar = 1;
      `,
      errors: [
        {
          line: 2,
          messageId: 'interfaceOverType',
        },
      ],
      output: `
interface Foo {
  a: string;
}

const bar = 1;
      `,
    },
  ],
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
});
