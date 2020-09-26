import rule, { MessageId, Options } from '../../src/rules/no-void-expression';
import {
  batchedSingleLineTests,
  getFixturesRootDir,
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
      `,
    }),
  ],

  invalid: [
    ...batchedSingleLineTests<MessageId, Options>({
      code: `
        const x = console.log('foo');
        (() => console.log('foo'))();
        return console.log('foo');
        console.error(console.log('foo'));
        [console.log('foo')];
        ({ x: console.log('foo') });
        void console.log('foo');
      `,
      errors: [
        { messageId: 'invalidVoidExpr', line: 2, column: 11 },
        { messageId: 'invalidVoidExpr', line: 3, column: 16 },
        { messageId: 'invalidVoidExpr', line: 4, column: 16 },
        { messageId: 'invalidVoidExpr', line: 5, column: 23 },
        { messageId: 'invalidVoidExpr', line: 6, column: 10 },
        { messageId: 'invalidVoidExpr', line: 7, column: 15 },
        { messageId: 'invalidVoidExpr', line: 8, column: 14 },
      ],
    }),
  ],
});
