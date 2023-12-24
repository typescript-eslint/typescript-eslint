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
    'await Promise.race([Promise.resolve(3)]);',
    'await Promise.all([Promise.resolve(3)]);',
    'await Promise.allSettled([Promise.resolve(3)]);',
    'await Promise.any([Promise.resolve(3)]);',
    'await Promise.all([]);',
    "await Promise['all']([Promise.resolve(3)]);",
    "await Promise.all([Promise['resolve'](3)]);",
    'await Promise.race([(async () => true)()]);',
    `
function returnsPromise() {
  return Promise.resolve('value');
}
await Promise.race([returnsPromise()]);
    `,
    `
async function returnsPromiseAsync() {}
await Promise.race([returnsPromiseAsync()]);
    `,
    `
declare const anyValue: any;
await Promise.race([anyValue]);
    `,
    `
declare const unknownValue: unknown;
await Promise.race([unknownValue]);
    `,
    `
declare const numberPromise: Promise<number>;
await Promise.race([numberPromise]);
    `,
    `
class Foo extends Promise<number> {}
const foo: Foo = Foo.resolve(2);
await Promise.race([foo]);
    `,
    `
class Foo extends Promise<number> {}
class Bar extends Foo {}
const bar: Bar = Bar.resolve(2);
await Promise.race([bar]);
    `,
    'await Promise.race([Math.random() > 0.5 ? nonExistentSymbol : 0]);',
    `
declare const intersectionPromise: Promise<number> & number;
await Promise.race([intersectionPromise]);
    `,
    `
declare const unionPromise: Promise<number> | number;
await Promise.race([unionPromise]);
    `,
    `
class Thenable {
  then(callback: () => {}) {}
}

const thenable = new Thenable();
await Promise.race([thenable]);
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
    callback(),
  ]);
};
    `,
    `
declare const promiseArr: Promise<number>[];
await Promise.all(promiseArr);
    `,
    `
declare const intersectionArr: (Promise<number> & number)[];
await Promise.all(intersectionArr);
    `,
    `
const values = [1, 2, 3];
await Promise.all(values.map(value => Promise.resolve(value)));
    `,
    `
const values = [1, 2, 3];
await Promise.all(values.map(async value => {}));
    `,
    `
const foo = Promise;
await foo.all([Promise.resolve(3)]);
    `,
    `
const foo = Promise;
await Promise.all([foo.resolve(3)]);
    `,
    `
class Foo extends Promise<number> {}
await Foo.all([Foo.resolve(3)]);
    `,
    `
const foo = Promise;
await Promise.all([
  new foo(resolve => {
    resolve();
  }),
]);
    `,
    `
class Foo extends Promise<number> {}
const myfn = () =>
  new Foo(resolve => {
    resolve(3);
  });
await Promise.all([myfn()]);
    `,
    'await Promise.resolve?.([Promise.resolve(3)]);',
    'await Promise?.resolve?.([Promise.resolve(3)]);',
    `
const foo = Promise;
await foo.resolve?.([foo.resolve(3)]);
    `,
    `
const promisesTuple: [Promise<number>] = [Promise.resolve(3)];
await Promise.all(promisesTuple);
    `,
    'await Promise.all([Promise.resolve(6)] as const);',
    `
const foo = Array();
await Promise.all(foo);
    `,
    `
declare const arrOfAny: any[];
await Promise.all(arrOfAny);
    `,
    `
declare const arrOfUnknown: unknown[];
await Promise.all(arrOfAny);
    `,
    `
declare const arrOfIntersection: (Promise<number> & number)[];
await Promise.all(arrOfIntersection);
    `,
    `
declare const arrOfUnion: (Promise<number> | number)[];
await Promise.all(arrOfUnion);
    `,
    `
declare const unionOfArr: Promise<string>[] | Promise<number>[];
await Promise.all(unionOfArr);
    `,
    `
declare const unionOfTuple: [Promise<number>] | [Promise<string>];
await Promise.all(unionOfTuple);
    `,
    `
declare const intersectionOfArr: Promise<string>[] & Promise<number>[];
await Promise.all(intersectionOfArr);
    `,
    `
declare const intersectionOfTuple: [Promise<number>] & [Promise<string>];
await Promise.all(intersectionOfTuple);
    `,
    `
declare const readonlyArr: ReadonlyArray<Promise<number>>;
await Promise.all(readonlyArr);
    `,
    `
declare const unionOfPromiseArrAndArr: Promise<number>[] | number[];
await Promise.all(unionOfPromiseArrAndArr);
    `,
    `
declare const readonlyTuple: readonly [Promise<number>];
await Promise.all(readonlyTuple);
    `,
    `
declare const readonlyTupleWithOneValid: readonly [number, Promise<number>];
await Promise.all(readonlyTupleWithOneValid);
    `,
    `
declare const unionOfReadonlyTuples:
  | readonly [number]
  | readonly [Promise<number>];
await Promise.all(unionOfReadonlyTuples);
    `,
    `
declare const readonlyTupleOfUnion: readonly [Promise<number> | number];
await Promise.all(readonlyTupleOfUnion);
    `,
    `
class Foo extends Array<Promise<number>> {}
declare const foo: Foo;
await Promise.all(foo);
    `,
    `
class Foo extends Array {}
declare const foo: Foo;
await Promise.all(foo);
    `,
    `
class Foo extends Array<any> {}
declare const foo: Foo;
await Promise.all(foo);
    `,
    `
class Foo extends Array<unknown> {}
declare const foo: Foo;
await Promise.all(foo);
    `,
    `
class Foo extends Array<number | Promise<number>> {}
declare const foo: Foo;
await Promise.all(foo);
    `,
    `
type Foo = { new (): ReadonlyArray<Promise<number>> };
declare const foo: Foo;
class Baz extends foo {}
declare const baz: Baz;
await Promise.all(baz);
    `,
    `
type Foo = { new (): [Promise<number>] };
declare const foo: Foo;
class Baz extends foo {}
declare const baz: Baz;
await Promise.all(baz);
    `,
    `
type Foo = { new (): [number | Promise<number>] };
declare const foo: Foo;
class Baz extends foo {}
declare const baz: Baz;
await Promise.all(baz);
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
      code: 'await Promise.any([0]);',
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
      code: "await Promise['all']([3]);",
      errors: [
        {
          line: 1,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: "await Promise['race']([3]);",
      errors: [
        {
          line: 1,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: "await Promise['allSettled']([3]);",
      errors: [
        {
          line: 1,
          messageId: 'inArray',
        },
      ],
    },
    {
      code: `
declare const badUnion: number | string;
await Promise.all([badUnion]);
      `,
      errors: [
        {
          line: 3,
          messageId: 'inArray',
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
    {
      code: "await Promise['all']([0, 1].map(v => v));",
      errors: [
        {
          line: 1,
          messageId: 'arrayArg',
        },
      ],
    },
    {
      code: `
declare const badUnionArr: (number | string)[];
await Promise.all(badUnionArr);
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
declare const badArrUnion: number[] | string[];
await Promise.all(badArrUnion);
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
declare const badReadonlyArr: ReadonlyArray<number>;
await Promise.all(badReadonlyArr);
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
declare const badArrIntersection: number[] & string[];
await Promise.all(badArrIntersection);
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
declare const badReadonlyTuple: readonly [number, string];
await Promise.all(badReadonlyTuple);
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
class Foo extends Array<number> {}
declare const foo: Foo;
await Promise.all(foo);
      `,
      errors: [
        {
          line: 4,
          messageId: 'arrayArg',
        },
      ],
    },
    {
      code: `
class Foo extends Array<string | number> {}
declare const foo: Foo;
await Promise.all(foo);
      `,
      errors: [
        {
          line: 4,
          messageId: 'arrayArg',
        },
      ],
    },
    {
      code: `
type Foo = [number];
declare const foo: Foo;
await Promise.all(foo);
      `,
      errors: [
        {
          line: 4,
          messageId: 'arrayArg',
        },
      ],
    },
    {
      code: `
class Bar {}
type Foo = { new (): Bar & [number] };
declare const foo: Foo;
class Baz extends foo {}
declare const baz: Baz;
await Promise.all(baz);
      `,
      errors: [
        {
          line: 7,
          messageId: 'arrayArg',
        },
      ],
    },
    {
      code: `
type Foo = { new (): ReadonlyArray<number> };
declare const foo: Foo;
class Baz extends foo {}
declare const baz: Baz;
await Promise.all(baz);
      `,
      errors: [
        {
          line: 6,
          messageId: 'arrayArg',
        },
      ],
    },
  ],
});
