import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-confusing-void-expression';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-confusing-void-expression', rule, {
  valid: [
    '() => Math.random();',
    "console.log('foo');",
    'foo && console.log(foo);',
    'foo || console.log(foo);',
    'foo ? console.log(true) : console.log(false);',
    "console?.log('foo');",

    {
      code: `
        () => console.log('foo');
      `,
      options: [{ ignoreArrowShorthand: true }],
    },
    {
      code: `
        foo => foo && console.log(foo);
      `,
      options: [{ ignoreArrowShorthand: true }],
    },
    {
      code: `
        foo => foo || console.log(foo);
      `,
      options: [{ ignoreArrowShorthand: true }],
    },
    {
      code: `
        foo => (foo ? console.log(true) : console.log(false));
      `,
      options: [{ ignoreArrowShorthand: true }],
    },

    {
      code: `
        !void console.log('foo');
      `,
      options: [{ ignoreVoidOperator: true }],
    },
    {
      code: `
        +void (foo && console.log(foo));
      `,
      options: [{ ignoreVoidOperator: true }],
    },
    {
      code: `
        -void (foo || console.log(foo));
      `,
      options: [{ ignoreVoidOperator: true }],
    },
    {
      code: `
        () => void ((foo && void console.log(true)) || console.log(false));
      `,
      options: [{ ignoreVoidOperator: true }],
    },
    {
      code: `
        const x = void (foo ? console.log(true) : console.log(false));
      `,
      options: [{ ignoreVoidOperator: true }],
    },
    {
      code: `
        !(foo && void console.log(foo));
      `,
      options: [{ ignoreVoidOperator: true }],
    },
    {
      code: `
        !!(foo || void console.log(foo));
      `,
      options: [{ ignoreVoidOperator: true }],
    },
    {
      code: `
        const x = (foo && void console.log(true)) || void console.log(false);
      `,
      options: [{ ignoreVoidOperator: true }],
    },
    {
      code: `
        () => (foo ? void console.log(true) : void console.log(false));
      `,
      options: [{ ignoreVoidOperator: true }],
    },
    {
      code: `
        return void console.log('foo');
      `,
      options: [{ ignoreVoidOperator: true }],
    },

    `
function cool(input: string) {
  return (console.log(input), input);
}
    `,
    {
      code: `
function cool(input: string) {
  return (input, console.log(input), input);
}
      `,
    },
    {
      code: `
function test(): void {
  return console.log('bar');
}
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
const test = (): void => {
  return console.log('bar');
};
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
const test = (): void => console.log('bar');
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
function test(): void {
  {
    return console.log('foo');
  }
}
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
const obj = {
  test(): void {
    return console.log('foo');
  },
};
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
class Foo {
  test(): void {
    return console.log('foo');
  }
}
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
function test() {
  function nestedTest(): void {
    return console.log('foo');
  }
}
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
type Foo = () => void;
const test = (() => console.log()) as Foo;
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
type Foo = {
  foo: () => void;
};
const test: Foo = {
  foo: () => console.log(),
};
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
const test = {
  foo: () => console.log(),
} as {
  foo: () => void;
};
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
const test: {
  foo: () => void;
} = {
  foo: () => console.log(),
};
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
type Foo = {
  foo: { bar: () => void };
};

const test = {
  foo: { bar: () => console.log() },
} as Foo;
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
type Foo = {
  foo: { bar: () => void };
};

const test: Foo = {
  foo: { bar: () => console.log() },
};
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
type MethodType = () => void;

class App {
  private method: MethodType = () => console.log();
}
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
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
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
type Foo = () => () => () => void;
const x: Foo = () => () => () => console.log();
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
type Foo = {
  foo: () => void;
};

const test = {
  foo: () => console.log(),
} as Foo;
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
type Foo = () => void;
const test: Foo = () => console.log('foo');
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: 'const foo = <button onClick={() => console.log()} />;',
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
declare function foo(arg: () => void): void;
foo(() => console.log());
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
declare function foo(arg: (() => void) | (() => string)): void;
foo(() => console.log());
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
declare function foo(arg: (() => void) | (() => string) | string): void;
foo(() => console.log());
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
declare function foo(arg: () => void | string): void;
foo(() => console.log());
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
declare function foo(options: { cb: () => void }): void;
foo({ cb: () => console.log() });
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
const obj = {
  foo: { bar: () => console.log() },
} as {
  foo: { bar: () => void };
};
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
function test(): void & void {
  return console.log('foo');
}
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
type Foo = void;

declare function foo(): Foo;

function test(): Foo {
  return foo();
}
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
type Foo = void;
const test = (): Foo => console.log('err');
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
const test: () => any = (): void => console.log();
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
function test(): void | string {
  return console.log('bar');
}
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
    {
      code: `
export function makeDate(): Date;
export function makeDate(m: number): void;
export function makeDate(m?: number): Date | void {
  if (m !== undefined) {
    return console.log('123');
  }
  return new Date();
}

declare const test: (cb: () => void) => void;

test((() => {
  return console.log('123');
}) as typeof makeDate | (() => string));
      `,
      options: [{ ignoreVoidReturningFunctions: true }],
    },
  ],

  invalid: [
    {
      code: `
        const x = console.log('foo');
      `,
      errors: [{ column: 19, messageId: 'invalidVoidExpr' }],
      output: null,
    },
    {
      code: `
        const x = console?.log('foo');
      `,
      errors: [{ column: 19, messageId: 'invalidVoidExpr' }],
      output: null,
    },
    {
      code: `
        console.error(console.log('foo'));
      `,
      errors: [{ column: 23, messageId: 'invalidVoidExpr' }],
      output: null,
    },
    {
      code: `
        [console.log('foo')];
      `,
      errors: [{ column: 10, messageId: 'invalidVoidExpr' }],
      output: null,
    },
    {
      code: `
        ({ x: console.log('foo') });
      `,
      errors: [{ column: 15, messageId: 'invalidVoidExpr' }],
      output: null,
    },
    {
      code: `
        void console.log('foo');
      `,
      errors: [{ column: 14, messageId: 'invalidVoidExpr' }],
      output: null,
    },
    {
      code: `
        console.log('foo') ? true : false;
      `,
      errors: [{ column: 9, messageId: 'invalidVoidExpr' }],
      output: null,
    },
    {
      code: `
        (console.log('foo') && true) || false;
      `,
      errors: [{ column: 10, messageId: 'invalidVoidExpr' }],
      output: null,
    },
    {
      code: `
        (cond && console.log('ok')) || console.log('error');
      `,
      errors: [{ column: 18, messageId: 'invalidVoidExpr' }],
      output: null,
    },
    {
      code: `
        !console.log('foo');
      `,
      errors: [{ column: 10, messageId: 'invalidVoidExpr' }],
      output: null,
    },

    {
      code: `
function notcool(input: string) {
  return (input, console.log(input));
}
      `,
      errors: [{ column: 18, line: 3, messageId: 'invalidVoidExpr' }],
      output: null,
    },
    {
      code: "() => console.log('foo');",
      errors: [{ column: 7, line: 1, messageId: 'invalidVoidExprArrow' }],
      output: `() => { console.log('foo'); };`,
    },
    {
      code: 'foo => foo && console.log(foo);',
      errors: [{ column: 15, line: 1, messageId: 'invalidVoidExprArrow' }],
      output: null,
    },
    {
      code: '(foo: undefined) => foo && console.log(foo);',
      errors: [{ column: 28, line: 1, messageId: 'invalidVoidExprArrow' }],
      output: `(foo: undefined) => { foo && console.log(foo); };`,
    },
    {
      code: 'foo => foo || console.log(foo);',
      errors: [{ column: 15, line: 1, messageId: 'invalidVoidExprArrow' }],
      output: null,
    },
    {
      code: '(foo: undefined) => foo || console.log(foo);',
      errors: [{ column: 28, line: 1, messageId: 'invalidVoidExprArrow' }],
      output: `(foo: undefined) => { foo || console.log(foo); };`,
    },
    {
      code: '(foo: void) => foo || console.log(foo);',
      errors: [{ column: 23, line: 1, messageId: 'invalidVoidExprArrow' }],
      output: `(foo: void) => { foo || console.log(foo); };`,
    },
    {
      code: 'foo => (foo ? console.log(true) : console.log(false));',
      errors: [
        { column: 15, line: 1, messageId: 'invalidVoidExprArrow' },
        { column: 35, line: 1, messageId: 'invalidVoidExprArrow' },
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
      errors: [{ column: 18, line: 3, messageId: 'invalidVoidExprReturn' }],
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
      errors: [{ column: 18, line: 4, messageId: 'invalidVoidExprReturn' }],
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
      errors: [{ column: 18, line: 4, messageId: 'invalidVoidExprReturnLast' }],
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
      errors: [{ column: 18, line: 4, messageId: 'invalidVoidExprReturnLast' }],
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
      errors: [{ column: 20, line: 4, messageId: 'invalidVoidExprReturn' }],
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
      errors: [{ column: 28, line: 3, messageId: 'invalidVoidExprReturn' }],
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
      errors: [{ column: 24, line: 4, messageId: 'invalidVoidExprReturnLast' }],
      output: null,
    },
    {
      code: `
        const f = function () {
          let undef = undefined;
          return undef ? console.log('foo') : undef;
        };
      `,
      errors: [{ column: 26, line: 4, messageId: 'invalidVoidExprReturnLast' }],
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
      errors: [{ column: 25, line: 4, messageId: 'invalidVoidExprReturnLast' }],
      output: null,
    },
    {
      code: `
        const f = function () {
          let bar = void 0;
          return bar || console.log('foo');
        };
      `,
      errors: [{ column: 25, line: 4, messageId: 'invalidVoidExprReturnLast' }],
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
      errors: [{ column: 34, line: 3, messageId: 'invalidVoidExprArrow' }],
      output: null,
    },
    {
      code: `
        let bar = void 0;
        const foo = () => (bar ? console.log('foo') : bar);
      `,
      errors: [{ column: 34, line: 3, messageId: 'invalidVoidExprArrow' }],
      output: `
        let bar = void 0;
        const foo = () => { bar ? console.log('foo') : bar; };
      `,
    },
    {
      code: "return console.log('foo');",
      errors: [
        { column: 8, line: 1, messageId: 'invalidVoidExprReturnWrapVoid' },
      ],
      options: [{ ignoreVoidOperator: true }],
      output: "return void console.log('foo');",
    },
    {
      code: "console.error(console.log('foo'));",
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'invalidVoidExprWrapVoid',
          suggestions: [
            {
              messageId: 'voidExprWrapVoid',
              output: "console.error(void console.log('foo'));",
            },
          ],
        },
      ],
      options: [{ ignoreVoidOperator: true }],
      output: null,
    },
    {
      code: "console.log('foo') ? true : false;",
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'invalidVoidExprWrapVoid',
          suggestions: [
            {
              messageId: 'voidExprWrapVoid',
              output: "void console.log('foo') ? true : false;",
            },
          ],
        },
      ],
      options: [{ ignoreVoidOperator: true }],
      output: null,
    },
    {
      code: "const x = foo ?? console.log('foo');",
      errors: [
        {
          column: 18,
          line: 1,
          messageId: 'invalidVoidExprWrapVoid',
          suggestions: [
            {
              messageId: 'voidExprWrapVoid',
              output: "const x = foo ?? void console.log('foo');",
            },
          ],
        },
      ],
      options: [{ ignoreVoidOperator: true }],
      output: null,
    },
    {
      code: 'foo => foo || console.log(foo);',
      errors: [
        { column: 15, line: 1, messageId: 'invalidVoidExprArrowWrapVoid' },
      ],
      options: [{ ignoreVoidOperator: true }],
      output: 'foo => foo || void console.log(foo);',
    },
    {
      code: "!!console.log('foo');",
      errors: [
        {
          column: 3,
          line: 1,
          messageId: 'invalidVoidExprWrapVoid',
          suggestions: [
            {
              messageId: 'voidExprWrapVoid',
              output: "!!void console.log('foo');",
            },
          ],
        },
      ],
      options: [{ ignoreVoidOperator: true }],
      output: null,
    },
    {
      code: `
function test() {
  return console.log('foo');
}
      `,
      errors: [
        {
          column: 10,
          line: 3,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
function test() {
  console.log('foo');
}
      `,
    },
    {
      code: "const test = () => console.log('foo');",
      errors: [
        {
          column: 20,
          line: 1,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: "const test = () => { console.log('foo'); };",
    },
    {
      code: `
const test = () => {
  return console.log('foo');
};
      `,
      errors: [
        {
          column: 10,
          line: 3,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
const test = () => {
  console.log('foo');
};
      `,
    },
    {
      code: `
function foo(): void {
  const bar = () => {
    return console.log();
  };
}
      `,
      errors: [
        {
          column: 12,
          line: 4,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
function foo(): void {
  const bar = () => {
    console.log();
  };
}
      `,
    },
    {
      code: `
        (): any => console.log('foo');
      `,
      errors: [
        {
          column: 20,
          line: 2,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
        (): any => { console.log('foo'); };
      `,
    },
    {
      code: `
        (): unknown => console.log('foo');
      `,
      errors: [
        {
          column: 24,
          line: 2,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
        (): unknown => { console.log('foo'); };
      `,
    },
    {
      code: `
function test(): void {
  () => () => console.log();
}
      `,
      errors: [
        {
          column: 15,
          line: 3,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
function test(): void {
  () => () => { console.log(); };
}
      `,
    },
    {
      code: `
type Foo = any;
(): Foo => console.log();
      `,
      errors: [
        {
          column: 12,
          line: 3,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
type Foo = any;
(): Foo => { console.log(); };
      `,
    },
    {
      code: `
type Foo = unknown;
(): Foo => console.log();
      `,
      errors: [
        {
          column: 12,
          line: 3,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
type Foo = unknown;
(): Foo => { console.log(); };
      `,
    },
    {
      code: `
function test(): any {
  () => () => console.log();
}
      `,
      errors: [
        {
          column: 15,
          line: 3,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
function test(): any {
  () => () => { console.log(); };
}
      `,
    },
    {
      code: `
function test(): unknown {
  return console.log();
}
      `,
      errors: [
        {
          column: 10,
          line: 3,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
function test(): unknown {
  console.log();
}
      `,
    },
    {
      code: `
function test(): any {
  return console.log();
}
      `,
      errors: [
        {
          column: 10,
          line: 3,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
function test(): any {
  console.log();
}
      `,
    },
    {
      code: `
type Foo = () => any;
(): Foo => () => console.log();
      `,
      errors: [
        {
          column: 18,
          line: 3,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
type Foo = () => any;
(): Foo => () => { console.log(); };
      `,
    },
    {
      code: `
type Foo = () => unknown;
(): Foo => () => console.log();
      `,
      errors: [
        {
          column: 18,
          line: 3,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
type Foo = () => unknown;
(): Foo => () => { console.log(); };
      `,
    },
    {
      code: `
type Foo = () => any;
const test: Foo = () => console.log();
      `,
      errors: [
        {
          column: 25,
          line: 3,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
type Foo = () => any;
const test: Foo = () => { console.log(); };
      `,
    },
    {
      code: `
type Foo = () => unknown;
const test: Foo = () => console.log();
      `,
      errors: [
        {
          column: 25,
          line: 3,
          messageId: 'invalidVoidExprArrow',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
type Foo = () => unknown;
const test: Foo = () => { console.log(); };
      `,
    },
    {
      code: `
type Foo = () => void;

const foo: Foo = function () {
  function bar() {
    return console.log();
  }
};
      `,
      errors: [
        {
          column: 12,
          line: 6,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
type Foo = () => void;

const foo: Foo = function () {
  function bar() {
    console.log();
  }
};
      `,
    },
    {
      code: `
const foo = function () {
  function bar() {
    return console.log();
  }
};
      `,
      errors: [
        {
          column: 12,
          line: 4,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
const foo = function () {
  function bar() {
    console.log();
  }
};
      `,
    },
    {
      code: `
return console.log('foo');
      `,
      errors: [
        {
          column: 8,
          line: 2,
          messageId: 'invalidVoidExprReturn',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
{ console.log('foo'); return; }
      `,
    },
    {
      code: `
function test(): void;
function test(arg: string): any;
function test(arg?: string): any | void {
  if (arg) {
    return arg;
  }
  return console.log();
}
      `,
      errors: [
        {
          column: 10,
          line: 8,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
function test(): void;
function test(arg: string): any;
function test(arg?: string): any | void {
  if (arg) {
    return arg;
  }
  console.log();
}
      `,
    },
    {
      code: `
function test(arg: string): any;
function test(): void;
function test(arg?: string): any | void {
  if (arg) {
    return arg;
  }
  return console.log();
}
      `,
      errors: [
        {
          column: 10,
          line: 8,
          messageId: 'invalidVoidExprReturnLast',
        },
      ],
      options: [{ ignoreVoidReturningFunctions: true }],
      output: `
function test(arg: string): any;
function test(): void;
function test(arg?: string): any | void {
  if (arg) {
    return arg;
  }
  console.log();
}
      `,
    },
  ],
});
