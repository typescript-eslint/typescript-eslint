import rule from '../../src/rules/no-return-in-void-callback';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: getFixturesRootDir(),
    sourceType: 'module',
  },
});

ruleTester.run('no-return-in-void-callback', rule, {
  valid: [
    {
      code: `
function foo(cb: () => void) {
  cb();
}
foo(() => {});
      `,
    },
    {
      code: `
function foo(cb: () => string | void) {
  cb();
}
foo(() => 'Hello');
      `,
    },
    {
      code: `
function foo(cb: (() => void) | string) {
  console.log(cb);
}
foo('Hello');
      `,
    },
    {
      code: `
function foo(cb: (() => void) | string) {
  console.log(cb);
}
foo(Math.random() > 0.5 ? 'Hello' : () => {});
      `,
    },
  ],
  invalid: [
    {
      code: `
function foo(cb: () => void) {
  cb();
}
foo(() => 'Hello');
      `,
      errors: [{ messageId: 'returnInVoidCallback', line: 5, column: 5 }],
    },
    {
      code: `
function foo(cb: () => void) {
  cb();
}
foo(() => {
  return null;
});
      `,
      errors: [{ messageId: 'returnInVoidCallback', line: 5, column: 5 }],
    },
    {
      code: `
function foo(cb: (() => void) | string) {
  console.log(cb);
}
foo(() => 'Hello');
foo(function () {
  return 'hello';
});
      `,
      errors: [
        { messageId: 'returnInVoidCallback', line: 5, column: 5 },
        { messageId: 'returnInVoidCallback', line: 6, column: 5 },
      ],
    },
    {
      code: `
function foo(cb: (() => void) | string) {
  console.log(cb);
}
foo(Math.random() > 0.5 ? 'Hello' : () => 'World');
      `,
      errors: [{ messageId: 'returnInVoidCallback', line: 5, column: 37 }],
    },
    {
      code: `
function foo({ cb }: { cb: () => void }) {
  cb();
}
foo({ cb: () => 'World' });
      `,
      errors: [{ messageId: 'returnInVoidCallback', line: 5, column: 11 }],
    },
  ],
});
