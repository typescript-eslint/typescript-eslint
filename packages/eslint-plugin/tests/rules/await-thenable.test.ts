import rule from '../../src/rules/await-thenable';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

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
  ],

  invalid: [
    {
      code: `
async function test() {
  await 0;
  await 'value';

  await (Math.random() > 0.5 ? '' : 0);

  class NonPromise extends Array {}
  await new NonPromise();
}
      `,
      errors: [
        {
          line: 3,
          messageId,
        },
        {
          line: 4,
          messageId,
        },
        {
          line: 6,
          messageId,
        },
        {
          line: 9,
          messageId,
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
        },
      ],
    },
  ],
});
