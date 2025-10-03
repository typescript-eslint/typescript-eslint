import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-misused-spread';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes({
  project: './tsconfig-with-dom.json',
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
      declare const data: unknown;
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
      code: `
        const obj = { a: 1, b: 2 };
        const o = <div {...x} />;
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: `
        declare const obj: { a: number; b: number } | any;
        const o = <div {...x} />;
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },

    {
      code: `
        const promise = new Promise(() => {});
        const o = { ...promise };
      `,
      options: [{ allow: ['Promise'] }],
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
      code: `
        const str: string = 'test';
        const a = [...str];
      `,
      options: [{ allow: ['string'] }],
    },
    {
      code: `
        function f() {}

        const a = { ...f };
      `,
      options: [{ allow: ['f'] }],
    },
    {
      code: `
        declare const iterator: Iterable<string>;

        const a = { ...iterator };
      `,
      options: [
        {
          allow: [{ from: 'lib', name: 'Iterable' }],
        },
      ],
    },
    {
      code: `
        type BrandedString = string & { __brand: 'safe' };

        declare const brandedString: BrandedString;

        const spreadBrandedString = [...brandedString];
      `,
      options: [
        {
          allow: [{ from: 'file', name: 'BrandedString' }],
        },
      ],
    },
    {
      code: `
        type CustomIterable = {
          [Symbol.iterator]: () => Generator<string>;
        };

        declare const iterator: CustomIterable;

        const a = { ...iterator };
      `,
      options: [{ allow: ['CustomIterable'] }],
    },
    {
      code: `
        type CustomIterable = {
          [Symbol.iterator]: () => string;
        };

        declare const iterator: CustomIterable;

        const a = { ...iterator };
      `,
      options: [
        {
          allow: [{ from: 'file', name: 'CustomIterable' }],
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
          allow: [
            { from: 'package', name: 'CustomIterable', package: 'module' },
          ],
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
      options: [{ allow: ['A'] }],
    },
    {
      code: `
        const a = {
          ...class A {
            static value = 1;
          },
        };
      `,
      options: [{ allow: ['A'] }],
    },
  ],

  invalid: [
    {
      code: "const a = [...'test'];",
      errors: [
        {
          column: 12,
          endColumn: 21,
          line: 1,
          messageId: 'noStringSpread',
        },
      ],
    },
    {
      code: `
        function withText<Text extends string>(text: Text) {
          return [...text];
        }
      `,
      errors: [
        {
          column: 19,
          endColumn: 26,
          line: 3,
          messageId: 'noStringSpread',
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
          column: 20,
          endColumn: 27,
          line: 3,
          messageId: 'noStringSpread',
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
          column: 20,
          endColumn: 27,
          line: 3,
          messageId: 'noStringSpread',
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
          column: 20,
          endColumn: 27,
          line: 3,
          messageId: 'noStringSpread',
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
          column: 20,
          endColumn: 27,
          line: 3,
          messageId: 'noStringSpread',
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
          column: 20,
          endColumn: 27,
          line: 3,
          messageId: 'noStringSpread',
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
          column: 20,
          endColumn: 27,
          line: 3,
          messageId: 'noStringSpread',
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
          column: 20,
          endColumn: 34,
          line: 3,
          messageId: 'noStringSpread',
        },
      ],
    },
    {
      code: `
        declare function textIdentity(...args: string[]);

        declare const text: string;

        textIdentity(...text);
      `,
      errors: [
        {
          column: 22,
          endColumn: 29,
          line: 6,
          messageId: 'noStringSpread',
        },
      ],
    },
    {
      code: `
        declare function textIdentity(...args: string[]);

        declare const text: string;

        textIdentity(...text, 'and', ...text);
      `,
      errors: [
        {
          column: 22,
          endColumn: 29,
          line: 6,
          messageId: 'noStringSpread',
        },
        {
          column: 38,
          endColumn: 45,
          line: 6,
          messageId: 'noStringSpread',
        },
      ],
    },
    {
      code: `
        declare function textIdentity(...args: string[]);

        function withText<Text extends string>(text: Text) {
          textIdentity(...text);
        }
      `,
      errors: [
        {
          column: 24,
          endColumn: 31,
          line: 5,
          messageId: 'noStringSpread',
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
          column: 20,
          endColumn: 34,
          line: 3,
          messageId: 'noStringSpread',
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
          column: 20,
          endColumn: 34,
          line: 3,
          messageId: 'noStringSpread',
        },
      ],
    },
    {
      code: 'const o = { ...[1, 2, 3] };',
      errors: [
        {
          column: 13,
          endColumn: 25,
          line: 1,
          messageId: 'noArraySpreadInObject',
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noArraySpreadInObject',
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noArraySpreadInObject',
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noArraySpreadInObject',
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noArraySpreadInObject',
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noArraySpreadInObject',
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noArraySpreadInObject',
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
          column: 21,
          endColumn: 34,
          line: 3,
          messageId: 'noArraySpreadInObject',
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
          column: 21,
          endColumn: 34,
          line: 3,
          messageId: 'noArraySpreadInObject',
        },
      ],
    },
    {
      code: 'const o = { ...new Set([1, 2, 3]) };',
      errors: [
        {
          column: 13,
          endColumn: 34,
          line: 1,
          messageId: 'noIterableSpreadInObject',
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noIterableSpreadInObject',
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noIterableSpreadInObject',
        },
      ],
    },
    {
      code: `
        declare const set: WeakSet<object>;
        const o = { ...set };
      `,
      errors: [
        {
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noClassInstanceSpreadInObject',
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noIterableSpreadInObject',
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noIterableSpreadInObject',
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
          column: 21,
          endColumn: 32,
          line: 3,
          messageId: 'noIterableSpreadInObject',
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
          column: 11,
          endColumn: 13,
          endLine: 6,
          line: 3,
          messageId: 'noMapSpreadInObject',
          suggestions: [
            {
              messageId: 'replaceMapSpreadInObject',
              output: `
        const o = Object.fromEntries(new Map([
            ['test-1', 1],
            ['test-2', 2],
          ]));
      `,
            },
          ],
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
          column: 21,
          endColumn: 27,
          line: 7,
          messageId: 'noMapSpreadInObject',
          suggestions: [
            {
              messageId: 'replaceMapSpreadInObject',
              output: `
        const map = new Map([
          ['test-1', 1],
          ['test-2', 2],
        ]);

        const o = Object.fromEntries(map);
      `,
            },
          ],
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noMapSpreadInObject',
          suggestions: [
            {
              messageId: 'replaceMapSpreadInObject',
              output: `
        declare const map: Map<string, number>;
        const o = Object.fromEntries(map);
      `,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`
        declare const map: Map<string, number>;
        const o = { ...(map) };
      `,
      errors: [
        {
          column: 21,
          endColumn: 29,
          line: 3,
          messageId: 'noMapSpreadInObject',
          suggestions: [
            {
              messageId: 'replaceMapSpreadInObject',
              output: `
        declare const map: Map<string, number>;
        const o = Object.fromEntries(map);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        declare const map: Map<string, number>;
        const o = { ...(map, map) };
      `,
      errors: [
        {
          column: 21,
          endColumn: 34,
          line: 3,
          messageId: 'noMapSpreadInObject',
          suggestions: [
            {
              messageId: 'replaceMapSpreadInObject',
              output: `
        declare const map: Map<string, number>;
        const o = Object.fromEntries((map, map));
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        declare const map: Map<string, number>;
        const others = { a: 1 };
        const o = { ...map, ...others };
      `,
      errors: [
        {
          column: 21,
          endColumn: 27,
          line: 4,
          messageId: 'noMapSpreadInObject',
          suggestions: [
            {
              messageId: 'replaceMapSpreadInObject',
              output: `
        declare const map: Map<string, number>;
        const others = { a: 1 };
        const o = { ...Object.fromEntries(map), ...others };
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        declare const map: Map<string, number>;
        const o = { other: 1, ...map };
      `,
      errors: [
        {
          column: 31,
          endColumn: 37,
          line: 3,
          messageId: 'noMapSpreadInObject',
          suggestions: [
            {
              messageId: 'replaceMapSpreadInObject',
              output: `
        declare const map: Map<string, number>;
        const o = { other: 1, ...Object.fromEntries(map) };
      `,
            },
          ],
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noMapSpreadInObject',
          suggestions: [
            {
              messageId: 'replaceMapSpreadInObject',
              output: `
        declare const map: ReadonlyMap<string, number>;
        const o = Object.fromEntries(map);
      `,
            },
          ],
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noMapSpreadInObject',
          suggestions: [
            {
              messageId: 'replaceMapSpreadInObject',
              output: `
        declare const map: WeakMap<{ a: number }, string>;
        const o = Object.fromEntries(map);
      `,
            },
          ],
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noMapSpreadInObject',
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
          column: 21,
          endColumn: 32,
          line: 3,
          messageId: 'noMapSpreadInObject',
          suggestions: [
            {
              messageId: 'replaceMapSpreadInObject',
              output: `
        declare function getMap(): Map<string, number>;
        const o = Object.fromEntries(getMap());
      `,
            },
          ],
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
          column: 21,
          endColumn: 25,
          line: 3,
          messageId: 'noMapSpreadInObject',
          suggestions: [
            {
              messageId: 'replaceMapSpreadInObject',
              output: `
        declare const a: Map<boolean, string> & Set<number>;
        const o = Object.fromEntries(a);
      `,
            },
          ],
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
          column: 21,
          endColumn: 27,
          line: 3,
          messageId: 'noClassInstanceSpreadInObject',
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
          column: 21,
          endColumn: 31,
          line: 3,
          messageId: 'noPromiseSpreadInObject',
          suggestions: [
            {
              messageId: 'addAwait',
              output: `
        const promise = new Promise(() => {});
        const o = { ...await promise };
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        declare const promise: Promise<{ a: 1 }>;
        async function foo() {
          return { ...(promise || {}) };
        }
      `,
      errors: [
        {
          column: 20,
          endColumn: 38,
          line: 4,
          messageId: 'noPromiseSpreadInObject',
          suggestions: [
            {
              messageId: 'addAwait',
              output: `
        declare const promise: Promise<{ a: 1 }>;
        async function foo() {
          return { ...(await (promise || {})) };
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        declare const promise: Promise<any>;
        async function foo() {
          return { ...(Math.random() < 0.5 ? promise : {}) };
        }
      `,
      errors: [
        {
          column: 20,
          endColumn: 59,
          line: 4,
          messageId: 'noPromiseSpreadInObject',
          suggestions: [
            {
              messageId: 'addAwait',
              output: `
        declare const promise: Promise<any>;
        async function foo() {
          return { ...(await (Math.random() < 0.5 ? promise : {})) };
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        function withPromise<P extends Promise<void>>(promise: P) {
          return { ...promise };
        }
      `,
      errors: [
        {
          column: 20,
          endColumn: 30,
          line: 3,
          messageId: 'noPromiseSpreadInObject',
          suggestions: [
            {
              messageId: 'addAwait',
              output: `
        function withPromise<P extends Promise<void>>(promise: P) {
          return { ...await promise };
        }
      `,
            },
          ],
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
          column: 21,
          endColumn: 36,
          line: 3,
          messageId: 'noPromiseSpreadInObject',
          suggestions: [
            {
              messageId: 'addAwait',
              output: `
        declare const maybePromise: Promise<number> | { a: number };
        const o = { ...await maybePromise };
      `,
            },
          ],
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
          column: 21,
          endColumn: 31,
          line: 3,
          messageId: 'noPromiseSpreadInObject',
          suggestions: [
            {
              messageId: 'addAwait',
              output: `
        declare const promise: Promise<number> & { a: number };
        const o = { ...await promise };
      `,
            },
          ],
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
          column: 21,
          endColumn: 36,
          line: 3,
          messageId: 'noPromiseSpreadInObject',
          suggestions: [
            {
              messageId: 'addAwait',
              output: `
        declare function getPromise(): Promise<number>;
        const o = { ...await getPromise() };
      `,
            },
          ],
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
          column: 21,
          endColumn: 36,
          line: 3,
          messageId: 'noPromiseSpreadInObject',
          suggestions: [
            {
              messageId: 'addAwait',
              output: `
        declare function getPromise<T extends Promise<number>>(arg: T): T;
        const o = { ...await getPromise() };
      `,
            },
          ],
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
          column: 21,
          endColumn: 25,
          line: 4,
          messageId: 'noFunctionSpreadInObject',
        },
      ],
    },
    {
      code: `
        interface FunctionWithProps {
          (): string;
          prop: boolean;
        }

        type FunctionWithoutProps = () => string;

        declare const obj: FunctionWithProps | FunctionWithoutProps | object;

        const o = { ...obj };
      `,
      errors: [
        {
          column: 21,
          endColumn: 27,
          line: 11,
          messageId: 'noFunctionSpreadInObject',
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
          column: 21,
          endColumn: 25,
          line: 4,
          messageId: 'noFunctionSpreadInObject',
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
          column: 21,
          endColumn: 25,
          line: 4,
          messageId: 'noFunctionSpreadInObject',
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
          column: 21,
          endColumn: 37,
          line: 4,
          messageId: 'noFunctionSpreadInObject',
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
          column: 21,
          endColumn: 25,
          line: 4,
          messageId: 'noFunctionSpreadInObject',
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
          column: 21,
          endColumn: 25,
          line: 4,
          messageId: 'noFunctionSpreadInObject',
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
          column: 21,
          endColumn: 33,
          line: 4,
          messageId: 'noFunctionSpreadInObject',
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
          column: 21,
          endColumn: 32,
          line: 8,
          messageId: 'noIterableSpreadInObject',
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
      errors: [
        {
          column: 21,
          endColumn: 32,
          line: 12,
          messageId: 'noIterableSpreadInObject',
        },
      ],
      options: [{ allow: ['AnotherIterable'] }],
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
      errors: [
        {
          column: 21,
          endColumn: 32,
          line: 12,
          messageId: 'noIterableSpreadInObject',
        },
      ],
      options: [
        {
          allow: [{ from: 'package', name: 'Nothing', package: 'module' }],
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
          column: 21,
          endColumn: 32,
          line: 4,
          messageId: 'noIterableSpreadInObject',
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
          column: 21,
          endColumn: 32,
          line: 4,
          messageId: 'noIterableSpreadInObject',
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
          column: 21,
          endColumn: 37,
          line: 4,
          messageId: 'noIterableSpreadInObject',
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
          column: 21,
          endColumn: 31,
          line: 12,
          messageId: 'noIterableSpreadInObject',
        },
      ],
    },
    {
      code: `
        const o = { ...new Date() };
      `,
      errors: [
        {
          column: 21,
          endColumn: 34,
          line: 2,
          messageId: 'noClassInstanceSpreadInObject',
        },
      ],
    },
    {
      code: `
        declare class HTMLElementLike {}
        declare const element: HTMLElementLike;
        const o = { ...element };
      `,
      errors: [
        {
          column: 21,
          endColumn: 31,
          line: 4,
          messageId: 'noClassInstanceSpreadInObject',
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
          column: 21,
          endColumn: 29,
          line: 3,
          messageId: 'noClassInstanceSpreadInObject',
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
          column: 21,
          endColumn: 31,
          line: 10,
          messageId: 'noClassInstanceSpreadInObject',
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
          column: 21,
          endColumn: 25,
          line: 8,
          messageId: 'noClassInstanceSpreadInObject',
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
          column: 21,
          endColumn: 25,
          line: 8,
          messageId: 'noClassInstanceSpreadInObject',
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
          column: 21,
          endColumn: 30,
          line: 8,
          messageId: 'noClassInstanceSpreadInObject',
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
          column: 21,
          endColumn: 30,
          line: 8,
          messageId: 'noClassInstanceSpreadInObject',
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
          column: 21,
          endColumn: 31,
          line: 8,
          messageId: 'noClassInstanceSpreadInObject',
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
          column: 21,
          endColumn: 25,
          line: 8,
          messageId: 'noClassInstanceSpreadInObject',
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
          column: 21,
          endColumn: 25,
          line: 8,
          messageId: 'noClassInstanceSpreadInObject',
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
          column: 21,
          endColumn: 25,
          line: 4,
          messageId: 'noClassDeclarationSpreadInObject',
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
          column: 21,
          endColumn: 25,
          line: 4,
          messageId: 'noClassDeclarationSpreadInObject',
        },
      ],
    },
    {
      code: `
        class Declaration {
          declaration?: boolean;
        }
        const Expression = class {
          expression?: boolean;
        };

        declare const either: typeof Declaration | typeof Expression;

        const o = { ...either };
      `,
      errors: [
        {
          column: 21,
          endColumn: 30,
          line: 11,
          messageId: 'noClassDeclarationSpreadInObject',
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
          column: 21,
          endColumn: 25,
          line: 4,
          messageId: 'noClassDeclarationSpreadInObject',
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
          column: 11,
          endColumn: 12,
          endLine: 6,
          line: 3,
          messageId: 'noClassDeclarationSpreadInObject',
        },
      ],
    },
    {
      code: noFormat`
        const a = { ...(class A { static value = 1 }) }
      `,
      errors: [
        {
          column: 21,
          endColumn: 54,
          line: 2,
          messageId: 'noClassDeclarationSpreadInObject',
        },
      ],
    },
    {
      code: noFormat`
        const a = { ...new (class A { static value = 1; })() };
      `,
      errors: [
        {
          column: 21,
          endColumn: 61,
          line: 2,
          messageId: 'noClassInstanceSpreadInObject',
        },
      ],
    },

    {
      code: `
        const o = <div {...[1, 2, 3]} />;
      `,
      errors: [
        {
          column: 24,
          endColumn: 38,
          line: 2,
          messageId: 'noArraySpreadInObject',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: `
        class A {}

        const o = <div {...A} />;
      `,
      errors: [
        {
          column: 24,
          endColumn: 30,
          line: 4,
          messageId: 'noClassDeclarationSpreadInObject',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: `
        const o = <div {...new Date()} />;
      `,
      errors: [
        {
          column: 24,
          endColumn: 39,
          line: 2,
          messageId: 'noClassInstanceSpreadInObject',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: `
        function f() {}

        const o = <div {...f} />;
      `,
      errors: [
        {
          column: 24,
          endColumn: 30,
          line: 4,
          messageId: 'noFunctionSpreadInObject',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: `
        const o = <div {...new Set([1, 2, 3])} />;
      `,
      errors: [
        {
          column: 24,
          endColumn: 47,
          line: 2,
          messageId: 'noIterableSpreadInObject',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: `
        declare const map: Map<string, number>;

        const o = <div {...map} />;
      `,
      errors: [
        {
          column: 24,
          endColumn: 32,
          line: 4,
          messageId: 'noMapSpreadInObject',
          suggestions: [
            {
              messageId: 'replaceMapSpreadInObject',
              output: `
        declare const map: Map<string, number>;

        const o = <div {...Object.fromEntries(map)} />;
      `,
            },
          ],
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: `
        const promise = new Promise(() => {});

        const o = <div {...promise} />;
      `,
      errors: [
        {
          column: 24,
          endColumn: 36,
          line: 4,
          messageId: 'noPromiseSpreadInObject',
          suggestions: [
            {
              messageId: 'addAwait',
              output: `
        const promise = new Promise(() => {});

        const o = <div {...await promise} />;
      `,
            },
          ],
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
  ],
});
