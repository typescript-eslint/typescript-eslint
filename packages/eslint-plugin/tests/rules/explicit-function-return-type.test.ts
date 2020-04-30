import rule from '../../src/rules/explicit-function-return-type';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
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
var fn = function(): number {
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
      code: 'fn(function() {});',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      code: '[function() {}, () => {}];',
      options: [
        {
          allowExpressions: true,
        },
      ],
    },
    {
      code: '(function() {});',
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
var funcExpr: Foo = function() {
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
() => function(): void {};
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
  return function(): void {};
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
  return function(): void {};
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
  meth: function() {
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
  ],
  invalid: [
    {
      code: `
function test(a: number, b: number) {
  return;
}
      `,
      output: `
function test(a: number, b: number): void {
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
      output: `
function test(): void {
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
var fn = function() {
  return 1;
};
      `,
      output: `
var fn = function(): number {
  return 1;
};
      `,
      errors: [
        {
          messageId: 'missingReturnType',
          line: 2,
          endLine: 2,
          column: 10,
          endColumn: 20,
        },
      ],
    },
    {
      code: `
var arrowFn = () => 'test';
      `,
      output: `
var arrowFn = (): string => 'test';
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
      output: `
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
  private method(): void {
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
      output: `
function test(): void {
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
      output: 'const foo = (): void => {};',
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
      code: 'const foo = function() {};',
      output: 'const foo = function(): void {};',
      options: [{ allowExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 13,
          endColumn: 23,
        },
      ],
    },
    {
      code: 'export default () => {};',
      output: 'export default (): void => {};',
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
      code: 'export default function() {}',
      output: 'export default function(): void {}',
      options: [{ allowExpressions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 16,
          endColumn: 26,
        },
      ],
    },
    {
      code: `
class Foo {
  public a = () => {};
  public b = function() {};
  public c = function test() {};

  static d = () => {};
  static e = function() {};
}
      `,
      output: `
class Foo {
  public a = (): void => {};
  public b = function(): void {};
  public c = function test(): void {};

  static d = (): void => {};
  static e = function(): void {};
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
          endColumn: 24,
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
          endColumn: 24,
        },
      ],
    },
    {
      code: "var arrowFn = () => 'test';",
      output: "var arrowFn = (): string => 'test';",
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
var funcExpr = function() {
  return 'test';
};
      `,
      output: `
var funcExpr = function(): string {
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
          endColumn: 26,
        },
      ],
    },
    {
      code: 'const x = (() => {}) as Foo;',
      output: 'const x = ((): void => {}) as Foo;',
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
      output: `
interface Foo {}
const x = {
  foo: (): void => {},
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
      output: `
interface Foo {}
const x: Foo = {
  foo: (): void => {},
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
      output: '() => (): void => {};',
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
      code: '() => function() {};',
      output: '() => function(): void {};',
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 1,
          endLine: 1,
          column: 7,
          endColumn: 17,
        },
      ],
    },
    {
      code: `
() => {
  return () => {};
};
      `,
      output: `
() => {
  return (): void => {};
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
  return function() {};
};
      `,
      output: `
() => {
  return function(): void {};
};
      `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 10,
          endColumn: 20,
        },
      ],
    },
    {
      code: `
function fn() {
  return () => {};
}
      `,
      output: `
function fn() {
  return (): void => {};
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
  return function() {};
}
      `,
      output: `
function fn() {
  return function(): void {};
}
      `,
      options: [{ allowHigherOrderFunctions: true }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 10,
          endColumn: 20,
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
          () => 1; // ArrowFunctionExpression_Within_ArrowFunctionExpression_WithNoBody
      };
    };
  };
}
      `,
      output: `
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
      output: `
() => () => {
  return (): void => {
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
      output: `
declare function foo(arg: () => void): void;
foo((): number => 1);
foo((): void => {});
foo((): null => null);
foo((): boolean => true);
foo((): string => '');
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
      output: `
class Accumulator {
  private count: number = 0;

  public accumulate(fn: () => number): void {
    this.count += fn();
  }
}

new Accumulator().accumulate((): number => 1);
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
      output: '((): boolean => true)();',
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
  meth: function() {
    return 1;
  },
});
foo({
  meth: () => {
    return 1;
  },
});
      `,
      output: `
declare function foo(arg: { meth: () => number }): void;
foo({
  meth(): number {
    return 1;
  },
});
foo({
  meth: function(): number {
    return 1;
  },
});
foo({
  meth: (): number => {
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
          endColumn: 19,
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
type Action = { type: string; value: number };
const func = (value: number) => ({ type: 'X', value } as any);
const func = (value: number) => ({ type: 'X', value } as Action);
      `,
      output: `
type Action = { type: string; value: number };
const func = (value: number): any => ({ type: 'X', value } as any);
const func = (value: number): Action => ({ type: 'X', value } as Action);
      `,
      options: [
        {
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          endLine: 3,
          column: 14,
          endColumn: 32,
        },
        {
          messageId: 'missingReturnType',
          line: 4,
          endLine: 4,
          column: 14,
          endColumn: 32,
        },
      ],
    },
    {
      code: `
const func = (value: number) => ({ type: 'X', value } as const);
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: `
const func = (value: number): { readonly type: "X"; readonly value: number; } => ({ type: 'X', value } as const);
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
      output:
        'const log = (message: string): undefined => void console.log(message);',
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
      output: `
        const log = (message: string): void => {
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
