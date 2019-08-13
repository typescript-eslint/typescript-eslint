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
  ],

  invalid: [
    {
      code: `
        let val = 1;
        let bool = !val;
      `,
      errors: [
        {
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
          line: 3,
          column: 20,
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
          messageId: 'strictBooleanExpression',
          line: 3,
          column: 20,
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
          messageId: 'strictBooleanExpression',
          line: 3,
          column: 20,
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
          messageId: 'strictBooleanExpression',
          line: 3,
          column: 20,
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
          line: 4,
          column: 13,
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
          line: 4,
          column: 13,
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
          line: 4,
          column: 22,
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
          messageId: 'strictBooleanExpression',
          line: 4,
          column: 22,
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
          line: 4,
          column: 22,
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
          messageId: 'strictBooleanExpression',
          line: 4,
          column: 22,
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
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
          messageId: 'strictBooleanExpression',
          line: 2,
          column: 58,
        },
      ],
    },
    {
      options: [{ ignoreRhs: true }],
      errors: [
        {
          messageId: 'strictBooleanExpression',
          line: 4,
          column: 19,
        },
        {
          messageId: 'strictBooleanExpression',
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
      options: [{ allowNullable: true }],
      errors: [
        {
          messageId: 'strictBooleanExpression',
          line: 2,
          column: 44,
        },
        {
          messageId: 'strictBooleanExpression',
          line: 3,
          column: 35,
        },
      ],
      code: `
        const f = (x: null | undefined) => x ? 1 : 0;
        const f = (x?: number) => x ? 1 : 0;
      `,
    },
  ],
});
