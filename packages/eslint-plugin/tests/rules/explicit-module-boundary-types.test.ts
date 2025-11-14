import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/explicit-module-boundary-types';

const ruleTester = new RuleTester();

ruleTester.run('explicit-module-boundary-types', rule, {
  valid: [
    {
      code: `
function test(): void {
  return;
}
      `,
    },
    {
      code: `
export function test(): void {
  return;
}
      `,
    },
    {
      code: `
export var fn = function (): number {
  return 1;
};
      `,
    },
    {
      code: `
export var arrowFn = (): string => 'test';
      `,
    },
    {
      // not exported
      code: `
class Test {
  constructor(one) {}
  get prop(one) {
    return 1;
  }
  set prop(one) {}
  method(one) {
    return;
  }
  arrow = one => 'arrow';
  abstract abs(one);
}
      `,
    },
    {
      code: `
export class Test {
  constructor(one: string) {}
  get prop(one: string): void {
    return 1;
  }
  set prop(one: string): void {}
  method(one: string): void {
    return;
  }
  arrow = (one: string): string => 'arrow';
  abstract abs(one: string): void;
}
      `,
    },
    {
      code: `
export class Test {
  private constructor(one) {}
  private get prop(one) {
    return 1;
  }
  private set prop(one) {}
  private method(one) {
    return;
  }
  private arrow = one => 'arrow';
  private abstract abs(one);
}
      `,
    },
    `
export class PrivateProperty {
  #property = () => null;
}
    `,
    `
export class PrivateMethod {
  #method() {}
}
    `,
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/2150
      code: `
export class Test {
  constructor();
  constructor(value?: string) {
    console.log(value);
  }
}
      `,
    },
    {
      code: `
declare class MyClass {
  constructor(options?: MyClass.Options);
}
export { MyClass };
      `,
    },
    {
      code: `
export function test(): void {
  nested();
  return;

  function nested() {}
}
      `,
    },
    {
      code: `
export function test(): string {
  const nested = () => 'value';
  return nested();
}
      `,
    },
    {
      code: `
export function test(): string {
  class Nested {
    public method() {
      return 'value';
    }
  }
  return new Nested().method();
}
      `,
    },
    {
      code: `
export var arrowFn: Foo = () => 'test';
      `,
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
export var funcExpr: Foo = function () {
  return 'test';
};
      `,
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: 'const x = (() => {}) as Foo;',
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: 'const x = <Foo>(() => {});',
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: `
export const x = {
  foo: () => {},
} as Foo;
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: `
export const x = <Foo>{
  foo: () => {},
};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: `
export const x: Foo = {
  foo: () => {},
};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2864
    {
      code: `
export const x = {
  foo: { bar: () => {} },
} as Foo;
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: `
export const x = <Foo>{
  foo: { bar: () => {} },
};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: `
export const x: Foo = {
  foo: { bar: () => {} },
};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/484
    {
      code: `
type MethodType = () => void;

export class App {
  public method: MethodType = () => {};
}
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/525
    {
      code: `
export const myObj = {
  set myProp(val: number) {
    this.myProp = val;
  },
};
      `,
    },
    {
      code: `
export default () => (): void => {};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export default () => function (): void {};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export default () => {
  return (): void => {};
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export default () => {
  return function (): void {};
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export function fn() {
  return (): void => {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export function fn() {
  return function (): void {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export function FunctionDeclaration() {
  return function FunctionExpression_Within_FunctionDeclaration() {
    return function FunctionExpression_Within_FunctionExpression() {
      return () => {
        // ArrowFunctionExpression_Within_FunctionExpression
        return () =>
          // ArrowFunctionExpression_Within_ArrowFunctionExpression
          (): number =>
            1; // ArrowFunctionExpression_Within_ArrowFunctionExpression_WithNoBody
      };
    };
  };
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export default () => () => {
  return (): void => {
    return;
  };
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export default () => () => {
  const foo = 'foo';
  return (): void => {
    return;
  };
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export default () => () => {
  const foo = () => (): string => 'foo';
  return (): void => {
    return;
  };
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export class Accumulator {
  private count: number = 0;

  public accumulate(fn: () => number): void {
    this.count += fn();
  }
}

new Accumulator().accumulate(() => 1);
      `,
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
export const func1 = (value: number) => ({ type: 'X', value }) as const;
export const func2 = (value: number) => ({ type: 'X', value }) as const;
export const func3 = (value: number) => x as const;
export const func4 = (value: number) => x as const;
      `,
      options: [
        {
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
    },
    {
      code: `
interface R {
  type: string;
  value: number;
}

export const func = (value: number) =>
  ({ type: 'X', value }) as const satisfies R;
      `,
      options: [
        {
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
    },
    {
      code: `
interface R {
  type: string;
  value: number;
}

export const func = (value: number) =>
  ({ type: 'X', value }) as const satisfies R satisfies R;
      `,
      options: [
        {
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
    },
    {
      code: `
interface R {
  type: string;
  value: number;
}

export const func = (value: number) =>
  ({ type: 'X', value }) as const satisfies R satisfies R satisfies R;
      `,
      options: [
        {
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
    },
    {
      code: `
export const func1 = (value: string) => value;
export const func2 = (value: number) => ({ type: 'X', value });
      `,
      options: [
        {
          allowedNames: ['func1', 'func2'],
        },
      ],
    },
    {
      code: `
export function func1() {
  return 0;
}
export const foo = {
  func2() {
    return 0;
  },
};
      `,
      options: [
        {
          allowedNames: ['func1', 'func2'],
        },
      ],
    },
    {
      code: `
export class Test {
  get prop() {
    return 1;
  }
  set prop() {}
  method() {
    return;
  }
  // prettier-ignore
  'method'() {}
  ['prop']() {}
  [\`prop\`]() {}
  [null]() {}
  [\`\${v}\`](): void {}

  foo = () => {
    bar: 5;
  };
}
      `,
      options: [
        {
          allowedNames: ['prop', 'method', 'null', 'foo'],
        },
      ],
    },
    {
      code: `
        export function foo(outer: string) {
          return function (inner: string): void {};
        }
      `,
      options: [
        {
          allowHigherOrderFunctions: true,
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/1552
    {
      code: `
        export type Ensurer = (blocks: TFBlock[]) => TFBlock[];

        export const myEnsurer: Ensurer = blocks => {
          return blocks;
        };
      `,
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
export const Foo: FC = () => (
  <div a={e => {}} b={function (e) {}} c={function foo(e) {}}></div>
);
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: { jsx: true },
        },
      },
    },
    {
      code: `
export const Foo: JSX.Element = (
  <div a={e => {}} b={function (e) {}} c={function foo(e) {}}></div>
);
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: { jsx: true },
        },
      },
    },
    {
      code: `
const test = (): void => {
  return;
};
export default test;
      `,
    },
    {
      code: `
function test(): void {
  return;
}
export default test;
      `,
    },
    {
      code: `
const test = (): void => {
  return;
};
export default [test];
      `,
    },
    {
      code: `
function test(): void {
  return;
}
export default [test];
      `,
    },
    {
      code: `
const test = (): void => {
  return;
};
export default { test };
      `,
    },
    {
      code: `
function test(): void {
  return;
}
export default { test };
      `,
    },
    {
      code: `
const foo = (arg => arg) as Foo;
export default foo;
      `,
    },
    {
      code: `
let foo = (arg => arg) as Foo;
foo = 3;
export default foo;
      `,
    },
    {
      code: `
class Foo {
  bar = (arg: string): string => arg;
}
export default { Foo };
      `,
    },
    {
      code: `
class Foo {
  bar(): void {
    return;
  }
}
export default { Foo };
      `,
    },
    {
      code: `
export class Foo {
  accessor bar = (): void => {
    return;
  };
}
      `,
    },
    {
      code: `
export function foo(): (n: number) => string {
  return n => String(n);
}
      `,
    },
    {
      code: `
export const foo = (a: string): ((n: number) => string) => {
  return function (n) {
    return String(n);
  };
};
      `,
    },
    {
      code: `
export function a(): void {
  function b() {}
  const x = () => {};
  (function () {});

  function c() {
    return () => {};
  }

  return;
}
      `,
    },
    {
      code: `
export function a(): void {
  function b() {
    function c() {}
  }
  const x = () => {
    return () => 100;
  };
  (function () {
    (function () {});
  });

  function c() {
    return () => {
      (function () {});
    };
  }

  return;
}
      `,
    },
    {
      code: `
export function a() {
  return function b(): () => void {
    return function c() {};
  };
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export var arrowFn = () => (): void => {};
      `,
    },
    {
      code: `
export function fn() {
  return function (): void {};
}
      `,
    },
    {
      code: `
export function foo(outer: string) {
  return function (inner: string): void {};
}
      `,
    },
    // shouldn't check functions that aren't directly exported - https://github.com/typescript-eslint/typescript-eslint/issues/2134
    `
export function foo(): unknown {
  return new Proxy(apiInstance, {
    get: (target, property) => {
      // implementation
    },
  });
}
    `,
    {
      code: 'export default (() => true)();',
      options: [
        {
          allowTypedFunctionExpressions: false,
        },
      ],
    },
    // explicit assertions are allowed
    {
      code: 'export const x = (() => {}) as Foo;',
      options: [{ allowTypedFunctionExpressions: false }],
    },
    {
      code: `
interface Foo {}
export const x = {
  foo: () => {},
} as Foo;
      `,
      options: [{ allowTypedFunctionExpressions: false }],
    },
    // allowArgumentsExplicitlyTypedAsAny
    {
      code: `
export function foo(foo: any): void {}
      `,
      options: [{ allowArgumentsExplicitlyTypedAsAny: true }],
    },
    {
      code: `
export function foo({ foo }: any): void {}
      `,
      options: [{ allowArgumentsExplicitlyTypedAsAny: true }],
    },
    {
      code: `
export function foo([bar]: any): void {}
      `,
      options: [{ allowArgumentsExplicitlyTypedAsAny: true }],
    },
    {
      code: `
export function foo(...bar: any): void {}
      `,
      options: [{ allowArgumentsExplicitlyTypedAsAny: true }],
    },
    {
      code: `
export function foo(...[a]: any): void {}
      `,
      options: [{ allowArgumentsExplicitlyTypedAsAny: true }],
    },
    // assignment patterns are ignored
    `
export function foo(arg = 1): void {}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2161
    {
      code: `
export const foo = (): ((n: number) => string) => n => String(n);
      `,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2173
    `
export function foo(): (n: number) => (m: number) => string {
  return function (n) {
    return function (m) {
      return String(n + m);
    };
  };
}
    `,
    `
export const foo = (): ((n: number) => (m: number) => string) => n => m =>
  String(n + m);
    `,
    `
export const bar: () => (n: number) => string = () => n => String(n);
    `,
    `
type Buz = () => (n: number) => string;

export const buz: Buz = () => n => String(n);
    `,
    `
export abstract class Foo<T> {
  abstract set value(element: T);
}
    `,
    `
export declare class Foo {
  set time(seconds: number);
}
    `,
    `
export class A {
  b = A;
}
    `,
    `
interface Foo {
  f: (x: boolean) => boolean;
}

export const a: Foo[] = [
  {
    f: (x: boolean) => x,
  },
];
    `,
    `
interface Foo {
  f: (x: boolean) => boolean;
}

export const a: Foo = {
  f: (x: boolean) => x,
};
    `,
    {
      code: `
export function test(a: string): string;
export function test(a: number): number;
export function test(a: unknown) {
  return a;
}
      `,
      options: [
        {
          allowOverloadFunctions: true,
        },
      ],
    },
    {
      code: `
export default function test(a: string): string;
export default function test(a: number): number;
export default function test(a: unknown) {
  return a;
}
      `,
      options: [
        {
          allowOverloadFunctions: true,
        },
      ],
    },
    {
      code: `
export default function (a: string): string;
export default function (a: number): number;
export default function (a: unknown) {
  return a;
}
      `,
      options: [
        {
          allowOverloadFunctions: true,
        },
      ],
    },
    {
      code: `
export class Test {
  test(a: string): string;
  test(a: number): number;
  test(a: unknown) {
    return a;
  }
}
      `,
      options: [
        {
          allowOverloadFunctions: true,
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
export function test(a: number, b: number) {
  return;
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
export function test() {
  return;
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
export var fn = function () {
  return 1;
};
      `,
      errors: [
        {
          column: 17,
          endColumn: 26,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
export var arrowFn = () => 'test';
      `,
      errors: [
        {
          column: 25,
          endColumn: 27,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
export class Test {
  constructor() {}
  get prop() {
    return 1;
  }
  set prop(value) {}
  method() {
    return;
  }
  arrow = arg => 'arrow';
  private method() {
    return;
  }
  abstract abs(arg);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 11,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnType',
        },
        {
          column: 12,
          data: {
            name: 'value',
          },
          endColumn: 17,
          endLine: 7,
          line: 7,
          messageId: 'missingArgType',
        },
        {
          column: 3,
          endColumn: 9,
          endLine: 8,
          line: 8,
          messageId: 'missingReturnType',
        },
        {
          column: 3,
          endColumn: 11,
          endLine: 11,
          line: 11,
          messageId: 'missingReturnType',
        },
        {
          column: 11,
          data: {
            name: 'arg',
          },
          endColumn: 14,
          endLine: 11,
          line: 11,
          messageId: 'missingArgType',
        },
        {
          column: 15,
          endColumn: 21,
          endLine: 15,
          line: 15,
          messageId: 'missingReturnType',
        },
        {
          column: 16,
          data: {
            name: 'arg',
          },
          endColumn: 19,
          endLine: 15,
          line: 15,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
export class Foo {
  public a = () => {};
  public b = function () {};
  public c = function test() {};

  static d = () => {};
  static e = function () {};
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'missingReturnType',
        },
        {
          column: 3,
          endColumn: 23,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnType',
        },
        {
          column: 3,
          endColumn: 27,
          endLine: 5,
          line: 5,
          messageId: 'missingReturnType',
        },
        {
          column: 3,
          endColumn: 14,
          endLine: 7,
          line: 7,
          messageId: 'missingReturnType',
        },
        {
          column: 3,
          endColumn: 23,
          endLine: 8,
          line: 8,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: 'export default () => (true ? () => {} : (): void => {});',
      errors: [
        {
          column: 19,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: "export var arrowFn = () => 'test';",
      errors: [
        {
          column: 25,
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: `
export var funcExpr = function () {
  return 'test';
};
      `,
      errors: [
        {
          column: 23,
          endColumn: 32,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: `
interface Foo {}
export const x: Foo = {
  foo: () => {},
};
      `,
      errors: [
        {
          column: 3,
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowTypedFunctionExpressions: false }],
    },
    {
      code: 'export default () => () => {};',
      errors: [
        {
          column: 25,
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: 'export default () => function () {};',
      errors: [
        {
          column: 22,
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export default () => {
  return () => {};
};
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export default () => {
  return function () {};
};
      `,
      errors: [
        {
          column: 10,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export function fn() {
  return () => {};
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export function fn() {
  return function () {};
}
      `,
      errors: [
        {
          column: 10,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export function FunctionDeclaration() {
  return function FunctionExpression_Within_FunctionDeclaration() {
    return function FunctionExpression_Within_FunctionExpression() {
      return () => {
        // ArrowFunctionExpression_Within_FunctionExpression
        return () =>
          // ArrowFunctionExpression_Within_ArrowFunctionExpression
          () =>
            1; // ArrowFunctionExpression_Within_ArrowFunctionExpression_WithNoBody
      };
    };
  };
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 9,
          line: 9,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export default () => () => {
  return () => {
    return;
  };
};
      `,
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export const func1 = (value: number) => ({ type: 'X', value }) as any;
export const func2 = (value: number) => ({ type: 'X', value }) as Action;
      `,
      errors: [
        {
          column: 38,
          endColumn: 40,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
        {
          column: 38,
          endColumn: 40,
          endLine: 3,
          line: 3,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
    },
    {
      code: `
export const func = (value: number) => ({ type: 'X', value }) as const;
      `,
      errors: [
        {
          column: 37,
          endColumn: 39,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowDirectConstAssertionInArrowFunctions: false,
        },
      ],
    },
    {
      code: `
interface R {
  type: string;
  value: number;
}

export const func = (value: number) =>
  ({ type: 'X', value }) as const satisfies R;
      `,
      errors: [
        {
          column: 37,
          endColumn: 39,
          endLine: 7,
          line: 7,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowDirectConstAssertionInArrowFunctions: false,
        },
      ],
    },
    {
      code: `
export class Test {
  constructor() {}
  get prop() {
    return 1;
  }
  set prop() {}
  method() {
    return;
  }
  arrow = (): string => 'arrow';
  foo = () => 'bar';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 9,
          endLine: 8,
          line: 8,
          messageId: 'missingReturnType',
        },
        {
          column: 3,
          endColumn: 9,
          endLine: 12,
          line: 12,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowedNames: ['prop'],
        },
      ],
    },
    {
      code: `
export class Test {
  constructor(public foo) {}
}
      `,
      errors: [
        {
          column: 22,
          data: {
            name: 'foo',
          },
          line: 3,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
export const func1 = (value: number) => value;
export const func2 = (value: number) => value;
      `,
      errors: [
        {
          column: 38,
          endColumn: 40,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowedNames: ['func2'],
        },
      ],
    },
    {
      code: `
export function fn(test): string {
  return '123';
}
      `,
      errors: [
        {
          column: 20,
          data: {
            name: 'test',
          },
          endColumn: 24,
          endLine: 2,
          line: 2,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
export const fn = (one: number, two): string => '123';
      `,
      errors: [
        {
          column: 33,
          data: {
            name: 'two',
          },
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
export function foo(outer) {
  return function (inner) {};
}
      `,
      errors: [
        {
          data: {
            name: 'outer',
          },
          line: 2,
          messageId: 'missingArgType',
        },
        {
          line: 3,
          messageId: 'missingReturnType',
        },
        {
          data: {
            name: 'inner',
          },
          line: 3,
          messageId: 'missingArgType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: 'export const baz = arg => arg as const;',
      errors: [
        {
          data: {
            name: 'arg',
          },
          line: 1,
          messageId: 'missingArgType',
        },
      ],
      options: [{ allowDirectConstAssertionInArrowFunctions: true }],
    },
    {
      code: `
const foo = arg => arg;
export default foo;
      `,
      errors: [
        {
          data: {
            name: 'arg',
          },
          line: 2,
          messageId: 'missingArgType',
        },
        {
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
const foo = arg => arg;
export = foo;
      `,
      errors: [
        {
          data: {
            name: 'arg',
          },
          line: 2,
          messageId: 'missingArgType',
        },
        {
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
let foo = (arg: number): number => arg;
foo = arg => arg;
export default foo;
      `,
      errors: [
        {
          data: {
            name: 'arg',
          },
          line: 3,
          messageId: 'missingArgType',
        },
        {
          line: 3,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
const foo = arg => arg;
export default [foo];
      `,
      errors: [
        {
          data: {
            name: 'arg',
          },
          line: 2,
          messageId: 'missingArgType',
        },
        {
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
const foo = arg => arg;
export default { foo };
      `,
      errors: [
        {
          data: {
            name: 'arg',
          },
          line: 2,
          messageId: 'missingArgType',
        },
        {
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
function foo(arg) {
  return arg;
}
export default foo;
      `,
      errors: [
        {
          line: 2,
          messageId: 'missingReturnType',
        },
        {
          data: {
            name: 'arg',
          },
          line: 2,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
function foo(arg) {
  return arg;
}
export default [foo];
      `,
      errors: [
        {
          line: 2,
          messageId: 'missingReturnType',
        },
        {
          data: {
            name: 'arg',
          },
          line: 2,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
function foo(arg) {
  return arg;
}
export default { foo };
      `,
      errors: [
        {
          line: 2,
          messageId: 'missingReturnType',
        },
        {
          data: {
            name: 'arg',
          },
          line: 2,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
const bar = function foo(arg) {
  return arg;
};
export default { bar };
      `,
      errors: [
        {
          line: 2,
          messageId: 'missingReturnType',
        },
        {
          data: {
            name: 'arg',
          },
          line: 2,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
class Foo {
  bool(arg) {
    return arg;
  }
}
export default Foo;
      `,
      errors: [
        {
          line: 3,
          messageId: 'missingReturnType',
        },
        {
          data: {
            name: 'arg',
          },
          line: 3,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
class Foo {
  bool = arg => {
    return arg;
  };
}
export default Foo;
      `,
      errors: [
        {
          line: 3,
          messageId: 'missingReturnType',
        },
        {
          data: {
            name: 'arg',
          },
          line: 3,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
class Foo {
  bool = function (arg) {
    return arg;
  };
}
export default Foo;
      `,
      errors: [
        {
          line: 3,
          messageId: 'missingReturnType',
        },
        {
          data: {
            name: 'arg',
          },
          line: 3,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
class Foo {
  accessor bool = arg => {
    return arg;
  };
}
export default Foo;
      `,
      errors: [
        {
          data: {
            name: 'arg',
          },
          line: 3,
          messageId: 'missingArgType',
        },
        {
          line: 3,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
class Foo {
  accessor bool = function (arg) {
    return arg;
  };
}
export default Foo;
      `,
      errors: [
        {
          line: 3,
          messageId: 'missingReturnType',
        },
        {
          data: {
            name: 'arg',
          },
          line: 3,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
class Foo {
  bool = function (arg) {
    return arg;
  };
}
export default [Foo];
      `,
      errors: [
        {
          line: 3,
          messageId: 'missingReturnType',
        },
        {
          data: {
            name: 'arg',
          },
          line: 3,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
let test = arg => argl;
test = (): void => {
  return;
};
export default test;
      `,
      errors: [
        {
          data: {
            name: 'arg',
          },
          line: 2,
          messageId: 'missingArgType',
        },
        {
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
let test = arg => argl;
test = (): void => {
  return;
};
export { test };
      `,
      errors: [
        {
          data: {
            name: 'arg',
          },
          line: 2,
          messageId: 'missingArgType',
        },
        {
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
export const foo =
  () =>
  (a: string): ((n: number) => string) => {
    return function (n) {
      return String(n);
    };
  };
      `,
      errors: [
        {
          column: 6,
          line: 3,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: false }],
    },
    {
      code: `
export var arrowFn = () => () => {};
      `,
      errors: [
        {
          column: 31,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export function fn() {
  return function () {};
}
      `,
      errors: [
        {
          column: 10,
          line: 3,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export function foo(outer) {
  return function (inner): void {};
}
      `,
      errors: [
        {
          column: 21,
          data: {
            name: 'outer',
          },
          line: 2,
          messageId: 'missingArgType',
        },
        {
          column: 20,
          data: {
            name: 'inner',
          },
          line: 3,
          messageId: 'missingArgType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
export function foo(outer: boolean) {
  if (outer) {
    return 'string';
  }
  return function (inner): void {};
}
      `,
      errors: [
        {
          column: 8,
          data: {
            name: 'inner',
          },
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    // test a few different argument patterns
    {
      code: `
export function foo({ foo }): void {}
      `,
      errors: [
        {
          column: 21,
          data: {
            type: 'Object pattern',
          },
          line: 2,
          messageId: 'missingArgTypeUnnamed',
        },
      ],
    },
    {
      code: `
export function foo([bar]): void {}
      `,
      errors: [
        {
          column: 21,
          data: {
            type: 'Array pattern',
          },
          line: 2,
          messageId: 'missingArgTypeUnnamed',
        },
      ],
    },
    {
      code: `
export function foo(...bar): void {}
      `,
      errors: [
        {
          column: 21,
          data: {
            name: 'bar',
          },
          line: 2,
          messageId: 'missingArgType',
        },
      ],
    },
    {
      code: `
export function foo(...[a]): void {}
      `,
      errors: [
        {
          column: 21,
          data: {
            type: 'Rest',
          },
          line: 2,
          messageId: 'missingArgTypeUnnamed',
        },
      ],
    },
    // allowArgumentsExplicitlyTypedAsAny
    {
      code: `
export function foo(foo: any): void {}
      `,
      errors: [
        {
          column: 21,
          data: {
            name: 'foo',
          },
          line: 2,
          messageId: 'anyTypedArg',
        },
      ],
      options: [{ allowArgumentsExplicitlyTypedAsAny: false }],
    },
    {
      code: `
export function foo({ foo }: any): void {}
      `,
      errors: [
        {
          column: 21,
          data: {
            type: 'Object pattern',
          },
          line: 2,
          messageId: 'anyTypedArgUnnamed',
        },
      ],
      options: [{ allowArgumentsExplicitlyTypedAsAny: false }],
    },
    {
      code: `
export function foo([bar]: any): void {}
      `,
      errors: [
        {
          column: 21,
          data: {
            type: 'Array pattern',
          },
          line: 2,
          messageId: 'anyTypedArgUnnamed',
        },
      ],
      options: [{ allowArgumentsExplicitlyTypedAsAny: false }],
    },
    {
      code: `
export function foo(...bar: any): void {}
      `,
      errors: [
        {
          column: 21,
          data: {
            name: 'bar',
          },
          line: 2,
          messageId: 'anyTypedArg',
        },
      ],
      options: [{ allowArgumentsExplicitlyTypedAsAny: false }],
    },
    {
      code: `
export function foo(...[a]: any): void {}
      `,
      errors: [
        {
          column: 21,
          data: {
            type: 'Rest',
          },
          line: 2,
          messageId: 'anyTypedArgUnnamed',
        },
      ],
      options: [{ allowArgumentsExplicitlyTypedAsAny: false }],
    },
    {
      code: `
export function func1() {
  return 0;
}
export const foo = {
  func2() {
    return 0;
  },
};
      `,
      errors: [
        {
          column: 8,
          endColumn: 22,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
        {
          column: 3,
          endColumn: 8,
          endLine: 6,
          line: 6,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowedNames: [],
        },
      ],
    },
    {
      code: `
export function test(a: string): string;
export function test(a: number): number;
export function test(a: unknown) {
  return a;
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 21,
          line: 4,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
export default function test(a: string): string;
export default function test(a: number): number;
export default function test(a: unknown) {
  return a;
}
      `,
      errors: [
        {
          column: 16,
          endColumn: 29,
          line: 4,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
export default function (a: string): string;
export default function (a: number): number;
export default function (a: unknown) {
  return a;
}
      `,
      errors: [
        {
          column: 16,
          endColumn: 25,
          line: 4,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
export class Test {
  test(a: string): string;
  test(a: number): number;
  test(a: unknown) {
    return a;
  }
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 7,
          line: 5,
          messageId: 'missingReturnType',
        },
      ],
    },
  ],
});
