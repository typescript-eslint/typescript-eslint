import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-confusing-void-expression';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-confusing-void-expression', rule, {
  valid: [
    '() => Math.random();',
    "console.log('foo');",
    'foo && console.log(foo);',
    'foo || console.log(foo);',
    'foo ? console.log(true) : console.log(false);',
    "console?.log('foo');",

    {
      options: [{ ignoreArrowShorthand: true }],
      code: `
        () => console.log('foo');
      `,
    },
    {
      options: [{ ignoreArrowShorthand: true }],
      code: `
        foo => foo && console.log(foo);
      `,
    },
    {
      options: [{ ignoreArrowShorthand: true }],
      code: `
        foo => foo || console.log(foo);
      `,
    },
    {
      options: [{ ignoreArrowShorthand: true }],
      code: `
        foo => (foo ? console.log(true) : console.log(false));
      `,
    },

    {
      options: [{ ignoreVoidOperator: true }],
      code: `
        !void console.log('foo');
      `,
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: `
        +void (foo && console.log(foo));
      `,
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: `
        -void (foo || console.log(foo));
      `,
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: `
        () => void ((foo && void console.log(true)) || console.log(false));
      `,
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: `
        const x = void (foo ? console.log(true) : console.log(false));
      `,
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: `
        !(foo && void console.log(foo));
      `,
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: `
        !!(foo || void console.log(foo));
      `,
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: `
        const x = (foo && void console.log(true)) || void console.log(false);
      `,
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: `
        () => (foo ? void console.log(true) : void console.log(false));
      `,
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: `
        return void console.log('foo');
      `,
    },

    `
function cool(input: string) {
  return console.log(input), input;
}
    `,
    {
      code: `
function cool(input: string) {
  return input, console.log(input), input;
}
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
function test(): void {
  return console.log('foo');
}
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: "const test = (): void => console.log('foo');",
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
const test = (): void => {
  return console.log('foo');
};
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
function test(): void {
  {
    return console.log('foo');
  }
}
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
const data = {
  test(): void {
    return console.log('foo');
  },
};
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
class Foo {
  test(): void {
    return console.log('foo');
  }
}
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
const test = function (): void {
  return console.log('foo');
};
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
function test() {
  function nestedTest(): void {
    return console.log('foo');
  }
}
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
type Foo = void;

function test(): Foo {
  return console.log();
}
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
function returnVoid(): void {}

function test(): void {
  return returnVoid();
}
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
type Foo = void;
function returnVoid(): void {}

function test(): Foo {
  return returnVoid();
}
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
function test(): void & void {
  return console.log('foo');
}
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
type Foo = void;
declare function foo(): Foo;
function test(): Foo {
  return foo();
}
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
type Foo = void;
const test = (): Foo => console.log('err');
      `,
    },
    {
      code: `
    type Foo = () => void;
    const arrowFn: Foo = () => console.log('foo');
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
    type Foo = () => void;
    const funcExpr: Foo = function () {
      return console.log();
    };
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
    type Foo = () => void;
    const funcExpr: Foo = () => {
      return console.log();
    };
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
    type Foo = () => void;
    const x = (() => console.log()) as Foo;
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
    type Foo = {
      foo: () => void;
    };
    const q = {
      foo: () => console.log(),
    } as Foo;
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
    type Foo = {
      foo: () => void;
    };
    const x: Foo = {
      foo: () => console.log(),
    };
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
    const q = {
      foo: () => console.log(),
    } as {
      foo: () => void;
    };
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
    const x: {
      foo: () => void;
    } = {
      foo: () => console.log(),
    };
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
    type Foo = {
      foo: { bar: () => void };
    };
    const q = {
      foo: { bar: () => console.log() },
    } as Foo;
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
    type Foo = {
      foo: { bar: () => void };
    };
    const x: Foo = {
      foo: { bar: () => console.log() },
    };
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
    type MethodType = () => void;

    class App {
      private method: MethodType = () => console.log();
    }
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
    interface Foo {
      foo: () => void;
    }
    function bar(): Foo {
      return {
        foo: () => console.log(),
      };
    }
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
  type HigherOrderType = () => () => () => void;
  const x: HigherOrderType = () => () => () => console.log();
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
  declare function foo(arg: () => void): void;
  foo(() => console.log());
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: 'const foo = <button onClick={() => console.log()} />;',
      options: [{ ignoreVoidInVoid: true }],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `
type HigherOrderType = () => () => () => void;
const x: HigherOrderType = () => () => () => {
  return console.log();
};
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
    {
      code: `
      type HigherOrderType = () => () => () => void;
      const x: HigherOrderType = () => () => function () { return console.log() };
      `,
      options: [{ ignoreVoidInVoid: true }],
    },
  ],

  invalid: [
    {
      code: `
        const x = console.log('foo');
      `,
      errors: [{ column: 19, messageId: 'invalidVoidExpr' }],
    },
    {
      code: `
        const x = console?.log('foo');
      `,
      errors: [{ column: 19, messageId: 'invalidVoidExpr' }],
    },
    {
      code: `
        console.error(console.log('foo'));
      `,
      errors: [{ column: 23, messageId: 'invalidVoidExpr' }],
    },
    {
      code: `
        [console.log('foo')];
      `,
      errors: [{ column: 10, messageId: 'invalidVoidExpr' }],
    },
    {
      code: `
        ({ x: console.log('foo') });
      `,
      errors: [{ column: 15, messageId: 'invalidVoidExpr' }],
    },
    {
      code: `
        void console.log('foo');
      `,
      errors: [{ column: 14, messageId: 'invalidVoidExpr' }],
    },
    {
      code: `
        console.log('foo') ? true : false;
      `,
      errors: [{ column: 9, messageId: 'invalidVoidExpr' }],
    },
    {
      code: `
        (console.log('foo') && true) || false;
      `,
      errors: [{ column: 10, messageId: 'invalidVoidExpr' }],
    },
    {
      code: `
        (cond && console.log('ok')) || console.log('error');
      `,
      errors: [{ column: 18, messageId: 'invalidVoidExpr' }],
    },
    {
      code: `
        !console.log('foo');
      `,
      errors: [{ column: 10, messageId: 'invalidVoidExpr' }],
    },

    {
      code: `
function notcool(input: string) {
  return input, console.log(input);
}
      `,
      errors: [{ line: 3, column: 17, messageId: 'invalidVoidExpr' }],
    },
    {
      code: "() => console.log('foo');",
      errors: [{ line: 1, column: 7, messageId: 'invalidVoidExprArrow' }],
      output: `() => { console.log('foo'); };`,
    },
    {
      code: 'foo => foo && console.log(foo);',
      errors: [{ line: 1, column: 15, messageId: 'invalidVoidExprArrow' }],
    },
    {
      code: '(foo: undefined) => foo && console.log(foo);',
      errors: [{ line: 1, column: 28, messageId: 'invalidVoidExprArrow' }],
      output: `(foo: undefined) => { foo && console.log(foo); };`,
    },
    {
      code: 'foo => foo || console.log(foo);',
      errors: [{ line: 1, column: 15, messageId: 'invalidVoidExprArrow' }],
    },
    {
      code: '(foo: undefined) => foo || console.log(foo);',
      errors: [{ line: 1, column: 28, messageId: 'invalidVoidExprArrow' }],
      output: `(foo: undefined) => { foo || console.log(foo); };`,
    },
    {
      code: '(foo: void) => foo || console.log(foo);',
      errors: [{ line: 1, column: 23, messageId: 'invalidVoidExprArrow' }],
      output: `(foo: void) => { foo || console.log(foo); };`,
    },
    {
      code: 'foo => (foo ? console.log(true) : console.log(false));',
      errors: [
        { line: 1, column: 15, messageId: 'invalidVoidExprArrow' },
        { line: 1, column: 35, messageId: 'invalidVoidExprArrow' },
      ],
      output: `foo => { foo ? console.log(true) : console.log(false); };`,
    },
    {
      code: `
        function f() {
          return console.log('foo');
          console.log('bar');
        }
      `,
      errors: [{ line: 3, column: 18, messageId: 'invalidVoidExprReturn' }],
      output: `
        function f() {
          console.log('foo'); return;
          console.log('bar');
        }
      `,
    },
    {
      code: noFormat`
        function f() {
          console.log('foo')
          return ['bar', 'baz'].forEach(console.log)
          console.log('quux')
        }
      `,
      errors: [{ line: 4, column: 18, messageId: 'invalidVoidExprReturn' }],
      output: `
        function f() {
          console.log('foo')
          ;['bar', 'baz'].forEach(console.log); return;
          console.log('quux')
        }
      `,
    },
    {
      code: `
        function f() {
          console.log('foo');
          return console.log('bar');
        }
      `,
      errors: [{ line: 4, column: 18, messageId: 'invalidVoidExprReturnLast' }],
      output: `
        function f() {
          console.log('foo');
          console.log('bar');
        }
      `,
    },
    {
      code: noFormat`
        function f() {
          console.log('foo')
          return ['bar', 'baz'].forEach(console.log)
        }
      `,
      errors: [{ line: 4, column: 18, messageId: 'invalidVoidExprReturnLast' }],
      output: `
        function f() {
          console.log('foo')
          ;['bar', 'baz'].forEach(console.log);
        }
      `,
    },
    {
      code: `
        const f = () => {
          if (cond) {
            return console.error('foo');
          }
          console.log('bar');
        };
      `,
      errors: [{ line: 4, column: 20, messageId: 'invalidVoidExprReturn' }],
      output: `
        const f = () => {
          if (cond) {
            console.error('foo'); return;
          }
          console.log('bar');
        };
      `,
    },
    {
      code: `
        const f = function () {
          if (cond) return console.error('foo');
          console.log('bar');
        };
      `,
      errors: [{ line: 3, column: 28, messageId: 'invalidVoidExprReturn' }],
      output: `
        const f = function () {
          if (cond) { console.error('foo'); return; }
          console.log('bar');
        };
      `,
    },
    {
      code: `
        const f = function () {
          let num = 1;
          return num ? console.log('foo') : num;
        };
      `,
      errors: [{ line: 4, column: 24, messageId: 'invalidVoidExprReturnLast' }],
    },
    {
      code: `
        const f = function () {
          let undef = undefined;
          return undef ? console.log('foo') : undef;
        };
      `,
      errors: [{ line: 4, column: 26, messageId: 'invalidVoidExprReturnLast' }],
      output: `
        const f = function () {
          let undef = undefined;
          undef ? console.log('foo') : undef;
        };
      `,
    },
    {
      code: `
        const f = function () {
          let num = 1;
          return num || console.log('foo');
        };
      `,
      errors: [{ line: 4, column: 25, messageId: 'invalidVoidExprReturnLast' }],
    },
    {
      code: `
        const f = function () {
          let bar = void 0;
          return bar || console.log('foo');
        };
      `,
      errors: [{ line: 4, column: 25, messageId: 'invalidVoidExprReturnLast' }],
      output: `
        const f = function () {
          let bar = void 0;
          bar || console.log('foo');
        };
      `,
    },
    {
      code: `
        let num = 1;
        const foo = () => (num ? console.log('foo') : num);
      `,
      errors: [{ line: 3, column: 34, messageId: 'invalidVoidExprArrow' }],
    },
    {
      code: `
        let bar = void 0;
        const foo = () => (bar ? console.log('foo') : bar);
      `,
      errors: [{ line: 3, column: 34, messageId: 'invalidVoidExprArrow' }],
      output: `
        let bar = void 0;
        const foo = () => { bar ? console.log('foo') : bar; };
      `,
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: "return console.log('foo');",
      errors: [
        { line: 1, column: 8, messageId: 'invalidVoidExprReturnWrapVoid' },
      ],
      output: "return void console.log('foo');",
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: "console.error(console.log('foo'));",
      errors: [
        {
          line: 1,
          column: 15,
          messageId: 'invalidVoidExprWrapVoid',
          suggestions: [
            {
              messageId: 'voidExprWrapVoid',
              output: "console.error(void console.log('foo'));",
            },
          ],
        },
      ],
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: "console.log('foo') ? true : false;",
      errors: [
        {
          line: 1,
          column: 1,
          messageId: 'invalidVoidExprWrapVoid',
          suggestions: [
            {
              messageId: 'voidExprWrapVoid',
              output: "void console.log('foo') ? true : false;",
            },
          ],
        },
      ],
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: "const x = foo ?? console.log('foo');",
      errors: [
        {
          line: 1,
          column: 18,
          messageId: 'invalidVoidExprWrapVoid',
          suggestions: [
            {
              messageId: 'voidExprWrapVoid',
              output: "const x = foo ?? void console.log('foo');",
            },
          ],
        },
      ],
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: 'foo => foo || console.log(foo);',
      errors: [
        { line: 1, column: 15, messageId: 'invalidVoidExprArrowWrapVoid' },
      ],
      output: 'foo => foo || void console.log(foo);',
    },
    {
      options: [{ ignoreVoidOperator: true }],
      code: "!!console.log('foo');",
      errors: [
        {
          line: 1,
          column: 3,
          messageId: 'invalidVoidExprWrapVoid',
          suggestions: [
            {
              messageId: 'voidExprWrapVoid',
              output: "!!void console.log('foo');",
            },
          ],
        },
      ],
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
function test() {
  return console.log('foo');
}
      `,
      errors: [
        {
          line: 3,
          column: 10,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      output: `
function test() {
  console.log('foo');
}
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: "const test = () => console.log('foo');",
      errors: [
        {
          line: 1,
          column: 20,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      output: "const test = () => { console.log('foo'); };",
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
const test = () => {
  return console.log('foo');
};
      `,
      errors: [
        {
          line: 3,
          column: 10,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      output: `
const test = () => {
  console.log('foo');
};
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
function foo(): void {
  const bar = () => {
    return console.log();
  };
}
      `,
      errors: [
        {
          line: 4,
          column: 12,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      output: `
function foo(): void {
  const bar = () => {
    console.log();
  };
}
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
return console.log('foo');
      `,
      errors: [
        {
          line: 2,
          column: 8,
          messageId: 'invalidVoidExprReturn',
        },
      ],
      output: `
{ console.log('foo'); return; }
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
      type Foo = () => void;
      const test1: Foo = function () {
        function testtt() {
          return console.log();
        }
      };
      `,
      errors: [
        {
          line: 5,
          column: 18,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      output: `
      type Foo = () => void;
      const test1: Foo = function () {
        function testtt() {
          console.log();
        }
      };
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
      type Foo = () => void;
      const test2 = function () {
        function testtt() {
          return console.log();
        }
      };
      `,
      errors: [
        {
          line: 5,
          column: 18,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      output: `
      type Foo = () => void;
      const test2 = function () {
        function testtt() {
          console.log();
        }
      };
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
        (): any => console.log('foo');
      `,
      errors: [
        {
          line: 2,
          column: 20,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      output: `
        (): any => { console.log('foo'); };
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
        (): unknown => console.log('foo');
      `,
      errors: [
        {
          line: 2,
          column: 24,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      output: `
        (): unknown => { console.log('foo'); };
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
      function test(): any {
        return console.log();
      }
      `,
      errors: [
        {
          line: 3,
          column: 16,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      output: `
      function test(): any {
        console.log();
      }
      `,
    },
    {
      options: [{ ignoreVoidInVoid: true }],
      code: `
      function test(): unknown {
        return console.log();
      }
      `,
      errors: [
        {
          line: 3,
          column: 16,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      output: `
      function test(): unknown {
        console.log();
      }
      `,
    },
  ],
});
