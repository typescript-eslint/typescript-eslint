import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import rule from '../../src/rules/prefer-function-type';
import { RuleTester } from '../RuleTester';

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
}`,
    `
type Foo = {
  (): void;
  bar: number;
}`,
    `
function foo(bar: { (): string, baz: number }): string {
  return bar();
}`,
    `
interface Foo {
  bar: string;
}
interface Bar extends Foo {
  (): void;
}`,
    `
interface Foo {
  bar: string;
}
interface Bar extends Function, Foo {
  (): void;
}`,
  ],

  invalid: [
    {
      code: `
interface Foo {
  (): string;
}`,
      errors: [
        {
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
        },
      ],
      output: `
type Foo = () => string;`,
    },
    {
      code: `
type Foo = {
  (): string;
}`,
      errors: [
        {
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
        },
      ],
      output: `
type Foo = () => string`,
    },
    {
      code: `
function foo(bar: { (s: string): number }): number {
  return bar("hello");
}`,
      errors: [
        {
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
        },
      ],
      output: `
function foo(bar: (s: string) => number): number {
  return bar("hello");
}`,
    },
    {
      code: `
function foo(bar: { (s: string): number } | undefined): number {
  return bar("hello");
}`,
      errors: [
        {
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
        },
      ],
      output: `
function foo(bar: ((s: string) => number) | undefined): number {
  return bar("hello");
}`,
    },
    {
      code: `
interface Foo extends Function {
  (): void;
}`,
      errors: [
        {
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
        },
      ],
      output: `
type Foo = () => void;`,
    },
    {
      code: `
interface Foo<T> {
  (bar: T): string;
}`,
      errors: [
        {
          messageId: 'functionTypeOverCallableType',
          type: AST_NODE_TYPES.TSCallSignatureDeclaration,
        },
      ],
      output: `
type Foo<T> = (bar: T) => string;`,
    },
  ],
});
