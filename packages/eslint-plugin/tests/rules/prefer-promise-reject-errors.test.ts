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
    'Promise.reject(5)',
    "Promise.reject('foo')",
    'Promise.reject(`foo`)',
    "Promise.reject('foo', somethingElse)",
    'Promise.reject(false)',
    'Promise.reject(void `foo`)',
    'Promise.reject()',
    'Promise.reject(undefined)',
    {
      code: 'Promise.reject(undefined)',
      options: [{ allowEmptyReject: true }] as const,
    },
    'Promise.reject(null)',
    'Promise.reject({ foo: 1 })',
    'Promise.reject([1, 2, 3])',
    `
      declare const foo: Error | undefined
      Promise.reject(foo)
    `,
    `
      declare const foo: () => Promise<string>
      Promise.reject(await foo())
    `,
    `
      declare const foo: boolean
      Promise.reject(foo && new Error())
    `,
    `
      const foo = Promise
      foo.reject()
    `,

    'Promise.reject?.(5)',
    'Promise?.reject(5)',
    'Promise?.reject?.(5)',
    '(Promise?.reject)(5)',
    '(Promise?.reject)?.(5)',
    `Promise['reject'](5)`,

    // Assignments with mathematical operators will either evaluate to a primitive value or throw a TypeError
    'Promise.reject(foo += new Error())',
    'Promise.reject(foo -= new Error())',
    'Promise.reject(foo **= new Error())',
    'Promise.reject(foo <<= new Error())',
    'Promise.reject(foo |= new Error())',
    'Promise.reject(foo &= new Error())',

    'new Promise(function(resolve, reject) { reject() })',
    'new Promise(function(resolve, reject) { reject(5) })',
    'new Promise((resolve, reject) => { reject() })',
    'new Promise((resolve, reject) => reject(5))',
    `
      new Promise((resolve, reject) => {
        fs.readFile('foo.txt', (err, file) => {
          if (err) reject('File not found')
          else resolve(file)
        })
      })
    `,
    'new Promise((yes, no) => no(5))',
    'new Promise(({foo, bar, baz}, reject) => reject(5))',
    'new Promise(function(reject, reject) { reject(5) })',
    'new Promise(function(foo, arguments) { arguments(5) })',
    'new Promise((foo, arguments) => arguments(5))',
    'new Promise(function({}, reject) { reject(5) })',
    'new Promise(({}, reject) => reject(5))',
    'new Promise((resolve, reject, somethingElse = reject(5)) => {})',
    `
      declare const foo: {
        bar: PromiseConstructor
      }
      new foo.bar((resolve, reject) => reject(5))
    `,
    `
      declare const foo: {
        bar: PromiseConstructor
      }
      new (foo?.bar)((resolve, reject) => reject(5))
    `,
    `
      const foo = Promise
      new foo((resolve, reject) => reject(5))
    `,
  ].map<TSESLint.InvalidTestCase<MessageIds, Options>>(invalidCase => {
    return {
      errors: [
        { messageId: 'rejectAnError', type: AST_NODE_TYPES.CallExpression },
      ],
      ...(typeof invalidCase === 'string'
        ? { code: invalidCase }
        : invalidCase),
    };
  }),
});
