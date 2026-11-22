import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule, { phrases } from '../../src/rules/prefer-function-type';

const ruleTester = new RuleTester();

ruleTester.run('prefer-function-type', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    `
interface Foo {
  (): void;
  bar: number;
}
    `,
    `
type Foo = {
  (): void;
  bar: number;
};
    `,
    `
function foo(bar: { (): string; baz: number }): string {
  return bar();
}
    `,
    `
interface Foo {
  bar: string;
}
interface Bar extends Foo {
  (): void;
}
    `,
    `
interface Foo {
  bar: string;
}
interface Bar extends Function, Foo {
  (): void;
}
    `,
    `
interface Foo {
  bar(): void;
}
    `,
    `
type Foo = {
  ();
};
    `,
    `
interface Foo {
  (): void;
}
interface Foo {
  bar: string;
}
    `,
    `
interface Foo {
  (): void;
}
class Foo {}
    `,
    `
interface Foo {
  (): void;
}
declare class Foo {}
    `,
    `
interface Foo<T> {
  (): T;
}
interface Foo<T> {
  bar: T;
}
    `,
    `
declare global {
  interface Foo {
    (): void;
  }
  interface Foo {
    bar: string;
  }
}
    `,
  ],

  invalid: [
    {
      code: `
interface Foo {
  (): string;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo = () => string;
      `,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/3004
    {
      code: `
export default interface Foo {
  /** comment */
  (): string;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: null,
    },
    {
      code: `
interface Foo {
  // comment
  (): string;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
// comment
type Foo = () => string;
      `,
    },
    {
      code: `
export interface Foo {
  /** comment */
  (): string;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
/** comment */
export type Foo = () => string;
      `,
    },
    {
      code: `
export interface Foo {
  // comment
  (): string;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
// comment
export type Foo = () => string;
      `,
    },
    {
      code: `
function foo(bar: { /* comment */ (s: string): number } | undefined): number {
  return bar('hello');
}
      `,
      errors: [
        {
          column: 35,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 54,
          endLine: 2,
          line: 2,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
function foo(bar: /* comment */ ((s: string) => number) | undefined): number {
  return bar('hello');
}
      `,
    },
    {
      code: `
type Foo = {
  (): string;
};
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo = () => string;
      `,
    },
    {
      code: `
function foo(bar: { (s: string): number }): number {
  return bar('hello');
}
      `,
      errors: [
        {
          column: 21,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 40,
          endLine: 2,
          line: 2,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
function foo(bar: (s: string) => number): number {
  return bar('hello');
}
      `,
    },
    {
      code: `
function foo(bar: { (s: string): number } | undefined): number {
  return bar('hello');
}
      `,
      errors: [
        {
          column: 21,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 40,
          endLine: 2,
          line: 2,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
function foo(bar: ((s: string) => number) | undefined): number {
  return bar('hello');
}
      `,
    },
    {
      code: `
interface Foo extends Function {
  (): void;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo = () => void;
      `,
    },
    {
      code: `
interface Foo<T> {
  (bar: T): string;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo<T> = (bar: T) => string;
      `,
    },
    {
      code: `
interface Foo<Foo> {
  (bar: Foo): string;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo<Foo> = (bar: Foo) => string;
      `,
    },
    {
      code: `
interface Foo<T> {
  (this: T): void;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo<T> = (this: T) => void;
      `,
    },
    {
      code: `
type Foo<T> = { (this: string): T };
      `,
      errors: [
        {
          column: 17,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 34,
          endLine: 2,
          line: 2,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo<T> = (this: string) => T;
      `,
    },
    {
      code: `
interface Foo {
  (arg: this): void;
}
      `,
      errors: [
        {
          column: 9,
          data: {
            interfaceName: 'Foo',
          },
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'unexpectedThisOnFunctionOnlyInterface',
        },
      ],
      output: null,
    },
    {
      code: `
interface Foo {
  (arg: number): this | undefined;
}
      `,
      errors: [
        {
          column: 18,
          data: {
            interfaceName: 'Foo',
          },
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'unexpectedThisOnFunctionOnlyInterface',
        },
      ],
      output: null,
    },
    {
      code: `
// isn't actually valid ts but want to not give message saying it refers to Foo.
interface Foo {
  (): {
    a: {
      nested: this;
    };
    between: this;
    b: {
      nested: string;
    };
  };
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 5,
          endLine: 12,
          line: 4,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
// isn't actually valid ts but want to not give message saying it refers to Foo.
type Foo = () => {
    a: {
      nested: this;
    };
    between: this;
    b: {
      nested: string;
    };
  };
      `,
    },
    {
      code: noFormat`
type X = {} | { (): void; }
      `,
      errors: [
        {
          column: 17,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 26,
          endLine: 2,
          line: 2,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type X = {} | (() => void)
      `,
    },
    {
      code: noFormat`
type X = {} & { (): void; };
      `,
      errors: [
        {
          column: 17,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 26,
          endLine: 2,
          line: 2,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type X = {} & (() => void);
      `,
    },
    {
      code: `
type Foo = {
  new (): Foo;
};
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo = new () => Foo;
      `,
    },
    {
      code: `
interface Foo {
  (): void;
}
function Foo() {}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo = () => void;
function Foo() {}
      `,
    },
    {
      code: `
interface Foo {
  (): void; // comment
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
// comment
type Foo = () => void;
      `,
    },
    {
      code: `
type Foo = {
  (): void; // comment
};
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo = // comment
() => void;
      `,
    },
    {
      code: `
interface Foo {
  // first
  (): void; // second
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 12,
          endLine: 4,
          line: 4,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
// first
// second
type Foo = () => void;
      `,
    },
    {
      code: noFormat`
type Foo = { (): void, };
      `,
      errors: [
        {
          column: 14,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 23,
          endLine: 2,
          line: 2,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo = () => void;
      `,
    },
    {
      code: `
type Foo = [{ (): void }?];
      `,
      errors: [
        {
          column: 15,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 23,
          endLine: 2,
          line: 2,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo = [(() => void)?];
      `,
    },
    {
      code: `
type Foo = keyof { (): void };
      `,
      errors: [
        {
          column: 20,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo = keyof (() => void);
      `,
    },
    {
      code: `
type Foo = { (): void }['call'];
      `,
      errors: [
        {
          column: 14,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 22,
          endLine: 2,
          line: 2,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo = (() => void)['call'];
      `,
    },
    {
      code: `
type Foo = Bar[{ (): void }];
      `,
      errors: [
        {
          column: 18,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 26,
          endLine: 2,
          line: 2,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo = Bar[() => void];
      `,
    },
    {
      code: `
type Foo = { (): void } extends Bar ? 1 : 2;
      `,
      errors: [
        {
          column: 14,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 22,
          endLine: 2,
          line: 2,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo = (() => void) extends Bar ? 1 : 2;
      `,
    },
    {
      code: `
type Foo<T> = T extends { (): void } ? 1 : 2;
      `,
      errors: [
        {
          column: 27,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 35,
          endLine: 2,
          line: 2,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
type Foo<T> = T extends () => void ? 1 : 2;
      `,
    },
    {
      code: `
interface Foo {
  /* comment */
  (): void;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 12,
          endLine: 4,
          line: 4,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
/* comment */
type Foo = () => void;
      `,
    },
    {
      code: `
export {};
declare global {
  interface Window {
    (): void;
  }
}
      `,
      errors: [
        {
          column: 5,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 14,
          endLine: 5,
          line: 5,
          messageId: 'functionTypeOverCallableType',
          suggestions: [
            {
              messageId: 'replaceWithFunctionType',
              output: `
export {};
declare global {
  type Window = () => void;
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
export {};
declare global {
  namespace NodeJS {
    interface Callback {
      (): void;
    }
  }
}
      `,
      errors: [
        {
          column: 7,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 16,
          endLine: 6,
          line: 6,
          messageId: 'functionTypeOverCallableType',
          suggestions: [
            {
              messageId: 'replaceWithFunctionType',
              output: `
export {};
declare global {
  namespace NodeJS {
    type Callback = () => void;
  }
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare module 'foo' {
  interface Foo {
    (): void;
  }
}
      `,
      errors: [
        {
          column: 5,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'functionTypeOverCallableType',
          suggestions: [
            {
              messageId: 'replaceWithFunctionType',
              output: `
declare module 'foo' {
  type Foo = () => void;
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare module 'foo' {
  export interface Foo {
    (): void;
  }
}
      `,
      errors: [
        {
          column: 5,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'functionTypeOverCallableType',
          suggestions: [
            {
              messageId: 'replaceWithFunctionType',
              output: `
declare module 'foo' {
  export type Foo = () => void;
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare namespace Space {
  interface Foo {
    (): void;
  }
}
      `,
      errors: [
        {
          column: 5,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'functionTypeOverCallableType',
          suggestions: [
            {
              messageId: 'replaceWithFunctionType',
              output: `
declare namespace Space {
  type Foo = () => void;
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
namespace Space {
  export interface Foo {
    (): void;
  }
}
      `,
      errors: [
        {
          column: 5,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'functionTypeOverCallableType',
          suggestions: [
            {
              messageId: 'replaceWithFunctionType',
              output: `
namespace Space {
  export type Foo = () => void;
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
namespace Space {
  interface Foo {
    (): void;
  }
}
      `,
      errors: [
        {
          column: 5,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
namespace Space {
  type Foo = () => void;
}
      `,
    },
    {
      code: `
interface Foo {
  (): void;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'functionTypeOverCallableType',
          suggestions: [
            {
              messageId: 'replaceWithFunctionType',
              output: `
type Foo = () => void;
      `,
            },
          ],
        },
      ],
      filename: 'test.d.ts',
      output: null,
    },
    {
      code: `
namespace Foo {
  export const value = 1;
}
interface Foo {
  (): void;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
namespace Foo {
  export const value = 1;
}
type Foo = () => void;
      `,
    },
    {
      code: `
export {};
declare global {
  type Foo = { (): void };
}
      `,
      errors: [
        {
          column: 16,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'functionTypeOverCallableType',
        },
      ],
      output: `
export {};
declare global {
  type Foo = () => void;
}
      `,
    },
  ],
});
