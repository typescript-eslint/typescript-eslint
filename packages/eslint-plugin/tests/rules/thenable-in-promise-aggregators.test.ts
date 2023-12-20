import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/thenable-in-promise-aggregators';
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

ruleTester.run('thenable-in-promise-aggregators', rule, {
  valid: [
    `
async function test() {
  await Promise.race([Promise.resolve(3)]);
}
    `,
    `
async function test() {
  await Promise.all([Promise.resolve(3)]);
}
    `,
    `
async function test() {
  await Promise.allSettled([Promise.resolve(3)]);
}
    `,
    `
async function test() {
  await Promise.all([]);
}
    `,
    `
async function test() {
  await Promise.race([(async () => true)()]);
}
    `,
    `
async function test() {
  function returnsPromise() {
    return Promise.resolve('value');
  }
  await Promise.race([returnsPromise()]);
}
    `,
    `
async function test() {
  async function returnsPromiseAsync() {}
  await Promise.race([returnsPromiseAsync()]);
}
    `,
    `
async function test() {
  let anyValue: any;
  await Promise.race([anyValue]);
}
    `,
    `
async function test() {
  let unknownValue: unknown;
  await Promise.race([unknownValue]);
}
    `,
    `
async function test() {
  const numberPromise: Promise<number>;
  await Promise.race([numberPromise]);
}
    `,
    `
async function test() {
  class Foo extends Promise<number> {}
  const foo: Foo = Foo.resolve(2);
  await Promise.race([foo]);

  class Bar extends Foo {}
  const bar: Bar = Bar.resolve(2);
  await Promise.race([bar]);
}
    `,
    `
async function test() {
  await Promise.race([Math.random() > 0.5 ? numberPromise : 0]);
  await Promise.race([Math.random() > 0.5 ? foo : 0]);
  await Promise.race([Math.random() > 0.5 ? bar : 0]);

  const intersectionPromise: Promise<number> & number;
  await Promise.race([intersectionPromise]);
}
    `,
    `
async function test() {
  class Thenable {
    then(callback: () => {}) {}
  }
  const thenable = new Thenable();

  await Promise.race([thenable]);
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
  await Promise.all([
    obj1.a?.b?.c?.(),
    obj2.a?.b?.c(),
    obj3.a?.b.c?.(),
    obj4.a.b.c?.(),
    obj5.a?.().b?.c?.(),
    obj6?.a.b.c?.(),
  ]);

  await Promise.allSettled([callback?.()]);
};
    `,
    `
async function test() {
  const promiseArr: Promise<number>[];
  await Promise.all(promiseArr);
}
    `,
    `
async function test() {
  const intersectionArr: (Promise<number> & number)[];
  await Promise.all(intersectionArr);
}
    `,
    `
async function test() {
  const values = [1, 2, 3];
  await Promise.all(values.map(value => Promise.resolve(value)));
}
    `,
    `
async function test() {
  const values = [1, 2, 3];
  await Promise.all(values.map(async value => {}));
}
    `,
    `
async function test() {
  const foo = Promise;
  await foo.all([Promise.resolve(3)]);
}
    `,
    `
async function test() {
  const foo = Promise;
  await Promise.all([foo.resolve(3)]);
}
    `,
    `
async function test() {
  class Foo extends Promise<number> {}
  await Foo.all([Foo.resolve(3)]);
}
    `,
    `
async function test() {
  const foo = Promise;
  await Promise.all([
    new foo(resolve => {
      resolve();
    }),
  ]);
}
    `,
    `
async function test() {
  class Foo extends Promise<number> {}
  const myfn = () =>
    new Foo(resolve => {
      resolve(3);
    });
  await Promise.all([myfn()]);
}
    `,
    `
async function test() {
  await Promise.resolve?.([Promise.resolve(3)]);
}
    `,
    `
async function test() {
  await Promise?.resolve?.([Promise.resolve(3)]);
}
    `,
    `
async function test() {
  const foo = Promise;
  await foo.resolve?.([foo.resolve(3)]);
}
    `,
    `
async function test() {
  const promisesTuple: [Promise<number>] = [Promise.resolve(3)];
  await Promise.all(promisesTuple);
}
    `,
    `
async function test() {
  await Promise.all([Promise.resolve(6)] as const);
}
    `,
    `
async function test() {
  const foo = Array();
  await Promise.all(foo);
}
    `,
    `
async function test() {
  const arrOfAny: any[] = [];
  await Promise.all(arrOfAny);
}
    `,
    `
async function test() {
  const arrOfUnknown: unknown[] = [];
  await Promise.all(arrOfAny);
}
    `,
  ],

  invalid: [
    {
      code: 'await Promise.race([0]);',
      errors: [
        {
          line: 1,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: 'await Promise.all([0]);',
      errors: [
        {
          line: 1,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: 'await Promise.allSettled([0]);',
      errors: [
        {
          line: 1,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: 'await Promise.race([Promise.resolve(3), 0]);',
      errors: [
        {
          line: 1,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: 'async () => await Promise.race([await Promise.resolve(3)]);',
      errors: [
        {
          line: 1,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: "async () => await Promise.race([Math.random() > 0.5 ? '' : 0]);",
      errors: [
        {
          line: 1,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: `
class NonPromise extends Array {}
await Promise.race([new NonPromise()]);
      `,
      errors: [
        {
          line: 3,
          messageId: 'inArray',
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

  await Promise.race([thenable]);
}
      `,
      errors: [
        {
          line: 8,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: `
declare const callback: (() => void) | undefined;
await Promise.race([callback?.()]);
      `,
      errors: [
        {
          line: 3,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: `
declare const obj: { a?: { b?: () => void } };
await Promise.race([obj.a?.b?.()]);
      `,
      errors: [
        {
          line: 3,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: `
declare const obj: { a: { b: { c?: () => void } } } | undefined;
await Promise.race([obj?.a.b.c?.()]);
      `,
      errors: [
        {
          line: 3,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: `
declare const wrappedPromise: { promise: Promise<number> };
declare const stdPromise: Promise<number>;
await Promise.all([wrappedPromise, stdPromise]);
      `,
      errors: [
        {
          line: 4,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: `
const foo = Promise;
await foo.race([0]);
      `,
      errors: [
        {
          line: 3,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: `
class Foo extends Promise<number> {}
await Foo.all([0]);
      `,
      errors: [
        {
          line: 3,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: `
const foo = (() => Promise)();
await foo.all([0]);
      `,
      errors: [
        {
          line: 3,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: 'await Promise.race?.([0]);',
      errors: [
        {
          line: 1,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: 'await Promise?.race([0]);',
      errors: [
        {
          line: 1,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: 'await Promise?.race?.([0]);',
      errors: [
        {
          line: 1,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: 'await Promise.all([,]);',
      errors: [
        {
          line: 1,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: 'await Promise.race(3);',
      errors: [
        {
          line: 1,
          messageId: 'nonArrayArg',
        },
      ],
    },
    {
      code: 'await Promise.all(3);',
      errors: [
        {
          line: 1,
          messageId: 'nonArrayArg',
        },
      ],
    },
    {
      code: 'await Promise.allSettled({ foo: 3 });',
      errors: [
        {
          line: 1,
          messageId: 'nonArrayArg',
        },
      ],
    },
    {
      code: 'await Promise.race(undefined);',
      errors: [
        {
          line: 1,
          messageId: 'nonArrayArg',
        },
      ],
    },
    {
      code: 'await Promise.race?.(undefined);',
      errors: [
        {
          line: 1,
          messageId: 'nonArrayArg',
        },
      ],
    },
    {
      code: `
declare const promiseArr: Promise<number[]>;
await Promise.all(promiseArr);
      `,
      errors: [
        {
          line: 3,
          messageId: 'nonArrayArg',
        },
      ],
    },
    {
      code: 'await Promise.all([0, 1].map(v => v));',
      errors: [
        {
          line: 1,
          messageId: 'arrayArg',
        },
      ],
    },
    {
      code: `
declare const promiseArr: Promise<number>[];
await Promise.all(promiseArr.map(v => await v));
      `,
      errors: [
        {
          line: 3,
          messageId: 'arrayArg',
        },
      ],
    },
    {
      code: `
declare const arr: number[];
await Promise.all?.(arr);
      `,
      errors: [
        {
          line: 3,
          messageId: 'arrayArg',
        },
      ],
    },
    {
      code: `
declare const foo: [number];
await Promise.race(foo);
      `,
      errors: [
        {
          line: 3,
          messageId: 'arrayArg',
        },
      ],
    },
    {
      code: 'await Promise.race([0] as const);',
      errors: [
        {
          line: 1,
          messageId: 'arrayArg',
        },
      ],
    },
  ],
});
