import rule, { MessageId, Options } from '../../src/rules/no-void-expression';
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

ruleTester.run('no-void-expression', rule, {
  valid: [
    ...batchedSingleLineTests<Options>({
      code: `
        console.log('foo');
        foo && console.log(foo);
        foo || console.log(foo);
        (foo && console.log(true)) || console.log(false);
        foo ? console.log(true) : console.log(false);
      `,
    }),

    ...batchedSingleLineTests({
      options: [{ ignoreArrowShorthand: true }],
      code: `
        () => console.log('foo');
        foo => foo && console.log(foo);
        foo => foo || console.log(foo);
        foo => (foo && console.log(true)) || console.log(false);
        foo => (foo ? console.log(true) : console.log(false));
      `,
    }),
  ],

  invalid: [
    ...batchedSingleLineTests<MessageId, Options>({
      code: `
        const x = console.log('foo');
        return console.log('foo');
        console.error(console.log('foo'));
        [console.log('foo')];
        ({ x: console.log('foo') });
        void console.log('foo');
      `,
      errors: [
        { line: 2, column: 11, messageId: 'invalidVoidExpr' },
        { line: 3, column: 16, messageId: 'invalidVoidExpr' },
        { line: 4, column: 23, messageId: 'invalidVoidExpr' },
        { line: 5, column: 10, messageId: 'invalidVoidExpr' },
        { line: 6, column: 15, messageId: 'invalidVoidExpr' },
        { line: 7, column: 14, messageId: 'invalidVoidExpr' },
      ],
    }),

    {
      code: "() => console.log('foo');",
      errors: [{ line: 1, column: 7, messageId: 'invalidVoidArrowExpr' }],
      output: noFormat`() => { console.log('foo'); };`,
    },
    {
      code: 'foo => foo && console.log(foo);',
      errors: [{ line: 1, column: 15, messageId: 'invalidVoidExpr' }],
    },
    {
      code: 'foo => foo || console.log(foo);',
      errors: [{ line: 1, column: 15, messageId: 'invalidVoidExpr' }],
    },
    {
      code: 'foo => (foo ? console.log(true) : console.log(false));',
      errors: [
        { line: 1, column: 15, messageId: 'invalidVoidExpr' },
        { line: 1, column: 35, messageId: 'invalidVoidExpr' },
      ],
    },
  ],
});
