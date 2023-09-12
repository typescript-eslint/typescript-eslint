import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/await-thenable';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const messageId = 'await';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('await-thenable', rule, {
  valid: [
    `
async function test() {
  await Promise.resolve('value');
  await Promise.reject(new Error('message'));
}
    `,
    `
async function test() {
  await (async () => true)();
}
    `,
    `
async function test() {
  function returnsPromise() {
    return Promise.resolve('value');
  }
  await returnsPromise();
}
    `,
    `
async function test() {
  async function returnsPromiseAsync() {}
  await returnsPromiseAsync();
}
    `,
    `
async function test() {
  let anyValue: any;
  await anyValue;
}
    `,
    `
async function test() {
  let unknownValue: unknown;
  await unknownValue;
}
    `,
    `
async function test() {
  const numberPromise: Promise<number>;
  await numberPromise;
}
    `,
    `
async function test() {
  class Foo extends Promise<number> {}
  const foo: Foo = Foo.resolve(2);
  await foo;

  class Bar extends Foo {}
  const bar: Bar = Bar.resolve(2);
  await bar;
}
    `,
    `
async function test() {
  await (Math.random() > 0.5 ? numberPromise : 0);
  await (Math.random() > 0.5 ? foo : 0);
  await (Math.random() > 0.5 ? bar : 0);

  const intersectionPromise: Promise<number> & number;
  await intersectionPromise;
}
    `,
    `
async function test() {
  class Thenable {
    then(callback: () => {}) {}
  }
  const thenable = new Thenable();

  await thenable;
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
}
    `,
    `
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/bluebird/index.d.ts
// Type definitions for bluebird 3.5
// Project: https://github.com/petkaantonov/bluebird
// Definitions by: Leonard Hecker <https://github.com/lhecker>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

/*!
 * The code following this comment originates from:
 *   https://github.com/types/npm-bluebird
 *
 * Note for browser users: use bluebird-global typings instead of this one
 * if you want to use Bluebird via the global Promise symbol.
 *
 * Licensed under:
 *   The MIT License (MIT)
 *
 *   Copyright (c) 2016 unional
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *   THE SOFTWARE.
 */

type Constructor<E> = new (...args: any[]) => E;
type CatchFilter<E> = ((error: E) => boolean) | (object & E);
type IterableItem<R> = R extends Iterable<infer U> ? U : never;
type IterableOrNever<R> = Extract<R, Iterable<any>>;
type Resolvable<R> = R | PromiseLike<R>;
type IterateFunction<T, R> = (
  item: T,
  index: number,
  arrayLength: number,
) => Resolvable<R>;

declare class Bluebird<R> implements PromiseLike<R> {
  then<U>(
    onFulfill?: (value: R) => Resolvable<U>,
    onReject?: (error: any) => Resolvable<U>,
  ): Bluebird<U>; // For simpler signature help.
  then<TResult1 = R, TResult2 = never>(
    onfulfilled?: ((value: R) => Resolvable<TResult1>) | null,
    onrejected?: ((reason: any) => Resolvable<TResult2>) | null,
  ): Bluebird<TResult1 | TResult2>;
}

declare const bluebird: Bluebird;

async function test() {
  await bluebird;
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

  await callback?.();
};
    `,
  ],

  invalid: [
    {
      code: 'await 0;',
      errors: [
        {
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeAwait',
              output: ' 0;',
            },
          ],
        },
      ],
    },
    {
      code: "await 'value';",
      errors: [
        {
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeAwait',
              output: " 'value';",
            },
          ],
        },
      ],
    },
    {
      code: "async () => await (Math.random() > 0.5 ? '' : 0);",
      errors: [
        {
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeAwait',
              output: "async () =>  (Math.random() > 0.5 ? '' : 0);",
            },
          ],
        },
      ],
    },
    {
      code: noFormat`async () => await(Math.random() > 0.5 ? '' : 0);`,
      errors: [
        {
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeAwait',
              output: "async () => (Math.random() > 0.5 ? '' : 0);",
            },
          ],
        },
      ],
    },
    {
      code: `
class NonPromise extends Array {}
await new NonPromise();
      `,
      errors: [
        {
          line: 3,
          messageId,
          suggestions: [
            {
              messageId: 'removeAwait',
              output: `
class NonPromise extends Array {}
 new NonPromise();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function test() {
  class IncorrectThenable {
    then() {}
  }
  const thenable = new IncorrectThenable();

  await thenable;
}
      `,
      errors: [
        {
          line: 8,
          messageId,
          suggestions: [
            {
              messageId: 'removeAwait',
              output: `
async function test() {
  class IncorrectThenable {
    then() {}
  }
  const thenable = new IncorrectThenable();

   thenable;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const callback: (() => void) | undefined;
await callback?.();
      `,
      errors: [
        {
          line: 3,
          messageId,
          suggestions: [
            {
              messageId: 'removeAwait',
              output: `
declare const callback: (() => void) | undefined;
 callback?.();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const obj: { a?: { b?: () => void } };
await obj.a?.b?.();
      `,
      errors: [
        {
          line: 3,
          messageId,
          suggestions: [
            {
              messageId: 'removeAwait',
              output: `
declare const obj: { a?: { b?: () => void } };
 obj.a?.b?.();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const obj: { a: { b: { c?: () => void } } } | undefined;
await obj?.a.b.c?.();
      `,
      errors: [
        {
          line: 3,
          messageId,
          suggestions: [
            {
              messageId: 'removeAwait',
              output: `
declare const obj: { a: { b: { c?: () => void } } } | undefined;
 obj?.a.b.c?.();
      `,
            },
          ],
        },
      ],
    },
  ],
});
