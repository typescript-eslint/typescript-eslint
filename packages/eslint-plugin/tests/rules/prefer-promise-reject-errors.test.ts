import { RuleTester } from '@typescript-eslint/rule-tester';
import type { TSESLint } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type {
  MessageIds,
  Options,
} from '../../src/rules/prefer-promise-reject-errors';
import rule from '../../src/rules/prefer-promise-reject-errors';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('prefer-promise-reject-errors', rule, {
  valid: [
    'Promise.resolve(5);',
    {
      code: 'Promise.reject();',
      options: [
        {
          allowEmptyReject: true,
        },
      ],
    },
    'Promise.reject(new Error());',
    'Promise.reject(new TypeError());',
    "Promise.reject(new Error('foo'));",
    `
      class CustomError extends Error {}
      Promise.reject(new CustomError());
    `,
    `
      declare const foo: () => { err: SyntaxError };
      Promise.reject(foo().err);
    `,
    `
      declare const foo: () => Promise<Error>;
      Promise.reject(await foo());
    `,
    'Promise.reject((foo = new Error()));',
    `
      const foo = Promise;
      foo.reject(new Error());
    `,
    "Promise['reject'](new Error());",
    'Promise.reject(true && new Error());',
    `
      const foo = false;
      Promise.reject(false || new Error());
    `,

    `
      new Promise(function (resolve, reject) {
        resolve(5);
      });
    `,
    `
      new Promise(function (resolve, reject) {
        reject(new Error());
      });
    `,
    `
      new Promise((resolve, reject) => {
        reject(new Error());
      });
    `,
    'new Promise((resolve, reject) => reject(new Error()));',
    {
      code: `
        new Promise(function (resolve, reject) {
          reject();
        });
      `,
      options: [
        {
          allowEmptyReject: true,
        },
      ],
    },
    'new Promise((yes, no) => no(new Error()));',
    'new Promise();',
    'new Promise(5);',
    'new Promise((resolve, { apply }) => {});',
    'new Promise((resolve, reject) => {});',
    'new Promise((resolve, reject) => reject);',
    `
      class CustomError extends Error {}
      new Promise(function (resolve, reject) {
        reject(new CustomError());
      });
    `,
    `
      declare const foo: () => { err: SyntaxError };
      new Promise(function (resolve, reject) {
        reject(foo().err);
      });
    `,
    'new Promise((resolve, reject) => reject((foo = new Error())));',
    `
      new Foo((resolve, reject) => reject(5));
    `,
    `
      class Foo {
        constructor(
          executor: (resolve: () => void, reject: (reason?: any) => void) => void,
        ): Promise<any> {}
      }
      new Foo((resolve, reject) => reject(5));
    `,
    `
      new Promise((resolve, reject) => {
        return function (reject) {
          reject(5);
        };
      });
    `,
    'new Promise((resolve, reject) => resolve(5, reject));',
    `
      class C {
        #error: Error;
        foo() {
          Promise.reject(this.#error);
        }
      }
    `,
    `
      const foo = Promise;
      new foo((resolve, reject) => reject(new Error()));
    `,
  ],
  invalid: [
    {
      code: 'Promise.reject(5)',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 18,
        },
      ],
    },
    {
      code: "Promise.reject('foo')",
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 22,
        },
      ],
    },
    {
      code: 'Promise.reject(`foo`)',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 22,
        },
      ],
    },
    {
      code: "Promise.reject('foo', somethingElse)",
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 37,
        },
      ],
    },
    {
      code: 'Promise.reject(false)',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 22,
        },
      ],
    },
    {
      code: 'Promise.reject(void `foo`)',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 27,
        },
      ],
    },
    {
      code: 'Promise.reject()',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 17,
        },
      ],
    },
    {
      code: 'Promise.reject(undefined)',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 26,
        },
      ],
    },
    {
      code: 'Promise.reject(undefined)',
      options: [{ allowEmptyReject: true }],
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 26,
        },
      ],
    },
    {
      code: 'Promise.reject(null)',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 21,
        },
      ],
    },
    {
      code: 'Promise.reject({ foo: 1 })',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 27,
        },
      ],
    },
    {
      code: 'Promise.reject([1, 2, 3])',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 26,
        },
      ],
    },
    {
      code: `
declare const foo: Error | undefined
Promise.reject(foo)
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 1,
          endColumn: 20,
        },
      ],
    },
    {
      code: `
declare const foo: () => Promise<string>
Promise.reject(await foo())
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 1,
          endColumn: 28,
        },
      ],
    },
    {
      code: `
declare const foo: boolean
Promise.reject(foo && new Error())
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 1,
          endColumn: 35,
        },
      ],
    },
    {
      code: `
const foo = Promise
foo.reject()
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 1,
          endColumn: 13,
        },
      ],
    },

    {
      code: 'Promise.reject?.(5)',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 20,
        },
      ],
    },
    {
      code: 'Promise?.reject(5)',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'Promise?.reject?.(5)',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 21,
        },
      ],
    },
    {
      code: '(Promise?.reject)(5)',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 21,
        },
      ],
    },
    {
      code: '(Promise?.reject)?.(5)',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 23,
        },
      ],
    },
    {
      code: `Promise['reject'](5)`,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 21,
        },
      ],
    },

    // Assignments with mathematical operators will either evaluate to a primitive value or throw a TypeError
    {
      code: 'Promise.reject(foo += new Error())',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 35,
        },
      ],
    },
    {
      code: 'Promise.reject(foo -= new Error())',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 35,
        },
      ],
    },
    {
      code: 'Promise.reject(foo **= new Error())',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 36,
        },
      ],
    },
    {
      code: 'Promise.reject(foo <<= new Error())',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 36,
        },
      ],
    },
    {
      code: 'Promise.reject(foo |= new Error())',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 35,
        },
      ],
    },
    {
      code: 'Promise.reject(foo &= new Error())',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 35,
        },
      ],
    },

    {
      code: 'new Promise(function(resolve, reject) { reject() })',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 41,
          endColumn: 49,
        },
      ],
    },
    {
      code: 'new Promise(function(resolve, reject) { reject(5) })',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 41,
          endColumn: 50,
        },
      ],
    },
    {
      code: 'new Promise((resolve, reject) => { reject() })',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 36,
          endColumn: 44,
        },
      ],
    },
    {
      code: 'new Promise((resolve, reject) => reject(5))',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 34,
          endColumn: 43,
        },
      ],
    },
    {
      code: `
new Promise((resolve, reject) => {
  fs.readFile('foo.txt', (err, file) => {
    if (err) reject('File not found')
    else resolve(file)
  })
})
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 4,
          endLine: 4,
          column: 14,
          endColumn: 38,
        },
      ],
    },
    {
      code: 'new Promise((yes, no) => no(5))',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 26,
          endColumn: 31,
        },
      ],
    },
    {
      code: 'new Promise(({foo, bar, baz}, reject) => reject(5))',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 42,
          endColumn: 51,
        },
      ],
    },
    {
      code: 'new Promise(function(reject, reject) { reject(5) })',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 40,
          endColumn: 49,
        },
      ],
    },
    {
      code: 'new Promise(function(foo, arguments) { arguments(5) })',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 40,
          endColumn: 52,
        },
      ],
    },
    {
      code: 'new Promise((foo, arguments) => arguments(5))',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 33,
          endColumn: 45,
        },
      ],
    },
    {
      code: 'new Promise(function({}, reject) { reject(5) })',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 36,
          endColumn: 45,
        },
      ],
    },
    {
      code: 'new Promise(({}, reject) => reject(5))',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 29,
          endColumn: 38,
        },
      ],
    },
    {
      code: 'new Promise((resolve, reject, somethingElse = reject(5)) => {})',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 47,
          endColumn: 56,
        },
      ],
    },
    {
      code: `
declare const foo: {
  bar: PromiseConstructor
}
new foo.bar((resolve, reject) => reject(5))
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 5,
          endLine: 5,
          column: 34,
          endColumn: 43,
        },
      ],
    },
    {
      code: `
declare const foo: {
  bar: PromiseConstructor
}
new (foo?.bar)((resolve, reject) => reject(5))
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 5,
          endLine: 5,
          column: 37,
          endColumn: 46,
        },
      ],
    },
    {
      code: `
const foo = Promise
new foo((resolve, reject) => reject(5))
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 30,
          endColumn: 39,
        },
      ],
    },
  ],
});
