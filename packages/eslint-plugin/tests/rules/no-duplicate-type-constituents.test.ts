import type { TSESLint } from '@typescript-eslint/utils';

import type {
  MessageIds,
  Options,
} from '../../src/rules/no-duplicate-type-constituents';
import rule from '../../src/rules/no-duplicate-type-constituents';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

const valid = (operator: '|' | '&'): TSESLint.ValidTestCase<Options>[] => [
  {
    code: `type T = 1 ${operator} 2;`,
  },
  {
    code: `type T = 1 ${operator} '1';`,
  },
  {
    code: `type T = true ${operator} boolean;`,
  },
  {
    code: `type T = null ${operator} undefined;`,
  },
  {
    code: `type T = any ${operator} unknown;`,
  },
  {
    code: `type T = { a: string } ${operator} { b: string };`,
  },
  {
    code: `type T = { a: string, b: number } ${operator} { b: number, a: string };`,
  },
  {
    code: `type T = { a: string ${operator} number };`,
  },
  {
    code: `type T = Set<string> ${operator} Set<number>;`,
  },
  {
    code: `type T = Class<string> ${operator} Class<number>;`,
  },
  {
    code: `type T = string[] ${operator} number[];`,
  },
  {
    code: `type T = string[][] ${operator} string[];`,
  },
  {
    code: `type T = [1, 2, 3] ${operator} [1, 2, 4];`,
  },
  {
    code: `type T = [1, 2, 3] ${operator} [1, 2, 3, 4];`,
  },
  {
    code: `type T = "A" ${operator} string[];`,
  },
  {
    code: `type T = (() => string) ${operator} (() => void);`,
  },
  {
    code: `type T = () => string ${operator} void;`,
  },
  {
    code: `type T = () => null ${operator} undefined;`,
  },
  {
    code: `type T = (arg : string ${operator} number) => void;`,
  },
  {
    code: `type A = "A";
type B = "B";
type T = A ${operator} B;`,
  },
  {
    code: `type A = "A";
type B = "B";
const a : A ${operator} B = "A";`,
  },
  {
    code: `type A = "A";
type B = "B";
type T = A ${operator} /* comment */ B;`,
  },
  {
    code: `type A = "A";
type B = "B";
type T = 'A' ${operator} 'B';`,
  },
  {
    code: `type A = "A";
type B = "B";
type T = (A) ${operator} (B);`,
  },
  {
    code: `type A = "A";
type B = "B";
type C = "C";
type T = A ${operator} B ${operator} C;`,
  },
  {
    code: `type T = readonly string[] ${operator} string[];`,
  },
  {
    code: `type A = "A";
type B = "B";
type C = "C";
type D = "D";
type T = (A | B) ${operator} (C | D);
`,
  },
  {
    code: `type A = "A";
type B = "B";
type T = (A | B) ${operator} (A & B);`,
  },
  {
    code: `type A = "A";
type B = "B";
type T = Record<string, A ${operator} B>;`,
  },
];
const invalid = (
  operator: '|' | '&',
): TSESLint.InvalidTestCase<MessageIds, Options>[] => {
  const type = operator === '|' ? 'Union' : 'Intersection';
  return [
    {
      code: `type T = 1 ${operator} 1;`,
      output: `type T = 1  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: '1',
            previous: '1',
          },
        },
      ],
    },
    {
      code: `type T = true ${operator} true;`,
      output: `type T = true  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'true',
            previous: 'true',
          },
        },
      ],
    },
    {
      code: `type T = null ${operator} null;`,
      output: `type T = null  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'null',
            previous: 'null',
          },
        },
      ],
    },
    {
      code: `type T = any ${operator} any;`,
      output: `type T = any  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'any',
            previous: 'any',
          },
        },
      ],
    },
    {
      code: `type T = { a: string ${operator} string };`,
      output: `type T = { a: string   };`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'string',
            previous: 'string',
          },
        },
      ],
    },
    {
      code: `type T = { a : string } ${operator} { a : string };`,
      output: `type T = { a : string }  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: '{ a : string }',
            previous: '{ a : string }',
          },
        },
      ],
    },
    {
      code: `type T = { a : string, b : number } ${operator} { a : string, b : number };`,
      output: `type T = { a : string, b : number }  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: '{ a : string, b : number }',
            previous: '{ a : string, b : number }',
          },
        },
      ],
    },
    {
      code: `type T = Set<string> ${operator} Set<string>;`,
      output: `type T = Set<string>  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'Set<string>',
            previous: 'Set<string>',
          },
        },
      ],
    },
    {
      code: `type IsArray<T> = T extends any[] ? true : false;
type ActuallyDuplicated = IsArray<number> ${operator} IsArray<string>;`,
      output: `type IsArray<T> = T extends any[] ? true : false;
type ActuallyDuplicated = IsArray<number>  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'IsArray<string>',
            previous: 'IsArray<number>',
          },
        },
      ],
    },
    {
      code: `type T = Class<string> ${operator} Class<string>;`,
      output: `type T = Class<string>  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'Class<string>',
            previous: 'Class<string>',
          },
        },
      ],
    },
    {
      code: `type T = string[] ${operator} string[];`,
      output: `type T = string[]  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'string[]',
            previous: 'string[]',
          },
        },
      ],
    },
    {
      code: `type T = string[][] ${operator} string[][];`,
      output: `type T = string[][]  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'string[][]',
            previous: 'string[][]',
          },
        },
      ],
    },
    {
      code: `type T = [1, 2, 3] ${operator} [1, 2, 3];`,
      output: `type T = [1, 2, 3]  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: '[1, 2, 3]',
            previous: '[1, 2, 3]',
          },
        },
      ],
    },
    {
      code: `type T = () => string ${operator} string;`,
      output: `type T = () => string  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'string',
            previous: 'string',
          },
        },
      ],
    },
    {
      code: `type T = () => null ${operator} null;`,
      output: `type T = () => null  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'null',
            previous: 'null',
          },
        },
      ],
    },
    {
      code: `type T = (arg : string ${operator} string) => void;`,
      output: `type T = (arg : string  ) => void;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'string',
            previous: 'string',
          },
        },
      ],
    },
    {
      code: `type T = 'A' ${operator} "A";`,
      output: `type T = 'A'  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: '"A"',
            previous: "'A'",
          },
        },
      ],
    },
    {
      code: `type A = "A";
type T = A ${operator} A;`,
      output: `type A = "A";
type T = A  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `type A = "A";
const a : A ${operator} A = 'A';`,
      output: `type A = "A";
const a : A   = 'A';`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `type A = "A";
type T = (A) ${operator} (A);`,
      output: `type A = "A";
type T = (A)  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `type A = "A";
type T = (A) ${operator} ((A));`,
      output: `type A = "A";
type T = (A)  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `type A = "A";
type T = A ${operator} /* comment */ A;`,
      output: `type A = "A";
type T = A  /* comment */ ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `type A1 = "A";
type A2 = "A";
type A3 = "A";
type T = A1 ${operator} A2 ${operator} A3;`,
      output: `type A1 = "A";
type A2 = "A";
type A3 = "A";
type T = A1    ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A2',
            previous: 'A1',
          },
        },
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A3',
            previous: 'A1',
          },
        },
      ],
    },
    {
      code: `type A = "A";
type B = "B";
type T = A ${operator} B ${operator} A;`,
      output: `type A = "A";
type B = "B";
type T = A ${operator} B  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `type A = "A";
type B = "B";
type T = A ${operator} B ${operator} A ${operator} B;`,
      output: `type A = "A";
type B = "B";
type T = A ${operator} B    ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A',
            previous: 'A',
          },
        },
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'B',
            previous: 'B',
          },
        },
      ],
    },
    {
      code: `type A = "A";
type B = "B";
type T = A ${operator} B ${operator} A ${operator} A;`,
      output: `type A = "A";
type B = "B";
type T = A ${operator} B    ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A',
            previous: 'A',
          },
        },
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `type A = "A";
type B = "B";
type C = "C";
type T = A ${operator} B ${operator} A ${operator} C;`,
      output: `type A = "A";
type B = "B";
type C = "C";
type T = A ${operator} B   ${operator} C;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `type A = "A";
type B = "B";
type T = (A | B) ${operator} (A | B);`,
      output: `type A = "A";
type B = "B";
type T = (A | B)  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A | B',
            previous: 'A | B',
          },
        },
      ],
    },
    {
      code: `type A = "A";
type T = A ${operator} (A ${operator} A);`,
      output: `type A = "A";
type T = A  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: `A ${operator} A`,
            previous: `A`,
          },
        },
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A',
            previous: 'A',
          },
        },
      ],
    },
    {
      code: `type A = "A";
type T = Record<string, A ${operator} A>;`,
      output: `type A = "A";
type T = Record<string, A  >;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            duplicated: 'A',
            previous: 'A',
          },
        },
      ],
    },
  ];
};

ruleTester.run('no-duplicate-type-constituents', rule, {
  valid: [
    ...valid('|'),
    {
      code: 'type T = A | A;',
      options: [
        {
          ignoreUnions: true,
        },
      ],
    },
    ...valid('&'),
    {
      code: 'type T = A & A;',
      options: [
        {
          ignoreIntersections: true,
        },
      ],
    },
  ],
  invalid: [...invalid('|'), ...invalid('&')],
});
