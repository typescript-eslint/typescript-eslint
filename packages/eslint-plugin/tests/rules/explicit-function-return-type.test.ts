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
var fn = function(): number {
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
      code: `fn(() => {});`,
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `fn(function() {});`,
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `[function() {}, () => {}]`,
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `(function() {});`,
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `(() => {})();`,
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
var funcExpr: Foo = function() { return 'test'; };
            `,
      options: [
        {
          allowTypedFunctionExpressions: true,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `const x = (() => {}) as Foo`,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      filename: 'test.ts',
      code: `const x = <Foo>(() => {})`,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      filename: 'test.ts',
      code: `
const x = {
  foo: () => {},
} as Foo
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      filename: 'test.ts',
      code: `
const x = <Foo>{
  foo: () => {},
}
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      filename: 'test.ts',
      code: `
const x: Foo = {
  foo: () => {},
}
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/484
    {
      filename: 'test.ts',
      code: `
type MethodType = () => void;

class App {
  private method: MethodType = () => {}
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
() => { return (): void => {} };
            `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
() => { return function (): void {} };
            `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
function fn() { return (): void => {} };
            `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
function fn() { return function (): void {} };
            `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
function FunctionDeclaration() {
  return function FunctionExpression_Within_FunctionDeclaration() {
    return function FunctionExpression_Within_FunctionExpression() {
      return () => { // ArrowFunctionExpression_Within_FunctionExpression
        return () => // ArrowFunctionExpression_Within_ArrowFunctionExpression
          (): number => 1 // ArrowFunctionExpression_Within_ArrowFunctionExpression_WithNoBody
      }
    }
  }
}
            `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
() => () => { return (): void => { return; } };
            `,
      options: [{ allowHigherOrderFunctions: true }],
    },
  ],
  invalid: [
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
          column: 1,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
var fn = function() {
    return 1;
};
            `,
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          column: 10,
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
          column: 15,
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
}
            `,
      errors: [
        {
          messageId: 'missingReturnType',
          line: 4,
          column: 11,
        },
        {
          messageId: 'missingReturnType',
          line: 8,
          column: 9,
        },
        {
          messageId: 'missingReturnType',
          line: 11,
          column: 11,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `function test() {
        return;
      }`,
      options: [{ allowExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `const foo = () => {};`,
      options: [{ allowExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          column: 13,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `const foo = function() {};`,
      options: [{ allowExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          column: 13,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `var arrowFn = () => 'test';`,
      options: [{ allowTypedFunctionExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          column: 15,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `var funcExpr = function() { return 'test'; };`,
      options: [{ allowTypedFunctionExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          column: 16,
        },
      ],
    },

    {
      filename: 'test.ts',
      code: `const x = (() => {}) as Foo`,
      options: [{ allowTypedFunctionExpressions: false }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
interface Foo {}
const x = {
  foo: () => {},
} as Foo
      `,
      options: [{ allowTypedFunctionExpressions: false }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 4,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
interface Foo {}
const x: Foo = {
  foo: () => {},
}
      `,
      options: [{ allowTypedFunctionExpressions: false }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 4,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
() => () => {};
            `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          column: 7,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
() => function () {};
            `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          column: 7,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
() => { return () => {} };
            `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          column: 16,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
() => { return function () {} };
            `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          column: 16,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
function fn() { return () => {} };
            `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          column: 24,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
function fn() { return function () {} };
            `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          column: 24,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
function FunctionDeclaration() {
  return function FunctionExpression_Within_FunctionDeclaration() {
    return function FunctionExpression_Within_FunctionExpression() {
      return () => { // ArrowFunctionExpression_Within_FunctionExpression
        return () => // ArrowFunctionExpression_Within_ArrowFunctionExpression
          () => 1 // ArrowFunctionExpression_Within_ArrowFunctionExpression_WithNoBody
      }
    }
  }
}
            `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 7,
          column: 11,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
() => () => { return () => { return; } };
            `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          column: 22,
        },
      ],
    },
  ],
});
