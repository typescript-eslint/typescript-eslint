import * as path from 'node:path';

import rule from '../../src/rules/no-floating-promises';
import { createRuleTesterWithTypes, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-floating-promises', rule, {
  assertionOptions: {
    requireData: true,
  },
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
      code: `
async function test() {
  void Promise.resolve('value');
}
      `,
      options: [{ ignoreVoid: true }],
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
  (Promise.resolve().catch(() => {}), 123);
  (123,
    Promise.resolve().then(
      () => {},
      () => {},
    ));
  (123,
    Promise.resolve().then(
      () => {},
      () => {},
    ),
    123);
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
      ((value: T) => TResult1 | SafeThenable<TResult1>) | undefined | null,
    onrejected?:
      ((reason: any) => TResult2 | SafeThenable<TResult2>) | undefined | null,
  ): SafeThenable<TResult1 | TResult2>;
}
let promise: SafeThenable<number> = Promise.resolve(5);
(0, promise);
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
      ((value: T) => TResult1 | SafeThenable<TResult1>) | undefined | null,
    onrejected?:
      ((reason: any) => TResult2 | SafeThenable<TResult2>) | undefined | null,
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
      ((value: T) => TResult1 | SafeThenable<TResult1>) | undefined | null,
    onrejected?:
      ((reason: any) => TResult2 | SafeThenable<TResult2>) | undefined | null,
  ): SafeThenable<TResult1 | TResult2>;
}
let promise: () => SafeThenable<number> = () => Promise.resolve(5);
(0, promise());
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
      ((value: T) => TResult1 | SafeThenable<TResult1>) | undefined | null,
    onrejected?:
      ((reason: any) => TResult2 | SafeThenable<TResult2>) | undefined | null,
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
                : path.posix.join(
                    ...path.relative(process.cwd(), rootDir).split(path.sep),
                    'file.ts',
                  ),
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
      ((value: T) => TResult1 | SafeThenable<TResult1>) | undefined | null,
    onrejected?:
      ((reason: any) => TResult2 | SafeThenable<TResult2>) | undefined | null,
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
    {
      code: `
const randomAsyncFunction = async () => {
  return Promise.resolve(true);
};

randomAsyncFunction();
      `,
      options: [
        {
          allowForKnownSafeCalls: ['randomAsyncFunction'],
        },
      ],
    },
    {
      code: `
async function myAsyncFunction() {
  return Promise.resolve('test');
}

myAsyncFunction();
      `,
      options: [
        {
          allowForKnownSafeCalls: ['myAsyncFunction'],
        },
      ],
    },

    "document.addEventListener('click', () => void fetch('/api/click'));",

    `
document.addEventListener('click', () => {
  void fetch('/api/click');
});
    `,

    // This code makes TypeScript type checker to crash with infinite recursion
    //
    // See:
    //  https://github.com/typescript-eslint/typescript-eslint/issues/11947
    //  https://github.com/microsoft/TypeScript/issues/63441
    `
interface CustomNode<P> {
  getNextNode: () => CustomNode<P>;
}

declare const createNode: () => {
  getNextNode: <T>() => CustomNode<T>;
};

function wrapNode<T>(getNode: () => CustomNode<T>) {
  return getNode;
}

(async () => {
  wrapNode(() => {
    const node = createNode();

    return wrapNode<typeof node.getNextNode<any>>(node.getNextNode);
  });
})().catch(() => {});
    `,
  ],

  invalid: [
    {
      code: `
async function test() {
  Promise.resolve('value');
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 28,
          endLine: 3,
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
  Promise.resolve('value').then(() => {});
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 43,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void Promise.resolve('value').then(() => {});
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await Promise.resolve('value').then(() => {});
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
  Promise.resolve('value').catch();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 36,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void Promise.resolve('value').catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await Promise.resolve('value').catch();
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
  Promise.resolve('value').finally();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 38,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void Promise.resolve('value').finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
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
const doSomething = async (obj: {
  a?: { b?: { c?: () => Promise<void> } };
}): Promise<void> => {
  obj.a?.b?.c?.();
};

void doSomething();
      `,
      errors: [
        {
          column: 3,
          endColumn: 19,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (obj: {
  a?: { b?: { c?: () => Promise<void> } };
}): Promise<void> => {
  void obj.a?.b?.c?.();
};

void doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (obj: {
  a?: { b?: { c?: () => Promise<void> } };
}): Promise<void> => {
  await obj.a?.b?.c?.();
};

void doSomething();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const doSomething = async (obj: {
  a?: { b?: { c: () => Promise<void> } };
}): Promise<void> => {
  obj.a?.b?.c();
};

void doSomething();
      `,
      errors: [
        {
          column: 3,
          endColumn: 17,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (obj: {
  a?: { b?: { c: () => Promise<void> } };
}): Promise<void> => {
  void obj.a?.b?.c();
};

void doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (obj: {
  a?: { b?: { c: () => Promise<void> } };
}): Promise<void> => {
  await obj.a?.b?.c();
};

void doSomething();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const doSomething = async (obj: {
  a?: { b: { c?: () => Promise<void> } };
}): Promise<void> => {
  obj.a?.b.c?.();
};

void doSomething();
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (obj: {
  a?: { b: { c?: () => Promise<void> } };
}): Promise<void> => {
  void obj.a?.b.c?.();
};

void doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (obj: {
  a?: { b: { c?: () => Promise<void> } };
}): Promise<void> => {
  await obj.a?.b.c?.();
};

void doSomething();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const doSomething = async (obj: {
  a: { b: { c?: () => Promise<void> } };
}): Promise<void> => {
  obj.a.b.c?.();
};

void doSomething();
      `,
      errors: [
        {
          column: 3,
          endColumn: 17,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (obj: {
  a: { b: { c?: () => Promise<void> } };
}): Promise<void> => {
  void obj.a.b.c?.();
};

void doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (obj: {
  a: { b: { c?: () => Promise<void> } };
}): Promise<void> => {
  await obj.a.b.c?.();
};

void doSomething();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const doSomething = async (obj: {
  a?: () => { b?: { c?: () => Promise<void> } };
}): Promise<void> => {
  obj.a?.().b?.c?.();
};

void doSomething();
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (obj: {
  a?: () => { b?: { c?: () => Promise<void> } };
}): Promise<void> => {
  void obj.a?.().b?.c?.();
};

void doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (obj: {
  a?: () => { b?: { c?: () => Promise<void> } };
}): Promise<void> => {
  await obj.a?.().b?.c?.();
};

void doSomething();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const doSomething = async (obj?: {
  a: { b: { c?: () => Promise<void> } };
}): Promise<void> => {
  obj?.a.b.c?.();
};

void doSomething();
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (obj?: {
  a: { b: { c?: () => Promise<void> } };
}): Promise<void> => {
  void obj?.a.b.c?.();
};

void doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (obj?: {
  a: { b: { c?: () => Promise<void> } };
}): Promise<void> => {
  await obj?.a.b.c?.();
};

void doSomething();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const doSomething = async (callback?: () => Promise<void>): Promise<void> => {
  callback?.();
};

void doSomething();
      `,
      errors: [
        {
          column: 3,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
const doSomething = async (callback?: () => Promise<void>): Promise<void> => {
  void callback?.();
};

void doSomething();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
const doSomething = async (callback?: () => Promise<void>): Promise<void> => {
  await callback?.();
};

void doSomething();
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
  await obj1.a?.b?.c?.();
  await obj2.a?.b?.c();
  await obj3.a?.b.c?.();
  await obj4.a.b.c?.();
  await obj5.a?.().b?.c?.();
  await obj6?.a.b.c?.();

  await callback?.();
};

doSomething();
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 21,
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
  await obj1.a?.b?.c?.();
  await obj2.a?.b?.c();
  await obj3.a?.b.c?.();
  await obj4.a.b.c?.();
  await obj5.a?.().b?.c?.();
  await obj6?.a.b.c?.();

  await callback?.();
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
  await obj1.a?.b?.c?.();
  await obj2.a?.b?.c();
  await obj3.a?.b.c?.();
  await obj4.a.b.c?.();
  await obj5.a?.().b?.c?.();
  await obj6?.a.b.c?.();

  await callback?.();
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
          column: 1,
          endColumn: 12,
          endLine: 3,
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
          column: 1,
          endColumn: 27,
          endLine: 3,
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
          column: 1,
          endColumn: 30,
          endLine: 3,
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
      code: `
async function test() {
  Promise.resolve('value');
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 28,
          endLine: 3,
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
      options: [{ ignoreVoid: true }],
    },
    {
      code: `
async function test() {
  Promise.reject(new Error('message'));
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 40,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void Promise.reject(new Error('message'));
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await Promise.reject(new Error('message'));
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
  Promise.reject(new Error('message')).then(() => {});
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 55,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void Promise.reject(new Error('message')).then(() => {});
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await Promise.reject(new Error('message')).then(() => {});
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
  Promise.reject(new Error('message')).catch();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 48,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void Promise.reject(new Error('message')).catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await Promise.reject(new Error('message')).catch();
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
  Promise.reject(new Error('message')).finally();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 50,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void Promise.reject(new Error('message')).finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
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
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void (async () => true)();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await (async () => true)();
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
  (async () => true)().then(() => {});
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void (async () => true)().then(() => {});
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await (async () => true)().then(() => {});
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
  (async () => true)().catch();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void (async () => true)().catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
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
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 20,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  async function returnsPromise() {}

  void returnsPromise();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  async function returnsPromise() {}

  await returnsPromise();
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

  returnsPromise().then(() => {});
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 35,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  async function returnsPromise() {}

  void returnsPromise().then(() => {});
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  async function returnsPromise() {}

  await returnsPromise().then(() => {});
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

  returnsPromise().catch();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 28,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  async function returnsPromise() {}

  void returnsPromise().catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  async function returnsPromise() {}

  await returnsPromise().catch();
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

  returnsPromise().finally();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 30,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  async function returnsPromise() {}

  void returnsPromise().finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  async function returnsPromise() {}

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
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 50,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void (Math.random() > 0.5 ? Promise.resolve() : null);
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await (Math.random() > 0.5 ? Promise.resolve() : null);
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
  Math.random() > 0.5 ? null : Promise.resolve();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 50,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void (Math.random() > 0.5 ? null : Promise.resolve());
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
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
  (Promise.resolve(), 123);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void (Promise.resolve(), 123);
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await (Promise.resolve(), 123);
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
  (123, Promise.resolve());
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void (123, Promise.resolve());
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  await (123, Promise.resolve());
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
  (123, Promise.resolve(), 123);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 33,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  void (123, Promise.resolve(), 123);
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
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
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 3,
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
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
async function test() {
  const promise = new Promise((resolve, reject) => resolve('value'));
  promise;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 11,
          endLine: 4,
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
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
async function returnsPromise() {
  return 'value';
}
void returnsPromise();
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 5,
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
      options: [{ ignoreVoid: false }],
    },
    {
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      code: `
async function returnsPromise() {
  return 'value';
}
void /* ... */ returnsPromise();
      `,
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 5,
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
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
async function returnsPromise() {
  return 'value';
}
(1, returnsPromise());
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 5,
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
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
async function returnsPromise() {
  return 'value';
}
bool ? returnsPromise() : null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 5,
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
      options: [{ ignoreVoid: false }],
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
          column: 3,
          endColumn: 11,
          endLine: 4,
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
          column: 3,
          endColumn: 37,
          endLine: 3,
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
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  void promiseValue;
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  await promiseValue;
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
  promiseValue.then(() => {});
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 31,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  void promiseValue.then(() => {});
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  await promiseValue.then(() => {});
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
  promiseValue.catch();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  void promiseValue.catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  await promiseValue.catch();
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
  promiseValue.finally();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
  void promiseValue.finally();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseValue: Promise<number>;

async function test() {
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
          column: 3,
          endColumn: 16,
          endLine: 5,
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
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 23,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;

async function test() {
  void promiseIntersection;
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;

async function test() {
  await promiseIntersection;
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
  promiseIntersection.then(() => {});
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 38,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;

async function test() {
  void promiseIntersection.then(() => {});
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;

async function test() {
  await promiseIntersection.then(() => {});
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
  promiseIntersection.catch();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 31,
          endLine: 5,
          line: 5,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;

async function test() {
  void promiseIntersection.catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;

async function test() {
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
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 11,
          endLine: 6,
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

  canThen.then(() => {});
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 6,
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  void canThen.then(() => {});
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  await canThen.then(() => {});
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

  canThen.catch();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 19,
          endLine: 6,
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  void canThen.catch();
}
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  await canThen.catch();
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

  canThen.finally();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 21,
          endLine: 6,
          line: 6,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

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
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 12,
          endLine: 10,
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
async function test() {
  class CatchableThenable {
    then(callback: () => void, callback: () => void): CatchableThenable {
      return new CatchableThenable();
    }
  }
  const thenable = new CatchableThenable();

  thenable.then(() => {});
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 27,
          endLine: 10,
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
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 11,
          endLine: 18,
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
}
      `,
            },
          ],
        },
      ],
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

  promise.then(() => {});
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 18,
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

  void promise.then(() => {});
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

  await promise.then(() => {});
}
      `,
            },
          ],
        },
      ],
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

  promise.catch();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 19,
          endLine: 18,
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
          column: 1,
          endColumn: 6,
          endLine: 4,
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
          column: 1,
          endColumn: 6,
          endLine: 4,
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
          column: 1,
          endColumn: 29,
          endLine: 1,
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
          column: 3,
          endColumn: 31,
          endLine: 3,
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
          column: 5,
          endColumn: 10,
          endLine: 6,
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
          column: 1,
          endColumn: 6,
          endLine: 4,
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
      errors: [
        {
          column: 3,
          endColumn: 21,
          endLine: 3,
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
      options: [{ ignoreIIFE: true }],
    },
    {
      code: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  promiseIntersection;
})();
      `,
      errors: [
        {
          column: 3,
          endColumn: 23,
          endLine: 4,
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  void promiseIntersection;
})();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  await promiseIntersection;
})();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreIIFE: true }],
    },
    {
      code: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  promiseIntersection.then(() => {});
})();
      `,
      errors: [
        {
          column: 3,
          endColumn: 38,
          endLine: 4,
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  void promiseIntersection.then(() => {});
})();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  await promiseIntersection.then(() => {});
})();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreIIFE: true }],
    },
    {
      code: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  promiseIntersection.catch();
})();
      `,
      errors: [
        {
          column: 3,
          endColumn: 31,
          endLine: 4,
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  void promiseIntersection.catch();
})();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  await promiseIntersection.catch();
})();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreIIFE: true }],
    },
    {
      code: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  promiseIntersection.finally();
})();
      `,
      errors: [
        {
          column: 3,
          endColumn: 33,
          endLine: 4,
          line: 4,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  void promiseIntersection.finally();
})();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const promiseIntersection: Promise<number> & number;
(async function () {
  await promiseIntersection.finally();
})();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreIIFE: true }],
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
          column: 3,
          endColumn: 33,
          endLine: 6,
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
      errors: [
        {
          column: 3,
          endColumn: 36,
          endLine: 6,
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
      options: [{ ignoreVoid: false }],
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
          column: 3,
          endColumn: 28,
          endLine: 6,
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
          column: 3,
          endColumn: 28,
          endLine: 6,
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
          column: 3,
          endColumn: 28,
          endLine: 6,
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
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 5,
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
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
async function foo() {
  const myPromise = Promise.resolve(true);
  let condition = false;
  condition || myPromise;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 5,
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
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
async function foo() {
  const myPromise = Promise.resolve(true);
  let condition = null;
  condition ?? myPromise;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 5,
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
      options: [{ ignoreVoid: false }],
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
          column: 3,
          endColumn: 41,
          endLine: 6,
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
Promise.resolve().then(() => {}, undefined);
      `,
      errors: [
        {
          column: 1,
          endColumn: 45,
          endLine: 2,
          line: 2,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.resolve().then(() => {}, undefined);
      `,
            },
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
Promise.resolve().then(() => {}, null);
      `,
      errors: [
        {
          column: 1,
          endColumn: 40,
          endLine: 2,
          line: 2,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.resolve().then(() => {}, null);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.resolve().then(() => {}, null);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.resolve().then(() => {}, 3);
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 2,
          line: 2,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.resolve().then(() => {}, 3);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.resolve().then(() => {}, 3);
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
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);
      `,
      errors: [
        {
          column: 1,
          endColumn: 49,
          endLine: 4,
          line: 4,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
void Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
await Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.resolve().catch(undefined);
      `,
      errors: [
        {
          column: 1,
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.resolve().catch(undefined);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.resolve().catch(undefined);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.resolve().catch(null);
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 2,
          line: 2,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.resolve().catch(null);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.resolve().catch(null);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.resolve().catch(3);
      `,
      errors: [
        {
          column: 1,
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.resolve().catch(3);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.resolve().catch(3);
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
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
      errors: [
        {
          column: 1,
          endColumn: 40,
          endLine: 4,
          line: 4,
          messageId: 'floatingUselessRejectionHandlerVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
void Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
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
          column: 1,
          endColumn: 23,
          endLine: 2,
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
      errors: [
        {
          column: 1,
          endColumn: 50,
          endLine: 2,
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
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
declare const maybeCallable: string | (() => void);
Promise.resolve().then(() => {}, maybeCallable);
      `,
      errors: [
        {
          column: 1,
          endColumn: 49,
          endLine: 3,
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
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
Promise.resolve().then(() => {}, undefined);
      `,
      errors: [
        {
          column: 1,
          endColumn: 45,
          endLine: 2,
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
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
Promise.resolve().then(() => {}, null);
      `,
      errors: [
        {
          column: 1,
          endColumn: 40,
          endLine: 2,
          line: 2,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.resolve().then(() => {}, null);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
Promise.resolve().then(() => {}, 3);
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 2,
          line: 2,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.resolve().then(() => {}, 3);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);
      `,
      errors: [
        {
          column: 1,
          endColumn: 49,
          endLine: 4,
          line: 4,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
await Promise.resolve().then(() => {}, maybeCallable);
Promise.resolve().then(() => {}, definitelyCallable);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
Promise.resolve().catch(undefined);
      `,
      errors: [
        {
          column: 1,
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.resolve().catch(undefined);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
Promise.resolve().catch(null);
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 2,
          line: 2,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.resolve().catch(null);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
Promise.resolve().catch(3);
      `,
      errors: [
        {
          column: 1,
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.resolve().catch(3);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
      errors: [
        {
          column: 1,
          endColumn: 40,
          endLine: 4,
          line: 4,
          messageId: 'floatingUselessRejectionHandler',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
declare const maybeCallable: string | (() => void);
declare const definitelyCallable: () => void;
await Promise.resolve().catch(maybeCallable);
Promise.resolve().catch(definitelyCallable);
      `,
            },
          ],
        },
      ],
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
Promise.reject() || 3;
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 2,
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
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
Promise.reject().finally(() => {});
      `,
      errors: [
        {
          column: 1,
          endColumn: 36,
          endLine: 2,
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
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 4,
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
      options: [{ ignoreVoid: false }],
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
          column: 1,
          endColumn: 22,
          endLine: 5,
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
          column: 1,
          endColumn: 22,
          endLine: 4,
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
          column: 1,
          endColumn: 37,
          endLine: 3,
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
          column: 1,
          endColumn: 39,
          endLine: 3,
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
(Promise.resolve().finally(() => {}), 123);
      `,
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 2,
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
          column: 1,
          endColumn: 32,
          endLine: 2,
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
          column: 1,
          endColumn: 56,
          endLine: 2,
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
          column: 3,
          endColumn: 26,
          endLine: 5,
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
      errors: [
        {
          column: 1,
          endColumn: 39,
          endLine: 2,
          line: 2,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
    },
    {
      code: `
declare const array: unknown[];
array.map(() => Promise.reject());
      `,
      errors: [
        {
          column: 1,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
    },
    {
      code: `
declare const promiseArray: Array<Promise<unknown>>;
void promiseArray;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'floatingPromiseArray',
        },
      ],
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
declare const promiseArray: Array<Promise<unknown>>;
async function f() {
  await promiseArray;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 4,
          line: 4,
          messageId: 'floatingPromiseArray',
        },
      ],
      options: [{ ignoreVoid: false }],
    },
    {
      code: `
[1, 2, Promise.reject(), 3];
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 2,
          line: 2,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
    },
    {
      code: `
[1, 2, Promise.reject().catch(() => {}), 3];
      `,
      errors: [
        {
          column: 1,
          endColumn: 45,
          endLine: 2,
          line: 2,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
    },
    {
      code: `
const data = ['test'];
data.map(async () => {
  await new Promise((_res, rej) => setTimeout(rej, 1000));
});
      `,
      errors: [
        {
          column: 1,
          endColumn: 4,
          endLine: 5,
          line: 3,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
    },
    {
      code: `
function _<T, S extends Array<T | Array<T | Promise<T>>>>(
  maybePromiseArrayArray: S | undefined,
): void {
  maybePromiseArrayArray?.[0];
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 31,
          endLine: 5,
          line: 5,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
    },
    {
      code: `
function f<T extends Array<Promise<number>>>(a: T): void {
  a;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
    },
    {
      code: `
declare const a: Array<Promise<number>> | undefined;
a;
      `,
      errors: [
        {
          column: 1,
          endColumn: 3,
          endLine: 3,
          line: 3,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
    },
    {
      code: `
function f<T extends Array<Promise<number>>>(a: T | undefined): void {
  a;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
    },
    {
      code: `
[Promise.reject()] as const;
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 2,
          line: 2,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
    },
    {
      code: `
declare function cursed(): [Promise<number>, Promise<string>];
cursed();
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
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
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 8,
          line: 2,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
    },
    {
      code: `
declare const arrayOrPromiseTuple:
  Array<number> | [number, number, Promise<unknown>, string];
arrayOrPromiseTuple;
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 4,
          line: 4,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
    },
    {
      code: `
declare const okArrayOrPromiseArray: Array<number> | Array<Promise<unknown>>;
okArrayOrPromiseArray;
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
    },
    {
      code: `
interface UnsafeThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      ((value: T) => TResult1 | UnsafeThenable<TResult1>) | undefined | null,
    onrejected?:
      ((reason: any) => TResult2 | UnsafeThenable<TResult2>) | undefined | null,
  ): UnsafeThenable<TResult1 | TResult2>;
}
let promise: UnsafeThenable<number> = Promise.resolve(5);
promise;
      `,
      errors: [
        {
          column: 1,
          endColumn: 9,
          endLine: 11,
          line: 11,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
interface UnsafeThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      ((value: T) => TResult1 | UnsafeThenable<TResult1>) | undefined | null,
    onrejected?:
      ((reason: any) => TResult2 | UnsafeThenable<TResult2>) | undefined | null,
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
      ((value: T) => TResult1 | UnsafeThenable<TResult1>) | undefined | null,
    onrejected?:
      ((reason: any) => TResult2 | UnsafeThenable<TResult2>) | undefined | null,
  ): UnsafeThenable<TResult1 | TResult2>;
}
let promise: UnsafeThenable<number> = Promise.resolve(5);
await promise;
      `,
            },
          ],
        },
      ],
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SafeThenable' }],
          checkThenables: true,
        },
      ],
    },
    {
      code: `
class SafePromise<T> extends Promise<T> {}
let promise: SafePromise<number> = Promise.resolve(5);
promise.catch();
      `,
      errors: [
        {
          column: 1,
          endColumn: 17,
          endLine: 4,
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
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    {
      code: `
class UnsafePromise<T> extends Promise<T> {}
let promise: () => UnsafePromise<number> = async () => 5;
promise().finally();
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 4,
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
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    {
      code: `
type UnsafePromise = Promise<number> & { hey?: string };
let promise: UnsafePromise = Promise.resolve(5);
0 ? promise.catch() : 2;
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 4,
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
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    {
      code: `
type UnsafePromise = Promise<number> & { hey?: string };
let promise: () => UnsafePromise = async () => 5;
null ?? promise().catch();
      `,
      errors: [
        {
          column: 1,
          endColumn: 27,
          endLine: 4,
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
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    {
      code: `
type Foo<T> = Promise<T> & { hey?: string };
declare const arrayOrPromiseTuple: Foo<unknown>[];
arrayOrPromiseTuple;
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 4,
          line: 4,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Bar' }] }],
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
      errors: [
        {
          column: 1,
          endColumn: 5,
          endLine: 5,
          line: 5,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    {
      code: `
type Foo<T> = Promise<T> & { hey?: string };
declare const arrayOrPromiseTuple: [Foo<unknown>, 5];
arrayOrPromiseTuple;
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 4,
          line: 4,
          messageId: 'floatingPromiseArrayVoid',
        },
      ],
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Bar' }] }],
    },
    {
      code: `
type SafePromise = Promise<number> & { __linterBrands?: string };
declare const myTag: (strings: TemplateStringsArray) => SafePromise;
myTag\`abc\`;
      `,
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 4,
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
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
    },
    {
      code: `
declare function unsafe(...args: unknown[]): Promise<void>;

unsafe('...', () => {});
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 4,
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
          column: 1,
          endColumn: 36,
          endLine: 4,
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
          column: 1,
          endColumn: 39,
          endLine: 4,
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
          column: 1,
          endColumn: 17,
          endLine: 3,
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
          column: 1,
          endColumn: 20,
          endLine: 8,
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
          column: 1,
          endColumn: 17,
          endLine: 3,
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
          column: 1,
          endColumn: 19,
          endLine: 4,
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
          column: 1,
          endColumn: 19,
          endLine: 6,
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
          column: 3,
          endColumn: 11,
          endLine: 4,
          line: 4,
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
          column: 3,
          endColumn: 12,
          endLine: 4,
          line: 4,
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
          column: 1,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'floatingVoid',
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
          column: 1,
          endColumn: 34,
          endLine: 2,
          line: 2,
          messageId: 'floatingVoid',
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
          column: 1,
          endColumn: 45,
          endLine: 2,
          line: 2,
          messageId: 'floatingVoid',
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
          column: 1,
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'floatingVoid',
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
    {
      code: `
Promise.reject('foo').then();
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 2,
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.reject('foo').then();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.reject('foo').then();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.reject('foo').finally();
      `,
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 2,
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.reject('foo').finally();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.reject('foo').finally();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.reject('foo').finally(...[], () => {});
      `,
      errors: [
        {
          column: 1,
          endColumn: 48,
          endLine: 2,
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.reject('foo').finally(...[], () => {});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.reject('foo').finally(...[], () => {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
Promise.reject('foo').then(...[], () => {});
      `,
      errors: [
        {
          column: 1,
          endColumn: 45,
          endLine: 2,
          line: 2,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
void Promise.reject('foo').then(...[], () => {});
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
await Promise.reject('foo').then(...[], () => {});
      `,
            },
          ],
        },
      ],
    },

    // This code makes TypeScript type checker to crash with infinite recursion
    //
    // See:
    //  https://github.com/typescript-eslint/typescript-eslint/issues/11947
    //  https://github.com/microsoft/TypeScript/issues/63441
    {
      code: `
interface CustomNode<P> {
  getNextNode: () => CustomNode<P>;
}

declare const createNode: () => {
  getNextNode: <T>() => CustomNode<T>;
};

function wrapNode<T>(getNode: () => CustomNode<T>) {
  return getNode;
}

(async () => {
  wrapNode(() => {
    const node = createNode();

    return wrapNode<typeof node.getNextNode<any>>(node.getNextNode);
  });
})();
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 20,
          line: 14,
          messageId: 'floatingVoid',
          suggestions: [
            {
              messageId: 'floatingFixVoid',
              output: `
interface CustomNode<P> {
  getNextNode: () => CustomNode<P>;
}

declare const createNode: () => {
  getNextNode: <T>() => CustomNode<T>;
};

function wrapNode<T>(getNode: () => CustomNode<T>) {
  return getNode;
}

void (async () => {
  wrapNode(() => {
    const node = createNode();

    return wrapNode<typeof node.getNextNode<any>>(node.getNextNode);
  });
})();
      `,
            },
            {
              messageId: 'floatingFixAwait',
              output: `
interface CustomNode<P> {
  getNextNode: () => CustomNode<P>;
}

declare const createNode: () => {
  getNextNode: <T>() => CustomNode<T>;
};

function wrapNode<T>(getNode: () => CustomNode<T>) {
  return getNode;
}

await (async () => {
  wrapNode(() => {
    const node = createNode();

    return wrapNode<typeof node.getNextNode<any>>(node.getNextNode);
  });
})();
      `,
            },
          ],
        },
      ],
    },

    {
      code: "document.addEventListener('click', () => void fetch('/api/click'));",
      errors: [
        {
          column: 42,
          endColumn: 66,
          endLine: 1,
          line: 1,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output:
                "document.addEventListener('click', () => await fetch('/api/click'));",
            },
          ],
        },
      ],
      options: [{ ignoreVoid: false }],
    },

    {
      code: `
document.addEventListener('click', () => {
  void fetch('/api/click');
});
      `,
      errors: [
        {
          column: 3,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'floating',
          suggestions: [
            {
              messageId: 'floatingFixAwait',
              output: `
document.addEventListener('click', () => {
  await fetch('/api/click');
});
      `,
            },
          ],
        },
      ],
      options: [{ ignoreVoid: false }],
    },
  ],
});
