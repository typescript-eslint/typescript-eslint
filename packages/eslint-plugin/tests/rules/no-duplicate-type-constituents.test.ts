import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-duplicate-type-constituents';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-duplicate-type-constituents', rule, {
  valid: [
    {
      code: 'type T = 1 | 2;',
    },
    {
      code: "type T = 1 | '1';",
    },
    {
      code: 'type T = true & boolean;',
    },
    {
      code: 'type T = null | undefined;',
    },
    {
      code: 'type T = any | unknown;',
    },
    {
      code: 'type T = { a: string } | { b: string };',
    },
    {
      code: 'type T = { a: string; b: number } | { b: number; a: string };',
    },
    {
      code: 'type T = { a: string | number };',
    },
    {
      code: 'type T = Set<string> | Set<number>;',
    },
    {
      code: 'type T = Class<string> | Class<number>;',
    },
    {
      code: 'type T = string[] | number[];',
    },
    {
      code: 'type T = string[][] | string[];',
    },
    {
      code: 'type T = [1, 2, 3] | [1, 2, 4];',
    },
    {
      code: 'type T = [1, 2, 3] | [1, 2, 3, 4];',
    },
    {
      code: "type T = 'A' | string[];",
    },
    {
      code: 'type T = (() => string) | (() => void);',
    },
    {
      code: 'type T = () => string | void;',
    },
    {
      code: 'type T = () => null | undefined;',
    },
    {
      code: 'type T = (arg: string | number) => void;',
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = A | B;
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
const a: A | B = 'A';
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = A | /* comment */ B;
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = 'A' | 'B';
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type C = 'C';
type T = A | B | C;
      `,
    },
    {
      code: 'type T = readonly string[] | string[];',
    },
    {
      code: `
type A = 'A';
type B = 'B';
type C = 'C';
type D = 'D';
type T = (A | B) | (C | D);
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = (A | B) | (A & B);
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = Record<string, A | B>;
      `,
    },
    {
      code: 'type T = A | A;',
      options: [
        {
          ignoreUnions: true,
        },
      ],
    },
    {
      code: 'type T = A & A;',
      options: [
        {
          ignoreIntersections: true,
        },
      ],
    },
  ],
  invalid: [
    {
      code: 'type T = 1 | 1;',
      output: `type T = 1  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: '1',
          },
        },
      ],
    },
    {
      code: 'type T = true & true;',
      output: `type T = true  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Intersection',
            previous: 'true',
          },
        },
      ],
    },
    {
      code: 'type T = null | null;',
      output: `type T = null  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'null',
          },
        },
      ],
    },
    {
      code: 'type T = any | any;',
      output: `type T = any  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'any',
          },
        },
      ],
    },
    {
      code: 'type T = { a: string | string };',
      output: `type T = { a: string   };`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'string',
          },
        },
      ],
    },
    {
      code: 'type T = { a: string } | { a: string };',
      output: `type T = { a: string }  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: '{ a: string }',
          },
        },
      ],
    },
    {
      code: 'type T = { a: string; b: number } | { a: string; b: number };',
      output: `type T = { a: string; b: number }  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: '{ a: string; b: number }',
          },
        },
      ],
    },
    {
      code: 'type T = Set<string> | Set<string>;',
      output: `type T = Set<string>  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'Set<string>',
          },
        },
      ],
    },
    {
      code: `
type IsArray<T> = T extends any[] ? true : false;
type ActuallyDuplicated = IsArray<number> | IsArray<string>;
      `,
      output: `
type IsArray<T> = T extends any[] ? true : false;
type ActuallyDuplicated = IsArray<number>  ;
      `,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'IsArray<number>',
          },
        },
      ],
    },
    {
      code: 'type T = Class<string> | Class<string>;',
      output: `type T = Class<string>  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'Class<string>',
          },
        },
      ],
    },
    {
      code: 'type T = string[] | string[];',
      output: `type T = string[]  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'string[]',
          },
        },
      ],
    },
    {
      code: 'type T = string[][] | string[][];',
      output: `type T = string[][]  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'string[][]',
          },
        },
      ],
    },
    {
      code: 'type T = [1, 2, 3] | [1, 2, 3];',
      output: `type T = [1, 2, 3]  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: '[1, 2, 3]',
          },
        },
      ],
    },
    {
      code: 'type T = () => string | string;',
      output: `type T = () => string  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'string',
          },
        },
      ],
    },
    {
      code: 'type T = () => null | null;',
      output: `type T = () => null  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'null',
          },
        },
      ],
    },
    {
      code: 'type T = (arg: string | string) => void;',
      output: `type T = (arg: string  ) => void;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'string',
          },
        },
      ],
    },
    {
      code: "type T = 'A' | 'A';",
      output: `type T = 'A'  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: "'A'",
          },
        },
      ],
    },
    {
      code: `
type A = 'A';
type T = A | A;
      `,
      output: `
type A = 'A';
type T = A  ;
      `,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `
type A = 'A';
const a: A | A = 'A';
      `,
      output: `
type A = 'A';
const a: A   = 'A';
      `,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `
type A = 'A';
type T = A | /* comment */ A;
      `,
      output: `
type A = 'A';
type T = A  /* comment */ ;
      `,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `
type A1 = 'A';
type A2 = 'A';
type A3 = 'A';
type T = A1 | A2 | A3;
      `,
      output: `
type A1 = 'A';
type A2 = 'A';
type A3 = 'A';
type T = A1    ;
      `,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A1',
          },
        },
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A1',
          },
        },
      ],
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = A | B | A;
      `,
      output: `
type A = 'A';
type B = 'B';
type T = A | B  ;
      `,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = A | B | A | B;
      `,
      output: `
type A = 'A';
type B = 'B';
type T = A | B    ;
      `,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A',
          },
        },
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'B',
          },
        },
      ],
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = A | B | A | A;
      `,
      output: `
type A = 'A';
type B = 'B';
type T = A | B    ;
      `,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A',
          },
        },
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `
type A = 'A';
type B = 'B';
type C = 'C';
type T = A | B | A | C;
      `,
      output: `
type A = 'A';
type B = 'B';
type C = 'C';
type T = A | B   | C;
      `,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = (A | B) | (A | B);
      `,
      output: `
type A = 'A';
type B = 'B';
type T = (A | B)  ;
      `,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A | B',
          },
        },
      ],
    },
    {
      code: `
type A = 'A';
type T = A | (A | A);
      `,
      output: `
type A = 'A';
type T = A  ;
      `,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: `A`,
          },
        },
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `
type A = 'A';
type B = 'B';
type C = 'C';
type D = 'D';
type F = (A | B) | (A | B) | ((C | D) & (A | B)) | (A | B);
      `,
      output: `
type A = 'A';
type B = 'B';
type C = 'C';
type D = 'D';
type F = (A | B)   | ((C | D) & (A | B))  ;
      `,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A | B',
          },
        },
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A | B',
          },
        },
      ],
    },
    {
      code: `
type A = 'A';
type T = Record<string, A | A>;
      `,
      output: `
type A = 'A';
type T = Record<string, A  >;
      `,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type: 'Union',
            previous: 'A',
          },
        },
      ],
    },
  ],
});
