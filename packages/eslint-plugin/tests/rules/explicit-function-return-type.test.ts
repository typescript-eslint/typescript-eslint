import rule from '../../src/rules/explicit-function-return-type';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('explicit-function-return-type', rule, {
  valid: [
    {
      filename: 'test.ts',
      code: `
function test(): void {
  return;
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
var fn = function (): number {
  return 1;
};
      `,
    },
    {
      filename: 'test.ts',
      code: `
var arrowFn = (): string => 'test';
      `,
    },
    {
      filename: 'test.ts',
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
      filename: 'test.ts',
      code: 'fn(() => {});',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: 'fn(function () {});',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: '[function () {}, () => {}];',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: '(function () {});',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: '(() => {})();',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: 'export default (): void => {};',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
      code: 'const x = (() => {}) as Foo;',
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      filename: 'test.ts',
      code: 'const x = <Foo>(() => {});',
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      filename: 'test.ts',
      code: `
const x = {
  foo: () => {},
} as Foo;
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      filename: 'test.ts',
      code: `
const x = <Foo>{
  foo: () => {},
};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      filename: 'test.ts',
      code: `
const x: Foo = {
  foo: () => {},
};
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/484
    {
      filename: 'test.ts',
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
      filename: 'test.ts',
      code: `
const myObj = {
  set myProp(val) {
    this.myProp = val;
  },
};
      `,
    },
    {
      filename: 'test.ts',
      code: `
() => (): void => {};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
() => function (): void {};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
() => {
  return (): void => {};
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
() => {
  return function (): void {};
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
function fn() {
  return (): void => {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
function fn() {
  return function (): void {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
function FunctionDeclaration() {
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
      code: 'const log = (message: string) => void console.log(message);',
      options: [{ allowConciseArrowFunctionExpressionsStartingWithVoid: true }],
    },
  ],
  invalid: [
    {
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
      code: `
function FunctionDeclaration() {
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
  ],
});
