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
      output: `foo => { foo && console.log(foo); };`,
    },
    {
      code: 'foo => foo || console.log(foo);',
      errors: [{ line: 1, column: 15, messageId: 'invalidVoidExprArrow' }],
      output: `foo => { foo || console.log(foo); };`,
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
  ],
});
