import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';

import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import type {
  MessageIds,
  Options,
} from '../../src/rules/sort-type-constituents';

import rule from '../../src/rules/sort-type-constituents';

const ruleTester = new RuleTester();

const valid = (operator: '&' | '|'): ValidTestCase<Options>[] => [
  {
    code: `type T = A ${operator} B;`,
  },
  {
    code: `type T = A ${operator} /* comment */ B;`,
  },
  {
    code: `type T = 'A' ${operator} 'B';`,
  },
  {
    code: `type T = 1 ${operator} 2;`,
  },
  {
    code: noFormat`type T = (A) ${operator} (B);`,
  },
  {
    code: `type T = { a: string } ${operator} { b: string };`,
  },
  {
    code: `type T = [1, 2, 3] ${operator} [1, 2, 4];`,
  },
  {
    code: `type T = (() => string) ${operator} (() => void);`,
  },
  {
    code: `type T = () => string ${operator} void;`,
  },
  {
    // testing the default ordering
    code: noFormat`
type T =
  ${operator} A
  ${operator} B
  ${operator} C.D
  ${operator} D.E
  ${operator} intrinsic
  ${operator} number[]
  ${operator} string[]
  ${operator} any
  ${operator} string
  ${operator} symbol
  ${operator} this
  ${operator} readonly number[]
  ${operator} readonly string[]
  ${operator} 'a'
  ${operator} 'b'
  ${operator} "a"
  ${operator} "b"
  ${operator} (() => string)
  ${operator} (() => void)
  ${operator} (new () => string)
  ${operator} (new () => void)
  ${operator} import('bar')
  ${operator} import('foo')
  ${operator} (number extends string ? unknown : never)
  ${operator} (string extends string ? unknown : never)
  ${operator} { [a in string]: string }
  ${operator} { [a: string]: string }
  ${operator} { [b in string]: string }
  ${operator} { [b: string]: string }
  ${operator} { a: string }
  ${operator} { b: string }
  ${operator} [1, 2, 3]
  ${operator} [1, 2, 4]
  ${operator} (A & B)
  ${operator} (B & C)
  ${operator} (A | B)
  ${operator} (B | C)
  ${operator} null
  ${operator} undefined
    `,
  },
];
const invalid = (
  operator: '&' | '|',
): InvalidTestCase<MessageIds, Options>[] => {
  const type = operator === '|' ? 'Union' : 'Intersection';
  return [
    {
      code: `type T = B ${operator} A;`,
      errors: [
        {
          data: {
            name: 'T',
            type,
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = A ${operator} B;`,
    },
    {
      code: `type T = 'B' ${operator} 'A';`,
      errors: [
        {
          data: {
            name: 'T',
            type,
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = 'A' ${operator} 'B';`,
    },
    {
      code: `type T = 2 ${operator} 1;`,
      errors: [
        {
          data: {
            name: 'T',
            type,
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = 1 ${operator} 2;`,
    },
    {
      code: noFormat`type T = (B) ${operator} (A);`,
      errors: [
        {
          data: {
            name: 'T',
            type,
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = A ${operator} B;`,
    },
    {
      code: `type T = { b: string } ${operator} { a: string };`,
      errors: [
        {
          data: {
            name: 'T',
            type,
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = { a: string } ${operator} { b: string };`,
    },
    {
      code: `type T = [1, 2, 4] ${operator} [1, 2, 3];`,
      errors: [
        {
          data: {
            name: 'T',
            type,
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = [1, 2, 3] ${operator} [1, 2, 4];`,
    },
    {
      code: `type T = (() => void) ${operator} (() => string);`,
      errors: [
        {
          data: {
            name: 'T',
            type,
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = (() => string) ${operator} (() => void);`,
    },
    {
      code: `type T = () => void ${operator} string;`,
      errors: [
        {
          data: {
            type,
          },
          messageId: 'notSorted',
        },
      ],
      output: `type T = () => string ${operator} void;`,
    },
    {
      code: `type T = () => undefined ${operator} null;`,
      errors: [
        {
          data: {
            type,
          },
          messageId: 'notSorted',
        },
      ],
      output: `type T = () => null ${operator} undefined;`,
    },
    {
      code: noFormat`
type T =
  ${operator} [1, 2, 4]
  ${operator} [1, 2, 3]
  ${operator} { b: string }
  ${operator} { a: string }
  ${operator} (() => void)
  ${operator} (() => string)
  ${operator} "b"
  ${operator} "a"
  ${operator} 'b'
  ${operator} 'a'
  ${operator} readonly string[]
  ${operator} readonly number[]
  ${operator} string[]
  ${operator} number[]
  ${operator} D.E
  ${operator} C.D
  ${operator} B
  ${operator} A
  ${operator} undefined
  ${operator} null
  ${operator} string
  ${operator} any;
      `,
      errors: [
        {
          data: {
            name: 'T',
            type,
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: `
type T =
  A ${operator} B ${operator} C.D ${operator} D.E ${operator} number[] ${operator} string[] ${operator} any ${operator} string ${operator} readonly number[] ${operator} readonly string[] ${operator} 'a' ${operator} 'b' ${operator} "a" ${operator} "b" ${operator} (() => string) ${operator} (() => void) ${operator} { a: string } ${operator} { b: string } ${operator} [1, 2, 3] ${operator} [1, 2, 4] ${operator} null ${operator} undefined;
      `,
    },
    {
      code: `type T = B ${operator} /* comment */ A;`,
      errors: [
        {
          data: {
            name: 'T',
            type,
          },
          messageId: 'notSortedNamed',
          suggestions: [
            {
              messageId: 'suggestFix',
              output: `type T = A ${operator} B;`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `type T = (() => /* comment */ A) ${operator} B;`,
      errors: [
        {
          data: {
            name: 'T',
            type,
          },
          messageId: 'notSortedNamed',
          suggestions: null,
        },
      ],
      output: `type T = B ${operator} (() => /* comment */ A);`,
    },
    {
      code: `type Expected = (new (x: number) => boolean) ${operator} string;`,
      errors: [
        {
          messageId: 'notSortedNamed',
        },
      ],
      output: `type Expected = string ${operator} (new (x: number) => boolean);`,
    },
    {
      code: `type T = (| A) ${operator} B;`,
      errors: [
        {
          data: {
            name: 'T',
            type,
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = B ${operator} (| A);`,
    },
    {
      code: `type T = (& A) ${operator} B;`,
      errors: [
        {
          data: {
            name: 'T',
            type,
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = B ${operator} (& A);`,
    },
  ];
};

ruleTester.run('sort-type-constituents', rule, {
  valid: [
    ...valid('|'),
    {
      code: 'type T = B | A;',
      options: [
        {
          checkUnions: false,
        },
      ],
    },
    {
      code: "type T = 'DeleteForever' | 'DeletedAt';",
      options: [
        {
          caseSensitive: true,
        },
      ],
    },
    {
      code: 'type T = { A: string } | { B: string } | { a: string };',
      options: [
        {
          caseSensitive: true,
        },
      ],
    },

    ...valid('&'),
    {
      code: 'type T = B & A;',
      options: [
        {
          checkIntersections: false,
        },
      ],
    },
    {
      code: "type T = 'DeleteForever' & 'DeleteForever';",
      options: [
        {
          caseSensitive: true,
        },
      ],
    },

    {
      code: noFormat`
type T = [1] | 'a' | 'b' | "b" | 1 | 2 | {};
      `,
      options: [
        {
          groupOrder: ['tuple', 'literal', 'object'],
        },
      ],
    },
    {
      // if not specified - groups should be placed last
      code: `
type T = 1 | string | {} | A;
      `,
      options: [
        {
          groupOrder: ['literal', 'keyword'],
        },
      ],
    },
    "type A<T> = string | (T extends number ? 'hi' : 'there');",
  ],
  invalid: [
    ...invalid('|'),
    ...invalid('&'),
    {
      code: 'type T = (B | C) & A;',
      errors: [
        {
          data: {
            name: 'T',
            type: 'Intersection',
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = A & (B | C);`,
    },
    {
      code: "type A<T> = (T extends number ? 'hi' : 'there') | string;",
      errors: [
        {
          data: {
            name: 'A',
            type: 'Union',
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: "type A<T> = string | (T extends number ? 'hi' : 'there');",
    },
    {
      code: "type T = 'DeletedAt' | 'DeleteForever';",
      errors: [
        {
          data: {
            name: 'T',
            type: 'Union',
          },
          messageId: 'notSortedNamed',
        },
      ],
      options: [
        {
          caseSensitive: true,
        },
      ],
      output: "type T = 'DeleteForever' | 'DeletedAt';",
    },
    {
      code: 'type T = { a: string } | { A: string } | { B: string };',
      errors: [
        {
          data: {
            name: 'T',
            type: 'Union',
          },
          messageId: 'notSortedNamed',
        },
      ],
      options: [
        {
          caseSensitive: true,
        },
      ],
      output: 'type T = { A: string } | { B: string } | { a: string };',
    },
  ],
});
