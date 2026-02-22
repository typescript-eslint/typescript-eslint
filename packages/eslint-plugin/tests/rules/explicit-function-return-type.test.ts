import { RuleTester, noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/explicit-function-return-type';

const ruleTester = new RuleTester();

ruleTester.run('explicit-function-return-type', rule, {
  valid: [
    'return;',
    {
      code: `
function test(): void {
  return;
}
      `,
    },
    {
      code: `
var fn = function (): number {
  return 1;
};
      `,
    },
    {
      code: `
var arrowFn = (): string => 'test';
      `,
    },
    {
      code: noFormat`
class Test {
  constructor() {}
  get prop(): number {
    return 1;
  }
  set prop() {}
  method(): void {
    return;
  }
  arrow = (): string => 'arrow';
}
      `,
    },
    {
      code: 'fn(() => {});',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      code: 'fn(function () {});',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      code: '[function () {}, () => {}];',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      code: '(function () {});',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      code: '(() => {})();',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      code: 'export default (): void => {};',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      code: `
var arrowFn: Foo = () => 'test';
      `,
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
var funcExpr: Foo = function () {
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
      code: noFormat`const x = <Foo>(() => {});`,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: `
const x = {
  foo: () => {},
} as Foo;
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: noFormat`
const x = <Foo>{
  foo: () => {},
};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: `
const x: Foo = {
  foo: () => {},
};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2864
    {
      code: `
const x = {
  foo: { bar: () => {} },
} as Foo;
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: noFormat`
const x = <Foo>{
  foo: { bar: () => {} },
};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: `
const x: Foo = {
  foo: { bar: () => {} },
};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/484
    {
      code: `
type MethodType = () => void;

class App {
  private method: MethodType = () => {};
}
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/7552
    {
      code: 'const foo = <button onClick={() => {}} />;',
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: 'const foo = <button on={{ click: () => {} }} />;',
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: 'const foo = <Bar>{() => {}}</Bar>;',
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: 'const foo = <Bar>{{ on: () => {} }}</Bar>;',
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: 'const foo = <button {...{ onClick: () => {} }} />;',
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      options: [{ allowTypedFunctionExpressions: true }],
    },

    // https://github.com/typescript-eslint/typescript-eslint/issues/525
    {
      code: `
const myObj = {
  set myProp(val) {
    this.myProp = val;
  },
};
      `,
    },
    {
      code: `
() => (): void => {};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
() => function (): void {};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
() => {
  return (): void => {};
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
() => {
  return function (): void {};
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
() => {
  const foo = 'foo';
  return function (): string {
    return foo;
  };
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
function fn() {
  return (): void => {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
function fn() {
  return function (): void {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
function fn() {
  const bar = () => (): number => 1;
  return function (): void {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
function fn(arg: boolean) {
  if (arg) {
    return () => (): number => 1;
  } else {
    return function (): string {
      return 'foo';
    };
  }

  return function (): void {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
function FunctionDeclaration() {
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
() => () => {
  return (): void => {
    return;
  };
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/679
    {
      code: `
declare function foo(arg: () => void): void;
foo(() => 1);
foo(() => {});
foo(() => null);
foo(() => true);
foo(() => '');
      `,
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
declare function foo(arg: () => void): void;
foo?.(() => 1);
foo?.bar(() => {});
foo?.bar?.(() => null);
foo.bar?.(() => true);
foo?.(() => '');
      `,
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
class Accumulator {
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
declare function foo(arg: { meth: () => number }): void;
foo({
  meth() {
    return 1;
  },
});
foo({
  meth: function () {
    return 1;
  },
});
foo({
  meth: () => {
    return 1;
  },
});
      `,
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
const func = (value: number) => ({ type: 'X', value }) as const;
const func = (value: number) => ({ type: 'X', value }) as const;
const func = (value: number) => x as const;
const func = (value: number) => x as const;
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

const func = (value: number) => ({ type: 'X', value }) as const satisfies R;
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

const func = (value: number) =>
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

const func = (value: number) =>
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
new Promise(resolve => {});
new Foo(1, () => {});
      `,
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: 'const log = (message: string) => void console.log(message);',
      options: [{ allowConciseArrowFunctionExpressionsStartingWithVoid: true }],
    },
    {
      code: 'const log = (a: string) => a;',
      options: [{ allowFunctionsWithoutTypeParameters: true }],
    },
    {
      code: 'const log = <A,>(a: A): A => a;',
      options: [{ allowFunctionsWithoutTypeParameters: true }],
    },
    {
      code: `
function log<A>(a: A): A {
  return a;
}
      `,
      options: [{ allowFunctionsWithoutTypeParameters: true }],
    },
    {
      code: `
function log(a: string) {
  return a;
}
      `,
      options: [{ allowFunctionsWithoutTypeParameters: true }],
    },
    {
      code: `
const log = function <A>(a: A): A {
  return a;
};
      `,
      options: [{ allowFunctionsWithoutTypeParameters: true }],
    },
    {
      code: `
const log = function (a: A): string {
  return a;
};
      `,
      options: [{ allowFunctionsWithoutTypeParameters: true }],
    },
    {
      code: `
function test1() {
  return;
}

const foo = function test2() {
  return;
};
      `,
      options: [
        {
          allowedNames: ['test1', 'test2'],
        },
      ],
    },
    {
      code: `
const test1 = function () {
  return;
};
const foo = function () {
  return function test2() {};
};
      `,
      options: [
        {
          allowedNames: ['test1', 'test2'],
        },
      ],
    },
    {
      code: `
const test1 = () => {
  return;
};
export const foo = {
  test2() {
    return 0;
  },
};
      `,
      options: [
        {
          allowedNames: ['test1', 'test2'],
        },
      ],
    },
    {
      code: noFormat`
class Test {
  constructor() {}
  get prop() {
    return 1;
  }
  set prop() {}
  method() {
    return;
  }
  arrow = () => 'arrow';
  private method() {
    return;
  }
}
      `,
      options: [
        {
          allowedNames: ['prop', 'method', 'arrow'],
        },
      ],
    },
    {
      code: `
const x = {
  arrowFn: () => {
    return;
  },
  fn: function () {
    return;
  },
};
      `,
      options: [
        {
          allowedNames: ['arrowFn', 'fn'],
        },
      ],
    },
    {
      code: `
type HigherOrderType = () => (arg1: string) => (arg2: number) => string;
const x: HigherOrderType = () => arg1 => arg2 => 'foo';
      `,
      options: [
        {
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
type HigherOrderType = () => (arg1: string) => (arg2: number) => string;
const x: HigherOrderType = () => arg1 => arg2 => 'foo';
      `,
      options: [
        {
          allowHigherOrderFunctions: false,
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
interface Foo {
  foo: string;
  arrowFn: () => string;
}

function foo(): Foo {
  return {
    foo: 'foo',
    arrowFn: () => 'test',
  };
}
      `,
      options: [
        {
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
type Foo = (arg1: string) => string;
type Bar<T> = (arg2: string) => T;
const x: Bar<Foo> = arg1 => arg2 => arg1 + arg2;
      `,
      options: [
        {
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
let foo = function (): number {
  return 1;
};
      `,
      options: [
        {
          allowIIFEs: true,
        },
      ],
    },
    {
      code: `
const foo = (function () {
  return 1;
})();
      `,
      options: [
        {
          allowIIFEs: true,
        },
      ],
    },
    {
      code: `
const foo = (() => {
  return 1;
})();
      `,
      options: [
        {
          allowIIFEs: true,
        },
      ],
    },
    {
      code: `
const foo = ((arg: number): number => {
  return arg;
})(0);
      `,
      options: [
        {
          allowIIFEs: true,
        },
      ],
    },
    {
      code: `
const foo = (() => (() => 'foo')())();
      `,
      options: [
        {
          allowIIFEs: true,
        },
      ],
    },
    {
      code: `
let foo = (() => (): string => {
  return 'foo';
})()();
      `,
      options: [
        {
          allowIIFEs: true,
        },
      ],
    },
    {
      code: `
let foo = (() => (): string => {
  return 'foo';
})();
      `,
      options: [
        {
          allowHigherOrderFunctions: false,
          allowIIFEs: true,
        },
      ],
    },
    {
      code: `
let foo = (() => (): string => {
  return 'foo';
})()();
      `,
      options: [
        {
          allowHigherOrderFunctions: true,
          allowIIFEs: true,
        },
      ],
    },
    {
      code: `
let foo = (() => (): void => {})()();
      `,
      options: [
        {
          allowIIFEs: true,
        },
      ],
    },
    {
      code: `
let foo = (() => (() => {})())();
      `,
      options: [
        {
          allowIIFEs: true,
        },
      ],
    },
    {
      code: `
class Bar {
  bar: Foo = {
    foo: x => x + 1,
  };
}
      `,
    },
    {
      code: `
class Bar {
  bar: Foo[] = [
    {
      foo: x => x + 1,
    },
  ];
}
      `,
    },
    {
      code: `
type CallBack = () => void;

function f(gotcha: CallBack = () => {}): void {}
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: `
type CallBack = () => void;

const f = (gotcha: CallBack = () => {}): void => {};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: `
type ObjectWithCallback = { callback: () => void };

const f = (gotcha: ObjectWithCallback = { callback: () => {} }): void => {};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
  ],

  invalid: [
    {
      code: `
function test(a: number, b: number) {
  return;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
function test() {
  return;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
var fn = function () {
  return 1;
};
      `,
      errors: [
        {
          column: 10,
          endColumn: 19,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
var arrowFn = () => 'test';
      `,
      errors: [
        {
          column: 18,
          endColumn: 20,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: noFormat`
class Test {
  constructor() {}
  get prop() {
    return 1;
  }
  set prop() {}
  method() {
    return;
  }
  arrow = () => 'arrow';
  private method() {
    return;
  }
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
          column: 3,
          endColumn: 17,
          endLine: 12,
          line: 12,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
function test() {
  return;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowExpressions: true }],
    },
    {
      code: 'const foo = () => {};',
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowExpressions: true }],
    },
    {
      code: 'const foo = function () {};',
      errors: [
        {
          column: 13,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowExpressions: true }],
    },
    {
      code: 'export default () => {};',
      errors: [
        {
          column: 19,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowExpressions: true }],
    },
    {
      code: 'export default function () {}',
      errors: [
        {
          column: 16,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowExpressions: true }],
    },
    {
      code: `
class Foo {
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
      options: [{ allowExpressions: true }],
    },
    {
      code: "var arrowFn = () => 'test';",
      errors: [
        {
          column: 18,
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      code: `
function foo(): any {
  const bar = () => () => console.log('aa');
}
      `,
      errors: [
        {
          column: 24,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
let anyValue: any;
function foo(): any {
  anyValue = () => () => console.log('aa');
}
      `,
      errors: [
        {
          column: 23,
          endColumn: 25,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
class Foo {
  foo(): any {
    const bar = () => () => {
      return console.log('foo');
    };
  }
}
      `,
      errors: [
        {
          column: 26,
          endColumn: 28,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: `
var funcExpr = function () {
  return 'test';
};
      `,
      errors: [
        {
          column: 16,
          endColumn: 25,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowTypedFunctionExpressions: true }],
    },

    {
      code: 'const x = (() => {}) as Foo;',
      errors: [
        {
          column: 15,
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowTypedFunctionExpressions: false }],
    },
    {
      code: `
interface Foo {}
const x = {
  foo: () => {},
} as Foo;
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
      code: `
interface Foo {}
const x: Foo = {
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
      code: 'const foo = <button onClick={() => {}} />;',
      errors: [
        {
          column: 33,
          endColumn: 35,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      options: [{ allowTypedFunctionExpressions: false }],
    },
    {
      code: 'const foo = <button on={{ click: () => {} }} />;',
      errors: [
        {
          column: 27,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      options: [{ allowTypedFunctionExpressions: false }],
    },
    {
      code: 'const foo = <Bar>{() => {}}</Bar>;',
      errors: [
        {
          column: 22,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      options: [{ allowTypedFunctionExpressions: false }],
    },
    {
      code: 'const foo = <Bar>{{ on: () => {} }}</Bar>;',
      errors: [
        {
          column: 21,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      options: [{ allowTypedFunctionExpressions: false }],
    },
    {
      code: 'const foo = <button {...{ onClick: () => {} }} />;',
      errors: [
        {
          column: 27,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      options: [{ allowTypedFunctionExpressions: false }],
    },
    {
      code: `
function foo(): any {
  class Foo {
    foo = () => () => {
      return console.log('foo');
    };
  }
}
      `,
      errors: [
        {
          column: 20,
          endColumn: 22,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      code: '() => () => {};',
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: '() => function () {};',
      errors: [
        {
          column: 7,
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
() => {
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
() => {
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
function fn() {
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
function fn() {
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
function fn() {
  const bar = () => (): number => 1;
  const baz = () => () => 'baz';
  return function (): void {};
}
      `,
      errors: [
        {
          column: 24,
          endColumn: 26,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
function fn(arg: boolean) {
  if (arg) return 'string';
  return function (): void {};
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      code: `
function FunctionDeclaration() {
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
() => () => {
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
    // https://github.com/typescript-eslint/typescript-eslint/issues/679
    {
      code: `
declare function foo(arg: () => void): void;
foo(() => 1);
foo(() => {});
foo(() => null);
foo(() => true);
foo(() => '');
      `,
      errors: [
        {
          column: 8,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'missingReturnType',
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnType',
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 5,
          line: 5,
          messageId: 'missingReturnType',
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'missingReturnType',
        },
        {
          column: 8,
          endColumn: 10,
          endLine: 7,
          line: 7,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowTypedFunctionExpressions: false,
        },
      ],
    },
    {
      code: `
class Accumulator {
  private count: number = 0;

  public accumulate(fn: () => number): void {
    this.count += fn();
  }
}

new Accumulator().accumulate(() => 1);
      `,
      errors: [
        {
          column: 33,
          endColumn: 35,
          endLine: 10,
          line: 10,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowTypedFunctionExpressions: false,
        },
      ],
    },
    {
      code: '(() => true)();',
      errors: [
        {
          column: 5,
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowTypedFunctionExpressions: false,
        },
      ],
    },
    {
      code: `
declare function foo(arg: { meth: () => number }): void;
foo({
  meth() {
    return 1;
  },
});
foo({
  meth: function () {
    return 1;
  },
});
foo({
  meth: () => {
    return 1;
  },
});
      `,
      errors: [
        {
          column: 3,
          endColumn: 7,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnType',
        },
        {
          column: 3,
          endColumn: 18,
          endLine: 9,
          line: 9,
          messageId: 'missingReturnType',
        },
        {
          column: 3,
          endColumn: 9,
          endLine: 14,
          line: 14,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowTypedFunctionExpressions: false,
        },
      ],
    },
    {
      code: `
type HigherOrderType = () => (arg1: string) => (arg2: number) => string;
const x: HigherOrderType = () => arg1 => arg2 => 'foo';
      `,
      errors: [
        {
          column: 47,
          endColumn: 49,
          endLine: 3,
          line: 3,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: false,
        },
      ],
    },
    {
      code: `
type HigherOrderType = () => (arg1: string) => (arg2: number) => string;
const x: HigherOrderType = () => arg1 => arg2 => 'foo';
      `,
      errors: [
        {
          column: 31,
          endColumn: 33,
          endLine: 3,
          line: 3,
          messageId: 'missingReturnType',
        },
        {
          column: 39,
          endColumn: 41,
          endLine: 3,
          line: 3,
          messageId: 'missingReturnType',
        },
        {
          column: 47,
          endColumn: 49,
          endLine: 3,
          line: 3,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowHigherOrderFunctions: false,
          allowTypedFunctionExpressions: false,
        },
      ],
    },
    {
      code: `
const func = (value: number) => ({ type: 'X', value }) as any;
const func = (value: number) => ({ type: 'X', value }) as Action;
      `,
      errors: [
        {
          column: 30,
          endColumn: 32,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
        {
          column: 30,
          endColumn: 32,
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
const func = (value: number) => ({ type: 'X', value }) as const;
      `,
      errors: [
        {
          column: 30,
          endColumn: 32,
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

const func = (value: number) => ({ type: 'X', value }) as const satisfies R;
      `,
      errors: [
        {
          column: 30,
          endColumn: 32,
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
      code: 'const log = (message: string) => void console.log(message);',
      errors: [
        {
          column: 31,
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        { allowConciseArrowFunctionExpressionsStartingWithVoid: false },
      ],
    },
    {
      code: `
        const log = (message: string) => {
          void console.log(message);
        };
      `,
      errors: [
        {
          column: 39,
          endColumn: 41,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowConciseArrowFunctionExpressionsStartingWithVoid: true }],
    },
    {
      code: 'const log = <A,>(a: A) => a;',
      errors: [{ messageId: 'missingReturnType' }],
      options: [{ allowFunctionsWithoutTypeParameters: true }],
    },
    {
      code: `
function log<A>(a: A) {
  return a;
}
      `,
      errors: [{ messageId: 'missingReturnType' }],
      options: [{ allowFunctionsWithoutTypeParameters: true }],
    },
    {
      code: `
const log = function <A>(a: A) {
  return a;
};
      `,
      errors: [{ messageId: 'missingReturnType' }],
      options: [{ allowFunctionsWithoutTypeParameters: true }],
    },
    {
      code: `
function hoge() {
  return;
}
const foo = () => {
  return;
};
const baz = function () {
  return;
};
let [test, test] = function () {
  return;
};
class X {
  [test] = function () {
    return;
  };
}
const x = {
  1: function () {
    reutrn;
  },
};
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
        {
          column: 16,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'missingReturnType',
        },
        {
          column: 13,
          endColumn: 22,
          endLine: 8,
          line: 8,
          messageId: 'missingReturnType',
        },
        {
          column: 20,
          endColumn: 29,
          endLine: 11,
          line: 11,
          messageId: 'missingReturnType',
        },
        {
          column: 3,
          endColumn: 21,
          endLine: 15,
          line: 15,
          messageId: 'missingReturnType',
        },
        {
          column: 3,
          endColumn: 15,
          endLine: 20,
          line: 20,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowedNames: ['test', '1'],
        },
      ],
    },
    {
      code: `
const ignoredName = 'notIgnoredName';
class Foo {
  [ignoredName]() {}
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowedNames: ['ignoredName'] }],
    },
    {
      code: `
class Bar {
  bar = [
    {
      foo: x => x + 1,
    },
  ];
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 12,
          endLine: 5,
          line: 5,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
const foo = (function () {
  return 'foo';
})();
      `,
      errors: [
        {
          column: 14,
          endColumn: 23,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowIIFEs: false,
        },
      ],
    },
    {
      code: `
const foo = (function () {
  return () => {
    return 1;
  };
})();
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
      options: [
        {
          allowIIFEs: true,
        },
      ],
    },
    {
      code: `
let foo = function () {
  return 'foo';
};
      `,
      errors: [
        {
          column: 11,
          endColumn: 20,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowIIFEs: true,
        },
      ],
    },
    {
      code: `
let foo = (() => () => {})()();
      `,
      errors: [
        {
          column: 21,
          endColumn: 23,
          endLine: 2,
          line: 2,
          messageId: 'missingReturnType',
        },
      ],
      options: [
        {
          allowIIFEs: true,
        },
      ],
    },
    {
      code: `
type CallBack = () => void;

function f(gotcha: CallBack = () => {}): void {}
      `,
      errors: [
        {
          column: 34,
          endColumn: 36,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowTypedFunctionExpressions: false }],
    },
    {
      code: `
type CallBack = () => void;

const f = (gotcha: CallBack = () => {}): void => {};
      `,
      errors: [
        {
          column: 34,
          endColumn: 36,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowTypedFunctionExpressions: false }],
    },
    {
      code: `
type ObjectWithCallback = { callback: () => void };

const f = (gotcha: ObjectWithCallback = { callback: () => {} }): void => {};
      `,
      errors: [
        {
          column: 43,
          line: 4,
          messageId: 'missingReturnType',
        },
      ],
      options: [{ allowTypedFunctionExpressions: false }],
    },
  ],
});
