import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/only-throw-error';
import { getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: getFixturesRootDir(),
    },
  },
});

ruleTester.run('only-throw-error', rule, {
  valid: [
    'throw new Error();',
    "throw new Error('error');",
    "throw Error('error');",
    `
const e = new Error();
throw e;
    `,
    `
try {
  throw new Error();
} catch (e) {
  throw e;
}
    `,
    `
function foo() {
  return new Error();
}
throw foo();
    `,
    `
const foo = {
  bar: new Error(),
};
throw foo.bar;
    `,
    `
const foo = {
  bar: new Error(),
};

throw foo['bar'];
    `,
    `
const foo = {
  bar: new Error(),
};

const bar = 'bar';
throw foo[bar];
    `,
    `
class CustomError extends Error {}
throw new CustomError();
    `,
    `
class CustomError1 extends Error {}
class CustomError2 extends CustomError1 {}
throw new CustomError2();
    `,
    'throw (foo = new Error());',
    'throw (1, 2, new Error());',
    "throw 'literal' && new Error();",
    "throw new Error() || 'literal';",
    'throw foo ? new Error() : new Error();',
    `
function* foo() {
  let index = 0;
  throw yield index++;
}
    `,
    `
async function foo() {
  throw await bar;
}
    `,
    `
import { Error } from './missing';
throw Error;
    `,
    `
class CustomError<T, C> extends Error {}
throw new CustomError<string, string>();
    `,
    `
class CustomError<T = {}> extends Error {}
throw new CustomError();
    `,
    `
class CustomError<T extends object> extends Error {}
throw new CustomError();
    `,
    `
function foo() {
  throw Object.assign(new Error('message'), { foo: 'bar' });
}
    `,
    `
const foo: Error | SyntaxError = bar();
function bar() {
  throw foo;
}
    `,
    `
declare const foo: Error | string;
throw foo as Error;
    `,
    'throw new Error() as Error;',
    `
declare const nullishError: Error | undefined;
throw nullishError ?? new Error();
    `,
    `
declare const nullishError: Error | undefined;
throw nullishError || new Error();
    `,
    `
declare const nullishError: Error | undefined;
throw nullishError ? nullishError : new Error();
    `,
    `
function fun(value: any) {
  throw value;
}
    `,
    `
function fun(value: unknown) {
  throw value;
}
    `,
    `
function fun<T extends Error>(t: T): void {
  throw t;
}
    `,
    {
      code: `
throw undefined;
      `,
      options: [
        {
          allow: [{ from: 'lib', name: 'undefined' }],
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
class CustomError implements Error {}
throw new CustomError();
      `,
      options: [
        {
          allow: [{ from: 'file', name: 'CustomError' }],
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
throw new Map();
      `,
      options: [
        {
          allow: [{ from: 'lib', name: 'Map' }],
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
        import { createError } from 'errors';
        throw createError();
      `,
      options: [
        {
          allow: [{ from: 'package', name: 'ErrorLike', package: 'errors' }],
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
function func<T1, T2>() {
  let err: Promise<T1> | Promise<T2>;
  throw err;
}
      `,
      options: [
        {
          allow: ['Promise'],
        },
      ],
    },
    {
      code: `
try {
} catch (e) {
  throw e;
}
      `,
      options: [
        {
          allowRethrowing: true,
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
try {
} catch (eOuter) {
  try {
    if (Math.random() > 0.5) {
      throw eOuter;
    }
  } catch (eInner) {
    if (Math.random() > 0.5) {
      throw eOuter;
    } else {
      throw eInner;
    }
  }
}
      `,
      options: [
        {
          allowRethrowing: true,
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
Promise.reject('foo').catch(e => {
  throw e;
});
      `,
      options: [
        {
          allowRethrowing: true,
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
async function foo() {
  throw await Promise.resolve(new Error('error'));
}
      `,
      options: [
        {
          allowThrowingAny: false,
        },
      ],
    },
    {
      code: `
function* foo(): Generator<number, void, Error> {
  throw yield 303;
}
      `,
      options: [
        {
          allowThrowingAny: false,
        },
      ],
    },
  ],
  invalid: [
    {
      code: 'throw undefined;',
      errors: [
        {
          messageId: 'undef',
        },
      ],
    },
    {
      code: "throw new String('');",
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: "throw 'error';",
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: 'throw 0;',
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: 'throw false;',
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: 'throw null;',
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: 'throw {};',
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: "throw 'a' + 'b';",
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
const a = '';
throw a + 'b';
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: "throw (foo = 'error');",
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: 'throw (new Error(), 1, 2, 3);',
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: "throw 'literal' && 'not an Error';",
      errors: [{ messageId: 'object' }],
    },
    {
      code: "throw 'literal' || new Error();",
      errors: [{ messageId: 'object' }],
    },
    {
      code: "throw new Error() && 'literal';",
      errors: [{ messageId: 'object' }],
    },
    {
      code: "throw 'literal' ?? new Error();",
      errors: [{ messageId: 'object' }],
    },
    {
      code: "throw foo ? 'not an Error' : 'literal';",
      errors: [{ messageId: 'object' }],
    },
    {
      code: "throw foo ? new Error() : 'literal';",
      errors: [{ messageId: 'object' }],
    },
    {
      code: "throw foo ? 'literal' : new Error();",
      errors: [{ messageId: 'object' }],
    },
    {
      code: 'throw `${err}`;',
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
const err = 'error';
throw err;
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
function foo(msg) {}
throw foo('error');
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
const foo = {
  msg: 'error',
};
throw foo.msg;
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
const foo = {
  msg: undefined,
};
throw foo.msg;
      `,
      errors: [
        {
          messageId: 'undef',
        },
      ],
    },
    {
      code: `
class CustomError {}
throw new CustomError();
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
class Foo {}
class CustomError extends Foo {}
throw new CustomError();
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
const Error = null;
throw Error;
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
import { Error } from './class';
throw new Error();
      `,
      errors: [
        {
          column: 7,
          line: 3,
          messageId: 'object',
        },
      ],
    },
    {
      code: `
class CustomError<T extends object> extends Foo {}
throw new CustomError();
      `,
      errors: [
        {
          column: 7,
          line: 3,
          messageId: 'object',
        },
      ],
    },
    {
      code: `
function foo<T>() {
  const res: T;
  throw res;
}
      `,
      errors: [
        {
          column: 9,
          line: 4,
          messageId: 'object',
        },
      ],
    },
    {
      code: `
function foo<T>(fn: () => Promise<T>) {
  const promise = fn();
  const res = promise.then(() => {}).catch(() => {});
  throw res;
}
      `,
      errors: [
        {
          column: 9,
          line: 5,
          messageId: 'object',
        },
      ],
    },
    {
      code: `
function foo() {
  throw Object.assign({ foo: 'foo' }, { bar: 'bar' });
}
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
const foo: Error | { bar: string } = bar();
function bar() {
  throw foo;
}
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
declare const foo: Error | string;
throw foo as string;
      `,
      errors: [{ messageId: 'object' }],
    },
    {
      code: `
function fun(value: any) {
  throw value;
}
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
      options: [
        {
          allowThrowingAny: false,
        },
      ],
    },
    {
      code: `
function fun(value: unknown) {
  throw value;
}
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
      options: [
        {
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
function fun<T extends number>(t: T): void {
  throw t;
}
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
function func<T1, T2>() {
  let err: Promise<T1> | Promise<T2> | void;
  throw err;
}
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
      options: [
        {
          allow: ['Promise'],
        },
      ],
    },
    {
      code: `
class UnknownError implements Error {}
throw new UnknownError();
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
      options: [
        {
          allow: [{ from: 'file', name: 'CustomError' }],
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
let x = 1;
Promise.reject('foo').catch(e => {
  throw x;
});
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
      options: [
        {
          allowRethrowing: true,
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
Promise.reject('foo').catch((...e) => {
  throw e;
});
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
      options: [
        {
          allowRethrowing: true,
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
declare const x: any[];
Promise.reject('foo').catch(...x, e => {
  throw e;
});
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
      options: [
        {
          allowRethrowing: true,
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
declare const x: any[];
Promise.reject('foo').then(...x, e => {
  throw e;
});
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
      options: [
        {
          allowRethrowing: true,
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
declare const onFulfilled: any;
declare const x: any[];
Promise.reject('foo').then(onFulfilled, ...x, e => {
  throw e;
});
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
      options: [
        {
          allowRethrowing: true,
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
Promise.reject('foo').then((...e) => {
  throw e;
});
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
      options: [
        {
          allowRethrowing: true,
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
Promise.reject('foo').then(e => {
  throw globalThis;
});
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
      options: [
        {
          allowRethrowing: true,
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],
    },
    {
      code: `
async function foo() {
  throw await bar;
}
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
      options: [
        {
          allowThrowingAny: false,
        },
      ],
    },
    {
      code: `
async function foo() {
  throw await Promise.resolve<number>(303);
}
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
      options: [
        {
          allowThrowingAny: false,
        },
      ],
    },
  ],
});
