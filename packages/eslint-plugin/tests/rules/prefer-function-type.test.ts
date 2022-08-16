import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import rule, { phrases } from '../../src/rules/prefer-function-type';
import { noFormat, RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
  },
  parser: '@typescript-eslint/parser',
});
ruleTester.run('prefer-function-type', rule, {
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
        },
      ],
      output: `
type Foo<T> = (bar: T) => string;
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
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
          messageId: 'unexpectedThisOnFunctionOnlyInterface',
          type: AST_NODE_TYPES.TSThisType,
          data: {
            interfaceName: 'Foo',
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  (arg: number): this | undefined;
}
      `,
      errors: [
        {
          messageId: 'unexpectedThisOnFunctionOnlyInterface',
          type: AST_NODE_TYPES.TSThisType,
          data: {
            interfaceName: 'Foo',
          },
        },
      ],
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
        },
      ],
      output: noFormat`
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
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
        },
      ],
      output: noFormat`
type X = {} | (() => void)
      `,
    },
    {
      code: noFormat`
type X = {} & { (): void; };
      `,
      errors: [
        {
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
        },
      ],
      output: noFormat`
type X = {} & (() => void);
      `,
    },
  ],
});
