import rule from '../../src/rules/no-floating-promises';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

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
  await Promise.resolve("value");
  Promise.resolve("value").then(() => {}, () => {});
  Promise.resolve("value").then(() => {}).catch(() => {});
  Promise.resolve("value").then(() => {}).catch(() => {}).finally(() => {});
  Promise.resolve("value").catch(() => {});
  Promise.resolve("value").finally(() => {});
  return Promise.resolve("value");
}
`,
    {
      options: [{ ignoreVoid: true }],
      code: `
async function test() {
  void Promise.resolve("value");
}
`,
    },
    `
async function test() {
  await Promise.reject(new Error("message"));
  Promise.reject(new Error("message")).then(() => {}, () => {});
  Promise.reject(new Error("message")).then(() => {}).catch(() => {});
  Promise.reject(new Error("message")).then(() => {}).catch(() => {}).finally(() => {});
  Promise.reject(new Error("message")).catch(() => {});
  Promise.reject(new Error("message")).finally(() => {});
  return Promise.reject(new Error("message"));
}
`,
    `
async function test() {
  await (async () => true)();
  (async () => true)().then(() => {}, () => {});
  (async () => true)().then(() => {}).catch(() => {});
  (async () => true)().then(() => {}).catch(() => {}).finally(() => {});
  (async () => true)().catch(() => {});
  (async () => true)().finally(() => {});
  return (async () => true)();
}
`,
    `
async function test() {
  async function returnsPromise() {}
  await returnsPromise();
  returnsPromise().then(() => {}, () => {});
  returnsPromise().then(() => {}).catch(() => {});
  returnsPromise().then(() => {}).catch(() => {}).finally(() => {});
  returnsPromise().catch(() => {});
  returnsPromise().finally(() => {});
  return returnsPromise();
}
`,
    `
async function test() {
  const x = Promise.resolve();
  const y = x.then(() => {});
  y.catch(() => {});
  y.finally(() => {});
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
  Promise.resolve().finally(() => {}), 123;
  123, Promise.resolve().then(() => {}, () => {});
  123, Promise.resolve().then(() => {}, () => {}), 123;
}
`,
    `
async function test() {
  void Promise.resolve().catch(() => {});
}
`,
    `
async function test() {
  Promise.resolve().catch(() => {}) || Promise.resolve().then(() => {}, () => {});
}
`,
    `
async function test() {
  const promiseValue: Promise<number>;

  await promiseValue;
  promiseValue.then(() => {}, () => {});
  promiseValue.then(() => {}).catch(() => {});
  promiseValue.then(() => {}).catch(() => {}).finally(() => {});
  promiseValue.catch(() => {});
  promiseValue.finally(() => {});
  return promiseValue;
}
`,
    `
async function test() {
  const promiseUnion: Promise<number> | number;

  await promiseUnion;
  promiseUnion.then(() => {}, () => {});
  promiseUnion.then(() => {}).catch(() => {});
  promiseUnion.then(() => {}).catch(() => {}).finally(() => {});
  promiseUnion.catch(() => {});
  promiseValue.finally(() => {});
  return promiseUnion;
}
`,
    `
async function test() {
  const promiseIntersection: Promise<number> & number;

  await promiseIntersection;
  promiseIntersection.then(() => {}, () => {});
  promiseIntersection.then(() => {}).catch(() => {});
  promiseIntersection.then(() => {}).catch(() => {}).finally(() => {});
  promiseIntersection.catch(() => {});
  promiseIntersection.finally(() => {});
  return promiseIntersection;
}
`,
    `
async function test() {
  class CanThen extends Promise<number> {}
  const canThen: CanThen = Foo.resolve(2);

  await canThen;
  canThen.then(() => {}, () => {});
  canThen.then(() => {}).catch(() => {});
  canThen.then(() => {}).catch(() => {}).finally(() => {});
  canThen.catch(() => {});
  canThen.finally(() => {});
  return canThen;
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
    then(callback: () => {}): Thenable { return new Thenable(); }
  };
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
  };
  const thenable = new NonFunctionParamThenable();

  await thenable;
  thenable;
  thenable.then('abc', 'def');
  return thenable;
}
`,
    `
async function test() {
  class NonFunctionThenable { then: number };
  const thenable = new NonFunctionThenable();

  thenable;
  thenable.then;
  return thenable;
}
`,
    `
async function test() {
  class CatchableThenable {
    then(callback: () => {}, callback: () => {}): CatchableThenable {
      return new CatchableThenable();
    }
  };
  const thenable = new CatchableThenable();

  await thenable
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
  promise.then(() => {}, () => {});
  promise.then(() => {}).catch(() => {});
  promise.then(() => {}).catch(() => {}).finally(() => {});
  promise.catch(() => {});
  promise.finally(() => {});
  return promise;
}
`,

    // optional chaining
    `
async function test() {
  declare const returnsPromise: () => Promise<void> | null;
  await returnsPromise?.();
  returnsPromise()?.then(() => {}, () => {});
  returnsPromise()?.then(() => {})?.catch(() => {});
  returnsPromise()?.catch(() => {});
  returnsPromise()?.finally(() => {});
  return returnsPromise();
}
  `,
  ],

  invalid: [
    {
      code: `
async function test() {
  Promise.resolve("value");
  Promise.resolve("value").then(() => {});
  Promise.resolve("value").catch();
  Promise.resolve("value").finally();
}
`,
      errors: [
        {
          line: 3,
          messageId: 'floating',
        },
        {
          line: 4,
          messageId: 'floating',
        },
        {
          line: 5,
          messageId: 'floating',
        },
        {
          line: 6,
          messageId: 'floating',
        },
      ],
    },
    {
      options: [{ ignoreVoid: true }],
      code: `
async function test() {
  Promise.resolve("value");
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
  void Promise.resolve("value");
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
  Promise.reject(new Error("message"));
  Promise.reject(new Error("message")).then(() => {});
  Promise.reject(new Error("message")).catch();
  Promise.reject(new Error("message")).finally();
}
`,
      errors: [
        {
          line: 3,
          messageId: 'floating',
        },
        {
          line: 4,
          messageId: 'floating',
        },
        {
          line: 5,
          messageId: 'floating',
        },
        {
          line: 6,
          messageId: 'floating',
        },
      ],
    },
    {
      code: `
async function test() {
  (async () => true)();
  (async () => true)().then(() => {});
  (async () => true)().catch();
  (async () => true)().finally();
}
`,
      errors: [
        {
          line: 3,
          messageId: 'floating',
        },
        {
          line: 4,
          messageId: 'floating',
        },
        {
          line: 5,
          messageId: 'floating',
        },
        {
          line: 6,
          messageId: 'floating',
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
          messageId: 'floating',
        },
        {
          line: 6,
          messageId: 'floating',
        },
        {
          line: 7,
          messageId: 'floating',
        },
        {
          line: 8,
          messageId: 'floating',
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
          messageId: 'floating',
        },
        {
          line: 4,
          messageId: 'floating',
        },
      ],
    },
    {
      code: `
async function test() {
  Promise.resolve(), 123
  123, Promise.resolve()
  123, Promise.resolve(), 123
}
`,
      errors: [
        {
          line: 3,
          messageId: 'floating',
        },
        {
          line: 4,
          messageId: 'floating',
        },
        {
          line: 5,
          messageId: 'floating',
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
          line: 3,
          messageId: 'floating',
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
          messageId: 'floating',
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
          messageId: 'floating',
        },
      ],
    },
    {
      code: `
async function test() {
  const promiseValue: Promise<number>;

  promiseValue;
  promiseValue.then(() => {});
  promiseValue.catch();
  promiseValue.finally();
}
`,
      errors: [
        {
          line: 5,
          messageId: 'floating',
        },
        {
          line: 6,
          messageId: 'floating',
        },
        {
          line: 7,
          messageId: 'floating',
        },
        {
          line: 8,
          messageId: 'floating',
        },
      ],
    },
    {
      code: `
async function test() {
  const promiseUnion: Promise<number> | number;

  promiseUnion;
}
`,
      errors: [
        {
          line: 5,
          messageId: 'floating',
        },
      ],
    },
    {
      code: `
async function test() {
  const promiseIntersection: Promise<number> & number;

  promiseIntersection;
  promiseIntersection.then(() => {})
  promiseIntersection.catch();
  promiseIntersection.finally();
}
`,
      errors: [
        {
          line: 5,
          messageId: 'floating',
        },
        {
          line: 6,
          messageId: 'floating',
        },
        {
          line: 7,
          messageId: 'floating',
        },
        {
          line: 8,
          messageId: 'floating',
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
          messageId: 'floating',
        },
        {
          line: 7,
          messageId: 'floating',
        },
        {
          line: 8,
          messageId: 'floating',
        },
        {
          line: 9,
          messageId: 'floating',
        },
      ],
    },
    {
      code: `
async function test() {
  class CatchableThenable {
    then(callback: () => {}, callback: () => {}): CatchableThenable {
      return new CatchableThenable();
    }
  };
  const thenable = new CatchableThenable();

  thenable;
  thenable.then(() => {});
}
`,
      errors: [
        {
          line: 10,
          messageId: 'floating',
        },
        {
          line: 11,
          messageId: 'floating',
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
          messageId: 'floating',
        },
        {
          line: 19,
          messageId: 'floating',
        },
        {
          line: 20,
          messageId: 'floating',
        },
      ],
    },
  ],
});
