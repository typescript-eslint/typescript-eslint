import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/unified-signatures';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

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
    `
declare class Example {
  privateMethod(a: number): void;
  #privateMethod(a: number, b?: string): void;
}
    `,
    `
declare class Example {
  #privateMethod1(a: number): void;
  #privateMethod2(a: number, b?: string): void;
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
    // Type parameters with different constraints must not be unified, even when
    // they are named differently.
    // https://github.com/typescript-eslint/typescript-eslint/issues/12143
    `
type A = 1 | 2;
type B = 3 | 4;
function f<T extends A>(x: T, y: string): void;
function f<R extends B>(x: R): void;
    `,
    // Type parameters with different constraints must not be unified, even when
    // they share a name.
    // https://github.com/typescript-eslint/typescript-eslint/issues/12143
    `
type A = 1 | 2;
type B = 3 | 4;
function f<T extends A>(x: T, y: string): void;
function f<T extends B>(x: T): void;
    `,
    // Type parameters with different defaults must not be unified.
    `
function f<T extends string = 'a'>(x: T, y: string): void;
function f<R extends string = 'b'>(x: R): void;
    `,
    // Type parameters with different defaults must not be unified, even when
    // they share a name.
    `
function f<T extends string = 'a'>(x: T, y: string): void;
function f<T extends string = 'b'>(x: T): void;
    `,
    // Outer type parameters are bindings, not local placeholder names.
    `
interface Box<T> {
  f(x: T, y: string): void;
  f<U extends string>(x: U): void;
}
    `,
    // A signature's own type parameters shadow outer type parameters with the
    // same name.
    `
interface I<T> {
  m<T>(x: T): void;
  m<U>(x: T): void;
}
    `,
    // Mapped type keys shadow same-named signature type parameters.
    `
function h<K extends string>(x: { [K in 'a' | 'b']: K }, y: string): void;
function h<J extends string>(x: { [K in 'a' | 'b']: J }): void;
    `,
    // Mapped type keys shadow same-named signature type parameters in name
    // remapping too.
    `
function h<K extends string>(x: { [K in 'a' | 'b' as K]: K }, y: string): void;
function h<J extends string>(x: { [K in 'a' | 'b' as K]: J }): void;
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
    `
declare class Foo {
  get bar();
  set bar(x: number);
}
    `,
    `
interface Foo {
  get bar();
  set bar(x: number);
}
    `,
    `
abstract class Foo {
  abstract get bar();
  abstract set bar(a: unknown);
}
    `,
    {
      code: `
function f(a: number): void;
function f(b: string): void;
function f(a: number | string): void {}
      `,
      options: [{ ignoreDifferentlyNamedParameters: true }],
    },
    {
      code: `
function f(m: number): void;
function f(v: number, u: string): void;
function f(v: number, u?: string): void {}
      `,
      options: [{ ignoreDifferentlyNamedParameters: true }],
    },
    {
      code: `
function f(v: boolean): number;
function f(): string;
      `,
      options: [{ ignoreDifferentlyNamedParameters: true }],
    },
    {
      code: `
function f(v: boolean, u: boolean): number;
function f(v: boolean): string;
      `,
      options: [{ ignoreDifferentlyNamedParameters: true }],
    },
    {
      code: `
function f(v: number, u?: string): void {}
function f(v: number): void;
function f(): string;
      `,
      options: [{ ignoreDifferentlyNamedParameters: true }],
    },
    {
      code: `
function f(a: boolean, ...c: number[]): void;
function f(a: boolean, ...d: string[]): void;
function f(a: boolean, ...c: (number | string)[]): void {}
      `,
      options: [{ ignoreDifferentlyNamedParameters: true }],
    },
    {
      code: `
class C {
  constructor();
  constructor(a: number, b: number);
  constructor(c?: number, b?: number) {}

  a(): void;
  a(a: number, b: number): void;
  a(a?: number, d?: number): void {}
}
      `,
      options: [{ ignoreDifferentlyNamedParameters: true }],
    },
    {
      code: `
/** @deprecated */
declare function f(x: number): unknown;
declare function f(x: boolean): unknown;
      `,
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
declare function f(x: number): unknown;
/** @deprecated */
declare function f(x: boolean): unknown;
      `,
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
declare function f(x: number): unknown;
/** @deprecated */ declare function f(x: boolean): unknown;
      `,
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
declare function f(x: string): void;
/**
 * @async
 */
declare function f(x: boolean): void;
/**
 * @deprecate
 */
declare function f(x: number): void;
      `,
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
/**
 * @deprecate
 */
declare function f(x: string): void;
/**
 * @async
 */
declare function f(x: boolean): void;
declare function f(x: number): void;
      `,
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
/**
 * This signature does something.
 */
declare function f(x: number): void;

/**
 * This signature does something else.
 */
declare function f(x: string): void;
      `,
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
/** @deprecated */
export function f(x: number): unknown;
export function f(x: boolean): unknown;
      `,
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
/**
 * This signature does something.
 */

// some other comment
export function f(x: number): void;

/**
 * This signature does something else.
 */
export function f(x: string): void;
      `,
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
interface I {
  /**
   * This signature does something else.
   */
  f(x: number): void;
  f(x: string): void;
}
      `,
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    // invalid jsdoc comments
    {
      code: `
/* @deprecated */
declare function f(x: number): unknown;
declare function f(x: boolean): unknown;
      `,
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
/*
 * This signature does something.
 */
declare function f(x: number): unknown;
declare function f(x: boolean): unknown;
      `,
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
/**
 * This signature does something.
 **/
declare function f(x: number): unknown;
declare function f(x: boolean): unknown;
      `,

      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
class C {
  a(b: string): void;
  /**
   * @deprecate
   */
  a(b: number): void;
}
      `,
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    `
function f(): void;
function f(this: {}): void;
function f(this: void | {}): void {}
    `,
    `
function f(a: boolean): void;
function f(this: {}, a: boolean): void;
function f(this: void | {}, a: boolean): void {}
    `,
    `
function f(this: void, a: boolean): void;
function f(this: {}, a: boolean): void;
function f(this: void | {}, a: boolean): void {}
    `,
  ],
  invalid: [
    {
      code: `
function f(a: number): void;
function f(b: string): void;
function f(a: number | string): void {}
      `,
      errors: [
        {
          column: 12,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string',
          },
          line: 3,
          messageId: 'singleParameterDifference',
        },
      ],
    },
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
          column: 12,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string',
          },
          line: 3,
          messageId: 'singleParameterDifference',
        },
      ],
    },
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
          column: 12,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string',
          },
          line: 3,
          messageId: 'singleParameterDifference',
        },
      ],
      options: [{ ignoreDifferentlyNamedParameters: true }],
    },
    {
      code: `
function opt(xs?: number[]): void;
function opt(xs: number[], y: string): void;
function opt(...args: any[]) {}
      `,
      errors: [
        {
          column: 28,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 3,
          messageId: 'omittingSingleParameter',
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
          column: 6,
          data: {
            failureStringStart:
              'This overload and the one on line 3 can be combined into one signature',
          },
          line: 5,
          messageId: 'omittingSingleParameter',
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
          column: 6,
          data: {
            failureStringStart:
              'This overload and the one on line 3 can be combined into one signature',
          },
          line: 5,
          messageId: 'omittingSingleParameter',
        },
      ],
      options: [{ ignoreDifferentlyNamedParameters: true }],
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
          column: 6,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          messageId: 'omittingSingleParameter',
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
          column: 29,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          messageId: 'omittingRestParameter',
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
          column: 5,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          messageId: 'omittingRestParameter',
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
          column: 5,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          messageId: 'omittingSingleParameter',
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
          column: 6,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string',
          },
          line: 4,
          messageId: 'singleParameterDifference',
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
          column: 5,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string',
          },
          line: 4,
          messageId: 'singleParameterDifference',
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
          column: 4,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          messageId: 'omittingSingleParameter',
        },
      ],
    },
    {
      code: `
declare class Example {
  #privateMethod(a: number): void;
  #privateMethod(a: number, b?: string): void;
}
      `,
      errors: [
        {
          column: 29,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          messageId: 'omittingSingleParameter',
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
          column: 15,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 4,
          messageId: 'omittingSingleParameter',
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
          column: 5,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string | boolean',
          },
          line: 4,
          messageId: 'singleParameterDifference',
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
          column: 5,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: '[string, boolean]',
          },
          line: 4,
          messageId: 'singleParameterDifference',
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
          column: 5,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'T[]',
            type2: 'T',
          },
          line: 4,
          messageId: 'singleParameterDifference',
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
          column: 15,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'T[]',
            type2: 'T',
          },
          line: 3,
          messageId: 'singleParameterDifference',
        },
      ],
    },
    {
      // Type parameters with the same constraint should be unified even when
      // they are named differently.
      // https://github.com/typescript-eslint/typescript-eslint/issues/12143
      code: `
function f<T extends string>(x: T, y: string): void;
function f<R extends string>(x: R): void;
      `,
      errors: [
        {
          column: 36,
          endColumn: 45,
          endLine: 2,
          line: 2,
          messageId: 'omittingSingleParameter',
        },
      ],
    },
    {
      // Differently named type parameters that share a constraint should be
      // unified when nested in another type.
      code: `
function f<T extends string>(x: Array<T>, y: string): void;
function f<R extends string>(x: Array<R>): void;
      `,
      errors: [
        {
          column: 43,
          endColumn: 52,
          endLine: 2,
          line: 2,
          messageId: 'omittingSingleParameter',
        },
      ],
    },
    {
      // A later parameter should still compare equal when it uses a renamed
      // type parameter with the same constraint.
      code: `
function f<T extends string>(x: number, y: T): void;
function f<R extends string>(x: string, y: R): void;
      `,
      errors: [
        {
          column: 30,
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'singleParameterDifference',
        },
      ],
    },
    {
      // Multiple renamed type parameters with matching constraints should be
      // compared by position.
      code: `
function f<T extends string, U extends number>(x: Map<T, U>, y: string): void;
function f<R extends string, S extends number>(x: Map<R, S>): void;
      `,
      errors: [
        {
          column: 62,
          endColumn: 71,
          endLine: 2,
          line: 2,
          messageId: 'omittingSingleParameter',
        },
      ],
    },
    {
      // Conditional types without infer type parameters should still normalize
      // signature type parameters.
      code: `
type Wrapper<T> = T;
function f<U>(x: string extends Wrapper<U> ? U : never, y: string): void;
function f<V>(x: string extends Wrapper<V> ? V : never): void;
      `,
      errors: [
        {
          column: 57,
          endColumn: 66,
          endLine: 3,
          line: 3,
          messageId: 'omittingSingleParameter',
        },
      ],
    },
    {
      // Nested conditional infer type parameters should not shadow the outer
      // conditional type's true branch.
      code: `
function f<U>(
  x: string extends (number extends infer U ? U : never) ? U : never,
  y: string,
): void;
function f<V>(
  x: string extends (number extends infer U ? U : never) ? V : never,
): void;
      `,
      errors: [
        {
          column: 3,
          endColumn: 12,
          endLine: 4,
          line: 4,
          messageId: 'omittingSingleParameter',
        },
      ],
    },
    {
      // Mapped type keys should shadow same-named signature type parameters
      // when normalizing type references.
      code: `
function f<K extends string>(x: { [K in 'a' | 'b']: K }, y: string): void;
function f<J extends string>(x: { [K in 'a' | 'b']: K }, y: number): void;
      `,
      errors: [
        {
          column: 58,
          endColumn: 67,
          endLine: 3,
          line: 3,
          messageId: 'singleParameterDifference',
        },
      ],
    },
    {
      // Conditional infer type parameters should shadow same-named signature type
      // parameters when normalizing type references.
      code: `
function g<U>(x: string extends infer U ? U : never, y: string): void;
function g<V>(x: string extends infer U ? U : never): void;
      `,
      errors: [
        {
          column: 54,
          endColumn: 63,
          endLine: 2,
          line: 2,
          messageId: 'omittingSingleParameter',
        },
      ],
    },
    {
      // Nested type parameters should shadow same-named signature type
      // parameters when normalizing type references.
      code: `
function f<T extends string>(x: <T>(y: T) => T, z: string): void;
function f<R extends string>(x: <T>(y: T) => T): void;
      `,
      errors: [
        {
          column: 49,
          endColumn: 58,
          endLine: 2,
          line: 2,
          messageId: 'omittingSingleParameter',
        },
      ],
    },
    {
      // A signature's own type parameters should not be treated as outer type
      // parameter references just because they share the same name.
      code: `
interface I<T> {
  f<T extends string>(x: T, y: number): void;
  f<R extends string>(x: R): void;
}
      `,
      errors: [
        {
          column: 29,
          endColumn: 38,
          endLine: 3,
          line: 3,
          messageId: 'omittingSingleParameter',
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
          column: 30,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'T[]',
            type2: 'T',
          },
          line: 3,
          messageId: 'singleParameterDifference',
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
          column: 21,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string',
          },
          line: 4,
          messageId: 'singleParameterDifference',
        },
      ],
    },
    {
      code: `
abstract class C {
  a(b: string): void;
  /**
   * @deprecate
   */
  a(b: number): void;
}
      `,
      errors: [
        {
          column: 5,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'string',
            type2: 'number',
          },
          line: 7,
          messageId: 'singleParameterDifference',
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
          column: 7,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'string',
            type2: 'number',
          },
          line: 4,
          messageId: 'singleParameterDifference',
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
          column: 8,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'string',
            type2: 'number',
          },
          line: 4,
          messageId: 'singleParameterDifference',
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
          column: 15,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'string',
            type2: 'number',
          },
          line: 8,
          messageId: 'singleParameterDifference',
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
          column: 35,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 3,
          messageId: 'omittingSingleParameter',
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
          column: 35,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
          },
          line: 3,
          messageId: 'omittingSingleParameter',
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
          column: 41,
          line: 4,
          messageId: 'omittingSingleParameter',
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
          column: 39,
          line: 3,
          messageId: 'omittingSingleParameter',
        },
      ],
    },
    {
      code: `
/**
 * @deprecate
 */
declare function f(x: string): void;
declare function f(x: number): void;
declare function f(x: boolean): void;
      `,
      errors: [
        {
          column: 20,
          data: {
            failureStringStart:
              'This overload and the one on line 6 can be combined into one signature',
            type1: 'number',
            type2: 'boolean',
          },
          line: 7,
          messageId: 'singleParameterDifference',
        },
      ],
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
/**
 * @deprecate
 */
declare function f(x: string): void;
/**
 * @deprecate
 */
declare function f(x: number): void;
declare function f(x: boolean): void;
      `,
      errors: [
        {
          column: 20,
          data: {
            failureStringStart:
              'This overload and the one on line 5 can be combined into one signature',
            type1: 'string',
            type2: 'number',
          },
          line: 9,
          messageId: 'singleParameterDifference',
        },
      ],
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
declare function f(x: string): void;
/**
 * @deprecate
 */
declare function f(x: number): void;
/**
 * @deprecate
 */
declare function f(x: boolean): void;
      `,
      errors: [
        {
          column: 20,
          data: {
            failureStringStart:
              'This overload and the one on line 6 can be combined into one signature',
            type1: 'number',
            type2: 'boolean',
          },
          line: 10,
          messageId: 'singleParameterDifference',
        },
      ],
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
export function f(x: string): void;
/**
 * @deprecate
 */
export function f(x: number): void;
/**
 * @deprecate
 */
export function f(x: boolean): void;
      `,
      errors: [
        {
          column: 19,
          data: {
            failureStringStart:
              'This overload and the one on line 6 can be combined into one signature',
            type1: 'number',
            type2: 'boolean',
          },
          line: 10,
          messageId: 'singleParameterDifference',
        },
      ],
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
/**
 * This signature does something.
 */

/**
 * This signature does something else.
 */
function f(x: number): void;

/**
 * This signature does something else.
 */
function f(x: string): void;
      `,
      errors: [
        {
          column: 12,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'string',
          },
          line: 14,
          messageId: 'singleParameterDifference',
        },
      ],
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
interface I {
  f(x: string): void;
  /**
   * @deprecate
   */
  f(x: number): void;
  /**
   * @deprecate
   */
  f(x: boolean): void;
}
      `,
      errors: [
        {
          column: 5,
          data: {
            failureStringStart:
              'This overload and the one on line 7 can be combined into one signature',
            type1: 'number',
            type2: 'boolean',
          },
          line: 11,
          messageId: 'singleParameterDifference',
        },
      ],
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
// a line comment
declare function f(x: number): unknown;
declare function f(x: boolean): unknown;
      `,
      errors: [
        {
          column: 20,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'number',
            type2: 'boolean',
          },
          line: 4,
          messageId: 'singleParameterDifference',
        },
      ],
      options: [{ ignoreOverloadsWithDifferentJSDoc: true }],
    },
    {
      code: `
function f(this: {}, a: boolean): void;
function f(this: {}, a: string): void;
function f(this: {}, a: boolean | string): void {}
      `,
      errors: [
        {
          column: 22,
          line: 3,
          messageId: 'singleParameterDifference',
        },
      ],
    },
    {
      code: `
function f(this: {}): void;
function f(this: {}, a: string): void;
function f(this: {}, a?: string): void {}
      `,
      errors: [
        {
          column: 22,
          line: 3,
          messageId: 'omittingSingleParameter',
        },
      ],
    },
    {
      code: `
function f(this: string): void;
function f(this: number): void;
function f(this: string | number): void {}
      `,
      errors: [
        {
          column: 12,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'string',
            type2: 'number',
          },
          line: 3,
          messageId: 'singleParameterDifference',
        },
      ],
    },
    {
      code: `
function f(this: string, a: boolean): void;
function f(this: number, a: boolean): void;
function f(this: string | number, a: boolean): void {}
      `,
      errors: [
        {
          column: 12,
          data: {
            failureStringStart:
              'These overloads can be combined into one signature',
            type1: 'string',
            type2: 'number',
          },
          line: 3,
          messageId: 'singleParameterDifference',
        },
      ],
    },
  ],
});
