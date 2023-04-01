import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/explicit-function-return-type';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('explicit-function-return-type', rule, {
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
      code: `
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
      code: 'const x = <Foo>(() => {});',
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
      code: `
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
      code: `
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
const func = (value: number) => ({ type: 'X', value } as const);
const func = (value: number) => ({ type: 'X', value } as const);
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
      code: 'const log = <A>(a: A): A => a;',
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
      options: [
        {
          allowedNames: ['test1', 'test2'],
        },
      ],
      code: `
function test1() {
  return;
}

const foo = function test2() {
  return;
};
      `,
    },
    {
      options: [
        {
          allowedNames: ['test1', 'test2'],
        },
      ],
      code: `
const test1 = function () {
  return;
};
const foo = function () {
  return function test2() {};
};
      `,
    },
    {
      options: [
        {
          allowedNames: ['test1', 'test2'],
        },
      ],
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
    },
    {
      code: `
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
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
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
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: false,
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
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
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
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
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
          allowIIFEs: true,
          allowHigherOrderFunctions: false,
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
          allowHigherOrderFunctions: true,
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
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 1,
          endColumn: 36,
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
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 1,
          endColumn: 16,
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
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 10,
          endColumn: 21,
        },
      ],
    },
    {
      code: `
var arrowFn = () => 'test';
      `,
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 15,
          endColumn: 20,
        },
      ],
    },
    {
      code: `
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
          messageId: 'missingReturnType',
          line: 4,
          endLine: 4,
          column: 3,
          endColumn: 13,
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
          endColumn: 16,
        },
        {
          messageId: 'missingReturnType',
          line: 12,
          endLine: 12,
          column: 3,
          endColumn: 19,
        },
      ],
    },
    {
      code: `
function test() {
  return;
}
      `,
      options: [{ allowExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 1,
          endColumn: 16,
        },
      ],
    },
    {
      code: 'const foo = () => {};',
      options: [{ allowExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 13,
          endColumn: 18,
        },
      ],
    },
    {
      code: 'const foo = function () {};',
      options: [{ allowExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 13,
          endColumn: 24,
        },
      ],
    },
    {
      code: 'export default () => {};',
      options: [{ allowExpressions: true }],
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
      code: 'export default function () {}',
      options: [{ allowExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 16,
          endColumn: 27,
        },
      ],
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
      options: [{ allowExpressions: true }],
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
      code: "var arrowFn = () => 'test';",
      options: [{ allowTypedFunctionExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 15,
          endColumn: 20,
        },
      ],
    },
    {
      code: `
var funcExpr = function () {
  return 'test';
};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 16,
          endColumn: 27,
        },
      ],
    },

    {
      code: 'const x = (() => {}) as Foo;',
      options: [{ allowTypedFunctionExpressions: false }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 12,
          endColumn: 17,
        },
      ],
    },
    {
      code: `
interface Foo {}
const x = {
  foo: () => {},
} as Foo;
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
      code: `
interface Foo {}
const x: Foo = {
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
      code: '() => () => {};',
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 7,
          endColumn: 12,
        },
      ],
    },
    {
      code: '() => function () {};',
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 7,
          endColumn: 18,
        },
      ],
    },
    {
      code: `
() => {
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
() => {
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
function fn() {
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
function fn() {
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
() => () => {
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
          allowTypedFunctionExpressions: false,
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 5,
          endColumn: 10,
        },
        {
          messageId: 'missingReturnType',
          line: 4,
          endLine: 4,
          column: 5,
          endColumn: 10,
        },
        {
          messageId: 'missingReturnType',
          line: 5,
          endLine: 5,
          column: 5,
          endColumn: 10,
        },
        {
          messageId: 'missingReturnType',
          line: 6,
          endLine: 6,
          column: 5,
          endColumn: 10,
        },
        {
          messageId: 'missingReturnType',
          line: 7,
          endLine: 7,
          column: 5,
          endColumn: 10,
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
          allowTypedFunctionExpressions: false,
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 10,
          endLine: 10,
          column: 30,
          endColumn: 35,
        },
      ],
    },
    {
      code: '(() => true)();',
      options: [
        {
          allowTypedFunctionExpressions: false,
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 2,
          endColumn: 7,
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
          allowTypedFunctionExpressions: false,
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 4,
          endLine: 4,
          column: 3,
          endColumn: 9,
        },
        {
          messageId: 'missingReturnType',
          line: 9,
          endLine: 9,
          column: 9,
          endColumn: 20,
        },
        {
          messageId: 'missingReturnType',
          line: 14,
          endLine: 14,
          column: 9,
          endColumn: 14,
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
          allowTypedFunctionExpressions: false,
          allowHigherOrderFunctions: true,
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 42,
          endColumn: 49,
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
          allowTypedFunctionExpressions: false,
          allowHigherOrderFunctions: false,
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 28,
          endColumn: 33,
        },
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 41,
        },
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 42,
          endColumn: 49,
        },
      ],
    },
    {
      code: `
const func = (value: number) => ({ type: 'X', value } as any);
const func = (value: number) => ({ type: 'X', value } as Action);
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
          column: 14,
          endColumn: 32,
        },
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 14,
          endColumn: 32,
        },
      ],
    },
    {
      code: `
const func = (value: number) => ({ type: 'X', value } as const);
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
          column: 14,
          endColumn: 32,
        },
      ],
    },
    {
      code: 'const log = (message: string) => void console.log(message);',
      options: [
        { allowConciseArrowFunctionExpressionsStartingWithVoid: false },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 13,
          endColumn: 33,
        },
      ],
    },
    {
      code: `
        const log = (message: string) => {
          void console.log(message);
        };
      `,
      options: [{ allowConciseArrowFunctionExpressionsStartingWithVoid: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 21,
          endColumn: 41,
        },
      ],
    },
    {
      code: 'const log = <A>(a: A) => a;',
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
      options: [
        {
          allowedNames: ['test', '1'],
        },
      ],
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
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 1,
          endColumn: 16,
        },
        {
          messageId: 'missingReturnType',
          line: 5,
          endLine: 5,
          column: 13,
          endColumn: 18,
        },
        {
          messageId: 'missingReturnType',
          line: 8,
          endLine: 8,
          column: 13,
          endColumn: 24,
        },
        {
          messageId: 'missingReturnType',
          line: 11,
          endLine: 11,
          column: 20,
          endColumn: 31,
        },
        {
          line: 15,
          column: 12,
          messageId: 'missingReturnType',
          endLine: 15,
          endColumn: 23,
        },
        {
          messageId: 'missingReturnType',
          line: 20,
          endLine: 20,
          column: 6,
          endColumn: 17,
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
      options: [{ allowedNames: ['ignoredName'] }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 4,
          endLine: 4,
          column: 3,
          endColumn: 18,
        },
      ],
    },
    {
      code: `
const foo = (function () {
  return 'foo';
})();
      `,
      options: [
        {
          allowIIFEs: false,
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 14,
          endColumn: 25,
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
      options: [
        {
          allowIIFEs: true,
        },
      ],
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
let foo = function () {
  return 'foo';
};
      `,
      options: [
        {
          allowIIFEs: true,
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 11,
          endColumn: 22,
        },
      ],
    },
    {
      code: `
let foo = (() => () => {})()();
      `,
      options: [
        {
          allowIIFEs: true,
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 18,
          endColumn: 23,
        },
      ],
    },
  ],
});
