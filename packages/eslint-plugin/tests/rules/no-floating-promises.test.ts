import rule from '../../src/rules/no-floating-promises';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const messageId = 'floating';

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
  Promise.resolve("value").catch(() => {});
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
  Promise.reject(new Error("message")).catch(() => {});
  return Promise.reject(new Error("message"));
}
`,
    `
async function test() {
  await (async () => true)();
  (async () => true)().then(() => {}, () => {});
  (async () => true)().then(() => {}).catch(() => {});
  (async () => true)().catch(() => {});
  return (async () => true)();
}
`,
    `
async function test() {
  async function returnsPromise() {}
  await returnsPromise();
  returnsPromise().then(() => {}, () => {});
  returnsPromise().then(() => {}).catch(() => {});
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
  promiseValue.catch(() => {});
  return promiseValue;
}
`,
    `
async function test() {
  const promiseUnion: Promise<number> | number;

  await promiseUnion;
  promiseUnion.then(() => {}, () => {});
  promiseUnion.then(() => {}).catch(() => {});
  promiseUnion.catch(() => {});
  return promiseUnion;
}
`,
    `
async function test() {
  const promiseIntersection: Promise<number> & number;

  await promiseIntersection;
  promiseIntersection.then(() => {}, () => {});
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
  canThen.then(() => {}, () => {});
  canThen.then(() => {}).catch(() => {});
  canThen.catch(() => {});
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
  promise.catch(() => {});
  return promise;
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
          line: 5,
          messageId,
        },
      ],
    },
    {
      code: `
async function test() {
  Promise.reject(new Error("message"));
  Promise.reject(new Error("message")).then(() => {});
  Promise.reject(new Error("message")).catch();
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
          line: 5,
          messageId,
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
          messageId,
        },
        {
          line: 4,
          messageId,
        },
        {
          line: 5,
          messageId,
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
}
`,
      errors: [
        {
          line: 5,
          messageId,
        },
        {
          line: 6,
          messageId,
        },
        {
          line: 7,
          messageId,
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
          messageId,
        },
        {
          line: 4,
          messageId,
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
          messageId,
        },
        {
          line: 4,
          messageId,
        },
        {
          line: 5,
          messageId,
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
          messageId,
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
          messageId,
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
          messageId,
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
}
`,
      errors: [
        {
          line: 5,
          messageId,
        },
        {
          line: 6,
          messageId,
        },
        {
          line: 7,
          messageId,
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
          messageId,
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
}
`,
      errors: [
        {
          line: 5,
          messageId,
        },
        {
          line: 6,
          messageId,
        },
        {
          line: 7,
          messageId,
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
}
`,
      errors: [
        {
          line: 6,
          messageId,
        },
        {
          line: 7,
          messageId,
        },
        {
          line: 8,
          messageId,
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
          messageId,
        },
        {
          line: 11,
          messageId,
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
          messageId,
        },
        {
          line: 19,
          messageId,
        },
        {
          line: 20,
          messageId,
        },
      ],
    },
  ],
});
