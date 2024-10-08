import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-confusing-void-expression';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();
const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
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
  return input, console.log(input);
}
      `,
      errors: [{ column: 17, line: 3, messageId: 'invalidVoidExpr' }],
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
  ],
});
