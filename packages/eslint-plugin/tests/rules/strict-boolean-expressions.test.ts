import rule from '../../src/rules/strict-boolean-expressions';
import {
  RuleTester,
  getFixturesRootDir,
  batchedSingleLineTests,
} from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('strict-boolean-expressions', rule, {
  valid: [
    `
      let val = true;
      let bool = !val;
      let bool2 = true || val;
      let bool3 = true && val;
    `,
    `
      let a = 0;
      let u1 = typeof a;
      let u2 = -a;
      let u3 = ~a;
    `,
    `
      const bool1 = true;
      const bool2 = false;
      if (true) {
        return;
      }

      if (bool1) {
        return;
      }

      if (bool1 && bool2) {
        return;
      }

      if (bool1 || bool2) {
        return;
      }

      if ((bool1 && bool2) || (bool1 || bool2)) {
        return;
      }
    `,
    `
      const bool1 = true;
      const bool2 = false;
      const res1 = true ? true : false;
      const res2 = bool1 && bool2 ? true : false;
      const res3 = bool1 || bool2 ? true : false;
      const res4 = (bool1 && bool2) || (bool1 || bool2) ? true : false;
    `,
    `
      for (let i = 0; true; i++) {
        break;
      }
    `,
    `
      const bool = true;
      for (let i = 0; bool; i++) {
        break;
      }
    `,
    `
      const bool1 = true;
      const bool2 = false;
      for (let i = 0; bool1 && bool2; i++) {
        break;
      }
    `,
    `
      const bool1 = true;
      const bool2 = false;
      for (let i = 0; bool1 || bool2; i++) {
        break;
      }
    `,
    `
      const bool1 = true;
      const bool2 = false;
      for (let i = 0; (bool1 && bool2) || (bool1 || bool2); i++) {
        break;
      }
    `,
    `
      while (true) {
        break;
      }
    `,
    `
      const bool = true;
      while (bool) {
        break;
      }
    `,
    `
      const bool1 = true;
      const bool2 = false;
      while (bool1 && bool2) {
        break;
      }
    `,
    `
      const bool1 = true;
      const bool2 = false;
      while (bool1 || bool2) {
        break;
      }
    `,
    `
      const bool1 = true;
      const bool2 = false;
      while ((bool1 && bool2) || (bool1 || bool2)) {
        break;
      }
    `,
    `
      do {
        break;
      } while (true);
    `,
    `
      const bool = true;
      do {
        break;
      } while (bool);
    `,
    `
      const bool1 = true;
      const bool2 = false;
      do {
        break;
      } while (bool1 && bool2);
    `,
    `
      const bool1 = true;
      const bool2 = false;
      do {
        break;
      } while (bool1 || bool2);
    `,
    `
      const bool1 = true;
      const bool2 = false;
      do {
        break;
      } while ((bool1 && bool2) || (bool1 || bool2));
    `,
    `
      function foo<T extends boolean>(arg: T) { return !arg; }
    `,
    {
      options: [{ ignoreRhs: true }],
      code: `
        const obj = { x: 1 };
        const bool = false;
        const boolOrObj = bool || obj;
        const boolAndObj = bool && obj;
      `,
    },
    ...batchedSingleLineTests({
      options: [{ allowNullable: true }],
      code: `
        const f1 = (x?: boolean) => x ? 1 : 0;
        const f2 = (x: boolean | null) => x ? 1 : 0;
        const f3 = (x?: true | null) => x ? 1 : 0;
        const f4 = (x?: false) => x ? 1 : 0;
      `,
    }),
    `
      declare const x: string | null;
      y = x ?? 'foo';
    `,
    ...batchedSingleLineTests({
      options: [{ allowSafe: true }],
      code: `
        const f1 = (x: boolean | { a: string }) => x ? 1 : 0;
        const f2 = (x: true | { a: string }) => x ? 1 : 0;
        const f3 = (x: { a: string } | false) => x ? 1 : 0;
      `,
    }),
    ...batchedSingleLineTests({
      options: [{ allowNullable: true, allowSafe: true }],
      code: `
        const f1 = (x?: boolean | { a?: 1 }) => x ? 1 : 0;
        const f2 = (x: { a?: 1 } | { b?: "a" } | null) => x ? 1 : 0;
        const f3 = (x?: { a?: 1 } | { b?: "a" } | null) => x ? 1 : 0;
        const f4 = (x?: { b?: "a" } | true) => x ? 1 : 0;
        const f5 = (g?: (x: number) => number) => g ? g(1) : 0;
      `,
    }),
    ...batchedSingleLineTests({
      options: [{ allowNullable: true, allowSafe: true, ignoreRhs: true }],
      code: `
        const f1 = (x?: { a: null }) => x && x.foo && x.foo.bar
        const f2 = (g?: (x: number) => number) => g && g(1)
      `,
    }),
    `
      declare let x: never;
      if (x) {}
    `,
    ...batchedSingleLineTests({
      code: `
        function f1(x: never) { return !x }
        function f2(x: never) { return x ? 1 : 0 }
        function f3(x: never, y: never) { return x && y }
        function f5(x: never | boolean) { if (!x) {} }
      `,
    }),
  ],

  invalid: [
    {
      code: `
        let val = "foo";
        let bool = !val;
      `,
      errors: [
        {
          messageId: 'conditionErrorString',
          line: 3,
          column: 21,
        },
      ],
    },
    {
      code: `
        let val;
        let bool = !val;
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 3,
          column: 21,
        },
      ],
    },
    {
      code: `
        let val = 1;
        let bool = true && val;
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 3,
          column: 28,
        },
      ],
    },
    {
      code: `
        let val;
        let bool = true && val;
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 3,
          column: 28,
        },
      ],
    },
    {
      code: `
        let val = 1;
        let bool = true || val;
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 3,
          column: 28,
        },
      ],
    },
    {
      code: `
        let val;
        let bool = true || val;
      `,
      errors: [
        {
          messageId: 'conditionErrorAny',
          line: 3,
          column: 28,
        },
      ],
    },
    {
      code: `
        let num = 1;
        let str = "foo"
        let val = null;
        let bool = true && (val || num || str);
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 5,
          column: 29,
        },
        {
          messageId: 'conditionErrorNumber',
          line: 5,
          column: 36,
        },
        {
          messageId: 'conditionErrorString',
          line: 5,
          column: 43,
        },
      ],
    },
    {
      code: `
        if (1) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: `
        if (undefined) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: `
        let item = "foo";
        if (item) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorString',
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
        let item;
        if (item) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
        let item1 = true;
        let item2 = 1;
        if (item1 && item2) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 4,
          column: 22,
        },
      ],
    },
    {
      code: `
        let item1 = 1;
        let item2 = true;
        if (item1 && item2) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 4,
          column: 13,
        },
      ],
    },
    {
      code: `
        let item1;
        let item2 = true;
        if (item1 && item2) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 4,
          column: 13,
        },
      ],
    },
    {
      code: `
        let item1 = true;
        let item2 = 1;
        if (item1 || item2) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 4,
          column: 22,
        },
      ],
    },
    {
      code: `
        let item1 = 1;
        let item2 = true;
        if (item1 || item2) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 4,
          column: 13,
        },
      ],
    },
    {
      code: `
        let item1;
        let item2 = true;
        if (item1 || item2) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 4,
          column: 13,
        },
      ],
    },
    {
      code: `
        const bool = "foo" ? true : false;
      `,
      errors: [
        {
          messageId: 'conditionErrorString',
          line: 2,
          column: 22,
        },
      ],
    },
    {
      code: `
        const bool = undefined ? true : false;
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 2,
          column: 22,
        },
      ],
    },
    {
      code: `
        let item = 1;
        const bool = item ? true : false;
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 3,
          column: 22,
        },
      ],
    },
    {
      code: `
        let item;
        const bool = item ? true : false;
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 3,
          column: 22,
        },
      ],
    },
    {
      code: `
        let item1 = 1;
        let item2 = false;
        const bool = item1 && item2 ? true : false;
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 4,
          column: 22,
        },
      ],
    },
    {
      code: `
        let item1 = true;
        let item2 = 1;
        const bool = item1 && item2 ? true : false;
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 4,
          column: 31,
        },
      ],
    },
    {
      code: `
        let item1 = true;
        let item2;
        const bool = item1 && item2 ? true : false;
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 4,
          column: 31,
        },
      ],
    },
    {
      code: `
        let item1 = 1;
        let item2 = false;
        const bool = item1 || item2 ? true : false;
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 4,
          column: 22,
        },
      ],
    },
    {
      code: `
        let item1 = true;
        let item2 = 1;
        const bool = item1 || item2 ? true : false;
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 4,
          column: 31,
        },
      ],
    },
    {
      code: `
        let item1 = true;
        let item2;
        const bool = item1 || item2 ? true : false;
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 4,
          column: 31,
        },
      ],
    },
    {
      code: `
        for (let i = 0; 1; i++) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 2,
          column: 25,
        },
      ],
    },
    {
      code: `
        for (let i = 0; undefined; i++) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 2,
          column: 25,
        },
      ],
    },
    {
      code: `
        let bool = 1;
        for (let i = 0; bool; i++) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 3,
          column: 25,
        },
      ],
    },
    {
      code: `
        let bool;
        for (let i = 0; bool; i++) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 3,
          column: 25,
        },
      ],
    },
    {
      code: `
        let bool1 = "foo";
        let bool2 = true;
        for (let i = 0; bool1 && bool2; i++) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorString',
          line: 4,
          column: 25,
        },
      ],
    },
    {
      code: `
        let bool1;
        let bool2 = true;
        for (let i = 0; bool1 && bool2; i++) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 4,
          column: 25,
        },
      ],
    },
    {
      code: `
        let bool1 = 1;
        let bool2 = true;
        for (let i = 0; bool1 || bool2; i++) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 4,
          column: 25,
        },
      ],
    },
    {
      code: `
        let bool1;
        let bool2 = true;
        for (let i = 0; bool1 || bool2; i++) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 4,
          column: 25,
        },
      ],
    },
    {
      code: `
        while (1) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 2,
          column: 16,
        },
      ],
    },
    {
      code: `
        while (undefined) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 2,
          column: 16,
        },
      ],
    },
    {
      code: `
        let bool = 1;
        while (bool) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 3,
          column: 16,
        },
      ],
    },
    {
      code: `
        let bool;
        while (bool) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 3,
          column: 16,
        },
      ],
    },
    {
      code: `
        let bool1 = 1;
        let bool2 = true;
        while (bool1 && bool2) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 4,
          column: 16,
        },
      ],
    },
    {
      code: `
        let bool1;
        let bool2 = true;
        while (bool1 && bool2) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 4,
          column: 16,
        },
      ],
    },
    {
      code: `
        let bool1 = 1;
        let bool2 = true;
        while (bool1 || bool2) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 4,
          column: 16,
        },
      ],
    },
    {
      code: `
        let bool1;
        let bool2 = true;
        while (bool1 || bool2) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 4,
          column: 16,
        },
      ],
    },
    {
      code: `
        do {
          return;
        } while ("foo");
      `,
      errors: [
        {
          messageId: 'conditionErrorString',
          line: 4,
          column: 18,
        },
      ],
    },
    {
      code: `
        do {
          return;
        } while (undefined);
      `,
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 4,
          column: 18,
        },
      ],
    },
    {
      code: `
        let bool = 1;
        do {
          return;
        } while (bool);
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 5,
          column: 18,
        },
      ],
    },
    {
      code: `
        let bool;
        do {
          return;
        } while (bool);
      `,
      errors: [
        {
          messageId: 'conditionErrorAny',
          line: 5,
          column: 18,
        },
      ],
    },
    {
      code: `
        let bool1 = 1;
        let bool2 = true;
        do {
          return;
        } while (bool1 && bool2);
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 6,
          column: 18,
        },
      ],
    },
    {
      code: `
        let bool1;
        let bool2 = true;
        do {
          return;
        } while (bool1 && bool2);
      `,
      errors: [
        {
          messageId: 'conditionErrorAny',
          line: 6,
          column: 18,
        },
      ],
    },
    {
      code: `
        let bool1 = 1;
        let bool2 = true;
        do {
          return;
        } while (bool1 || bool2);
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 6,
          column: 18,
        },
      ],
    },
    {
      code: `
        let bool1;
        let bool2 = true;
        do {
          return;
        } while (bool1 || bool2);
      `,
      errors: [
        {
          messageId: 'conditionErrorAny',
          line: 6,
          column: 18,
        },
      ],
    },
    {
      code: `
        function foo<T extends number>(arg: T) { return !arg; }
      `,
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 2,
          column: 58,
        },
      ],
    },
    ...batchedSingleLineTests({
      errors: [
        {
          messageId: 'conditionErrorNullableBoolean',
          line: 2,
          column: 47,
        },
        {
          messageId: 'conditionErrorNullableBoolean',
          line: 3,
          column: 37,
        },
        {
          messageId: 'conditionErrorOther',
          line: 4,
          column: 41,
        },
      ],
      code: `
        const f1 = (x: boolean | null | undefined) => x ? 1 : 0;
        const f2 = (x?: boolean) => x ? 1 : 0;
        const f3 = (x: boolean | {}) => x ? 1 : 0;
      `,
    }),
    {
      options: [{ ignoreRhs: true }],
      errors: [
        {
          messageId: 'conditionErrorObject',
          line: 4,
          column: 27,
        },
        {
          messageId: 'conditionErrorObject',
          line: 5,
          column: 28,
        },
      ],
      code: `
        const obj = { x: 1 };
        const bool = false;
        const objOrBool = obj || bool;
        const objAndBool = obj && bool;
      `,
    },
    {
      options: [{ ignoreRhs: true }],
      errors: [
        {
          messageId: 'conditionErrorOther',
          line: 4,
          column: 13,
        },
        {
          messageId: 'conditionErrorOther',
          line: 5,
          column: 13,
        },
      ],
      code: `
        const condition = () => false;
        const obj = { x: 1 };
        if (condition() || obj) {}
        if (condition() && obj) {}
      `,
    },
    {
      options: [{ ignoreRhs: true }],
      errors: [
        {
          messageId: 'conditionErrorOther',
          line: 4,
          column: 13,
        },
        {
          messageId: 'conditionErrorOther',
          line: 5,
          column: 13,
        },
      ],
      code: `
        declare let condition: boolean;
        const obj = { x: 1 };
        if (condition || obj) {}
        if (condition && obj) {}
      `,
    },
    ...batchedSingleLineTests({
      options: [{ allowNullable: true }],
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 2,
          column: 37,
        },
        {
          messageId: 'conditionErrorNullableNumber',
          line: 3,
          column: 36,
        },
        {
          messageId: 'conditionErrorNullableString',
          line: 4,
          column: 36,
        },
        {
          messageId: 'conditionErrorOther',
          line: 5,
          column: 45,
        },
      ],
      code: `
        const f1 = (x: null | undefined) => x ? 1 : 0;
        const f2 = (x?: number) => x ? 1 : 0;
        const f3 = (x?: string) => x ? 1 : 0;
        const f4 = (x?: string | number) => x ? 1 : 0;
      `,
    }),
    {
      errors: [
        {
          messageId: 'conditionErrorOther',
          line: 3,
          column: 43,
        },
        {
          messageId: 'conditionErrorOther',
          line: 4,
          column: 44,
        },
      ],
      code: `
        type Type = { a: string; };
        const f1 = (x: Type | boolean) => x ? 1 : 0;
        const f2 = (x?: Type | boolean) => x ? 1 : 0;
      `,
    },
    ...batchedSingleLineTests({
      options: [{ allowSafe: true }],
      errors: [
        {
          messageId: 'conditionErrorOther',
          line: 2,
          column: 36,
        },
        {
          messageId: 'conditionErrorOther',
          line: 3,
          column: 44,
        },
        {
          messageId: 'conditionErrorOther',
          line: 4,
          column: 44,
        },
      ],
      code: `
        const f1 = (x: object | string) => x ? 1 : 0;
        const f2 = (x: object | number) => x ? 1 : 0;
        const f3 = (x: number | string) => x ? 1 : 0;
      `,
    }),
    {
      options: [{ allowSafe: true }],
      errors: [
        {
          messageId: 'conditionErrorNumber',
          line: 8,
          column: 34,
        },
        {
          messageId: 'conditionErrorString',
          line: 9,
          column: 34,
        },
      ],
      code: `
        enum Enum1 {
          A, B, C
        }
        enum Enum2 {
          A = 'A', B = 'B', C = 'C'
        }
        const f1 = (x: Enum1) => x ? 1 : 0;
        const f2 = (x: Enum2) => x ? 1 : 0;
      `,
    },
    {
      options: [{ allowNullable: true, allowSafe: true }],
      errors: [
        {
          messageId: 'conditionErrorOther',
          line: 3,
          column: 43,
        },
        {
          messageId: 'conditionErrorOther',
          line: 4,
          column: 49,
        },
      ],
      code: `
        type Type = { a: string; };
        const f1 = (x?: Type | string) => x ? 1 : 0;
        const f2 = (x: Type | number | null) => x ? 1 : 0;
      `,
    },
    ...batchedSingleLineTests({
      errors: [
        {
          messageId: 'conditionErrorObject',
          line: 2,
          column: 31,
        },
        {
          messageId: 'conditionErrorNullableObject',
          line: 3,
          column: 40,
        },
        {
          messageId: 'conditionErrorNullableObject',
          line: 4,
          column: 47,
        },
      ],
      code: `
        const f1 = (x: { x: any }) => x ? 1 : 0;
        const f2 = (x?: { x: any }) => x ? 1 : 0;
        const f3 = (x?: { x: any } | null) => x ? 1 : 0;
      `,
    }),
  ],
});
