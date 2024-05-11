import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

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
      declare const foo: Readonly<Error>;
      Promise.reject(foo);
    `,
    `
      declare const foo: Readonly<Error> | Readonly<TypeError>;
      Promise.reject(foo);
    `,
    `
      declare const foo: Readonly<Error> & Readonly<TypeError>;
      Promise.reject(foo);
    `,
    `
      declare const foo: Readonly<Error> & { foo: 'bar' };
      Promise.reject(foo);
    `,
    `
      declare const foo: Readonly<Error & { bar: 'foo' }> & { foo: 'bar' };
      Promise.reject(foo);
    `,
    `
      declare const foo: Readonly<Readonly<Error>>;
      Promise.reject(foo);
    `,
    `
      declare const foo: Readonly<Readonly<Readonly<Error>>>;
      Promise.reject(foo);
    `,
    `
      declare const foo: Readonly<
        Readonly<Readonly<Error & { bar: 'foo' }> & { foo: 'bar' }> & {
          fooBar: 'barFoo';
        }
      > & { barFoo: 'fooBar' };
      Promise.reject(foo);
    `,
    `
      declare const foo:
        | Readonly<Readonly<Error> | Readonly<TypeError & string>>
        | Readonly<Error>;
      Promise.reject(foo);
    `,
    `
      type Wrapper<T> = { foo: Readonly<T>[] };
      declare const foo: Wrapper<Error>['foo'][5];
      Promise.reject(foo);
    `,
    `
      declare const foo: Error[];
      Promise.reject(foo[5]);
    `,
    `
      declare const foo: ReadonlyArray<Error>;
      Promise.reject(foo[5]);
    `,
    `
      declare const foo: [Error];
      Promise.reject(foo[0]);
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
    `
      declare const foo: Readonly<Error>;
      new Promise((resolve, reject) => reject(foo));
    `,
    `
      declare const foo: Readonly<Error> | Readonly<TypeError>;
      new Promise((resolve, reject) => reject(foo));
    `,
    `
      declare const foo: Readonly<Error> & Readonly<TypeError>;
      new Promise((resolve, reject) => reject(foo));
    `,
    `
      declare const foo: Readonly<Error> & { foo: 'bar' };
      new Promise((resolve, reject) => reject(foo));
    `,
    `
      declare const foo: Readonly<Error & { bar: 'foo' }> & { foo: 'bar' };
      new Promise((resolve, reject) => reject(foo));
    `,
    `
      declare const foo: Readonly<Readonly<Error>>;
      new Promise((resolve, reject) => reject(foo));
    `,
    `
      declare const foo: Readonly<Readonly<Readonly<Error>>>;
      new Promise((resolve, reject) => reject(foo));
    `,
    `
      declare const foo: Readonly<
        Readonly<Readonly<Error & { bar: 'foo' }> & { foo: 'bar' }> & {
          fooBar: 'barFoo';
        }
      > & { barFoo: 'fooBar' };
      new Promise((resolve, reject) => reject(foo));
    `,
    `
      declare const foo:
        | Readonly<Readonly<Error> | Readonly<TypeError & string>>
        | Readonly<Error>;
      new Promise((resolve, reject) => reject(foo));
    `,
    `
      type Wrapper<T> = { foo: Readonly<T>[] };
      declare const foo: Wrapper<Error>['foo'][5];
      new Promise((resolve, reject) => reject(foo));
    `,
    `
      declare const foo: Error[];
      new Promise((resolve, reject) => reject(foo[5]));
    `,
    `
      declare const foo: ReadonlyArray<Error>;
      new Promise((resolve, reject) => reject(foo[5]));
    `,
    `
      declare const foo: [Error];
      new Promise((resolve, reject) => reject(foo[0]));
    `,
    `
      class Foo extends Promise<number> {}
      Foo.reject(new Error());
    `,
    `
      class Foo extends Promise<number> {}
      new Foo((resolve, reject) => reject(new Error()));
    `,
    `
      declare const someRandomCall: {
        reject(arg: any): void;
      };
      someRandomCall.reject(5);
    `,
    `
      declare const foo: PromiseConstructor;
      foo.reject(new Error());
    `,
  ],
  invalid: [
    {
      code: 'Promise.reject(5);',
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
      code: "Promise.reject('foo');",
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
      code: 'Promise.reject(`foo`);',
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
      code: "Promise.reject('foo', somethingElse);",
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
      code: 'Promise.reject(false);',
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
      code: 'Promise.reject(void `foo`);',
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
      code: 'Promise.reject();',
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
      code: 'Promise.reject(undefined);',
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
      code: 'Promise.reject(undefined);',
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
      code: 'Promise.reject(null);',
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
      code: 'Promise.reject({ foo: 1 });',
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
      code: 'Promise.reject([1, 2, 3]);',
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
declare const foo: Error | undefined;
Promise.reject(foo);
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
declare const foo: () => Promise<string>;
Promise.reject(await foo());
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
declare const foo: boolean;
Promise.reject(foo && new Error());
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
const foo = Promise;
foo.reject();
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
      code: 'Promise.reject?.(5);',
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
      code: 'Promise?.reject(5);',
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
      code: 'Promise?.reject?.(5);',
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
      code: '(Promise?.reject)(5);',
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
      code: noFormat`(Promise?.reject)?.(5);`,
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
      code: "Promise['reject'](5);",
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
      code: 'Promise.reject((foo += new Error()));',
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
      code: 'Promise.reject((foo -= new Error()));',
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
      code: 'Promise.reject((foo **= new Error()));',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 38,
        },
      ],
    },
    {
      code: 'Promise.reject((foo <<= new Error()));',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 38,
        },
      ],
    },
    {
      code: 'Promise.reject((foo |= new Error()));',
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
      code: 'Promise.reject((foo &= new Error()));',
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
      code: `
declare const foo: never;
Promise.reject(foo);
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
declare const foo: unknown;
Promise.reject(foo);
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
type FakeReadonly<T> = { 'fake readonly': T };
declare const foo: FakeReadonly<Error>;
Promise.reject(foo);
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 4,
          endLine: 4,
          column: 1,
          endColumn: 20,
        },
      ],
    },
    {
      code: `
declare const foo: Readonly<'error'>;
Promise.reject(foo);
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
declare const foo: Readonly<Error | 'error'>;
Promise.reject(foo);
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
declare const foo: Readonly<Error> | 'error';
Promise.reject(foo);
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
declare const foo: Readonly<Error> | Readonly<TypeError> | Readonly<'error'>;
Promise.reject(foo);
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
declare const foo: Readonly<Readonly<'error'>>;
Promise.reject(foo);
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
declare const foo: Readonly<Readonly<Readonly<Error> | 'error'>>;
Promise.reject(foo);
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
declare const foo: Readonly<Readonly<Readonly<Error> & TypeError>> | 'error';
Promise.reject(foo);
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
declare const foo: Readonly<Readonly<Error>> | Readonly<TypeError> | 'error';
Promise.reject(foo);
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
type Wrapper<T> = { foo: Readonly<T>[] };
declare const foo: Wrapper<Error | 'error'>['foo'][5];
Promise.reject(foo);
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 4,
          endLine: 4,
          column: 1,
          endColumn: 20,
        },
      ],
    },
    {
      code: `
declare const foo: Error[];
Promise.reject(foo);
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
declare const foo: ReadonlyArray<Error>;
Promise.reject(foo);
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
declare const foo: [Error];
Promise.reject(foo);
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
new Promise(function (resolve, reject) {
  reject();
});
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 3,
          endColumn: 11,
        },
      ],
    },
    {
      code: `
new Promise(function (resolve, reject) {
  reject(5);
});
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 3,
          endColumn: 12,
        },
      ],
    },
    {
      code: `
new Promise((resolve, reject) => {
  reject();
});
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 3,
          endColumn: 11,
        },
      ],
    },
    {
      code: 'new Promise((resolve, reject) => reject(5));',
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
    if (err) reject('File not found');
    else resolve(file);
  });
});
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
      code: 'new Promise((yes, no) => no(5));',
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
      code: 'new Promise(({ foo, bar, baz }, reject) => reject(5));',
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 1,
          endLine: 1,
          column: 44,
          endColumn: 53,
        },
      ],
    },
    {
      code: `
new Promise(function (reject, reject) {
  reject(5);
});
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 3,
          endColumn: 12,
        },
      ],
    },
    {
      code: `
new Promise(function (foo, arguments) {
  arguments(5);
});
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 3,
          endColumn: 15,
        },
      ],
    },
    {
      code: 'new Promise((foo, arguments) => arguments(5));',
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
      code: `
new Promise(function ({}, reject) {
  reject(5);
});
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 3,
          endColumn: 12,
        },
      ],
    },
    {
      code: 'new Promise(({}, reject) => reject(5));',
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
      code: 'new Promise((resolve, reject, somethingElse = reject(5)) => {});',
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
  bar: PromiseConstructor;
};
new foo.bar((resolve, reject) => reject(5));
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
  bar: PromiseConstructor;
};
new (foo?.bar)((resolve, reject) => reject(5));
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
const foo = Promise;
new foo((resolve, reject) => reject(5));
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
    {
      code: `
declare const foo: never;
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
declare const foo: unknown;
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
type FakeReadonly<T> = { 'fake readonly': T };
declare const foo: FakeReadonly<Error>;
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 4,
          endLine: 4,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
declare const foo: Readonly<'error'>;
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
declare const foo: Readonly<Error | 'error'>;
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
declare const foo: Readonly<Error> | 'error';
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
declare const foo: Readonly<Error> | Readonly<TypeError> | Readonly<'error'>;
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
declare const foo: Readonly<Readonly<'error'>>;
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
declare const foo: Readonly<Readonly<Readonly<Error> | 'error'>>;
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
declare const foo: Readonly<Readonly<Readonly<Error> & TypeError>> | 'error';
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
declare const foo: Readonly<Readonly<Error>> | Readonly<TypeError> | 'error';
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
type Wrapper<T> = { foo: Readonly<T>[] };
declare const foo: Wrapper<Error | 'error'>['foo'][5];
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 4,
          endLine: 4,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
declare const foo: Error[];
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
declare const foo: ReadonlyArray<Error>;
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
declare const foo: [Error];
new Promise((resolve, reject) => reject(foo));
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 34,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
class Foo extends Promise<number> {}
Foo.reject(5);
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 1,
          endColumn: 14,
        },
      ],
    },
    {
      code: `
declare const foo: PromiseConstructor & string;
foo.reject(5);
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 3,
          endLine: 3,
          column: 1,
          endColumn: 14,
        },
      ],
    },
    {
      code: `
class Foo extends Promise<number> {}
class Bar extends Foo {}
Bar.reject(5);
      `,
      errors: [
        {
          messageId: 'rejectAnError',
          type: AST_NODE_TYPES.CallExpression,
          line: 4,
          endLine: 4,
          column: 1,
          endColumn: 14,
        },
      ],
    },
  ],
});
