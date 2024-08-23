import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-floating-promises';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: rootDir,
      project: './tsconfig.json',
    },
  },
});

ruleTester.run('no-floating-promises', rule, {
  valid: [
    `
async function test() {
  await Promise.resolve('value');
  Promise.resolve('value').then(
    () => {},
    () => {},
  );
  Promise.resolve('value')
    .then(() => {})
    .catch(() => {});
  Promise.resolve('value')
    .then(() => {})
    .catch(() => {})
    .finally(() => {});
  Promise.resolve('value').catch(() => {});
  return Promise.resolve('value');
}
    `,
    {
      options: [{ ignoreVoid: true }],
      code: `
async function test() {
  void Promise.resolve('value');
}
      `,
    },
    `
async function test() {
  await Promise.reject(new Error('message'));
  Promise.reject(new Error('message')).then(
    () => {},
    () => {},
  );
  Promise.reject(new Error('message'))
    .then(() => {})
    .catch(() => {});
  Promise.reject(new Error('message'))
    .then(() => {})
    .catch(() => {})
    .finally(() => {});
  Promise.reject(new Error('message')).catch(() => {});
  return Promise.reject(new Error('message'));
}
    `,
    `
async function test() {
  await (async () => true)();
  (async () => true)().then(
    () => {},
    () => {},
  );
  (async () => true)()
    .then(() => {})
    .catch(() => {});
  (async () => true)()
    .then(() => {})
    .catch(() => {})
    .finally(() => {});
  (async () => true)().catch(() => {});
  return (async () => true)();
}
    `,
    `
async function test() {
  async function returnsPromise() {}
  await returnsPromise();
  returnsPromise().then(
    () => {},
    () => {},
  );
  returnsPromise()
    .then(() => {})
    .catch(() => {});
  returnsPromise()
    .then(() => {})
    .catch(() => {})
    .finally(() => {});
  returnsPromise().catch(() => {});
  return returnsPromise();
}
    `,
    `
async function test() {
  const x = Promise.resolve();
  const y = x.then(() => {});
  y.catch(() => {});
}
    `,
    `
async function test() {
  Math.random() > 0.5 ? Promise.resolve().catch(() => {}) : null;
}
    `,
    `
async function test() {
  Promise.resolve().catch(() => {}), 123;
  123,
    Promise.resolve().then(
      () => {},
      () => {},
    );
  123,
    Promise.resolve().then(
      () => {},
      () => {},
    ),
    123;
}
    `,
    `
async function test() {
  void Promise.resolve().catch(() => {});
}
    `,
    `
async function test() {
  Promise.resolve().catch(() => {}) ||
    Promise.resolve().then(
      () => {},
      () => {},
    );
}
    `,
    `
declare const promiseValue: Promise<number>;
async function test() {
  await promiseValue;
  promiseValue.then(
    () => {},
    () => {},
  );
  promiseValue.then(() => {}).catch(() => {});
  promiseValue
    .then(() => {})
    .catch(() => {})
    .finally(() => {});
  promiseValue.catch(() => {});
  return promiseValue;
}
    `,
    `
declare const promiseUnion: Promise<number> | number;
async function test() {
  await promiseUnion;
  promiseUnion.then(
    () => {},
    () => {},
  );
  promiseUnion.then(() => {}).catch(() => {});
  promiseUnion
    .then(() => {})
    .catch(() => {})
    .finally(() => {});
  promiseUnion.catch(() => {});
  promiseValue.finally(() => {});
  return promiseUnion;
}
    `,
    `
declare const promiseIntersection: Promise<number> & number;
async function test() {
  await promiseIntersection;
  promiseIntersection.then(
    () => {},
    () => {},
  );
  promiseIntersection.then(() => {}).catch(() => {});
  promiseIntersection.catch(() => {});
  return promiseIntersection;
}
    `,
    `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  await canThen;
  canThen.then(
    () => {},
    () => {},
  );
  canThen.then(() => {}).catch(() => {});
  canThen
    .then(() => {})
    .catch(() => {})
    .finally(() => {});
  canThen.catch(() => {});
  return canThen;
}
    `,
    `
declare const intersectionPromise: Promise<number> & number;
async function test() {
  await (Math.random() > 0.5 ? numberPromise : 0);
  await (Math.random() > 0.5 ? foo : 0);
  await (Math.random() > 0.5 ? bar : 0);

  await intersectionPromise;
}
    `,
    `
async function test() {
  class Thenable {
    then(callback: () => void): Thenable {
      return new Thenable();
    }
  }
  const thenable = new Thenable();

  await thenable;
  thenable;
  thenable.then(() => {});
  return thenable;
}
    `,
    `
async function test() {
  class NonFunctionParamThenable {
    then(param: string, param2: number): NonFunctionParamThenable {
      return new NonFunctionParamThenable();
    }
  }
  const thenable = new NonFunctionParamThenable();

  await thenable;
  thenable;
  thenable.then('abc', 'def');
  return thenable;
}
    `,
    `
async function test() {
  class NonFunctionThenable {
    then: number;
  }
  const thenable = new NonFunctionThenable();

  thenable;
  thenable.then;
  return thenable;
}
    `,
    `
async function test() {
  class CatchableThenable {
    then(callback: () => void, callback: () => void): CatchableThenable {
      return new CatchableThenable();
    }
  }
  const thenable = new CatchableThenable();

  await thenable;
  return thenable;
}
    `,
    `
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/promise-polyfill/index.d.ts
// Type definitions for promise-polyfill 6.0
// Project: https://github.com/taylorhakes/promise-polyfill
// Definitions by: Steve Jenkins <https://github.com/skysteve>
//                 Daniel Cassidy <https://github.com/djcsdy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface PromisePolyfillConstructor extends PromiseConstructor {
  _immediateFn?: (handler: (() => void) | string) => void;
}

declare const PromisePolyfill: PromisePolyfillConstructor;

async function test() {
  const promise = new PromisePolyfill(() => {});

  await promise;
  promise.then(
    () => {},
    () => {},
  );
  promise.then(() => {}).catch(() => {});
  promise
    .then(() => {})
    .catch(() => {})
    .finally(() => {});
  promise.catch(() => {});
  return promise;
}
    `,

    // optional chaining
    `
declare const returnsPromise: () => Promise<void> | null;
async function test() {
  await returnsPromise?.();
  returnsPromise()?.then(
    () => {},
    () => {},
  );
  returnsPromise()
    ?.then(() => {})
    ?.catch(() => {});
  returnsPromise()?.catch(() => {});
  return returnsPromise();
}
    `,
    `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  await obj1.a?.b?.c?.();
  await obj2.a?.b?.c();
  await obj3.a?.b.c?.();
  await obj4.a.b.c?.();
  await obj5.a?.().b?.c?.();
  await obj6?.a.b.c?.();

  return callback?.();
};

void doSomething();
    `,
    // ignoreIIFE
    {
      code: `
        (async () => {
          await something();
        })();
      `,
      options: [{ ignoreIIFE: true }],
    },
    {
      code: `
        (async () => {
          something();
        })();
      `,
      options: [{ ignoreIIFE: true }],
    },
    {
      code: '(async function foo() {})();',
      options: [{ ignoreIIFE: true }],
    },
    {
      code: `
        function foo() {
          (async function bar() {})();
        }
      `,
      options: [{ ignoreIIFE: true }],
    },
    {
      code: `
        const foo = () =>
          new Promise(res => {
            (async function () {
              await res(1);
            })();
          });
      `,
      options: [{ ignoreIIFE: true }],
    },
    {
      code: `
        (async function () {
          await res(1);
        })();
      `,
      options: [{ ignoreIIFE: true }],
    },
    {
      code: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = true;
  void (condition && myPromise());
}
      `,
    },
    {
      code: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = true;
  await (condition && myPromise());
}
      `,
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = true;
  condition && void myPromise();
}
      `,
    },
    {
      code: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = true;
  condition && (await myPromise());
}
      `,
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
async function foo() {
  const myPromise = async () => void 0;
  let condition = false;
  condition && myPromise();
  condition = true;
  condition || myPromise();
  condition ?? myPromise();
}
      `,
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
declare const definitelyCallable: () => void;
Promise.reject().catch(definitelyCallable);
      `,
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
Promise.reject()
  .catch(() => {})
  .finally(() => {});
      `,
    },
    {
      code: `
Promise.reject()
  .catch(() => {})
  .finally(() => {})
  .finally(() => {});
      `,
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
Promise.reject()
  .catch(() => {})
  .finally(() => {})
  .finally(() => {})
  .finally(() => {});
      `,
    },
    {
      code: `
await Promise.all([Promise.resolve(), Promise.resolve()]);
      `,
    },
    {
      code: `
declare const promiseArray: Array<Promise<unknown>>;
void promiseArray;
      `,
    },
    {
      // Expressions aren't checked by this rule, so this just becomes an array
      // of number | undefined, which is fine regardless of the ignoreVoid setting.
      code: `
[1, 2, void Promise.reject(), 3];
      `,
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
['I', 'am', 'just', 'an', 'array'];
      `,
    },
    {
      code: `
interface SafeThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | SafeThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | SafeThenable<TResult2>)
      | undefined
      | null,
  ): SafeThenable<TResult1 | TResult2>;
}
let promise: SafeThenable<number> = Promise.resolve(5);
0, promise;
      `,
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SafeThenable' }],
        },
      ],
    },
    {
      code: `
interface SafeThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | SafeThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | SafeThenable<TResult2>)
      | undefined
      | null,
  ): SafeThenable<TResult1 | TResult2>;
}
let promise: SafeThenable<number> = Promise.resolve(5);
0 ? promise : 3;
      `,
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SafeThenable' }],
        },
      ],
    },
    {
      code: `
class SafePromise<T> extends Promise<T> {}
let promise: { a: SafePromise<number> } = { a: Promise.resolve(5) };
promise.a;
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    {
      code: `
class SafePromise<T> extends Promise<T> {}
let promise: SafePromise<number> = Promise.resolve(5);
promise;
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    {
      code: `
type Foo = Promise<number> & { hey?: string };
let promise: Foo = Promise.resolve(5);
0 || promise;
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
    },
    {
      code: `
type Foo = Promise<number> & { hey?: string };
let promise: Foo = Promise.resolve(5);
promise.finally();
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
    },
    {
      code: `
interface SafeThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | SafeThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | SafeThenable<TResult2>)
      | undefined
      | null,
  ): SafeThenable<TResult1 | TResult2>;
}
let promise: () => SafeThenable<number> = () => Promise.resolve(5);
0, promise();
      `,
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SafeThenable' }],
        },
      ],
    },
    {
      code: `
interface SafeThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | SafeThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | SafeThenable<TResult2>)
      | undefined
      | null,
  ): SafeThenable<TResult1 | TResult2>;
}
let promise: () => SafeThenable<number> = () => Promise.resolve(5);
0 ? promise() : 3;
      `,
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SafeThenable' }],
        },
      ],
    },
    {
      code: `
type Foo = Promise<number> & { hey?: string };
let promise: () => Foo = () => Promise.resolve(5);
promise();
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
    },
    {
      code: `
type Foo = Promise<number> & { hey?: string };
let promise: () => Foo = async () => 5;
promise().finally();
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
    },
    {
      code: `
class SafePromise<T> extends Promise<T> {}
let promise: () => SafePromise<number> = async () => 5;
0 || promise();
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    {
      code: `
class SafePromise<T> extends Promise<T> {}
let promise: () => SafePromise<number> = async () => 5;
null ?? promise();
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    {
      code: `
let promise: () => PromiseLike<number> = () => Promise.resolve(5);
promise();
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'lib', name: 'PromiseLike' }] },
      ],
    },
    {
      code: `
type Foo<T> = Promise<T> & { hey?: string };
declare const arrayOrPromiseTuple: Foo<unknown>[];
arrayOrPromiseTuple;
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
    },
    {
      code: `
type Foo<T> = Promise<T> & { hey?: string };
declare const arrayOrPromiseTuple: [Foo<unknown>, 5];
arrayOrPromiseTuple;
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
    },
    {
      code: `
type SafePromise = Promise<number> & { __linterBrands?: string };
declare const myTag: (strings: TemplateStringsArray) => SafePromise;
myTag\`abc\`;
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    {
      code: `
        declare function it(...args: unknown[]): Promise<void>;

        it('...', () => {});
      `,
      options: [
        {
          allowForKnownSafeCalls: [
            {
              from: 'file',
              name: 'it',
              // https://github.com/typescript-eslint/typescript-eslint/pull/9234/files#r1626465054
              path: process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE
                ? 'file.ts'
                : 'tests/fixtures/file.ts',
            },
          ],
        },
      ],
    },
    {
      code: `
declare const myTag: (strings: TemplateStringsArray) => Promise<void>;
myTag\`abc\`.catch(() => {});
      `,
    },
    {
      code: `
declare const myTag: (strings: TemplateStringsArray) => string;
myTag\`abc\`;
      `,
    },
    {
      code: `
declare let x: any;
declare const promiseArray: Array<Promise<unknown>>;
x = promiseArray;
      `,
    },
    {
      code: `
declare let x: Promise<number>;
x = Promise.resolve(2);
      `,
    },
    {
      code: `
declare const promiseArray: Array<Promise<unknown>>;
async function f() {
  return promiseArray;
}
      `,
    },
    {
      code: `
declare const promiseArray: Array<Promise<unknown>>;
async function* generator() {
  yield* promiseArray;
}
      `,
    },
    {
      code: `
async function* generator() {
  yield Promise.resolve();
}
      `,
    },
    {
      code: `
interface SafeThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | SafeThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | SafeThenable<TResult2>)
      | undefined
      | null,
  ): SafeThenable<TResult1 | TResult2>;
}
let promise: () => SafeThenable<number> = () => Promise.resolve(5);
promise().then(() => {});
      `,
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SafeThenable' }],
        },
      ],
    },

    {
      code: `
        declare module 'abc' {
          export function it(name: string, action: () => void): void;
        }
        it('...', () => {});
      `,
      options: [
        {
          allowForKnownSafeCalls: [
            { from: 'package', name: 'it', package: 'abc' },
          ],
        },
      ],
    },
    {
      code: `
        declare module 'abc' {
          export function it(name: string, action: () => void): void;
        }

        it('...', () => {});
      `,
      options: [
        {
          allowForKnownSafeCalls: [
            { from: 'package', name: 'it', package: 'abc' },
          ],
        },
      ],
    },
    {
      code: `
        import { it } from 'node:test';

        it('...', () => {});
      `,
      options: [
        {
          allowForKnownSafeCalls: [
            { from: 'package', name: 'it', package: 'node:test' },
          ],
        },
      ],
    },
    {
      code: `
interface SafePromise<T> extends Promise<T> {
  brand: 'safe';
}

declare const createSafePromise: () => SafePromise<string>;
createSafePromise();
      `,
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }],
          checkThenables: true,
        },
      ],
    },
    `
declare const createPromiseLike: () => PromiseLike<number>;
createPromiseLike();
    `,
    `
interface MyThenable {
  then(onFulfilled: () => void, onRejected: () => void): MyThenable;
}

declare function createMyThenable(): MyThenable;

createMyThenable();
    `,
  ],

  invalid: [
    {
      code: `
async function test() {
  Promise.resolve('value');
  Promise.resolve('value').then(() => {});
  Promise.resolve('value').catch();
  Promise.resolve('value').finally();
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void Promise.resolve('value');
  Promise.resolve('value').then(() => {});
  Promise.resolve('value').catch();
  Promise.resolve('value').finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await Promise.resolve('value');
  Promise.resolve('value').then(() => {});
  Promise.resolve('value').catch();
  Promise.resolve('value').finally();
}
      `,
            },
          ],
        },
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  Promise.resolve('value');
  void Promise.resolve('value').then(() => {});
  Promise.resolve('value').catch();
  Promise.resolve('value').finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  Promise.resolve('value');
  await Promise.resolve('value').then(() => {});
  Promise.resolve('value').catch();
  Promise.resolve('value').finally();
}
      `,
            },
          ],
        },
        {
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  Promise.resolve('value');
  Promise.resolve('value').then(() => {});
  void Promise.resolve('value').catch();
  Promise.resolve('value').finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  Promise.resolve('value');
  Promise.resolve('value').then(() => {});
  await Promise.resolve('value').catch();
  Promise.resolve('value').finally();
}
      `,
            },
          ],
        },
        {
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  Promise.resolve('value');
  Promise.resolve('value').then(() => {});
  Promise.resolve('value').catch();
  void Promise.resolve('value').finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  Promise.resolve('value');
  Promise.resolve('value').then(() => {});
  Promise.resolve('value').catch();
  await Promise.resolve('value').finally();
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  obj3.a?.b.c?.();
  obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  callback?.();
};

doSomething();
      `,
      errors: [
        {
          line: 11,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  void obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  obj3.a?.b.c?.();
  obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  callback?.();
};

doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  await obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  obj3.a?.b.c?.();
  obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  callback?.();
};

doSomething();
      `,
            },
          ],
        },
        {
          line: 12,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  void obj2.a?.b?.c();
  obj3.a?.b.c?.();
  obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  callback?.();
};

doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  await obj2.a?.b?.c();
  obj3.a?.b.c?.();
  obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  callback?.();
};

doSomething();
      `,
            },
          ],
        },
        {
          line: 13,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  void obj3.a?.b.c?.();
  obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  callback?.();
};

doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  await obj3.a?.b.c?.();
  obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  callback?.();
};

doSomething();
      `,
            },
          ],
        },
        {
          line: 14,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  obj3.a?.b.c?.();
  void obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  callback?.();
};

doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  obj3.a?.b.c?.();
  await obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  callback?.();
};

doSomething();
      `,
            },
          ],
        },
        {
          line: 15,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  obj3.a?.b.c?.();
  obj4.a.b.c?.();
  void obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  callback?.();
};

doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  obj3.a?.b.c?.();
  obj4.a.b.c?.();
  await obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  callback?.();
};

doSomething();
      `,
            },
          ],
        },
        {
          line: 16,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  obj3.a?.b.c?.();
  obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  void obj6?.a.b.c?.();

  callback?.();
};

doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  obj3.a?.b.c?.();
  obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  await obj6?.a.b.c?.();

  callback?.();
};

doSomething();
      `,
            },
          ],
        },
        {
          line: 18,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  obj3.a?.b.c?.();
  obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  void callback?.();
};

doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  obj3.a?.b.c?.();
  obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  await callback?.();
};

doSomething();
      `,
            },
          ],
        },
        {
          line: 21,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  obj3.a?.b.c?.();
  obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  callback?.();
};

void doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (
  obj1: { a?: { b?: { c?: () => Promise<void> } } },
  obj2: { a?: { b?: { c: () => Promise<void> } } },
  obj3: { a?: { b: { c?: () => Promise<void> } } },
  obj4: { a: { b: { c?: () => Promise<void> } } },
  obj5: { a?: () => { b?: { c?: () => Promise<void> } } },
  obj6?: { a: { b: { c?: () => Promise<void> } } },
  callback?: () => Promise<void>,
): Promise<void> => {
  obj1.a?.b?.c?.();
  obj2.a?.b?.c();
  obj3.a?.b.c?.();
  obj4.a.b.c?.();
  obj5.a?.().b?.c?.();
  obj6?.a.b.c?.();

  callback?.();
};

await doSomething();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const myTag: (strings: TemplateStringsArray) => Promise<void>;
myTag\`abc\`;
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const myTag: (strings: TemplateStringsArray) => Promise<void>;
void myTag\`abc\`;
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const myTag: (strings: TemplateStringsArray) => Promise<void>;
await myTag\`abc\`;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const myTag: (strings: TemplateStringsArray) => Promise<void>;
myTag\`abc\`.then(() => {});
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const myTag: (strings: TemplateStringsArray) => Promise<void>;
void myTag\`abc\`.then(() => {});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const myTag: (strings: TemplateStringsArray) => Promise<void>;
await myTag\`abc\`.then(() => {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const myTag: (strings: TemplateStringsArray) => Promise<void>;
myTag\`abc\`.finally(() => {});
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const myTag: (strings: TemplateStringsArray) => Promise<void>;
void myTag\`abc\`.finally(() => {});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const myTag: (strings: TemplateStringsArray) => Promise<void>;
await myTag\`abc\`.finally(() => {});
      `,
            },
          ],
        },
      ],
    },

    {
      options: [{ ignoreVoid: true }],
      code: `
async function test() {
  Promise.resolve('value');
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void Promise.resolve('value');
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await Promise.resolve('value');
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function test() {
  Promise.reject(new Error('message'));
  Promise.reject(new Error('message')).then(() => {});
  Promise.reject(new Error('message')).catch();
  Promise.reject(new Error('message')).finally();
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void Promise.reject(new Error('message'));
  Promise.reject(new Error('message')).then(() => {});
  Promise.reject(new Error('message')).catch();
  Promise.reject(new Error('message')).finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await Promise.reject(new Error('message'));
  Promise.reject(new Error('message')).then(() => {});
  Promise.reject(new Error('message')).catch();
  Promise.reject(new Error('message')).finally();
}
      `,
            },
          ],
        },
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  Promise.reject(new Error('message'));
  void Promise.reject(new Error('message')).then(() => {});
  Promise.reject(new Error('message')).catch();
  Promise.reject(new Error('message')).finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  Promise.reject(new Error('message'));
  await Promise.reject(new Error('message')).then(() => {});
  Promise.reject(new Error('message')).catch();
  Promise.reject(new Error('message')).finally();
}
      `,
            },
          ],
        },
        {
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  Promise.reject(new Error('message'));
  Promise.reject(new Error('message')).then(() => {});
  void Promise.reject(new Error('message')).catch();
  Promise.reject(new Error('message')).finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  Promise.reject(new Error('message'));
  Promise.reject(new Error('message')).then(() => {});
  await Promise.reject(new Error('message')).catch();
  Promise.reject(new Error('message')).finally();
}
      `,
            },
          ],
        },
        {
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  Promise.reject(new Error('message'));
  Promise.reject(new Error('message')).then(() => {});
  Promise.reject(new Error('message')).catch();
  void Promise.reject(new Error('message')).finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  Promise.reject(new Error('message'));
  Promise.reject(new Error('message')).then(() => {});
  Promise.reject(new Error('message')).catch();
  await Promise.reject(new Error('message')).finally();
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function test() {
  (async () => true)();
  (async () => true)().then(() => {});
  (async () => true)().catch();
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void (async () => true)();
  (async () => true)().then(() => {});
  (async () => true)().catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await (async () => true)();
  (async () => true)().then(() => {});
  (async () => true)().catch();
}
      `,
            },
          ],
        },
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  (async () => true)();
  void (async () => true)().then(() => {});
  (async () => true)().catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  (async () => true)();
  await (async () => true)().then(() => {});
  (async () => true)().catch();
}
      `,
            },
          ],
        },
        {
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  (async () => true)();
  (async () => true)().then(() => {});
  void (async () => true)().catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  (async () => true)();
  (async () => true)().then(() => {});
  await (async () => true)().catch();
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function test() {
  async function returnsPromise() {}

  returnsPromise();
  returnsPromise().then(() => {});
  returnsPromise().catch();
  returnsPromise().finally();
}
      `,
      errors: [
        {
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  async function returnsPromise() {}

  void returnsPromise();
  returnsPromise().then(() => {});
  returnsPromise().catch();
  returnsPromise().finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  async function returnsPromise() {}

  await returnsPromise();
  returnsPromise().then(() => {});
  returnsPromise().catch();
  returnsPromise().finally();
}
      `,
            },
          ],
        },
        {
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  async function returnsPromise() {}

  returnsPromise();
  void returnsPromise().then(() => {});
  returnsPromise().catch();
  returnsPromise().finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  async function returnsPromise() {}

  returnsPromise();
  await returnsPromise().then(() => {});
  returnsPromise().catch();
  returnsPromise().finally();
}
      `,
            },
          ],
        },
        {
          line: 7,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  async function returnsPromise() {}

  returnsPromise();
  returnsPromise().then(() => {});
  void returnsPromise().catch();
  returnsPromise().finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  async function returnsPromise() {}

  returnsPromise();
  returnsPromise().then(() => {});
  await returnsPromise().catch();
  returnsPromise().finally();
}
      `,
            },
          ],
        },
        {
          line: 8,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  async function returnsPromise() {}

  returnsPromise();
  returnsPromise().then(() => {});
  returnsPromise().catch();
  void returnsPromise().finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  async function returnsPromise() {}

  returnsPromise();
  returnsPromise().then(() => {});
  returnsPromise().catch();
  await returnsPromise().finally();
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function test() {
  Math.random() > 0.5 ? Promise.resolve() : null;
  Math.random() > 0.5 ? null : Promise.resolve();
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void (Math.random() > 0.5 ? Promise.resolve() : null);
  Math.random() > 0.5 ? null : Promise.resolve();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await (Math.random() > 0.5 ? Promise.resolve() : null);
  Math.random() > 0.5 ? null : Promise.resolve();
}
      `,
            },
          ],
        },
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  Math.random() > 0.5 ? Promise.resolve() : null;
  void (Math.random() > 0.5 ? null : Promise.resolve());
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  Math.random() > 0.5 ? Promise.resolve() : null;
  await (Math.random() > 0.5 ? null : Promise.resolve());
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function test() {
  Promise.resolve(), 123;
  123, Promise.resolve();
  123, Promise.resolve(), 123;
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void (Promise.resolve(), 123);
  123, Promise.resolve();
  123, Promise.resolve(), 123;
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await (Promise.resolve(), 123);
  123, Promise.resolve();
  123, Promise.resolve(), 123;
}
      `,
            },
          ],
        },
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  Promise.resolve(), 123;
  void (123, Promise.resolve());
  123, Promise.resolve(), 123;
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  Promise.resolve(), 123;
  await (123, Promise.resolve());
  123, Promise.resolve(), 123;
}
      `,
            },
          ],
        },
        {
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  Promise.resolve(), 123;
  123, Promise.resolve();
  void (123, Promise.resolve(), 123);
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  Promise.resolve(), 123;
  123, Promise.resolve();
  await (123, Promise.resolve(), 123);
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function test() {
  void Promise.resolve();
}
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 3,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await Promise.resolve();
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function test() {
  const promise = new Promise((resolve, reject) => resolve('value'));
  promise;
}
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 4,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  const promise = new Promise((resolve, reject) => resolve('value'));
  await promise;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function returnsPromise() {
  return 'value';
}
void returnsPromise();
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 5,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
async function returnsPromise() {
  return 'value';
}
await returnsPromise();
      `,
            },
          ],
        },
      ],
    },
    {
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      code: `
async function returnsPromise() {
  return 'value';
}
void /* ... */ returnsPromise();
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 5,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
async function returnsPromise() {
  return 'value';
}
await /* ... */ returnsPromise();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function returnsPromise() {
  return 'value';
}
1, returnsPromise();
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 5,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
async function returnsPromise() {
  return 'value';
}
await (1, returnsPromise());
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function returnsPromise() {
  return 'value';
}
bool ? returnsPromise() : null;
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 5,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
async function returnsPromise() {
  return 'value';
}
await (bool ? returnsPromise() : null);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function test() {
  const obj = { foo: Promise.resolve() };
  obj.foo;
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  const obj = { foo: Promise.resolve() };
  void obj.foo;
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  const obj = { foo: Promise.resolve() };
  await obj.foo;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function test() {
  new Promise(resolve => resolve());
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void new Promise(resolve => resolve());
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await new Promise(resolve => resolve());
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const promiseValue: Promise<number>;

async function test() {
  promiseValue;
  promiseValue.then(() => {});
  promiseValue.catch();
  promiseValue.finally();
}
      `,
      errors: [
        {
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  void promiseValue;
  promiseValue.then(() => {});
  promiseValue.catch();
  promiseValue.finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  await promiseValue;
  promiseValue.then(() => {});
  promiseValue.catch();
  promiseValue.finally();
}
      `,
            },
          ],
        },
        {
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  promiseValue;
  void promiseValue.then(() => {});
  promiseValue.catch();
  promiseValue.finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  promiseValue;
  await promiseValue.then(() => {});
  promiseValue.catch();
  promiseValue.finally();
}
      `,
            },
          ],
        },
        {
          line: 7,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  promiseValue;
  promiseValue.then(() => {});
  void promiseValue.catch();
  promiseValue.finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  promiseValue;
  promiseValue.then(() => {});
  await promiseValue.catch();
  promiseValue.finally();
}
      `,
            },
          ],
        },
        {
          line: 8,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  promiseValue;
  promiseValue.then(() => {});
  promiseValue.catch();
  void promiseValue.finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  promiseValue;
  promiseValue.then(() => {});
  promiseValue.catch();
  await promiseValue.finally();
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const promiseUnion: Promise<number> | number;

async function test() {
  promiseUnion;
}
      `,
      errors: [
        {
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseUnion: Promise<number> | number;

async function test() {
  void promiseUnion;
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseUnion: Promise<number> | number;

async function test() {
  await promiseUnion;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const promiseIntersection: Promise<number> & number;

async function test() {
  promiseIntersection;
  promiseIntersection.then(() => {});
  promiseIntersection.catch();
}
      `,
      errors: [
        {
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;

async function test() {
  void promiseIntersection;
  promiseIntersection.then(() => {});
  promiseIntersection.catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;

async function test() {
  await promiseIntersection;
  promiseIntersection.then(() => {});
  promiseIntersection.catch();
}
      `,
            },
          ],
        },
        {
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;

async function test() {
  promiseIntersection;
  void promiseIntersection.then(() => {});
  promiseIntersection.catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;

async function test() {
  promiseIntersection;
  await promiseIntersection.then(() => {});
  promiseIntersection.catch();
}
      `,
            },
          ],
        },
        {
          line: 7,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;

async function test() {
  promiseIntersection;
  promiseIntersection.then(() => {});
  void promiseIntersection.catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;

async function test() {
  promiseIntersection;
  promiseIntersection.then(() => {});
  await promiseIntersection.catch();
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  canThen;
  canThen.then(() => {});
  canThen.catch();
  canThen.finally();
}
      `,
      errors: [
        {
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  void canThen;
  canThen.then(() => {});
  canThen.catch();
  canThen.finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  await canThen;
  canThen.then(() => {});
  canThen.catch();
  canThen.finally();
}
      `,
            },
          ],
        },
        {
          line: 7,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  canThen;
  void canThen.then(() => {});
  canThen.catch();
  canThen.finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  canThen;
  await canThen.then(() => {});
  canThen.catch();
  canThen.finally();
}
      `,
            },
          ],
        },
        {
          line: 8,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  canThen;
  canThen.then(() => {});
  void canThen.catch();
  canThen.finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  canThen;
  canThen.then(() => {});
  await canThen.catch();
  canThen.finally();
}
      `,
            },
          ],
        },
        {
          line: 9,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  canThen;
  canThen.then(() => {});
  canThen.catch();
  void canThen.finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  canThen;
  canThen.then(() => {});
  canThen.catch();
  await canThen.finally();
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function test() {
  class CatchableThenable {
    then(callback: () => void, callback: () => void): CatchableThenable {
      return new CatchableThenable();
    }
  }
  const thenable = new CatchableThenable();

  thenable;
  thenable.then(() => {});
}
      `,
      errors: [
        {
          line: 10,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  class CatchableThenable {
    then(callback: () => void, callback: () => void): CatchableThenable {
      return new CatchableThenable();
    }
  }
  const thenable = new CatchableThenable();

  void thenable;
  thenable.then(() => {});
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  class CatchableThenable {
    then(callback: () => void, callback: () => void): CatchableThenable {
      return new CatchableThenable();
    }
  }
  const thenable = new CatchableThenable();

  await thenable;
  thenable.then(() => {});
}
      `,
            },
          ],
        },
        {
          line: 11,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  class CatchableThenable {
    then(callback: () => void, callback: () => void): CatchableThenable {
      return new CatchableThenable();
    }
  }
  const thenable = new CatchableThenable();

  thenable;
  void thenable.then(() => {});
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  class CatchableThenable {
    then(callback: () => void, callback: () => void): CatchableThenable {
      return new CatchableThenable();
    }
  }
  const thenable = new CatchableThenable();

  thenable;
  await thenable.then(() => {});
}
      `,
            },
          ],
        },
      ],
      options: [{ checkThenables: true }],
    },
    {
      code: `
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/promise-polyfill/index.d.ts
// Type definitions for promise-polyfill 6.0
// Project: https://github.com/taylorhakes/promise-polyfill
// Definitions by: Steve Jenkins <https://github.com/skysteve>
//                 Daniel Cassidy <https://github.com/djcsdy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface PromisePolyfillConstructor extends PromiseConstructor {
  _immediateFn?: (handler: (() => void) | string) => void;
}

declare const PromisePolyfill: PromisePolyfillConstructor;

async function test() {
  const promise = new PromisePolyfill(() => {});

  promise;
  promise.then(() => {});
  promise.catch();
}
      `,
      errors: [
        {
          line: 18,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/promise-polyfill/index.d.ts
// Type definitions for promise-polyfill 6.0
// Project: https://github.com/taylorhakes/promise-polyfill
// Definitions by: Steve Jenkins <https://github.com/skysteve>
//                 Daniel Cassidy <https://github.com/djcsdy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface PromisePolyfillConstructor extends PromiseConstructor {
  _immediateFn?: (handler: (() => void) | string) => void;
}

declare const PromisePolyfill: PromisePolyfillConstructor;

async function test() {
  const promise = new PromisePolyfill(() => {});

  void promise;
  promise.then(() => {});
  promise.catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/promise-polyfill/index.d.ts
// Type definitions for promise-polyfill 6.0
// Project: https://github.com/taylorhakes/promise-polyfill
// Definitions by: Steve Jenkins <https://github.com/skysteve>
//                 Daniel Cassidy <https://github.com/djcsdy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface PromisePolyfillConstructor extends PromiseConstructor {
  _immediateFn?: (handler: (() => void) | string) => void;
}

declare const PromisePolyfill: PromisePolyfillConstructor;

async function test() {
  const promise = new PromisePolyfill(() => {});

  await promise;
  promise.then(() => {});
  promise.catch();
}
      `,
            },
          ],
        },
        {
          line: 19,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/promise-polyfill/index.d.ts
// Type definitions for promise-polyfill 6.0
// Project: https://github.com/taylorhakes/promise-polyfill
// Definitions by: Steve Jenkins <https://github.com/skysteve>
//                 Daniel Cassidy <https://github.com/djcsdy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface PromisePolyfillConstructor extends PromiseConstructor {
  _immediateFn?: (handler: (() => void) | string) => void;
}

declare const PromisePolyfill: PromisePolyfillConstructor;

async function test() {
  const promise = new PromisePolyfill(() => {});

  promise;
  void promise.then(() => {});
  promise.catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/promise-polyfill/index.d.ts
// Type definitions for promise-polyfill 6.0
// Project: https://github.com/taylorhakes/promise-polyfill
// Definitions by: Steve Jenkins <https://github.com/skysteve>
//                 Daniel Cassidy <https://github.com/djcsdy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface PromisePolyfillConstructor extends PromiseConstructor {
  _immediateFn?: (handler: (() => void) | string) => void;
}

declare const PromisePolyfill: PromisePolyfillConstructor;

async function test() {
  const promise = new PromisePolyfill(() => {});

  promise;
  await promise.then(() => {});
  promise.catch();
}
      `,
            },
          ],
        },
        {
          line: 20,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/promise-polyfill/index.d.ts
// Type definitions for promise-polyfill 6.0
// Project: https://github.com/taylorhakes/promise-polyfill
// Definitions by: Steve Jenkins <https://github.com/skysteve>
//                 Daniel Cassidy <https://github.com/djcsdy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface PromisePolyfillConstructor extends PromiseConstructor {
  _immediateFn?: (handler: (() => void) | string) => void;
}

declare const PromisePolyfill: PromisePolyfillConstructor;

async function test() {
  const promise = new PromisePolyfill(() => {});

  promise;
  promise.then(() => {});
  void promise.catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/promise-polyfill/index.d.ts
// Type definitions for promise-polyfill 6.0
// Project: https://github.com/taylorhakes/promise-polyfill
// Definitions by: Steve Jenkins <https://github.com/skysteve>
//                 Daniel Cassidy <https://github.com/djcsdy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface PromisePolyfillConstructor extends PromiseConstructor {
  _immediateFn?: (handler: (() => void) | string) => void;
}

declare const PromisePolyfill: PromisePolyfillConstructor;

async function test() {
  const promise = new PromisePolyfill(() => {});

  promise;
  promise.then(() => {});
  await promise.catch();
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        (async () => {
          await something();
        })();
      `,
      errors: [
        {
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
        void (async () => {
          await something();
        })();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
        await (async () => {
          await something();
        })();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        (async () => {
          something();
        })();
      `,
      errors: [
        {
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
        void (async () => {
          something();
        })();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
        await (async () => {
          something();
        })();
      `,
            },
          ],
        },
      ],
    },
    {
      code: '(async function foo() {})();',
      errors: [
        {
          line: 1,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: 'void (async function foo() {})();',
            },
            {
              messageId: 'floatingFixAwait',
              output: 'await (async function foo() {})();',
            },
          ],
        },
      ],
    },
    {
      code: `
        function foo() {
          (async function bar() {})();
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
        function foo() {
          void (async function bar() {})();
        }
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
        function foo() {
          await (async function bar() {})();
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        const foo = () =>
          new Promise(res => {
            (async function () {
              await res(1);
            })();
          });
      `,
      errors: [
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
        const foo = () =>
          new Promise(res => {
            void (async function () {
              await res(1);
            })();
          });
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
        const foo = () =>
          new Promise(res => {
            await (async function () {
              await res(1);
            })();
          });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        (async function () {
          await res(1);
        })();
      `,
      errors: [
        {
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
        void (async function () {
          await res(1);
        })();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
        await (async function () {
          await res(1);
        })();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        (async function () {
          Promise.resolve();
        })();
      `,
      options: [{ ignoreIIFE: true }],
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
        (async function () {
          void Promise.resolve();
        })();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
        (async function () {
          await Promise.resolve();
        })();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  promiseIntersection;
  promiseIntersection.then(() => {});
  promiseIntersection.catch();
  promiseIntersection.finally();
})();
      `,
      options: [{ ignoreIIFE: true }],
      errors: [
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  void promiseIntersection;
  promiseIntersection.then(() => {});
  promiseIntersection.catch();
  promiseIntersection.finally();
})();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  await promiseIntersection;
  promiseIntersection.then(() => {});
  promiseIntersection.catch();
  promiseIntersection.finally();
})();
      `,
            },
          ],
        },
        {
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  promiseIntersection;
  void promiseIntersection.then(() => {});
  promiseIntersection.catch();
  promiseIntersection.finally();
})();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  promiseIntersection;
  await promiseIntersection.then(() => {});
  promiseIntersection.catch();
  promiseIntersection.finally();
})();
      `,
            },
          ],
        },
        {
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  promiseIntersection;
  promiseIntersection.then(() => {});
  void promiseIntersection.catch();
  promiseIntersection.finally();
})();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  promiseIntersection;
  promiseIntersection.then(() => {});
  await promiseIntersection.catch();
  promiseIntersection.finally();
})();
      `,
            },
          ],
        },
        {
          line: 7,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  promiseIntersection;
  promiseIntersection.then(() => {});
  promiseIntersection.catch();
  void promiseIntersection.finally();
})();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  promiseIntersection;
  promiseIntersection.then(() => {});
  promiseIntersection.catch();
  await promiseIntersection.finally();
})();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = true;

  void condition || myPromise();
}
      `,
      errors: [
        {
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = true;

  void (void condition || myPromise());
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = true;

  await (void condition || myPromise());
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = true;

  (await condition) && myPromise();
}
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 6,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = true;

  await ((await condition) && myPromise());
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = true;

  condition && myPromise();
}
      `,
      errors: [
        {
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = true;

  void (condition && myPromise());
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = true;

  await (condition && myPromise());
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = false;

  condition || myPromise();
}
      `,
      errors: [
        {
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = false;

  void (condition || myPromise());
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = false;

  await (condition || myPromise());
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = null;

  condition ?? myPromise();
}
      `,
      errors: [
        {
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = null;

  void (condition ?? myPromise());
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = null;

  await (condition ?? myPromise());
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function foo() {
  const myPromise = Promise.resolve(true);
  let condition = true;
  condition && myPromise;
}
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 5,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
async function foo() {
  const myPromise = Promise.resolve(true);
  let condition = true;
  await (condition && myPromise);
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function foo() {
  const myPromise = Promise.resolve(true);
  let condition = false;
  condition || myPromise;
}
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 5,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
async function foo() {
  const myPromise = Promise.resolve(true);
  let condition = false;
  await (condition || myPromise);
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function foo() {
  const myPromise = Promise.resolve(true);
  let condition = null;
  condition ?? myPromise;
}
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 5,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
async function foo() {
  const myPromise = Promise.resolve(true);
  let condition = null;
  await (condition ?? myPromise);
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = false;

  condition || condition || myPromise();
}
      `,
      errors: [
        {
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = false;

  void (condition || condition || myPromise());
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function foo() {
  const myPromise = async () => void 0;
  const condition = false;

  await (condition || condition || myPromise());
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
      errors: [
        {
          line: 4,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
void Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
await Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 5,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
void Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
await Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 6,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
void Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
await Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 7,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
void Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
await Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 10,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

void Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

await Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 11,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
void Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
await Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 12,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
void Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
await Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 13,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
void Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
await Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.reject() || 3;
      `,
      errors: [
        {
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void (Promise.reject() || 3);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await (Promise.reject() || 3);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
void Promise.resolve().then(() => {}, undefined);
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 2,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.resolve().then(() => {}, undefined);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const maybeCallable: string | (() => void);
Promise.resolve().then(() => {}, maybeCallable);
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 3,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
await Promise.resolve().then(() => {}, maybeCallable);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 4,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
await Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 5,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
await Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 6,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
await Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 7,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
await Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 10,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

await Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 11,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
await Promise.resolve().catch(null);
Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 12,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
await Promise.resolve().catch(3);
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
        {
          line: 13,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, undefined);
Promise.resolve().then(() => {}, null);
Promise.resolve().then(() => {}, 3);
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);

Promise.resolve().catch(undefined);
Promise.resolve().catch(null);
Promise.resolve().catch(3);
await Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.reject() || 3;
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 2,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
await (Promise.reject() || 3);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.reject().finally(() => {});
      `,
      errors: [
        {
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.reject().finally(() => {});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.reject().finally(() => {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.reject()
  .finally(() => {})
  .finally(() => {});
      `,
      options: [{ ignoreVoid: false }],
      errors: [
        {
          line: 2,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.reject()
  .finally(() => {})
  .finally(() => {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.reject()
  .finally(() => {})
  .finally(() => {})
  .finally(() => {});
      `,
      errors: [
        {
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.reject()
  .finally(() => {})
  .finally(() => {})
  .finally(() => {});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.reject()
  .finally(() => {})
  .finally(() => {})
  .finally(() => {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.reject()
  .then(() => {})
  .finally(() => {});
      `,
      errors: [
        {
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.reject()
  .then(() => {})
  .finally(() => {});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.reject()
  .then(() => {})
  .finally(() => {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const returnsPromise: () => Promise<void> | null;
returnsPromise()?.finally(() => {});
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const returnsPromise: () => Promise<void> | null;
void returnsPromise()?.finally(() => {});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const returnsPromise: () => Promise<void> | null;
await returnsPromise()?.finally(() => {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const promiseIntersection: Promise<number> & number;
promiseIntersection.finally(() => {});
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const promiseIntersection: Promise<number> & number;
void promiseIntersection.finally(() => {});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const promiseIntersection: Promise<number> & number;
await promiseIntersection.finally(() => {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.resolve().finally(() => {}), 123;
      `,
      errors: [
        {
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void (Promise.resolve().finally(() => {}), 123);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await (Promise.resolve().finally(() => {}), 123);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
(async () => true)().finally();
      `,
      errors: [
        {
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void (async () => true)().finally();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await (async () => true)().finally();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.reject(new Error('message')).finally(() => {});
      `,
      errors: [
        {
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.reject(new Error('message')).finally(() => {});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.reject(new Error('message')).finally(() => {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function _<T, S extends Array<T | Promise<T>>>(
  maybePromiseArray: S | undefined,
): void {
  maybePromiseArray?.[0];
}
      `,
      errors: [
        {
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
function _<T, S extends Array<T | Promise<T>>>(
  maybePromiseArray: S | undefined,
): void {
  void maybePromiseArray?.[0];
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
function _<T, S extends Array<T | Promise<T>>>(
  maybePromiseArray: S | undefined,
): void {
  await maybePromiseArray?.[0];
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
[1, 2, 3].map(() => Promise.reject());
      `,
      errors: [{ line: 2, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
declare const array: unknown[];
array.map(() => Promise.reject());
      `,
      errors: [{ line: 3, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
declare const promiseArray: Array<Promise<unknown>>;
void promiseArray;
      `,
      options: [{ ignoreVoid: false }],
      errors: [{ line: 3, messageId: 'floatingPromiseArray' }],
    },
    {
      code: `
declare const promiseArray: Array<Promise<unknown>>;
async function f() {
  await promiseArray;
}
      `,
      options: [{ ignoreVoid: false }],
      errors: [{ line: 4, messageId: 'floatingPromiseArray' }],
    },
    {
      code: `
[1, 2, Promise.reject(), 3];
      `,
      errors: [{ line: 2, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
[1, 2, Promise.reject().catch(() => {}), 3];
      `,
      errors: [{ line: 2, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
const data = ['test'];
data.map(async () => {
  await new Promise((_res, rej) => setTimeout(rej, 1000));
});
      `,
      errors: [{ line: 3, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
function _<T, S extends Array<T | Array<T | Promise<T>>>>(
  maybePromiseArrayArray: S | undefined,
): void {
  maybePromiseArrayArray?.[0];
}
      `,
      errors: [{ line: 5, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
function f<T extends Array<Promise<number>>>(a: T): void {
  a;
}
      `,
      errors: [{ line: 3, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
declare const a: Array<Promise<number>> | undefined;
a;
      `,
      errors: [{ line: 3, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
function f<T extends Array<Promise<number>>>(a: T | undefined): void {
  a;
}
      `,
      errors: [{ line: 3, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
[Promise.reject()] as const;
      `,
      errors: [{ line: 2, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
declare function cursed(): [Promise<number>, Promise<string>];
cursed();
      `,
      errors: [{ line: 3, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
[
  'Type Argument number ',
  1,
  'is not',
  Promise.resolve(),
  'but it still is flagged',
] as const;
      `,
      errors: [{ line: 2, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
        declare const arrayOrPromiseTuple:
          | Array<number>
          | [number, number, Promise<unknown>, string];
        arrayOrPromiseTuple;
      `,
      errors: [{ line: 5, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
        declare const okArrayOrPromiseArray: Array<number> | Array<Promise<unknown>>;
        okArrayOrPromiseArray;
      `,
      errors: [{ line: 3, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
interface UnsafeThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | UnsafeThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | UnsafeThenable<TResult2>)
      | undefined
      | null,
  ): UnsafeThenable<TResult1 | TResult2>;
}
let promise: UnsafeThenable<number> = Promise.resolve(5);
promise;
      `,
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SafeThenable' }],
          checkThenables: true,
        },
      ],
      errors: [
        {
          line: 15,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
interface UnsafeThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | UnsafeThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | UnsafeThenable<TResult2>)
      | undefined
      | null,
  ): UnsafeThenable<TResult1 | TResult2>;
}
let promise: UnsafeThenable<number> = Promise.resolve(5);
void promise;
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
interface UnsafeThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | UnsafeThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | UnsafeThenable<TResult2>)
      | undefined
      | null,
  ): UnsafeThenable<TResult1 | TResult2>;
}
let promise: UnsafeThenable<number> = Promise.resolve(5);
await promise;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class SafePromise<T> extends Promise<T> {}
let promise: SafePromise<number> = Promise.resolve(5);
promise.catch();
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
      errors: [
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
class SafePromise<T> extends Promise<T> {}
let promise: SafePromise<number> = Promise.resolve(5);
void promise.catch();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
class SafePromise<T> extends Promise<T> {}
let promise: SafePromise<number> = Promise.resolve(5);
await promise.catch();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class UnsafePromise<T> extends Promise<T> {}
let promise: () => UnsafePromise<number> = async () => 5;
promise().finally();
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
      errors: [
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
class UnsafePromise<T> extends Promise<T> {}
let promise: () => UnsafePromise<number> = async () => 5;
void promise().finally();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
class UnsafePromise<T> extends Promise<T> {}
let promise: () => UnsafePromise<number> = async () => 5;
await promise().finally();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type UnsafePromise = Promise<number> & { hey?: string };
let promise: UnsafePromise = Promise.resolve(5);
0 ? promise.catch() : 2;
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
      errors: [
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
type UnsafePromise = Promise<number> & { hey?: string };
let promise: UnsafePromise = Promise.resolve(5);
void (0 ? promise.catch() : 2);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
type UnsafePromise = Promise<number> & { hey?: string };
let promise: UnsafePromise = Promise.resolve(5);
await (0 ? promise.catch() : 2);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type UnsafePromise = Promise<number> & { hey?: string };
let promise: () => UnsafePromise = async () => 5;
null ?? promise().catch();
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
      errors: [
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
type UnsafePromise = Promise<number> & { hey?: string };
let promise: () => UnsafePromise = async () => 5;
void (null ?? promise().catch());
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
type UnsafePromise = Promise<number> & { hey?: string };
let promise: () => UnsafePromise = async () => 5;
await (null ?? promise().catch());
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type Foo<T> = Promise<T> & { hey?: string };
declare const arrayOrPromiseTuple: Foo<unknown>[];
arrayOrPromiseTuple;
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Bar' }] }],
      errors: [{ line: 4, messageId: 'floatingPromiseArrayVoid' }],
    },
    // an array containing elements of `Promise` type and a branded Promise type will be treated as just an ordinary `Promise`.
    // see https://github.com/typescript-eslint/typescript-eslint/pull/8502#issuecomment-2105734406
    {
      code: `
type SafePromise = Promise<number> & { hey?: string };
let foo: SafePromise = Promise.resolve(1);
let bar = [Promise.resolve(2), foo];
bar;
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
      errors: [{ line: 5, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
type Foo<T> = Promise<T> & { hey?: string };
declare const arrayOrPromiseTuple: [Foo<unknown>, 5];
arrayOrPromiseTuple;
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Bar' }] }],
      errors: [{ line: 4, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
type SafePromise = Promise<number> & { __linterBrands?: string };
declare const myTag: (strings: TemplateStringsArray) => SafePromise;
myTag\`abc\`;
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
      errors: [
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
type SafePromise = Promise<number> & { __linterBrands?: string };
declare const myTag: (strings: TemplateStringsArray) => SafePromise;
void myTag\`abc\`;
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
type SafePromise = Promise<number> & { __linterBrands?: string };
declare const myTag: (strings: TemplateStringsArray) => SafePromise;
await myTag\`abc\`;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        declare function unsafe(...args: unknown[]): Promise<void>;

        unsafe('...', () => {});
      `,
      errors: [
        {
          line: 4,
          messageId: 'floatingVoid',

          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
        declare function unsafe(...args: unknown[]): Promise<void>;

        void unsafe('...', () => {});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
        declare function unsafe(...args: unknown[]): Promise<void>;

        await unsafe('...', () => {});
      `,
            },
          ],
        },
      ],
      options: [
        {
          allowForKnownSafeCalls: [
            {
              from: 'file',
              name: 'it',
              // https://github.com/typescript-eslint/typescript-eslint/pull/9234/files#r1626465054
              path: process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE
                ? 'file.ts'
                : 'tests/fixtures/file.ts',
            },
          ],
        },
      ],
    },
    {
      code: `
        declare function it(...args: unknown[]): Promise<void>;

        it('...', () => {}).then(() => {});
      `,
      errors: [
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
        declare function it(...args: unknown[]): Promise<void>;

        void it('...', () => {}).then(() => {});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
        declare function it(...args: unknown[]): Promise<void>;

        await it('...', () => {}).then(() => {});
      `,
            },
          ],
        },
      ],
      options: [
        {
          allowForKnownSafeCalls: [
            {
              from: 'file',
              name: 'it',
              // https://github.com/typescript-eslint/typescript-eslint/pull/9234/files#r1626465054
              path: process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE
                ? 'file.ts'
                : 'tests/fixtures/file.ts',
            },
          ],
        },
      ],
    },
    {
      code: `
        declare function it(...args: unknown[]): Promise<void>;

        it('...', () => {}).finally(() => {});
      `,
      errors: [
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
        declare function it(...args: unknown[]): Promise<void>;

        void it('...', () => {}).finally(() => {});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
        declare function it(...args: unknown[]): Promise<void>;

        await it('...', () => {}).finally(() => {});
      `,
            },
          ],
        },
      ],
      options: [
        {
          allowForKnownSafeCalls: [
            {
              from: 'file',
              name: 'it',
              // https://github.com/typescript-eslint/typescript-eslint/pull/9234/files#r1626465054
              path: process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE
                ? 'file.ts'
                : 'tests/fixtures/file.ts',
            },
          ],
        },
      ],
    },
    {
      code: `
declare const createPromise: () => PromiseLike<number>;
createPromise();
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const createPromise: () => PromiseLike<number>;
void createPromise();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const createPromise: () => PromiseLike<number>;
await createPromise();
      `,
            },
          ],
        },
      ],
      options: [{ checkThenables: true }],
    },
    {
      code: `
interface MyThenable {
  then(onFulfilled: () => void, onRejected: () => void): MyThenable;
}

declare function createMyThenable(): MyThenable;

createMyThenable();
      `,
      errors: [
        {
          line: 8,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
interface MyThenable {
  then(onFulfilled: () => void, onRejected: () => void): MyThenable;
}

declare function createMyThenable(): MyThenable;

void createMyThenable();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
interface MyThenable {
  then(onFulfilled: () => void, onRejected: () => void): MyThenable;
}

declare function createMyThenable(): MyThenable;

await createMyThenable();
      `,
            },
          ],
        },
      ],
      options: [{ checkThenables: true }],
    },
    {
      code: `
declare const createPromise: () => Promise<number>;
createPromise();
      `,
      errors: [
        {
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const createPromise: () => Promise<number>;
void createPromise();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const createPromise: () => Promise<number>;
await createPromise();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class MyPromise<T> extends Promise<T> {}
declare const createMyPromise: () => MyPromise<number>;
createMyPromise();
      `,
      errors: [
        {
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
class MyPromise<T> extends Promise<T> {}
declare const createMyPromise: () => MyPromise<number>;
void createMyPromise();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
class MyPromise<T> extends Promise<T> {}
declare const createMyPromise: () => MyPromise<number>;
await createMyPromise();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class MyPromise<T> extends Promise<T> {
  additional: string;
}
declare const createMyPromise: () => MyPromise<number>;
createMyPromise();
      `,
      errors: [
        {
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
class MyPromise<T> extends Promise<T> {
  additional: string;
}
declare const createMyPromise: () => MyPromise<number>;
void createMyPromise();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
class MyPromise<T> extends Promise<T> {
  additional: string;
}
declare const createMyPromise: () => MyPromise<number>;
await createMyPromise();
      `,
            },
          ],
        },
      ],
      options: [{ checkThenables: true }],
    },
    {
      code: `
declare const x: any;
function* generator(): Generator<number, void, Promise<number>> {
  yield x;
}
      `,
      errors: [
        {
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const x: any;
function* generator(): Generator<number, void, Promise<number>> {
  void (yield x);
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const x: any;
function* generator(): Generator<number, void, Promise<number>> {
  await (yield x);
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const x: Generator<number, Promise<number>, void>;
function* generator(): Generator<number, void, void> {
  yield* x;
}
      `,
      errors: [
        {
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const x: Generator<number, Promise<number>, void>;
function* generator(): Generator<number, void, void> {
  void (yield* x);
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const x: Generator<number, Promise<number>, void>;
function* generator(): Generator<number, void, void> {
  await (yield* x);
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const value = {};
value as Promise<number>;
      `,
      errors: [
        {
          messageId: 'floatingVoid',
          line: 3,
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const value = {};
void (value as Promise<number>);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const value = {};
await (value as Promise<number>);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
({}) as Promise<number> & number;
      `,
      errors: [
        {
          messageId: 'floatingVoid',
          line: 2,
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void (({}) as Promise<number> & number);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await (({}) as Promise<number> & number);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
({}) as Promise<number> & { yolo?: string };
      `,
      errors: [
        {
          messageId: 'floatingVoid',
          line: 2,
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void (({}) as Promise<number> & { yolo?: string });
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await (({}) as Promise<number> & { yolo?: string });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
<Promise<number>>{};
      `,
      errors: [
        {
          messageId: 'floatingVoid',
          line: 2,
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void (<Promise<number>>{});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await (<Promise<number>>{});
      `,
            },
          ],
        },
      ],
    },
  ],
});
