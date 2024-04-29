import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-floating-promises';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
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
async function test() {
  declare const promiseValue: Promise<number>;

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
async function test() {
  declare const promiseUnion: Promise<number> | number;

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
async function test() {
  declare const promiseIntersection: Promise<number> & number;

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
async function test() {
  await (Math.random() > 0.5 ? numberPromise : 0);
  await (Math.random() > 0.5 ? foo : 0);
  await (Math.random() > 0.5 ? bar : 0);

  declare const intersectionPromise: Promise<number> & number;
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
async function test() {
  declare const returnsPromise: () => Promise<void> | null;
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
    // Branded type annotations on variables containing promises
    {
      code: `
interface SecureThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | SecureThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | SecureThenable<TResult2>)
      | undefined
      | null,
  ): SecureThenable<TResult1 | TResult2>;
}
let guzz: SecureThenable<number> = Promise.resolve(5);
guzz;
      `,
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SecureThenable' }],
        },
      ],
    },
    {
      code: `
interface SecureThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | SecureThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | SecureThenable<TResult2>)
      | undefined
      | null,
  ): SecureThenable<TResult1 | TResult2>;
}
let guzz: SecureThenable<number> = Promise.resolve(5);
guzz.then(() => {});
      `,
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SecureThenable' }],
        },
      ],
    },
    {
      code: `
class SafePromise<T> extends Promise<T> {}
let guzz: SafePromise<number> = Promise.resolve(5);
guzz.catch();
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    {
      code: `
class SafePromise<T> extends Promise<T> {}
let guzz: SafePromise<number> = Promise.resolve(5);
guzz.finally();
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    {
      code: `
type Foo = Promise<number> & { hey?: string };
let guzz: Foo = Promise.resolve(5);
0 ? guzz.catch() : 2;
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
    },
    {
      code: `
type Foo = Promise<number> & { hey?: string };
let guzz: Foo = Promise.resolve(5);
null ?? guzz.catch();
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
    },
    // branded type annotations on promise returning functions (or async functions)
    {
      code: `
interface SecureThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | SecureThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | SecureThenable<TResult2>)
      | undefined
      | null,
  ): SecureThenable<TResult1 | TResult2>;
}
let guzz: () => SecureThenable<number> = () => Promise.resolve(5);
guzz();
      `,
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SecureThenable' }],
        },
      ],
    },
    {
      code: `
interface SecureThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | SecureThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | SecureThenable<TResult2>)
      | undefined
      | null,
  ): SecureThenable<TResult1 | TResult2>;
}
let guzz: () => SecureThenable<number> = () => Promise.resolve(5);
guzz().then(() => {});
      `,
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SecureThenable' }],
        },
      ],
    },
    {
      code: `
type Foo = Promise<number> & { hey?: string };
let guzz: () => Foo = () => Promise.resolve(5);
guzz().catch();
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
    },
    {
      code: `
type Foo = Promise<number> & { hey?: string };
let guzz: () => Foo = async () => 5;
guzz().finally();
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
    },
    {
      code: `
class SafePromise<T> extends Promise<T> {}
let guzz: () => SafePromise<number> = async () => 5;
0 ? guzz().catch() : 2;
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    {
      code: `
class SafePromise<T> extends Promise<T> {}
let guzz: () => SafePromise<number> = async () => 5;
null ?? guzz().catch();
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
    },
    // type from es5.d.ts using `allowForKnownSafePromises`
    {
      code: `
let guzz: () => PromiseLike<number> = () => Promise.resolve(5);
guzz().then(() => {});
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'lib', name: 'PromiseLike' }] },
      ],
    },
    // promises in array using `allowForKnownSafePromises`
    {
      code: `
declare const arrayOrPromiseTuple: Foo<unknown>[];
arrayOrPromiseTuple;
type Foo<T> = Promise<T> & { hey?: string };
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
    },
    {
      code: `
declare const arrayOrPromiseTuple: [Foo<unknown>, 5];
arrayOrPromiseTuple;
type Foo<T> = Promise<T> & { hey?: string };
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
        },
        {
          line: 4,
          messageId: 'floatingVoid',
        },
        {
          line: 5,
          messageId: 'floatingVoid',
        },
        {
          line: 6,
          messageId: 'floatingVoid',
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
        },
        {
          line: 12,
          messageId: 'floatingVoid',
        },
        {
          line: 13,
          messageId: 'floatingVoid',
        },
        {
          line: 14,
          messageId: 'floatingVoid',
        },
        {
          line: 15,
          messageId: 'floatingVoid',
        },
        {
          line: 16,
          messageId: 'floatingVoid',
        },
        {
          line: 18,
          messageId: 'floatingVoid',
        },
        {
          line: 21,
          messageId: 'floatingVoid',
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
        },
        {
          line: 4,
          messageId: 'floatingVoid',
        },
        {
          line: 5,
          messageId: 'floatingVoid',
        },
        {
          line: 6,
          messageId: 'floatingVoid',
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
        },
        {
          line: 4,
          messageId: 'floatingVoid',
        },
        {
          line: 5,
          messageId: 'floatingVoid',
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
        },
        {
          line: 6,
          messageId: 'floatingVoid',
        },
        {
          line: 7,
          messageId: 'floatingVoid',
        },
        {
          line: 8,
          messageId: 'floatingVoid',
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
        },
        {
          line: 4,
          messageId: 'floatingVoid',
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
        },
        {
          line: 4,
          messageId: 'floatingVoid',
        },
        {
          line: 5,
          messageId: 'floatingVoid',
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
        },
      ],
    },
    {
      code: `
async function test() {
  declare const promiseValue: Promise<number>;

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
        },
        {
          line: 6,
          messageId: 'floatingVoid',
        },
        {
          line: 7,
          messageId: 'floatingVoid',
        },
        {
          line: 8,
          messageId: 'floatingVoid',
        },
      ],
    },
    {
      code: `
async function test() {
  declare const promiseUnion: Promise<number> | number;

  promiseUnion;
}
      `,
      errors: [
        {
          line: 5,
          messageId: 'floatingVoid',
        },
      ],
    },
    {
      code: `
async function test() {
  declare const promiseIntersection: Promise<number> & number;

  promiseIntersection;
  promiseIntersection.then(() => {});
  promiseIntersection.catch();
}
      `,
      errors: [
        {
          line: 5,
          messageId: 'floatingVoid',
        },
        {
          line: 6,
          messageId: 'floatingVoid',
        },
        {
          line: 7,
          messageId: 'floatingVoid',
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
        },
        {
          line: 7,
          messageId: 'floatingVoid',
        },
        {
          line: 8,
          messageId: 'floatingVoid',
        },
        {
          line: 9,
          messageId: 'floatingVoid',
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
        },
        {
          line: 11,
          messageId: 'floatingVoid',
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

  promise;
  promise.then(() => {});
  promise.catch();
}
      `,
      errors: [
        {
          line: 18,
          messageId: 'floatingVoid',
        },
        {
          line: 19,
          messageId: 'floatingVoid',
        },
        {
          line: 20,
          messageId: 'floatingVoid',
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
        },
      ],
    },
    {
      code: '(async function foo() {})();',
      errors: [
        {
          line: 1,
          messageId: 'floatingVoid',
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
        },
      ],
    },
    {
      code: `
        (async function () {
          declare const promiseIntersection: Promise<number> & number;
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
        },
        {
          line: 5,
          messageId: 'floatingVoid',
        },
        {
          line: 6,
          messageId: 'floatingVoid',
        },
        {
          line: 7,
          messageId: 'floatingVoid',
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
        },
        {
          line: 5,
          messageId: 'floatingUselessRejectionHandlerVoid',
        },
        {
          line: 6,
          messageId: 'floatingUselessRejectionHandlerVoid',
        },
        {
          line: 7,
          messageId: 'floatingUselessRejectionHandlerVoid',
        },
        {
          line: 10,
          messageId: 'floatingUselessRejectionHandlerVoid',
        },
        {
          line: 11,
          messageId: 'floatingUselessRejectionHandlerVoid',
        },
        {
          line: 12,
          messageId: 'floatingUselessRejectionHandlerVoid',
        },
        {
          line: 13,
          messageId: 'floatingUselessRejectionHandlerVoid',
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
        },
        {
          line: 5,
          messageId: 'floatingUselessRejectionHandler',
        },
        {
          line: 6,
          messageId: 'floatingUselessRejectionHandler',
        },
        {
          line: 7,
          messageId: 'floatingUselessRejectionHandler',
        },
        {
          line: 10,
          messageId: 'floatingUselessRejectionHandler',
        },
        {
          line: 11,
          messageId: 'floatingUselessRejectionHandler',
        },
        {
          line: 12,
          messageId: 'floatingUselessRejectionHandler',
        },
        {
          line: 13,
          messageId: 'floatingUselessRejectionHandler',
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
        },
      ],
    },
    {
      code: `
Promise.reject().finally(() => {});
      `,
      errors: [{ line: 2, messageId: 'floatingVoid' }],
    },
    {
      code: `
Promise.reject()
  .finally(() => {})
  .finally(() => {});
      `,
      options: [{ ignoreVoid: false }],
      errors: [{ line: 2, messageId: 'floating' }],
    },
    {
      code: `
Promise.reject()
  .finally(() => {})
  .finally(() => {})
  .finally(() => {});
      `,
      errors: [{ line: 2, messageId: 'floatingVoid' }],
    },
    {
      code: `
Promise.reject()
  .then(() => {})
  .finally(() => {});
      `,
      errors: [{ line: 2, messageId: 'floatingVoid' }],
    },
    {
      code: `
declare const returnsPromise: () => Promise<void> | null;
returnsPromise()?.finally(() => {});
      `,
      errors: [{ line: 3, messageId: 'floatingVoid' }],
    },
    {
      code: `
const promiseIntersection: Promise<number> & number;
promiseIntersection.finally(() => {});
      `,
      errors: [{ line: 3, messageId: 'floatingVoid' }],
    },
    {
      code: `
Promise.resolve().finally(() => {}), 123;
      `,
      errors: [{ line: 2, messageId: 'floatingVoid' }],
    },
    {
      code: `
(async () => true)().finally();
      `,
      errors: [{ line: 2, messageId: 'floatingVoid' }],
    },
    {
      code: `
Promise.reject(new Error('message')).finally(() => {});
      `,
      errors: [{ line: 2, messageId: 'floatingVoid' }],
    },
    {
      code: `
function _<T, S extends Array<T | Promise<T>>>(
  maybePromiseArray: S | undefined,
): void {
  maybePromiseArray?.[0];
}
      `,
      errors: [{ line: 5, messageId: 'floatingVoid' }],
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
interface InsecureThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | InsecureThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | InsecureThenable<TResult2>)
      | undefined
      | null,
  ): InsecureThenable<TResult1 | TResult2>;
}
let guzz: InsecureThenable<number> = Promise.resolve(5);
guzz;
      `,
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SecureThenable' }],
        },
      ],
      errors: [{ line: 15, messageId: 'floatingVoid' }],
    },
    {
      code: `
interface InsecureThenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | InsecureThenable<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | InsecureThenable<TResult2>)
      | undefined
      | null,
  ): InsecureThenable<TResult1 | TResult2>;
}
let guzz: () => InsecureThenable<number> = () => Promise.resolve(5);
guzz().then(() => {});
      `,
      options: [
        {
          allowForKnownSafePromises: [{ from: 'file', name: 'SecureThenable' }],
        },
      ],
      errors: [{ line: 15, messageId: 'floatingVoid' }],
    },
    {
      code: `
class UnsafePromise<T> extends Promise<T> {}
let guzz: UnsafePromise<number> = Promise.resolve(5);
guzz.catch();
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
      errors: [{ line: 4, messageId: 'floatingVoid' }],
    },
    {
      code: `
class UnsafePromise<T> extends Promise<T> {}
let guzz: () => UnsafePromise<number> = async () => 5;
guzz().finally();
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
      errors: [{ line: 4, messageId: 'floatingVoid' }],
    },
    {
      code: `
type UnsafePromise = Promise<number> & { hey?: string };
let guzz: UnsafePromise = Promise.resolve(5);
0 ? guzz.catch() : 2;
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
      errors: [{ line: 4, messageId: 'floatingVoid' }],
    },
    {
      code: `
type UnsafePromise = Promise<number> & { hey?: string };
let guzz: () => UnsafePromise = async () => 5;
null ?? guzz().catch();
      `,
      options: [
        { allowForKnownSafePromises: [{ from: 'file', name: 'SafePromise' }] },
      ],
      errors: [{ line: 4, messageId: 'floatingVoid' }],
    },
    {
      code: `
declare const arrayOrPromiseTuple: Foo<unknown>[];
arrayOrPromiseTuple;
type Foo<T> = Promise<T> & { hey?: string };
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Bar' }] }],
      errors: [{ line: 3, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
declare const arrayOrPromiseTuple: [Foo<unknown>, 5];
arrayOrPromiseTuple;
type Foo<T> = Promise<T> & { hey?: string };
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Bar' }] }],
      errors: [{ line: 3, messageId: 'floatingPromiseArrayVoid' }],
    },
    {
      code: `
type SafePromise = Promise<number> & { __linterBrands?: string };
declare const myTag: (strings: TemplateStringsArray) => SafePromise;
myTag\`abc\`;
      `,
      options: [{ allowForKnownSafePromises: [{ from: 'file', name: 'Foo' }] }],
      errors: [{ line: 4, messageId: 'floatingVoid' }],
    },
  ],
});
