/**
 * @fileoverview Use function types instead of interfaces with call signatures
 * @author Benjamin Lichtman
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../lib/rules/prefer-function-type'),
  RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const parserOptions = {
  ecmaVersion: 2015
};
var ruleTester = new RuleTester({
  parserOptions,
  parser: '@typescript-eslint/parser'
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
}`
  ],

  invalid: [
    {
      code: `
interface Foo {
  (): string;
}`,
      errors: [
        {
          messageId: 'callableTypeViolation',
          type: 'TSCallSignatureDeclaration'
        }
      ],
      output: `
type Foo = () => string;`
    },
    {
      code: `
type Foo = {
  (): string;
}`,
      errors: [
        {
          messageId: 'callableTypeViolation',
          type: 'TSCallSignatureDeclaration'
        }
      ],
      output: `
type Foo = () => string`
    },
    {
      code: `
function foo(bar: { (s: string): number }): number {
  return bar("hello");
}`,
      errors: [
        {
          messageId: 'callableTypeViolation',
          type: 'TSCallSignatureDeclaration'
        }
      ],
      output: `
function foo(bar: (s: string) => number): number {
  return bar("hello");
}`
    },
    {
      code: `
function foo(bar: { (s: string): number } | undefined): number {
  return bar("hello");
}`,
      errors: [
        {
          messageId: 'callableTypeViolation',
          type: 'TSCallSignatureDeclaration'
        }
      ],
      output: `
function foo(bar: ((s: string) => number) | undefined): number {
  return bar("hello");
}`
    },
    {
      code: `
interface Foo extends Function {
  (): void;
}`,
      errors: [
        {
          messageId: 'callableTypeViolation',
          type: 'TSCallSignatureDeclaration'
        }
      ],
      output: `
type Foo = () => void;`
    },
    {
      code: `
interface Foo<T> {
  (bar: T): string;
}`,
      errors: [
        {
          messageId: 'callableTypeViolation',
          type: 'TSCallSignatureDeclaration'
        }
      ],
      output: `
type Foo<T> = (bar: T) => string;`
    }
  ]
});
