import rule, {
  MessageId,
  Options,
} from '../../src/rules/no-confusing-void-expression';
import {
  batchedSingleLineTests,
  getFixturesRootDir,
  noFormat,
  RuleTester,
} from '../RuleTester';

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
    ...batchedSingleLineTests<Options>({
      code: `
        () => Math.random();
        console.log('foo');
        foo && console.log(foo);
        foo || console.log(foo);
        foo ? console.log(true) : console.log(false);
      `,
    }),

    ...batchedSingleLineTests<Options>({
      options: [{ ignoreArrowShorthand: true }],
      code: `
        () => console.log('foo');
        foo => foo && console.log(foo);
        foo => foo || console.log(foo);
        foo => (foo ? console.log(true) : console.log(false));
      `,
    }),

    ...batchedSingleLineTests<Options>({
      options: [{ ignoreVoidOperator: true }],
      code: `
        !void console.log('foo');
        +void (foo && console.log(foo));
        -void (foo || console.log(foo));
        () => void ((foo && void console.log(true)) || console.log(false));
        const x = void (foo ? console.log(true) : console.log(false));
        !(foo && void console.log(foo));
        !!(foo || void console.log(foo));
        const x = (foo && void console.log(true)) || void console.log(false);
        () => (foo ? void console.log(true) : void console.log(false));
        return void console.log('foo');
      `,
    }),
  ],

  invalid: [
    ...batchedSingleLineTests<MessageId, Options>({
      code: `
        const x = console.log('foo');
        console.error(console.log('foo'));
        [console.log('foo')];
        ({ x: console.log('foo') });
        void console.log('foo');
        console.log('foo') ? true : false;
        (console.log('foo') && true) || false;
        (cond && console.log('ok')) || console.log('error');
        !console.log('foo');
      `,
      errors: [
        { line: 2, column: 11, messageId: 'invalidVoidExpr' },
        { line: 3, column: 23, messageId: 'invalidVoidExpr' },
        { line: 4, column: 10, messageId: 'invalidVoidExpr' },
        { line: 5, column: 15, messageId: 'invalidVoidExpr' },
        { line: 6, column: 14, messageId: 'invalidVoidExpr' },
        { line: 7, column: 9, messageId: 'invalidVoidExpr' },
        { line: 8, column: 10, messageId: 'invalidVoidExpr' },
        { line: 9, column: 18, messageId: 'invalidVoidExpr' },
        { line: 10, column: 10, messageId: 'invalidVoidExpr' },
      ],
    }),

    {
      code: "() => console.log('foo');",
      errors: [{ line: 1, column: 7, messageId: 'invalidVoidExprArrow' }],
      output: noFormat`() => { console.log('foo'); };`,
    },
    {
      code: 'foo => foo && console.log(foo);',
      errors: [{ line: 1, column: 15, messageId: 'invalidVoidExprArrow' }],
      output: noFormat`foo => { foo && console.log(foo); };`,
    },
    {
      code: 'foo => foo || console.log(foo);',
      errors: [{ line: 1, column: 15, messageId: 'invalidVoidExprArrow' }],
      output: noFormat`foo => { foo || console.log(foo); };`,
    },
    {
      code: 'foo => (foo ? console.log(true) : console.log(false));',
      errors: [
        { line: 1, column: 15, messageId: 'invalidVoidExprArrow' },
        { line: 1, column: 35, messageId: 'invalidVoidExprArrow' },
      ],
      output: noFormat`foo => { foo ? console.log(true) : console.log(false); };`,
    },
    {
      code: `
        function f() {
          return console.log('foo');
          console.log('bar');
        }
      `,
      errors: [{ line: 3, column: 18, messageId: 'invalidVoidExprReturn' }],
      output: noFormat`
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
      output: noFormat`
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
      output: noFormat`
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
      output: noFormat`
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
      output: noFormat`
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
