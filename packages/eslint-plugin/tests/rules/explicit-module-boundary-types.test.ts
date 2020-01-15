import rule from '../../src/rules/explicit-module-boundary-types';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('explicit-module-boundary-types', rule, {
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
export function test(): void {
    return;
}
            `,
    },
    {
      filename: 'test.ts',
      code: `
export var fn = function(): number {
    return 1;
};
            `,
    },
    {
      filename: 'test.ts',
      code: `
export var arrowFn = (): string => 'test';
            `,
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
  arrow = (): string => 'arrow';
}
            `,
    },
    {
      filename: 'test.ts',
      code: `
export class Test {
  constructor() {}
  get prop(): number {
    return 1;
  }
  set prop() {}
  private method(one) {
    return;
  }
  arrow = (): string => 'arrow';
}
            `,
    },
    {
      filename: 'test.ts',
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
      filename: 'test.ts',
      code: `
export var funcExpr: Foo = function() { return 'test'; };
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
export const x = {
  foo: () => {},
} as Foo
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      filename: 'test.ts',
      code: `
export const x = <Foo>{
  foo: () => {},
}
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    {
      filename: 'test.ts',
      code: `
export const x: Foo = {
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

export class App {
  public method: MethodType = () => {}
}
      `,
      options: [{ allowTypedFunctionExpressions: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/525
    {
      filename: 'test.ts',
      code: `
export const myObj = {
  set myProp(val: number) {
    this.myProp = val;
  },
};
      `,
    },
    {
      filename: 'test.ts',
      code: `
export default () => (): void => {};
            `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
export default () => function (): void {};
            `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
export default () => { return (): void => {} };
            `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
export default () => { return function (): void {} };
            `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
export function fn() { return (): void => {} };
            `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
export function fn() { return function (): void {} };
            `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
      code: `
export function FunctionDeclaration() {
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
export default () => () => { return (): void => { return; } };
            `,
      options: [{ allowHigherOrderFunctions: true }],
    },
    {
      filename: 'test.ts',
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
      filename: 'test.ts',
      code: `
export const func1 = (value: number) => (({ type: "X", value }) as const);
export const func2 = (value: number) => ({ type: "X", value } as const);
export const func3 = (value: number) => (x as const);
export const func4 = (value: number) => x as const;
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
export const func1 = (value: string) => value;
export const func2 = (value: number) => ({ type: "X", value });
      `,
      options: [
        {
          allowedNames: ['func1', 'func2'],
        },
      ],
    },
    {
      filename: 'test.ts',
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
          allowedNames: ['prop', 'method'],
        },
      ],
    },
  ],
  invalid: [
    {
      filename: 'test.ts',
      code: `
export function test(
  a: number,
  b: number,
) {
  return;
}
      `,
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 5,
          column: 8,
          endColumn: 2,
        },
      ],
    },
    {
      filename: 'test.ts',
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
      filename: 'test.ts',
      code: `
export var fn = function() {
  return 1;
};
      `,
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 17,
          endColumn: 27,
        },
      ],
    },
    {
      filename: 'test.ts',
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
      filename: 'test.ts',
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
  arrow = (arg) => 'arrow';
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
          messageId: 'missingArgType',
          line: 11,
          endLine: 11,
          column: 11,
          endColumn: 27,
        },
        {
          messageId: 'missingReturnType',
          line: 11,
          endLine: 11,
          column: 11,
          endColumn: 19,
        },
      ],
    },
    {
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
      code: "export var funcExpr = function() { return 'test'; };",
      options: [{ allowTypedFunctionExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 23,
          endColumn: 33,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: 'export const x = (() => {}) as Foo',
      options: [{ allowTypedFunctionExpressions: false }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 19,
          endColumn: 24,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
interface Foo {}
export const x = {
  foo: () => {},
} as Foo
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
export const x: Foo = {
  foo: () => {},
}
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
      filename: 'test.ts',
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
      filename: 'test.ts',
      code: 'export default () => { return () => {} };',
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 31,
          endColumn: 36,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: 'export default () => { return function () {} };',
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 31,
          endColumn: 42,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: 'export function fn() { return () => {} };',
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 31,
          endColumn: 36,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: 'export function fn() { return function () {} };',
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 31,
          endColumn: 42,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
export function FunctionDeclaration() {
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
          endLine: 7,
          column: 11,
          endColumn: 16,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: 'export default () => () => { return () => { return; } };',
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 37,
          endColumn: 42,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: 'export default (() => true)()',
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
          column: 17,
          endColumn: 22,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
export const func1 = (value: number) => ({ type: "X", value } as any);
export const func2 = (value: number) => ({ type: "X", value } as Action);
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
      filename: 'test.ts',
      code: `
export const func = (value: number) => ({ type: "X", value } as const);
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
      filename: 'test.ts',
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
      filename: 'test.ts',
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
      filename: 'test.ts',
      code: 'export function fn(test): string { return "123" };',
      errors: [
        {
          messageId: 'missingArgType',
          line: 1,
          endLine: 1,
          column: 8,
          endColumn: 50,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: 'export const fn = (one: number, two): string => "123";',
      errors: [
        {
          messageId: 'missingArgType',
          line: 1,
          endLine: 1,
          column: 19,
          endColumn: 54,
        },
      ],
    },
  ],
});
