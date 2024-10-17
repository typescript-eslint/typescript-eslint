import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule, { phrases } from '../../src/rules/prefer-function-type';

const ruleTester = new RuleTester();

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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            interfaceName: 'Foo',
          },
          messageId: 'unexpectedThisOnFunctionOnlyInterface',
          type: AST_NODE_TYPES.TSThisType,
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
          data: {
            interfaceName: 'Foo',
          },
          messageId: 'unexpectedThisOnFunctionOnlyInterface',
          type: AST_NODE_TYPES.TSThisType,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSInterfaceDeclaration],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
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
          data: {
            literalOrInterface: phrases[AST_NODE_TYPES.TSTypeLiteral],
          },
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
        },
      ],
      output: `
type X = {} & (() => void);
      `,
    },
  ],
});
