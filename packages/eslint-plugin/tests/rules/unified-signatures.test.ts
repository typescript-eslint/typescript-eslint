import rule from '../../src/rules/unified-signatures';
import { RuleTester } from '../RuleTester';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parser: '@typescript-eslint/parser' });

ruleTester.run('unified-signatures', rule, {
  valid: [
    `
function g(): void;
function g(a: number, b: number): void;
function g(a?: number, b?: number): void {}
    `,
    `
function rest(...xs: number[]): void;
function rest(xs: number[], y: string): void;
function rest(...args: any[]) {}
    `,
    `
class C {
  constructor();
  constructor(a: number, b: number);
  constructor(a?: number, b?: number) {}

  a(): void;
  a(a: number, b: number): void;
  a(a?: number, b?: number): void {}
}
    `,
    // No error for arity difference greater than 1.
    `
interface I {
  a2(): void;
  a2(x: number, y: number): void;
}
    `,
    // No error for different return types.
    `
interface I {
  a4(): void;
  a4(x: number): number;
}
    `,
    // No error if one takes a type parameter and the other doesn't.
    `
interface I {
  a5<T>(x: T): T;
  a5(x: number): number;
}
    `,
    // No error if one is a rest parameter and other isn't.
    `
interface I {
  b2(x: string): void;
  b2(...x: number[]): void;
}
    `,
    // No error if both are rest parameters. (https://github.com/Microsoft/TypeScript/issues/5077)
    `
interface I {
  b3(...x: number[]): void;
  b3(...x: string[]): void;
}
    `,
    // No error if one is optional and the other isn't.
    `
interface I {
  c3(x: number): void;
  c3(x?: string): void;
}
    `,
    // No error if they differ by 2 or more parameters.
    `
interface I {
  d2(x: string, y: number): void;
  d2(x: number, y: string): void;
}
    `,
    // No conflict between static/non-static members.
    `
declare class D {
  static a();
  a(x: number);
}
    `,
    // Allow separate overloads if one is generic and the other isn't.
    `
interface Generic<T> {
  x(): void;
  x(x: T[]): void;
}
    `,
    // Allow signatures if the type is not equal.
    `
interface I {
  f(x1: number): void;
  f(x1: boolean, x2?: number): void;
}
    `,
    // AllowType parameters that are not equal
    `
function f<T extends number>(x: T[]): void;
function f<T extends string>(x: T): void;
    `,
    // Same name, different scopes
    `
declare function foo(n: number): number;

declare module 'hello' {
  function foo(n: number, s: string): number;
}
    `,
    // children of block not checked to match TSLint
    `
{
  function block(): number;
  function block(n: number): number;
  function block(n?: number): number {
    return 3;
  }
}
    `,
    `
export interface Foo {
  bar(baz: string): number[];
  bar(): string[];
}
    `,
    `
declare module 'foo' {
  export default function (foo: number): string[];
}
    `,
    `
export default function (foo: number): string[];
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/740
    `
function p(key: string): Promise<string | undefined>;
function p(key: string, defaultValue: string): Promise<string>;
function p(key: string, defaultValue?: string): Promise<string | undefined> {
  const obj: Record<string, string> = {};
  return obj[key] || defaultValue;
}
    `,
    `
interface I {
  p<T>(x: T): Promise<T>;
  p(x: number): Promise<number>;
}
    `,
    `
function rest(...xs: number[]): Promise<number[]>;
function rest(xs: number[], y: string): Promise<string>;
async function rest(...args: any[], y?: string): Promise<number[] | string> {
  return y || args;
}
    `,
  ],
  invalid: [
    {
      code: `
function f(x: number): void;
function f(x: string): void;
function f(x: any): any {
  return x;
}
      `,
      errors: [
        {
          messageId: 'singleParameterDifference',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string',
          },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
function opt(xs?: number[]): void;
function opt(xs: number[], y: string): void;
function opt(...args: any[]) {}
      `,
      errors: [
        {
          messageId: 'omittingSingleParameter',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 3,
          column: 28,
        },
      ],
    },
    {
      // For 3 or more overloads, mentions the line.
      code: `
interface I {
  a0(): void;
  a0(x: string): string;
  a0(x: number): void;
}
      `,
      errors: [
        {
          messageId: 'omittingSingleParameter',
          data: {
            failureStringStart:
              'This overload and the one on line 3 can be combined into one signature',
          },
          line: 5,
          column: 6,
        },
      ],
    },
    {
      // Error for extra parameter.
      code: `
interface I {
  a1(): void;
  a1(x: number): void;
}
      `,
      errors: [
        {
          messageId: 'omittingSingleParameter',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          column: 6,
        },
      ],
    },
    {
      // Error for arity difference greater than 1 if the additional parameters are all optional/rest.
      code: `
interface I {
  a3(): void;
  a3(x: number, y?: number, ...z: number[]): void;
}
      `,
      errors: [
        {
          messageId: 'omittingRestParameter',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          column: 29,
        },
      ],
    },
    {
      // Error if only one defines a rest parameter.
      code: `
interface I {
  b(): void;
  b(...x: number[]): void;
}
      `,
      errors: [
        {
          messageId: 'omittingRestParameter',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          column: 5,
        },
      ],
    },
    {
      // Error if only one defines an optional parameter.
      code: `
interface I {
  c(): void;
  c(x?: number): void;
}
      `,
      errors: [
        {
          messageId: 'omittingSingleParameter',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          column: 5,
        },
      ],
    },
    {
      // Error if both are optional.
      code: `
interface I {
  c2(x?: number): void;
  c2(x?: string): void;
}
      `,
      errors: [
        {
          messageId: 'singleParameterDifference',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string',
          },
          line: 4,
          column: 6,
        },
      ],
    },
    {
      // Error for different types (could be a union)
      code: `
interface I {
  d(x: number): void;
  d(x: string): void;
}
      `,
      errors: [
        {
          messageId: 'singleParameterDifference',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string',
          },
          line: 4,
          column: 5,
        },
      ],
    },
    {
      // Works for type literal and call signature too.
      code: `
type T = {
  (): void;
  (x: number): void;
};
      `,
      errors: [
        {
          messageId: 'omittingSingleParameter',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          column: 4,
        },
      ],
    },
    {
      // Works for constructor.
      code: `
declare class C {
  constructor();
  constructor(x: number);
}
      `,
      errors: [
        {
          messageId: 'omittingSingleParameter',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          column: 15,
        },
      ],
    },
    {
      // Works with unions.
      code: `
interface I {
  f(x: number);
  f(x: string | boolean);
}
      `,
      errors: [
        {
          messageId: 'singleParameterDifference',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string | boolean',
          },
          line: 4,
          column: 5,
        },
      ],
    },
    {
      // Works with tuples.
      code: `
interface I {
  f(x: number);
  f(x: [string, boolean]);
}
      `,
      errors: [
        {
          messageId: 'singleParameterDifference',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: '[string, boolean]',
          },
          line: 4,
          column: 5,
        },
      ],
    },
    {
      code: `
interface Generic<T> {
  y(x: T[]): void;
  y(x: T): void;
}
      `,
      errors: [
        {
          messageId: 'singleParameterDifference',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'T[]',
            type2: 'T',
          },
          line: 4,
          column: 5,
        },
      ],
    },
    {
      // Check type parameters when equal
      code: `
function f<T>(x: T[]): void;
function f<T>(x: T): void;
      `,
      errors: [
        {
          messageId: 'singleParameterDifference',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'T[]',
            type2: 'T',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      // Verifies type parameters and constraints
      code: `
function f<T extends number>(x: T[]): void;
function f<T extends number>(x: T): void;
      `,
      errors: [
        {
          messageId: 'singleParameterDifference',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'T[]',
            type2: 'T',
          },
          line: 3,
          column: 30,
        },
      ],
    },
    {
      // Works with abstract
      code: `
abstract class Foo {
  public abstract f(x: number): void;
  public abstract f(x: string): void;
}
      `,
      errors: [
        {
          messageId: 'singleParameterDifference',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string',
          },
          line: 4,
          column: 21,
        },
      ],
    },
    {
      // Works with literals
      code: `
interface Foo {
  'f'(x: string): void;
  'f'(x: number): void;
}
      `,
      errors: [
        {
          messageId: 'singleParameterDifference',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'string',
            type2: 'number',
          },
          line: 4,
          column: 7,
        },
      ],
    },
    {
      // Works with new constructor
      code: `
interface Foo {
  new (x: string): Foo;
  new (x: number): Foo;
}
      `,
      errors: [
        {
          messageId: 'singleParameterDifference',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'string',
            type2: 'number',
          },
          line: 4,
          column: 8,
        },
      ],
    },
    {
      // Works with new computed properties
      code: `
enum Enum {
  Func = 'function',
}

interface IFoo {
  [Enum.Func](x: string): void;
  [Enum.Func](x: number): void;
}
      `,
      errors: [
        {
          messageId: 'singleParameterDifference',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'string',
            type2: 'number',
          },
          line: 8,
          column: 15,
        },
      ],
    },
    {
      // Works with parameter properties. Note that this is invalid TypeScript syntax.
      code: `
class Foo {
  constructor(readonly x: number);
  constructor(readonly x: string);
}
      `,
      errors: [
        {
          messageId: 'singleParameterDifference',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string',
          },
          line: 4,
          column: 15,
        },
      ],
    },
    {
      // Works with parameter properties. Note that this is invalid TypeScript syntax.
      code: `
class Foo {
  constructor(readonly x: number);
  constructor(readonly x: number, readonly y: string);
}
      `,
      errors: [
        {
          messageId: 'omittingSingleParameter',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          column: 35,
        },
      ],
    },
    {
      // Works with parameter properties. Note that this is invalid TypeScript syntax.
      code: `
class Foo {
  constructor(readonly x: number);
  constructor(readonly x: number, readonly y?: string, readonly z?: string);
}
      `,
      errors: [
        {
          messageId: 'omittingSingleParameter',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          column: 56,
        },
      ],
    },
    {
      code: `
export function foo(line: number): number;
export function foo(line: number, character?: number): number;
      `,
      errors: [
        {
          messageId: 'omittingSingleParameter',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 3,
          column: 35,
        },
      ],
    },
    {
      code: `
declare function foo(line: number): number;
export function foo(line: number, character?: number): number;
      `,
      errors: [
        {
          messageId: 'omittingSingleParameter',
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 3,
          column: 35,
        },
      ],
    },
    {
      code: `
declare module 'foo' {
  export default function (foo: number): string[];
  export default function (foo: number, bar?: string): string[];
}
      `,
      errors: [
        {
          messageId: 'omittingSingleParameter',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
export default function (foo: number): string[];
export default function (foo: number, bar?: string): string[];
      `,
      errors: [
        {
          messageId: 'omittingSingleParameter',
          line: 3,
          column: 39,
        },
      ],
    },
  ],
});
