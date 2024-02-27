import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-misused-spread';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
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
      class A {
        a = 1;
        b = 2;
      }

      const o = { ...new A() };
    `,

    `
      class A {
        a = 1;
        b = 2;
      }

      const a = new A();

      const o = { ...a };
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
      declare const promise: Promise<number>;

      const o = { ...promise };
    `,

    `
      declare const promise: PromiseLike<number>;

      const o = { ...promise };
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Array',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Array',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Array',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Array',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Array',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Array',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Array',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Array',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Array',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Set',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Set',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Set',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Set',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Set',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Set',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Map',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Map',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Map',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Map',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Map',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Map',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Set',
          },
          line: 3,
          column: 21,
          endColumn: 25,
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Iterable',
          },
          line: 8,
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Iterable',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Iterable',
          },
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
          messageId: 'noSpreadInObject',
          data: {
            type: 'Iterable',
          },
          line: 4,
          column: 21,
          endColumn: 37,
        },
      ],
    },
  ],
});
