import path from 'path';
import rule from '../../src/rules/strict-boolean-expressions';
import { RuleTester } from '../RuleTester';

const rootPath = path.join(process.cwd(), 'tests/fixtures/');

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
        const obj = {};
        const bool = false;
        const boolOrObj = bool || obj;
        const boolAndObj = bool && obj;
      `,
    },
    {
      options: [{ allowNullable: true }],
      code: `
        const f1 = (x?: boolean) => x ? 1 : 0;
        const f2 = (x: boolean | null) => x ? 1 : 0;
        const f3 = (x?: true | null) => x ? 1 : 0;
        const f4 = (x?: false) => x ? 1 : 0;
      `,
    },
    `
      declare const x: string | null;
      y = x ?? 'foo';
    `,
    {
      options: [{ allowSafe: true }],
      code: `
        type TestType = { a: string; };
        const f1 = (x: boolean | TestType) => x ? 1 : 0;
        const f2 = (x: true | TestType) => x ? 1 : 0;
        const f3 = (x: TestType | false) => x ? 1 : 0;
      `,
    },
    {
      options: [{ allowNullable: true, allowSafe: true }],
      code: `
        type TestType = { a: string; };
        type TestType2 = { b: number; };
        const f1 = (x?: boolean | TestType) => x ? 1 : 0;
        const f2 = (x: TestType | TestType2 | null) => x ? 1 : 0;
        const f3 = (x?: TestType | TestType2 | null) => x ? 1 : 0;
        const f4 = (x?: TestType2 | true) => x ? 1 : 0;
        const f5 = (g?: (x: number) => number) => g ? g(1) : 0;
      `,
    },
    {
      options: [{ allowNullable: true, allowSafe: true, ignoreRhs: true }],
      code: `
        type TestType = { foo? : { bar?: string; }; };
        const f1 = (x?: TestType) => x && x.foo && x.foo.bar
        const f2 = (g?: (x: number) => number) => g && g(1)
      `,
    },
  ],

  invalid: [
    {
      code: `
        let val = 1;
        let bool = !val;
      `,
      errors: [
        {
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
        if (1) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorPrimitive',
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
        let item = 1;
        if (item) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
        const bool = 1 ? true : false;
      `,
      errors: [
        {
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
        let bool1 = 1;
        let bool2 = true;
        for (let i = 0; bool1 && bool2; i++) {
          return;
        }
      `,
      errors: [
        {
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
        } while (1);
      `,
      errors: [
        {
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
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
          messageId: 'conditionErrorPrimitive',
          line: 2,
          column: 58,
        },
      ],
    },
    {
      errors: [
        {
          messageId: 'conditionErrorNullableBoolean',
          line: 2,
          column: 55,
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
    },
    {
      options: [{ ignoreRhs: true }],
      errors: [
        {
          messageId: 'conditionErrorOther',
          line: 4,
          column: 19,
        },
        {
          messageId: 'conditionErrorOther',
          line: 5,
          column: 20,
        },
      ],
      code: `
const obj = {};
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
        const condition = () => true;
        const obj = {};
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
        const obj = {};
        if (condition || obj) {}
        if (condition && obj) {}
      `,
    },
    {
      options: [{ allowNullable: true }],
      errors: [
        {
          messageId: 'conditionErrorNullish',
          line: 2,
          column: 45,
        },
        {
          messageId: 'conditionErrorNullablePrimitive',
          line: 3,
          column: 36,
        },
      ],
      code: `
        const f1 = (x: null | undefined) => x ? 1 : 0;
        const f2 = (x?: number) => x ? 1 : 0;
      `,
    },
    {
      options: [{ allowSafe: true }],
      errors: [
        {
          messageId: 'conditionErrorOther',
          line: 3,
          column: 42,
        },
        {
          messageId: 'conditionErrorOther',
          line: 4,
          column: 42,
        },
        {
          messageId: 'conditionErrorPrimitive',
          line: 5,
          column: 44,
        },
      ],
      code: `
        type Type = { a: string; };
        const f1 = (x: Type | string) => x ? 1 : 0;
        const f2 = (x: Type | number) => x ? 1 : 0;
        const f3 = (x: number | string) => x ? 1 : 0;
      `,
    },
    {
      options: [{ allowSafe: true }],
      errors: [
        {
          messageId: 'conditionErrorPrimitive',
          line: 8,
          column: 34,
        },
        {
          messageId: 'conditionErrorPrimitive',
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
  ],
});
