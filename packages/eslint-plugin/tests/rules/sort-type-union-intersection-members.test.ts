import type { TSESLint } from '@typescript-eslint/utils';

import type {
  MessageIds,
  Options,
} from '../../src/rules/sort-type-union-intersection-members';
import rule from '../../src/rules/sort-type-union-intersection-members';
import { noFormat, RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const valid = (operator: '|' | '&'): TSESLint.ValidTestCase<Options>[] => [
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
  operator: '|' | '&',
): TSESLint.InvalidTestCase<MessageIds, Options>[] => {
  const type = operator === '|' ? 'Union' : 'Intersection';
  return [
    {
      code: `type T = B ${operator} A;`,
      output: `type T = A ${operator} B;`,
      errors: [
        {
          messageId: 'notSortedNamed',
          data: {
            type,
            name: 'T',
          },
        },
      ],
    },
    {
      code: `type T = 'B' ${operator} 'A';`,
      output: `type T = 'A' ${operator} 'B';`,
      errors: [
        {
          messageId: 'notSortedNamed',
          data: {
            type,
            name: 'T',
          },
        },
      ],
    },
    {
      code: `type T = 2 ${operator} 1;`,
      output: `type T = 1 ${operator} 2;`,
      errors: [
        {
          messageId: 'notSortedNamed',
          data: {
            type,
            name: 'T',
          },
        },
      ],
    },
    {
      code: noFormat`type T = (B) ${operator} (A);`,
      output: `type T = A ${operator} B;`,
      errors: [
        {
          messageId: 'notSortedNamed',
          data: {
            type,
            name: 'T',
          },
        },
      ],
    },
    {
      code: `type T = { b: string } ${operator} { a: string };`,
      output: `type T = { a: string } ${operator} { b: string };`,
      errors: [
        {
          messageId: 'notSortedNamed',
          data: {
            type,
            name: 'T',
          },
        },
      ],
    },
    {
      code: `type T = [1, 2, 4] ${operator} [1, 2, 3];`,
      output: `type T = [1, 2, 3] ${operator} [1, 2, 4];`,
      errors: [
        {
          messageId: 'notSortedNamed',
          data: {
            type,
            name: 'T',
          },
        },
      ],
    },
    {
      code: `type T = (() => void) ${operator} (() => string);`,
      output: `type T = (() => string) ${operator} (() => void);`,
      errors: [
        {
          messageId: 'notSortedNamed',
          data: {
            type,
            name: 'T',
          },
        },
      ],
    },
    {
      code: `type T = () => void ${operator} string;`,
      output: `type T = () => string ${operator} void;`,
      errors: [
        {
          messageId: 'notSorted',
          data: {
            type,
          },
        },
      ],
    },
    {
      code: `type T = () => undefined ${operator} null;`,
      output: `type T = () => null ${operator} undefined;`,
      errors: [
        {
          messageId: 'notSorted',
          data: {
            type,
          },
        },
      ],
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
  ${operator} B
  ${operator} A
  ${operator} undefined
  ${operator} null
  ${operator} string
  ${operator} any;
      `,
      output: `
type T =
  A ${operator} B ${operator} number[] ${operator} string[] ${operator} any ${operator} string ${operator} readonly number[] ${operator} readonly string[] ${operator} 'a' ${operator} 'b' ${operator} "a" ${operator} "b" ${operator} (() => string) ${operator} (() => void) ${operator} { a: string } ${operator} { b: string } ${operator} [1, 2, 3] ${operator} [1, 2, 4] ${operator} null ${operator} undefined;
      `,
      errors: [
        {
          messageId: 'notSortedNamed',
          data: {
            type,
            name: 'T',
          },
        },
      ],
    },
    {
      code: `type T = B ${operator} /* comment */ A;`,
      output: null,
      errors: [
        {
          messageId: 'notSortedNamed',
          data: {
            type,
            name: 'T',
          },
          suggestions: [
            {
              messageId: 'suggestFix',
              output: `type T = A ${operator} B;`,
            },
          ],
        },
      ],
    },
    {
      code: `type T = (() => /* comment */ A) ${operator} B;`,
      output: `type T = B ${operator} (() => /* comment */ A);`,
      errors: [
        {
          messageId: 'notSortedNamed',
          data: {
            type,
            name: 'T',
          },
          suggestions: null,
        },
      ],
    },
    {
      code: `type Expected = (new (x: number) => boolean) ${operator} string;`,
      output: `type Expected = string ${operator} (new (x: number) => boolean);`,
      errors: [
        {
          messageId: 'notSortedNamed',
        },
      ],
    },
  ];
};

ruleTester.run('sort-type-union-intersection-members', rule, {
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
  ],
  invalid: [...invalid('|'), ...invalid('&')],
});
