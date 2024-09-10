import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-misused-spread';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: rootPath,
      project: './tsconfig.json',
    },
  },
});

ruleTester.run('no-misused-spread', rule, {
  valid: [
    'const a = [...[1, 2, 3]];',
    'const a = [...([1, 2, 3] as const)];',

    `
      declare const data: any;
      const a = [...data];
    `,

    `
      declare const data: number[] | any;
      const a = [...data];
    `,

    `
      declare const data: number[] & any;
      const a = [...data];
    `,

    `
      const a = [1, 2, 3];
      const b = [...a];
    `,

    `
      const a = [1, 2, 3] as const;
      const b = [...a];
    `,

    `
      declare function getArray(): number[];
      const a = [...getArray()];
    `,

    `
      declare function getTuple(): readonly number[];
      const a = [...getTuple()];
    `,

    `
      const iterator = {
        *[Symbol.iterator]() {
          yield 1;
          yield 2;
          yield 3;
        },
      };

      const a = [...iterator];
    `,

    `
      declare const data: Iterable<number> | number[];

      const a = [...data];
    `,

    `
      declare const data: Iterable<number> & number[];

      const a = [...data];
    `,

    `
      declare function getIterable(): Iterable<number>;

      const a = [...getIterable()];
    `,

    `
      declare const data: Uint8Array;

      const a = [...data];
    `,

    `
      declare const data: TypedArray;

      const a = [...data];
    `,

    'const o = { ...{ a: 1, b: 2 } };',

    'const o = { ...({ a: 1, b: 2 } as const) };',

    `
      declare const obj: any;

      const o = { ...obj };
    `,

    `
      declare const obj: { a: number; b: number } | any;

      const o = { ...obj };
    `,

    `
      declare const obj: { a: number; b: number } & any;

      const o = { ...obj };
    `,

    `
      const obj = { a: 1, b: 2 };
      const o = { ...obj };
    `,

    `
      declare const obj: { a: number; b: number };
      const o = { ...obj };
    `,

    `
      declare function getObject(): { a: number; b: number };
      const o = { ...getObject() };
    `,

    `
      function f() {}

      f.prop = 1;

      const o = { ...f };
    `,

    `
      const f = () => {};

      f.prop = 1;

      const o = { ...f };
    `,

    `
      function* generator() {}

      generator.prop = 1;

      const o = { ...generator };
    `,

    `
      declare const promiseLike: PromiseLike<number>;

      const o = { ...promiseLike };
    `,

    {
      options: [{ allow: ['Promise'] }],
      code: `
        const promise = new Promise(() => {});
        const o = { ...promise };
      `,
    },

    `
      interface A {}

      declare const a: A;

      const o = { ...a };
    `,

    // This case is being flagged by TS already, but since we check in the code
    // for `Iterable`s, it catches string as well, so this test exists to ensure
    // we don't flag it.
    `
      const o = { ...'test' };
    `,

    {
      options: [{ allow: ['string'] }],
      code: `
        const str: string = 'test';
        const a = [...str];
      `,
    },

    {
      options: [{ allow: ['f'] }],
      code: `
        function f() {}

        const a = { ...f };
      `,
    },

    {
      options: [
        {
          allow: [{ from: 'lib', name: 'Iterable' }],
        },
      ],
      code: `
        declare const iterator: Iterable<string>;

        const a = { ...iterator };
      `,
    },

    {
      options: [{ allow: ['CustomIterable'] }],
      code: `
        type CustomIterable = {
          [Symbol.iterator]: () => Generator<string>;
        };

        declare const iterator: CustomIterable;

        const a = { ...iterator };
      `,
    },

    {
      options: [
        {
          allow: [{ from: 'file', name: 'CustomIterable' }],
        },
      ],
      code: `
        type CustomIterable = {
          [Symbol.iterator]: () => string;
        };

        declare const iterator: CustomIterable;

        const a = { ...iterator };
      `,
    },

    {
      options: [
        {
          allow: [
            { from: 'package', package: 'module', name: 'CustomIterable' },
          ],
        },
      ],
      code: `
        declare module 'module' {
          export type CustomIterable = {
            [Symbol.iterator]: () => string;
          };
        }

        import { CustomIterable } from 'module';

        declare const iterator: CustomIterable;

        const a = { ...iterator };
      `,
    },

    {
      options: [{ allow: ['A'] }],
      code: `
        class A {
          a = 1;
        }

        const a = new A();

        const o = { ...a };
      `,
    },

    {
      options: [{ allow: ['A'] }],
      code: `
        const a = {
          ...class A {
            static value = 1;
          },
        };
      `,
    },

    // WeakSet is not iterable
    `
      declare const set: WeakSet<number>;
      const o = { ...set };
    `,
  ],

  invalid: [
    {
      code: "const a = [...'test'];",
      errors: [
        {
          messageId: 'noStringSpreadInArray',
          line: 1,
          column: 12,
          endColumn: 21,
        },
      ],
    },

    {
      code: `
        const test = 'hello';
        const a = [...test];
      `,
      errors: [
        {
          messageId: 'noStringSpreadInArray',
          line: 3,
          column: 20,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        const test = \`he\${'ll'}o\`;
        const a = [...test];
      `,
      errors: [
        {
          messageId: 'noStringSpreadInArray',
          line: 3,
          column: 20,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const test: string;
        const a = [...test];
      `,
      errors: [
        {
          messageId: 'noStringSpreadInArray',
          line: 3,
          column: 20,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const test: string | number[];
        const a = [...test];
      `,
      errors: [
        {
          messageId: 'noStringSpreadInArray',
          line: 3,
          column: 20,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const test: string & { __brand: 'test' };
        const a = [...test];
      `,
      errors: [
        {
          messageId: 'noStringSpreadInArray',
          line: 3,
          column: 20,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const test: number | (boolean | (string & { __brand: true }));
        const a = [...test];
      `,
      errors: [
        {
          messageId: 'noStringSpreadInArray',
          line: 3,
          column: 20,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare function getString(): string;
        const a = [...getString()];
      `,
      errors: [
        {
          messageId: 'noStringSpreadInArray',
          line: 3,
          column: 20,
          endColumn: 34,
        },
      ],
    },

    {
      code: `
        declare function getString<T extends string>(): T;
        const a = [...getString()];
      `,
      errors: [
        {
          messageId: 'noStringSpreadInArray',
          line: 3,
          column: 20,
          endColumn: 34,
        },
      ],
    },

    {
      code: `
        declare function getString(): string & { __brand: 'test' };
        const a = [...getString()];
      `,
      errors: [
        {
          messageId: 'noStringSpreadInArray',
          line: 3,
          column: 20,
          endColumn: 34,
        },
      ],
    },

    {
      code: 'const o = { ...[1, 2, 3] };',
      errors: [
        {
          messageId: 'noArraySpreadInObject',
          line: 1,
          column: 13,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        const arr = [1, 2, 3];
        const o = { ...arr };
      `,
      errors: [
        {
          messageId: 'noArraySpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        const arr = [1, 2, 3] as const;
        const o = { ...arr };
      `,
      errors: [
        {
          messageId: 'noArraySpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const arr: number[];
        const o = { ...arr };
      `,
      errors: [
        {
          messageId: 'noArraySpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const arr: readonly number[];
        const o = { ...arr };
      `,
      errors: [
        {
          messageId: 'noArraySpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const arr: number[] | string[];
        const o = { ...arr };
      `,
      errors: [
        {
          messageId: 'noArraySpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const arr: number[] & string[];
        const o = { ...arr };
      `,
      errors: [
        {
          messageId: 'noArraySpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare function getArray(): number[];
        const o = { ...getArray() };
      `,
      errors: [
        {
          messageId: 'noArraySpreadInObject',
          line: 3,
          column: 21,
          endColumn: 34,
        },
      ],
    },

    {
      code: `
        declare function getArray(): readonly number[];
        const o = { ...getArray() };
      `,
      errors: [
        {
          messageId: 'noArraySpreadInObject',
          line: 3,
          column: 21,
          endColumn: 34,
        },
      ],
    },

    {
      code: 'const o = { ...new Set([1, 2, 3]) };',
      errors: [
        {
          messageId: 'noIterableSpreadInObject',
          line: 1,
          column: 13,
          endColumn: 34,
        },
      ],
    },

    {
      code: `
        const set = new Set([1, 2, 3]);
        const o = { ...set };
      `,
      errors: [
        {
          messageId: 'noIterableSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const set: Set<number>;
        const o = { ...set };
      `,
      errors: [
        {
          messageId: 'noIterableSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const set: ReadonlySet<number>;
        const o = { ...set };
      `,
      errors: [
        {
          messageId: 'noIterableSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const set: Set<number> | { a: number };
        const o = { ...set };
      `,
      errors: [
        {
          messageId: 'noIterableSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare function getSet(): Set<number>;
        const o = { ...getSet() };
      `,
      errors: [
        {
          messageId: 'noIterableSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 32,
        },
      ],
    },

    {
      code: `
        const o = {
          ...new Map([
            ['test-1', 1],
            ['test-2', 2],
          ]),
        };
      `,
      errors: [
        {
          messageId: 'noMapSpreadInObject',
          line: 3,
          column: 11,
          endLine: 6,
          endColumn: 13,
        },
      ],
    },

    {
      code: `
        const map = new Map([
          ['test-1', 1],
          ['test-2', 2],
        ]);

        const o = { ...map };
      `,
      errors: [
        {
          messageId: 'noMapSpreadInObject',
          line: 7,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const map: Map<string, number>;
        const o = { ...map };
      `,
      errors: [
        {
          messageId: 'noMapSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const map: ReadonlyMap<string, number>;
        const o = { ...map };
      `,
      errors: [
        {
          messageId: 'noMapSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const map: WeakMap<{ a: number }, string>;
        const o = { ...map };
      `,
      errors: [
        {
          messageId: 'noMapSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare const map: Map<string, number> | { a: number };
        const o = { ...map };
      `,
      errors: [
        {
          messageId: 'noMapSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        declare function getMap(): Map<string, number>;
        const o = { ...getMap() };
      `,
      errors: [
        {
          messageId: 'noMapSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 32,
        },
      ],
    },

    {
      code: `
        declare const a: Map<boolean, string> & Set<number>;
        const o = { ...a };
      `,
      errors: [
        {
          messageId: 'noMapSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        const ref = new WeakRef({ a: 1 });
        const o = { ...ref };
      `,
      errors: [
        {
          messageId: 'noClassInstanceSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 27,
        },
      ],
    },

    {
      code: `
        const promise = new Promise(() => {});
        const o = { ...promise };
      `,
      errors: [
        {
          messageId: 'noPromiseSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 31,
        },
      ],
    },

    {
      code: `
        declare const maybePromise: Promise<number> | { a: number };
        const o = { ...maybePromise };
      `,
      errors: [
        {
          messageId: 'noPromiseSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 36,
        },
      ],
    },

    {
      code: `
        declare const promise: Promise<number> & { a: number };
        const o = { ...promise };
      `,
      errors: [
        {
          messageId: 'noPromiseSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 31,
        },
      ],
    },

    {
      code: `
        declare function getPromise(): Promise<number>;
        const o = { ...getPromise() };
      `,
      errors: [
        {
          messageId: 'noPromiseSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 36,
        },
      ],
    },

    {
      code: `
        declare function getPromise<T extends Promise<number>>(arg: T): T;
        const o = { ...getPromise() };
      `,
      errors: [
        {
          messageId: 'noPromiseSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 36,
        },
      ],
    },

    {
      code: `
        function f() {}

        const o = { ...f };
      `,
      errors: [
        {
          messageId: 'noFunctionSpreadInObject',
          line: 4,
          column: 21,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        const f = () => {};

        const o = { ...f };
      `,
      errors: [
        {
          messageId: 'noFunctionSpreadInObject',
          line: 4,
          column: 21,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        declare function f(): void;

        const o = { ...f };
      `,
      errors: [
        {
          messageId: 'noFunctionSpreadInObject',
          line: 4,
          column: 21,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        declare function getFunction(): () => void;

        const o = { ...getFunction() };
      `,
      errors: [
        {
          messageId: 'noFunctionSpreadInObject',
          line: 4,
          column: 21,
          endColumn: 37,
        },
      ],
    },

    {
      code: `
        declare const f: () => void;

        const o = { ...f };
      `,
      errors: [
        {
          messageId: 'noFunctionSpreadInObject',
          line: 4,
          column: 21,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        declare const f: () => void | { a: number };

        const o = { ...f };
      `,
      errors: [
        {
          messageId: 'noFunctionSpreadInObject',
          line: 4,
          column: 21,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        function* generator() {}

        const o = { ...generator };
      `,
      errors: [
        {
          messageId: 'noFunctionSpreadInObject',
          line: 4,
          column: 21,
          endColumn: 33,
        },
      ],
    },

    {
      code: `
        const iterator = {
          *[Symbol.iterator]() {
            yield 'test';
          },
        };

        const o = { ...iterator };
      `,
      errors: [
        {
          messageId: 'noIterableSpreadInObject',
          line: 8,
          column: 21,
          endColumn: 32,
        },
      ],
    },

    {
      code: `
        type CustomIterable = {
          [Symbol.iterator]: () => Generator<string>;
        };

        const iterator: CustomIterable = {
          *[Symbol.iterator]() {
            yield 'test';
          },
        };

        const a = { ...iterator };
      `,
      options: [{ allow: ['AnotherIterable'] }],
      errors: [
        {
          messageId: 'noIterableSpreadInObject',
          line: 12,
          column: 21,
          endColumn: 32,
        },
      ],
    },
    {
      code: `
        declare module 'module' {
          export type CustomIterable = {
            [Symbol.iterator]: () => string;
          };
        }

        import { CustomIterable } from 'module';

        declare const iterator: CustomIterable;

        const a = { ...iterator };
      `,
      options: [
        {
          allow: [{ from: 'package', package: 'module', name: 'Nothing' }],
        },
      ],
      errors: [
        {
          messageId: 'noIterableSpreadInObject',
          line: 12,
          column: 21,
          endColumn: 32,
        },
      ],
    },

    {
      code: `
        declare const iterator: Iterable<string>;

        const o = { ...iterator };
      `,
      errors: [
        {
          messageId: 'noIterableSpreadInObject',
          line: 4,
          column: 21,
          endColumn: 32,
        },
      ],
    },

    {
      code: `
        declare const iterator: Iterable<string> | { a: number };

        const o = { ...iterator };
      `,
      errors: [
        {
          messageId: 'noIterableSpreadInObject',
          line: 4,
          column: 21,
          endColumn: 32,
        },
      ],
    },

    {
      code: `
        declare function getIterable(): Iterable<string>;

        const o = { ...getIterable() };
      `,
      errors: [
        {
          messageId: 'noIterableSpreadInObject',
          line: 4,
          column: 21,
          endColumn: 37,
        },
      ],
    },

    {
      code: `
        class A {
          [Symbol.iterator]() {
            return {
              next() {
                return { done: true, value: undefined };
              },
            };
          }
        }

        const a = { ...new A() };
      `,
      errors: [
        {
          messageId: 'noIterableSpreadInObject',
          line: 12,
          column: 21,
          endColumn: 31,
        },
      ],
    },

    {
      code: `
        const o = { ...new Date() };
      `,
      errors: [
        {
          messageId: 'noClassInstanceSpreadInObject',
          line: 2,
          column: 21,
          endColumn: 34,
        },
      ],
    },

    {
      code: `
        declare const element: HTMLElement;
        const o = { ...element };
      `,
      errors: [
        {
          messageId: 'noClassInstanceSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 31,
        },
      ],
    },

    {
      code: `
        declare const regex: RegExp;
        const o = { ...regex };
      `,
      errors: [
        {
          messageId: 'noClassInstanceSpreadInObject',
          line: 3,
          column: 21,
          endColumn: 29,
        },
      ],
    },

    {
      code: `
        class A {
          a = 1;
          public b = 2;
          private c = 3;
          protected d = 4;
          static e = 5;
        }

        const o = { ...new A() };
      `,
      errors: [
        {
          messageId: 'noClassInstanceSpreadInObject',
          line: 10,
          column: 21,
          endColumn: 31,
        },
      ],
    },

    {
      code: `
        class A {
          a = 1;
        }

        const a = new A();

        const o = { ...a };
      `,
      errors: [
        {
          messageId: 'noClassInstanceSpreadInObject',
          line: 8,
          column: 21,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        class A {
          a = 1;
        }

        declare const a: A;

        const o = { ...a };
      `,
      errors: [
        {
          messageId: 'noClassInstanceSpreadInObject',
          line: 8,
          column: 21,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        class A {
          a = 1;
        }

        declare function getA(): A;

        const o = { ...getA() };
      `,
      errors: [
        {
          messageId: 'noClassInstanceSpreadInObject',
          line: 8,
          column: 21,
          endColumn: 30,
        },
      ],
    },

    {
      code: `
        class A {
          a = 1;
        }

        declare function getA<T extends A>(arg: T): T;

        const o = { ...getA() };
      `,
      errors: [
        {
          messageId: 'noClassInstanceSpreadInObject',
          line: 8,
          column: 21,
          endColumn: 30,
        },
      ],
    },

    {
      code: `
        class A {
          a = 1;
        }

        class B extends A {}

        const o = { ...new B() };
      `,
      errors: [
        {
          messageId: 'noClassInstanceSpreadInObject',
          line: 8,
          column: 21,
          endColumn: 31,
        },
      ],
    },

    {
      code: `
        class A {
          a = 1;
        }

        declare const a: A | { b: string };

        const o = { ...a };
      `,
      errors: [
        {
          messageId: 'noClassInstanceSpreadInObject',
          line: 8,
          column: 21,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        class A {
          a = 1;
        }

        declare const a: A & { b: string };

        const o = { ...a };
      `,
      errors: [
        {
          messageId: 'noClassInstanceSpreadInObject',
          line: 8,
          column: 21,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        class A {}

        const o = { ...A };
      `,
      errors: [
        {
          messageId: 'noClassDeclarationSpreadInObject',
          line: 4,
          column: 21,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        const A = class {};

        const o = { ...A };
      `,
      errors: [
        {
          messageId: 'noClassDeclarationSpreadInObject',
          line: 4,
          column: 21,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        const A = Set<number>;

        const o = { ...A };
      `,
      errors: [
        {
          messageId: 'noClassDeclarationSpreadInObject',
          line: 4,
          column: 21,
          endColumn: 25,
        },
      ],
    },

    {
      code: `
        const a = {
          ...class A {
            static value = 1;
            nonStatic = 2;
          },
        };
      `,
      errors: [
        {
          messageId: 'noClassDeclarationSpreadInObject',
          line: 3,
          column: 11,
          endLine: 6,
          endColumn: 12,
        },
      ],
    },

    {
      code: noFormat`
        const a = { ...(class A { static value = 1 }) }
      `,
      errors: [
        {
          messageId: 'noClassDeclarationSpreadInObject',
          line: 2,
          column: 21,
          endColumn: 54,
        },
      ],
    },

    {
      code: noFormat`
        const a = { ...new (class A { static value = 1; })() };
      `,
      errors: [
        {
          messageId: 'noClassInstanceSpreadInObject',
          line: 2,
          column: 21,
          endColumn: 61,
        },
      ],
    },
  ],
});
