import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-misused-disposable';
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

ruleTester.run('no-misused-disposable', rule, {
  valid: [
    `
declare function d(): Disposable;
using foo = d();
    `,
    `
declare function f(): void;
declare function d(): Disposable;
using foo = (f(), d());
    `,
    `
declare function ad(): AsyncDisposable;
async function f() {
  await using foo = ad();
}
    `,
    `
declare function d(): Disposable;
function makeDisposable() {
  return d();
}
    `,
    `
declare function d(): Disposable;
function makeDisposable() {
  const x = d();
  return x;
}
    `,
    // not all paths handle the disposable... should this flag?
    `
declare function d(): Disposable;
function makeDisposable() {
  const x = d();
  if (Math.random() > 0.5) {
    return x;
  }
}
    `,
  ],
  invalid: [
    {
      code: `
declare function d(): Disposable;
const foo = d();
      `,
      errors: [
        {
          column: 13,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'misusedDisposable',
        },
      ],
    },
    {
      code: `
declare function f(): void;
declare function d(): Disposable;
const foo = (f(), d());
      `,
      errors: [
        {
          column: 19,
          endColumn: 22,
          endLine: 4,
          line: 4,
          messageId: 'misusedDisposable',
        },
      ],
    },
    {
      code: `
declare function d(): Disposable;
function makeDisposable() {
  const x = d();
  function inner() {
    return x;
  }
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'misusedDisposable',
        },
      ],
    },
  ],
});
