import rule from '../../src/rules/explicit-module-boundary-types';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
          (): number => 1; // ArrowFunctionExpression_Within_ArrowFunctionExpression_WithNoBody
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
export const func1 = (value: number) => ({ type: 'X', value } as const);
export const func2 = (value: number) => ({ type: 'X', value } as const);
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
  [\`\${v}\`](): void {}
}
      `,
      options: [
        {
          allowedNames: ['prop', 'method'],
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
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    {
      code: `
export const Foo: JSX.Element = (
  <div a={e => {}} b={function (e) {}} c={function foo(e) {}}></div>
);
      `,
      parserOptions: {
        ecmaFeatures: { jsx: true },
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
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 8,
          endColumn: 43,
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
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 8,
          endColumn: 23,
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
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 17,
          endColumn: 28,
        },
      ],
    },
    {
      code: `
export var arrowFn = () => 'test';
      `,
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 22,
          endColumn: 27,
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
          messageId: 'missingReturnType',
          line: 4,
          endLine: 4,
          column: 3,
          endColumn: 13,
        },
        {
          messageId: 'missingArgType',
          line: 7,
          endLine: 7,
          column: 12,
          endColumn: 17,
          data: {
            name: 'value',
          },
        },
        {
          messageId: 'missingReturnType',
          line: 8,
          endLine: 8,
          column: 3,
          endColumn: 11,
        },
        {
          messageId: 'missingReturnType',
          line: 11,
          endLine: 11,
          column: 11,
          endColumn: 17,
        },
        {
          messageId: 'missingArgType',
          line: 11,
          endLine: 11,
          column: 11,
          endColumn: 14,
          data: {
            name: 'arg',
          },
        },
        {
          messageId: 'missingReturnType',
          line: 15,
          column: 15,
          endLine: 15,
          endColumn: 21,
        },
        {
          messageId: 'missingArgType',
          line: 15,
          column: 16,
          endLine: 15,
          endColumn: 19,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 14,
          endColumn: 19,
        },
        {
          messageId: 'missingReturnType',
          line: 4,
          endLine: 4,
          column: 14,
          endColumn: 25,
        },
        {
          messageId: 'missingReturnType',
          line: 5,
          endLine: 5,
          column: 14,
          endColumn: 29,
        },
        {
          messageId: 'missingReturnType',
          line: 7,
          endLine: 7,
          column: 14,
          endColumn: 19,
        },
        {
          messageId: 'missingReturnType',
          line: 8,
          endLine: 8,
          column: 14,
          endColumn: 25,
        },
      ],
    },
    {
      code: 'export default () => (true ? () => {} : (): void => {});',
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 16,
          endColumn: 21,
        },
      ],
    },
    {
      code: "export var arrowFn = () => 'test';",
      options: [{ allowTypedFunctionExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 22,
          endColumn: 27,
        },
      ],
    },
    {
      code: `
export var funcExpr = function () {
  return 'test';
};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 23,
          endColumn: 34,
        },
      ],
    },
    {
      code: `
interface Foo {}
export const x: Foo = {
  foo: () => {},
};
      `,
      options: [{ allowTypedFunctionExpressions: false }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 4,
          endLine: 4,
          column: 8,
          endColumn: 13,
        },
      ],
    },
    {
      code: 'export default () => () => {};',
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 22,
          endColumn: 27,
        },
      ],
    },
    {
      code: 'export default () => function () {};',
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 22,
          endColumn: 33,
        },
      ],
    },
    {
      code: `
export default () => {
  return () => {};
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 10,
          endColumn: 15,
        },
      ],
    },
    {
      code: `
export default () => {
  return function () {};
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 10,
          endColumn: 21,
        },
      ],
    },
    {
      code: `
export function fn() {
  return () => {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 10,
          endColumn: 15,
        },
      ],
    },
    {
      code: `
export function fn() {
  return function () {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 10,
          endColumn: 21,
        },
      ],
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
          () => 1; // ArrowFunctionExpression_Within_ArrowFunctionExpression_WithNoBody
      };
    };
  };
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 9,
          endLine: 9,
          column: 11,
          endColumn: 16,
        },
      ],
    },
    {
      code: `
export default () => () => {
  return () => {
    return;
  };
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 10,
          endColumn: 15,
        },
      ],
    },
    {
      code: `
export const func1 = (value: number) => ({ type: 'X', value } as any);
export const func2 = (value: number) => ({ type: 'X', value } as Action);
      `,
      options: [
        {
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 22,
          endColumn: 40,
        },
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 22,
          endColumn: 40,
        },
      ],
    },
    {
      code: `
export const func = (value: number) => ({ type: 'X', value } as const);
      `,
      options: [
        {
          allowDirectConstAssertionInArrowFunctions: false,
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 21,
          endColumn: 39,
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
}
      `,
      options: [
        {
          allowedNames: ['prop'],
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 8,
          endLine: 8,
          column: 3,
          endColumn: 11,
        },
      ],
    },
    {
      code: `
export class Test {
  constructor(public foo, private ...bar) {}
}
      `,
      errors: [
        {
          messageId: 'missingArgType',
          line: 3,
          column: 22,
          data: {
            name: 'foo',
          },
        },
        {
          messageId: 'missingArgType',
          line: 3,
          column: 27,
          data: {
            name: 'bar',
          },
        },
      ],
    },
    {
      code: `
export const func1 = (value: number) => value;
export const func2 = (value: number) => value;
      `,
      options: [
        {
          allowedNames: ['func2'],
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 22,
          endColumn: 40,
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
          messageId: 'missingArgType',
          line: 2,
          endLine: 2,
          column: 20,
          endColumn: 24,
          data: {
            name: 'test',
          },
        },
      ],
    },
    {
      code: `
export const fn = (one: number, two): string => '123';
      `,
      errors: [
        {
          messageId: 'missingArgType',
          line: 2,
          endLine: 2,
          column: 33,
          endColumn: 36,
          data: {
            name: 'two',
          },
        },
      ],
    },
    {
      code: `
export function foo(outer) {
  return function (inner) {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingArgType',
          line: 2,
          data: {
            name: 'outer',
          },
        },
        {
          messageId: 'missingReturnType',
          line: 3,
        },
        {
          messageId: 'missingArgType',
          line: 3,
          data: {
            name: 'inner',
          },
        },
      ],
    },
    {
      code: 'export const baz = arg => arg as const;',
      options: [{ allowDirectConstAssertionInArrowFunctions: true }],
      errors: [
        {
          messageId: 'missingArgType',
          line: 1,
          data: {
            name: 'arg',
          },
        },
      ],
    },
    {
      code: `
const foo = arg => arg;
export default foo;
      `,
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
        },
        {
          messageId: 'missingArgType',
          line: 2,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 2,
        },
        {
          messageId: 'missingArgType',
          line: 2,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 3,
        },
        {
          messageId: 'missingArgType',
          line: 3,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 2,
        },
        {
          messageId: 'missingArgType',
          line: 2,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 2,
        },
        {
          messageId: 'missingArgType',
          line: 2,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 2,
        },
        {
          messageId: 'missingArgType',
          line: 2,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 2,
        },
        {
          messageId: 'missingArgType',
          line: 2,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 2,
        },
        {
          messageId: 'missingArgType',
          line: 2,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 2,
        },
        {
          messageId: 'missingArgType',
          line: 2,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 3,
        },
        {
          messageId: 'missingArgType',
          line: 3,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 3,
        },
        {
          messageId: 'missingArgType',
          line: 3,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 3,
        },
        {
          messageId: 'missingArgType',
          line: 3,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 3,
        },
        {
          messageId: 'missingArgType',
          line: 3,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 2,
        },
        {
          messageId: 'missingArgType',
          line: 2,
          data: {
            name: 'arg',
          },
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
          messageId: 'missingReturnType',
          line: 2,
        },
        {
          messageId: 'missingArgType',
          line: 2,
          data: {
            name: 'arg',
          },
        },
      ],
    },
    {
      code: `
export const foo = () => (a: string): ((n: number) => string) => {
  return function (n) {
    return String(n);
  };
};
      `,
      options: [{ allowHigherOrderFunctions: false }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          column: 20,
        },
      ],
    },
    {
      code: `
export var arrowFn = () => () => {};
      `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          column: 28,
        },
      ],
    },
    {
      code: `
export function fn() {
  return function () {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
export function foo(outer) {
  return function (inner): void {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingArgType',
          line: 2,
          column: 21,
          data: {
            name: 'outer',
          },
        },
        {
          messageId: 'missingArgType',
          line: 3,
          column: 20,
          data: {
            name: 'inner',
          },
        },
      ],
    },
    // test a few different argument patterns
    {
      code: `
export function foo({ foo }): void {}
      `,
      errors: [
        {
          messageId: 'missingArgTypeUnnamed',
          line: 2,
          column: 21,
          data: {
            type: 'Object pattern',
          },
        },
      ],
    },
    {
      code: `
export function foo([bar]): void {}
      `,
      errors: [
        {
          messageId: 'missingArgTypeUnnamed',
          line: 2,
          column: 21,
          data: {
            type: 'Array pattern',
          },
        },
      ],
    },
    {
      code: `
export function foo(...bar): void {}
      `,
      errors: [
        {
          messageId: 'missingArgType',
          line: 2,
          column: 21,
          data: {
            name: 'bar',
          },
        },
      ],
    },
    {
      code: `
export function foo(...[a]): void {}
      `,
      errors: [
        {
          messageId: 'missingArgTypeUnnamed',
          line: 2,
          column: 21,
          data: {
            type: 'Rest',
          },
        },
      ],
    },
    // allowArgumentsExplicitlyTypedAsAny
    {
      code: `
export function foo(foo: any): void {}
      `,
      options: [{ allowArgumentsExplicitlyTypedAsAny: false }],
      errors: [
        {
          messageId: 'anyTypedArg',
          line: 2,
          column: 21,
          data: {
            name: 'foo',
          },
        },
      ],
    },
    {
      code: `
export function foo({ foo }: any): void {}
      `,
      options: [{ allowArgumentsExplicitlyTypedAsAny: false }],
      errors: [
        {
          messageId: 'anyTypedArgUnnamed',
          line: 2,
          column: 21,
          data: {
            type: 'Object pattern',
          },
        },
      ],
    },
    {
      code: `
export function foo([bar]: any): void {}
      `,
      options: [{ allowArgumentsExplicitlyTypedAsAny: false }],
      errors: [
        {
          messageId: 'anyTypedArgUnnamed',
          line: 2,
          column: 21,
          data: {
            type: 'Array pattern',
          },
        },
      ],
    },
    {
      code: `
export function foo(...bar: any): void {}
      `,
      options: [{ allowArgumentsExplicitlyTypedAsAny: false }],
      errors: [
        {
          messageId: 'anyTypedArg',
          line: 2,
          column: 21,
          data: {
            name: 'bar',
          },
        },
      ],
    },
    {
      code: `
export function foo(...[a]: any): void {}
      `,
      options: [{ allowArgumentsExplicitlyTypedAsAny: false }],
      errors: [
        {
          messageId: 'anyTypedArgUnnamed',
          line: 2,
          column: 21,
          data: {
            type: 'Rest',
          },
        },
      ],
    },
  ],
});
