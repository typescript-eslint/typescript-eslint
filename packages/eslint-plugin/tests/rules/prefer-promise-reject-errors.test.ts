import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-promise-reject-errors';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

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
    {
      code: `
        declare const someAnyValue: any;
        Promise.reject(someAnyValue);
      `,
      options: [{ allowThrowingAny: true, allowThrowingUnknown: false }],
    },
    {
      code: `
        declare const someUnknownValue: unknown;
        Promise.reject(someUnknownValue);
      `,
      options: [{ allowThrowingAny: false, allowThrowingUnknown: true }],
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
    noFormat`
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
    'console[Symbol.iterator]();',
    `
      class A {
        a = [];
        [Symbol.iterator]() {
          return this.a[Symbol.iterator]();
        }
      }
    `,
    `
      declare const foo: PromiseConstructor;
      function fun<T extends Error>(t: T): void {
        foo.reject(t);
      }
    `,
    {
      code: `
        declare const someAnyValue: any;
        Promise.reject(someAnyValue);
      `,
      options: [{ allowThrowingAny: true, allowThrowingUnknown: true }],
    },
    {
      code: `
        declare const someUnknownValue: unknown;
        Promise.reject(someUnknownValue);
      `,
      options: [{ allowThrowingAny: true, allowThrowingUnknown: true }],
    },
  ],
  invalid: [
    {
      code: 'Promise.reject(5);',
      errors: [
        {
          column: 1,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: "Promise.reject('foo');",
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise.reject(`foo`);',
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: "Promise.reject('foo', somethingElse);",
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise.reject(false);',
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise.reject(void `foo`);',
      errors: [
        {
          column: 1,
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise.reject();',
      errors: [
        {
          column: 1,
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise.reject(undefined);',
      errors: [
        {
          column: 1,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise.reject(undefined);',
      errors: [
        {
          column: 1,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
      options: [{ allowEmptyReject: true }],
    },
    {
      code: 'Promise.reject(null);',
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise.reject({ foo: 1 });',
      errors: [
        {
          column: 1,
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise.reject([1, 2, 3]);',
      errors: [
        {
          column: 1,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
        },
      ],
    },

    {
      code: 'Promise.reject?.(5);',
      errors: [
        {
          column: 1,
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise?.reject(5);',
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise?.reject?.(5);',
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: '(Promise?.reject)(5);',
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: noFormat`(Promise?.reject)?.(5);`,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: "Promise['reject'](5);",
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },

    // Assignments with mathematical operators will either evaluate to a primitive value or throw a TypeError
    {
      code: 'Promise.reject((foo += new Error()));',
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise.reject((foo -= new Error()));',
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise.reject((foo **= new Error()));',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise.reject((foo <<= new Error()));',
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise.reject((foo |= new Error()));',
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'Promise.reject((foo &= new Error()));',
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 4,
          line: 4,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 4,
          line: 4,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 3,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 3,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 3,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'new Promise((resolve, reject) => reject(5));',
      errors: [
        {
          column: 34,
          endColumn: 43,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
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
          column: 14,
          endColumn: 38,
          endLine: 4,
          line: 4,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'new Promise((yes, no) => no(5));',
      errors: [
        {
          column: 26,
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'new Promise(({ foo, bar, baz }, reject) => reject(5));',
      errors: [
        {
          column: 44,
          endColumn: 53,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
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
          column: 3,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 3,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'new Promise((foo, arguments) => arguments(5));',
      errors: [
        {
          column: 33,
          endColumn: 45,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
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
          column: 3,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'new Promise(({}, reject) => reject(5));',
      errors: [
        {
          column: 29,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: 'new Promise((resolve, reject, somethingElse = reject(5)) => {});',
      errors: [
        {
          column: 47,
          endColumn: 56,
          endLine: 1,
          line: 1,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 43,
          endLine: 5,
          line: 5,
          messageId: 'rejectAnError',
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
          column: 37,
          endColumn: 46,
          endLine: 5,
          line: 5,
          messageId: 'rejectAnError',
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
          column: 30,
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 4,
          line: 4,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 4,
          line: 4,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 34,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'rejectAnError',
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
          column: 1,
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: `
declare const foo: PromiseConstructor;
function fun<T extends number>(t: T): void {
  foo.reject(t);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: `
        declare const someAnyValue: any;
        Promise.reject(someAnyValue);
      `,
      errors: [
        {
          messageId: 'rejectAnError',
        },
      ],
      options: [{ allowThrowingAny: false, allowThrowingUnknown: true }],
    },
    {
      code: `
        declare const someUnknownValue: unknown;
        Promise.reject(someUnknownValue);
      `,
      errors: [
        {
          messageId: 'rejectAnError',
        },
      ],
      options: [{ allowThrowingAny: true, allowThrowingUnknown: false }],
    },
    {
      code: `
        declare const someUnknownValue: unknown;
        Promise.reject(someUnknownValue);
      `,
      errors: [
        {
          messageId: 'rejectAnError',
        },
      ],
    },
    {
      code: `
        declare const someAnyValue: any;
        Promise.reject(someAnyValue);
      `,
      errors: [
        {
          messageId: 'rejectAnError',
        },
      ],
    },
  ],
});
